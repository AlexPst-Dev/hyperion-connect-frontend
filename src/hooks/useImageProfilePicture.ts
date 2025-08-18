import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getImageAsBase64 } from "../utils/file-utils";
import { fileService } from "../services/api/file-service";
import { File } from "../models/file";
import { UserResponse } from "../models/user";
import { UserService } from "../services/api/user-service";

export const useUserProfileImage = () => {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [isPpLoading, setPpIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { user, token } = useAuth();

  const loadProfileImage = async () => {
    if (!user || !token) {
      setProfilePicture("");
      setError("");
      return;
    }

    setPpIsLoading(true);
    setError("");

    try {
      const completeUser = await UserService.getUserById(user.id);
      if (!completeUser) {
        console.log("Aucun utilisateur trouvé");
        setProfilePicture("");
        return;
      }
      if (!completeUser.filePicture) {
        console.log("Cet utilisateur n'a pas de photo de profil");
        setProfilePicture("");
        return;
      }

      const imageFile = await fileService.getFileById(
        completeUser.filePicture.id,
        token
      );

      if (!imageFile) {
        console.log("Aucune image de profil trouvée");
        setProfilePicture("");
        return;
      }

      const imageBase64 = await getImageAsBase64(imageFile, token);
      setProfilePicture(imageBase64);
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement de l'image de profil:",
        error
      );
      setError(error instanceof Error ? error.message : "Erreur inconnue");
      setProfilePicture("");
    } finally {
      setPpIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileImage();
  }, [user?.id, user?.imageUrl, token]);

  return {
    profilePicture,
    isPpLoading,
    error,
    reloadProfileImage: loadProfileImage,
  };
};

// Hook pour les images d'entreprise
export const useCompanyImage = (companyId?: number, fileImage?: File) => {
  const [companyImage, setCompanyImage] = useState<string>("");
  const [isCppLoading, setCppIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { token } = useAuth();

  const loadCompanyImage = async () => {
    if (!fileImage || !token || !companyId) {
      setCompanyImage("");
      setError("");
      return;
    }

    setCppIsLoading(true);
    setError("");

    try {
      const imageBase64 = await getImageAsBase64(fileImage, token);
      setCompanyImage(imageBase64);
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement de l'image d'entreprise:",
        error
      );
      setError(error instanceof Error ? error.message : "Erreur inconnue");
      setCompanyImage("");
    } finally {
      setCppIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyImage();
  }, [fileImage?.id, token, companyId]);

  return {
    companyImage,
    isCppLoading,
    error,
    reloadCompanyImage: loadCompanyImage,
  };
};

export const useAnyUserProfileImage = (userFile?: File) => {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [isUserPPLoading, setIsUserPPLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { token } = useAuth();

  const loadProfileImage = async () => {
    if (!userFile || !token) {
      setProfilePicture("");
      setError("");
      return;
    }

    setIsUserPPLoading(true);
    setError("");

    try {
      const imageBase64 = await getImageAsBase64(userFile, token);
      setProfilePicture(imageBase64);
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement de l'image utilisateur:",
        error
      );
      setError(error instanceof Error ? error.message : "Erreur inconnue");
      setProfilePicture("");
    } finally {
      setIsUserPPLoading(false);
    }
  };

  useEffect(() => {
    loadProfileImage();
  }, [userFile?.id, token]);

  return {
    profilePicture,
    isUserPPLoading,
    error,
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
  const [globalError, setGlobalError] = useState<string>("");
  const { token } = useAuth();
  const loadingRef = useRef<Set<number>>(new Set());

  const loadProfileImages = async () => {
    if (!users.length || !token) {
      setProfileImages(new Map());
      setGlobalError("");
      return;
    }

    setIsLoading(true);
    setGlobalError("");
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

    // Charger toutes les images en parallèle avec limitation
    const batchSize = 5; // Limiter le nombre de requêtes simultanées
    const usersWithImages = users.filter((user) => user.filePicture);

    try {
      for (let i = 0; i < usersWithImages.length; i += batchSize) {
        const batch = usersWithImages.slice(i, i + batchSize);

        const batchPromises = batch.map(async (completeUser) => {
          const userId = completeUser.user.id;

          try {
            console.log(`📸 Chargement image batch pour utilisateur ${userId}`);

            const imageBase64 = await getImageAsBase64(
              completeUser.filePicture!,
              token
            );

            return {
              userId,
              imageBase64,
              isLoading: false,
            };
          } catch (error) {
            console.error(`❌ Erreur image utilisateur ${userId}:`, error);
            return {
              userId,
              imageBase64: "",
              isLoading: false,
              error: error instanceof Error ? error.message : "Erreur inconnue",
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        // Mettre à jour les résultats du batch
        setProfileImages((prevImages) => {
          const updatedImages = new Map(prevImages);
          batchResults.forEach((result) => {
            updatedImages.set(result.userId, result);
          });
          return updatedImages;
        });

        // Petite pause entre les batches pour éviter de surcharger
        if (i + batchSize < usersWithImages.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement des images de profil:",
        error
      );
      setGlobalError(
        error instanceof Error ? error.message : "Erreur inconnue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileImages();
  }, [users.length, token]);

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

  const getLoadedImagesCount = (): number => {
    return Array.from(profileImages.values()).filter((img) => img.imageBase64)
      .length;
  };

  const getTotalImagesCount = (): number => {
    return profileImages.size;
  };

  return {
    profileImages,
    isLoading,
    globalError,
    getImageForUser,
    isUserImageLoading,
    getUserImageError,
    getLoadedImagesCount,
    getTotalImagesCount,
    reloadProfileImages: loadProfileImages,
  };
};
