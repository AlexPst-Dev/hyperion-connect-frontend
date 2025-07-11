import { Platform, Pressable, View } from "react-native";
import { File, FileCategory } from "../models/file";
import Icon from "./Icon";
import AppText from "./AppText";
import { Colors } from "../styles/styles";
import { useState } from "react";
import env from "@/env";
import { notify } from "./NotificationContainer";
import * as FileSystem from "expo-file-system";
import { fileService } from "../services/api/file-service";
import { SportsmanProfile } from "../models/user";
import { UserService } from "../services/api/user-service";

interface Props {
  file: File;
  displayControllers: boolean;
  token: string;
  uploadToASpecificId?: number;
  onDeleteSuccess?: (fileId: number, updatedList: string) => void;
}

export default function ItemFile({
  file,
  displayControllers,
  token,
  uploadToASpecificId,
  onDeleteSuccess,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileDownload = async (file: File) => {
    if (!file.url) {
      notify({
        title: "URL du fichier non disponible",
        type: "error",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const fullUrl = uploadToASpecificId
        ? `${env.API_URL}/files/download/${file.id}?targetUserId=${uploadToASpecificId}`
        : `${env.API_URL}/files/download/${file.id}`;

      if (Platform.OS === "web") {
        // Version web
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.label;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Version mobile - reste identique
        const { downloadAsync } = await import("expo-file-system");
        const { shareAsync, isAvailableAsync } = await import("expo-sharing");

        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const fileUri = `${FileSystem.documentDirectory}${file.label}`;
        const downloadResult = await downloadAsync(fullUrl, fileUri, {
          headers,
        });

        if (downloadResult.status === 200) {
          const isSharingAvailable = await isAvailableAsync();
          if (isSharingAvailable) {
            await shareAsync(downloadResult.uri, {
              UTI: "com.adobe.pdf",
              mimeType: "application/pdf",
            });
          }
        }
      }

      notify({
        title: "Fichier téléchargé avec succès",
        type: "success",
      });
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      notify({
        title: "Impossible de télécharger le fichier",
        type: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleting = async (file: File) => {
    if (!file.url) {
      notify({
        title: "URL du fichier non disponible",
        type: "error",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Mettre à jour la liste des fichiers du sportif
      if (uploadToASpecificId) {
        const sportsmanProfile = await UserService.getUserById(
          uploadToASpecificId,
          token
        );
        const profile = sportsmanProfile.profile as SportsmanProfile;
        let currentList: string = "";
        if (file.fileCategory === FileCategory.MEDICAL_FILE) {
          currentList = profile.listMedicFiles || "";
        } else if (file.fileCategory === FileCategory.USER_FILE) {
          currentList = profile.listUserFiles || "";
        }
        const currentIds = currentList
          ? currentList
              .split(";")
              .map((id) => parseInt(id.trim(), 10))
              .filter((id) => !isNaN(id))
          : [];

        // Retirer l'ID du fichier supprimé de la liste
        const fileIdToRemove = file.id;
        const filteredIds = currentIds.filter((id) => id !== fileIdToRemove);

        // Construire la nouvelle liste
        const updatedList =
          filteredIds.length > 0 ? filteredIds.join("; ") : "";

        // Mettre à jour le profil du sportif
        if (file.fileCategory === FileCategory.USER_FILE) {
          const updatedUser = await UserService.updateSportsman(
            uploadToASpecificId,
            {
              listUserFiles: updatedList,
            },
            token
          );
        }
        if (file.fileCategory === FileCategory.MEDICAL_FILE) {
          const updatedUser = await UserService.updateSportsman(
            uploadToASpecificId,
            {
              listMedicFiles: updatedList,
            },
            token
          );
        }
        // Supprimer le fichier
        await fileService.deleteFile(file.id, token);
        onDeleteSuccess?.(file.id, updatedList);
      }

      notify({
        title: "Le fichier a bien été supprimé",
        type: "success",
      });
    } catch (e) {
      notify({
        title: "Une erreur est survenue lors de la suppression du fichier",
        type: "error",
      });
      console.log("Error while trying to delete the file : ", e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Pressable
      style={{
        flexDirection: "column",
        gap: 16,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 16,
      }}
      onPress={
        displayControllers
          ? () => {}
          : () => {
              if (isDownloading) return;
              handleFileDownload(file);
            }
      }
    >
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Icon
          name={
            file.fileCategory === FileCategory.IMAGE ? "image" : "paperclip"
          }
          width={24}
          height={24}
          strokeColor="black"
          fillColor="transparent"
        />
        <View style={{ flex: 1 }}>
          <AppText>{file.label}</AppText>
        </View>
      </View>
      {displayControllers && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Pressable
            style={{ flexDirection: "row", gap: 8, paddingHorizontal: 32 }}
            onPress={() => {
              if (isDeleting) return;
              handleDeleting(file);
            }}
          >
            <Icon
              name="trash"
              width={20}
              height={20}
              strokeColor={Colors.lightRed}
              fillColor="transparent"
            />
            <AppText style={{ color: Colors.lightRed }}>Supprimer</AppText>
          </Pressable>
          <Pressable
            style={{ flexDirection: "row", gap: 8, paddingHorizontal: 32 }}
            onPress={() => {
              if (isDownloading) return;
              handleFileDownload(file);
            }}
          >
            <Icon
              name="download"
              width={20}
              height={20}
              strokeColor={Colors.deepBlue}
              fillColor="transparent"
            />
            <AppText style={{ color: Colors.deepBlue }}>Télécharger</AppText>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
