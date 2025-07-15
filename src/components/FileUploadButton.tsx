import React, { useState } from "react";
import {
  View,
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
import { SessionService } from "../services/api/session-service";
import { LoggedUser } from "../models/auth";
import { UserService } from "../services/api/user-service";
import { fileService } from "../services/api/file-service";
import { ProfileCategory, SportsmanProfile } from "../models/user";
import { CompanyService } from "../services/api/company-service";

interface FileUploadButtonProps {
  fileCategory: FileCategory;
  label?: string;
  onUploadSuccess?: (file: any, newSession?: any) => void;
  onUploadError?: (error: string) => void;
  authToken: string;
  authUser: LoggedUser;
  uploadToUserId?: number;
  companyId?: number;
  styleAddButton?: boolean;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  fileCategory,
  label = "Uploader un fichier",
  onUploadSuccess,
  onUploadError,
  authToken,
  authUser,
  uploadToUserId,
  companyId,
  styleAddButton = false,
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
        uploadToASpecificId: uploadToUserId ? uploadToUserId : undefined,
        companyId: companyId ? companyId : undefined,
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
        } else if (fileCategory === FileCategory.IMAGE) {
          try {
            if (companyId) {
              console.log(companyId);
              const companyToUpdate = await CompanyService.getCompanyById(
                companyId,
                authToken
              );
              const updatedCompany = await CompanyService.updateCompany(
                companyId,
                {
                  fileImageCompany: result.data,
                },
                authToken
              );
              if (companyToUpdate.fileImageCompany) {
                await fileService.deleteFile(
                  companyToUpdate.fileImageCompany.id,
                  authToken
                );
              }
            } else {
              const userToUpdate = await UserService.getUserById(
                authUser.id,
                authToken
              );
              const updatedUser = UserService.updateUserById(
                authUser.id,
                {
                  filePicture: result.data,
                  filePictureId: result.data.id,
                },
                authToken
              );
              if (userToUpdate.filePicture) {
                await fileService.deleteFile(
                  userToUpdate.filePicture.id,
                  authToken
                );
              }
            }
            onUploadSuccess?.(result.data);
          } catch (e) {
            console.log(
              "Error while create a new image for the connected user : ",
              e
            );
          }
        } else if (fileCategory === FileCategory.USER_FILE && uploadToUserId) {
          try {
            const userToUpdate = await UserService.getUserById(
              uploadToUserId,
              authToken
            );
            if (
              userToUpdate.user.profileCategory === ProfileCategory.SPORTSMAN &&
              userToUpdate.profile
            ) {
              const currentList =
                (userToUpdate.profile as SportsmanProfile)?.listUserFiles || "";
              const currentIds = currentList
                ? currentList
                    .split(";")
                    .map((id) => parseInt(id.trim(), 10))
                    .filter((id) => !isNaN(id))
                : [];

              // Get new medic IDs from selection
              const newId = result.data.id;

              // Merge and deduplicate
              const mergedIds = Array.from(new Set([...currentIds, newId]));

              // Build new list string
              const updatedList = mergedIds.join("; ");
              const updatedUser = UserService.updateSportsman(
                uploadToUserId,
                {
                  listUserFiles: updatedList,
                },
                authToken
              );
              onUploadSuccess?.(result.data, updatedUser);
            }
          } catch (e) {
            console.log(
              "Error while fetching for user and uploading user file : ",
              e
            );
          }
        } else if (
          fileCategory === FileCategory.MEDICAL_FILE &&
          uploadToUserId
        ) {
          try {
            const userToUpdate = await UserService.getUserById(
              uploadToUserId,
              authToken
            );
            if (
              userToUpdate.user.profileCategory === ProfileCategory.SPORTSMAN &&
              userToUpdate.profile
            ) {
              const currentList =
                (userToUpdate.profile as SportsmanProfile)?.listMedicFiles ||
                "";
              const currentIds = currentList
                ? currentList
                    .split(";")
                    .map((id) => parseInt(id.trim(), 10))
                    .filter((id) => !isNaN(id))
                : [];

              // Get new medic IDs from selection
              const newId = result.data.id;

              // Merge and deduplicate
              const mergedIds = Array.from(new Set([...currentIds, newId]));

              // Build new list string
              const updatedList = mergedIds.join("; ");
              const updatedUser = UserService.updateSportsman(
                uploadToUserId,
                {
                  listMedicFiles: updatedList,
                },
                authToken
              );
              onUploadSuccess?.(result.data, updatedUser);
            }
          } catch (e) {
            console.log(
              "Error while fetching for user and uploading user file : ",
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
        styleAddButton
          ? GlobalStyles.button_add
          : GlobalStyles.button_secondary,
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
          {!styleAddButton && (
            <AppText style={styles.buttonText}>{label}</AppText>
          )}
          <Icon
            name={styleAddButton ? "plus" : "download"}
            strokeColor="white"
            fillColor="transparent"
            width={styleAddButton ? 24 : 20}
            height={styleAddButton ? 24 : 20}
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
