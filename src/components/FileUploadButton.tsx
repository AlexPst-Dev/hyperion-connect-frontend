import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FileCategory } from "../models/file";
import { FileUploadService } from "../utils/file-utils";
import AppText from "./AppText";
import GlobalStyles from "../styles/styles";
import Icon from "./Icon";
import { notify } from "./NotificationContainer";
import { useAuth } from "../hooks/useAuth";
import { SessionService } from "../services/api/session-service";
import { LoggedUser } from "../models/auth";

interface FileUploadButtonProps {
  fileCategory: FileCategory;
  label?: string;
  onUploadSuccess?: (file: any, newSession?: any) => void;
  onUploadError?: (error: string) => void;
  authToken: string;
  authUser: LoggedUser;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  fileCategory,
  label = "Uploader un fichier",
  onUploadSuccess,
  onUploadError,
  authToken,
  authUser,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!authToken) {
      Alert.alert(
        "Erreur",
        "Vous devez être connecté pour uploader un fichier"
      );
      return;
    }

    setUploading(true);

    try {
      let fileType = "*/*";
      if (fileCategory === FileCategory.IMAGE) {
        fileType = "image/*";
      } else if (fileCategory === FileCategory.SESSION_IMPORTED) {
        fileType = "application/pdf";
      }

      const file = await FileUploadService.selectFile({
        type: fileType,
      });

      if (!file) {
        setUploading(false);
        return;
      }

      const result = await FileUploadService.uploadFile(file, {
        label: file.name,
        fileCategory,
        authToken,
      });

      if (result.success) {
        notify({
          title: "Fichier importé avec succès",
          type: "success",
        });
        /*
         * Build a new session if it's type SESSION_IMPORTED in order to let the pro users see the files in sessions screen
         */
        if (fileCategory === FileCategory.SESSION_IMPORTED) {
          try {
            const newSession = await SessionService.createSession(
              {
                label: file.name,
                numberOfExercises: 1,
                durationTime: "00:01:00",
                filePictureId: result.data.id,
                authorId: authUser.id,
              },
              authToken
            );

            const newLinkedSession = await SessionService.addSessionToUser(
              authUser.id,
              newSession.session.id,
              authToken
            );
            onUploadSuccess?.(result.data, newSession);
          } catch (e) {
            console.log(
              "Error while create a new imported session and link it to user : ",
              e
            );
          }
        } else {
          onUploadSuccess?.(result.data);
        }
      } else {
        notify({
          title: "Une erreur est survenue lors de l'importation du fichier",
          type: "error",
        });
        onUploadError?.(result.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      Alert.alert("Erreur", errorMessage);
      notify({
        title: `Une erreur est survenue : ${errorMessage}`,
        type: "error",
      });
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        GlobalStyles.buttonBase,
        GlobalStyles.button_secondary,
        uploading && styles.buttonDisabled,
      ]}
      onPress={handleUpload}
      disabled={uploading}
    >
      {uploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <AppText style={styles.buttonText}>Upload en cours...</AppText>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <AppText style={styles.buttonText}>{label}</AppText>
          <Icon
            name="download"
            strokeColor="white"
            fillColor="transparent"
            width={20}
            height={20}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
