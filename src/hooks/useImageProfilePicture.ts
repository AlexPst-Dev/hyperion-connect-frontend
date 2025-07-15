import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getImageAsBase64 } from "../utils/file-utils";
import { fileService } from "../services/api/file-service";
import { FileCategory, File } from "../models/file";

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
