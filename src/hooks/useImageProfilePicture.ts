import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getImageAsBase64 } from "../utils/file-utils";
import { fileService } from "../services/api/file-service";
import { FileCategory, File } from "../models/file";
import { UserResponse } from "../models/user";

export const useUserProfileImage = () => {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [isPpLoading, setPpIsLoading] = useState<boolean>(false);
  const { user, token } = useAuth();

  const loadProfileImage = async () => {
    if (!user || !token) {
      setProfilePicture("");
      return;
    }

    const userFileImage = await (
      await fileService.getFilesByCategory(FileCategory.IMAGE, token)
    ).filter((file) =>
      file.url.startsWith(`/uploads/user-${user.id}/images/`)
    )[0];

    setPpIsLoading(true);
    try {
      const imageBase64 = await getImageAsBase64(userFileImage, token, "image");
      setProfilePicture(imageBase64);
    } catch (error) {
      console.error("Erreur lors du chargement de l'image de profil:", error);
      setProfilePicture("");
    } finally {
      setPpIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileImage();
  }, [user?.imageUrl, token]);

  return {
    profilePicture,
    isPpLoading,
    reloadProfileImage: loadProfileImage,
  };
};

// Hook pour les images d'entreprise
export const useCompanyImage = (companyId?: number, fileImage?: File) => {
  const [companyImage, setCompanyImage] = useState<string>("");
  const [isCppLoading, setCppIsLoading] = useState<boolean>(false);
  const { token } = useAuth();

  const loadCompanyImage = async () => {
    if (!fileImage || !token || !companyId) {
      setCompanyImage("");
      return;
    }

    setCppIsLoading(true);
    try {
      const imageBase64 = await getImageAsBase64(
        fileImage,
        token,
        "companyImage",
        companyId
      );
      setCompanyImage(imageBase64);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de l'image d'entreprise:",
        error
      );
      setCompanyImage("");
    } finally {
      setCppIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyImage();
  }, [fileImage, token, companyId]);

  return {
    companyImage,
    isCppLoading,
    reloadCompanyImage: loadCompanyImage,
  };
};

export const useAnyUserProfileImage = (userFile?: File) => {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [isUserPPLoading, setIsUserPPLoading] = useState<boolean>(false);
  const { token } = useAuth();

  const loadProfileImage = async () => {
    if (!userFile || !token) {
      setProfilePicture("");
      return;
    }

    setIsUserPPLoading(true);
    try {
      const imageBase64 = await getImageAsBase64(userFile, token, "image");
      setProfilePicture(imageBase64);
    } catch (error) {
      console.error("Erreur lors du chargement de l'image de profil:", error);
      setProfilePicture("");
    } finally {
      setIsUserPPLoading(false);
    }
  };

  useEffect(() => {
    loadProfileImage();
  }, [userFile, token]);

  return {
    profilePicture,
    isUserPPLoading,
    reloadProfileImage: loadProfileImage,
  };
};

interface UserProfileImage {
  userId: number;
  imageBase64: string;
  isLoading: boolean;
  error?: string;
}

export const useMultipleUserProfileImages = (users: UserResponse[]) => {
  const [profileImages, setProfileImages] = useState<
    Map<number, UserProfileImage>
  >(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const loadingRef = useRef<Set<number>>(new Set());

  const loadProfileImages = async () => {
    if (!users.length || !token) {
      setProfileImages(new Map());
      return;
    }

    setIsLoading(true);
    const newProfileImages = new Map<number, UserProfileImage>();

    // Initialiser les états de chargement
    users.forEach((completeUser) => {
      if (completeUser.filePicture) {
        newProfileImages.set(completeUser.user.id, {
          userId: completeUser.user.id,
          imageBase64: "",
          isLoading: true,
        });
      }
    });

    setProfileImages(newProfileImages);

    // Charger toutes les images en parallèle
    const imagePromises = users
      .filter((user) => user.filePicture)
      .map(async (completeUser) => {
        try {
          const imageBase64 = await getImageAsBase64(
            completeUser.filePicture!,
            token,
            "image"
          );
          return {
            userId: completeUser.user.id,
            imageBase64,
            isLoading: false,
          };
        } catch (error) {
          console.error(
            `Erreur lors du chargement de l'image pour l'utilisateur ${completeUser.user.id}:`,
            error
          );
          return {
            userId: completeUser.user.id,
            imageBase64: "",
            isLoading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          };
        }
      });

    try {
      const results = await Promise.all(imagePromises);

      // Mettre à jour les résultats
      setProfileImages((prevImages) => {
        const updatedImages = new Map(prevImages);
        results.forEach((result) => {
          updatedImages.set(result.userId, result);
        });
        return updatedImages;
      });
    } catch (error) {
      console.error("Erreur lors du chargement des images de profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileImages();
  }, [users, token]);

  const getImageForUser = (userId: number): string => {
    const userImage = profileImages.get(userId);
    return userImage?.imageBase64 || "";
  };

  const isUserImageLoading = (userId: number): boolean => {
    const userImage = profileImages.get(userId);
    return userImage?.isLoading || false;
  };

  const getUserImageError = (userId: number): string | undefined => {
    const userImage = profileImages.get(userId);
    return userImage?.error;
  };

  return {
    profileImages,
    isLoading,
    getImageForUser,
    isUserImageLoading,
    getUserImageError,
    reloadProfileImages: loadProfileImages,
  };
};
