import * as DocumentPicker from "expo-document-picker";
import { FileCategory, File } from "../models/file";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import env from "@/env";

export interface UploadFileParams {
  label: string;
  fileCategory: FileCategory;
  authToken: string;
}

export interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
  errorCode?: string;
}

const maxSize = 10 * 1024 * 1024; // 10MB

export class FileUploadService {
  /**
   * Valider un fichier avant upload
   */
  static async validateFile(
    file: DocumentPicker.DocumentPickerAsset,
    fileCategory: FileCategory
  ): Promise<{ valid: boolean; error?: string }> {
    // Vérifier la taille
    if (file.size && file.size > maxSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux. La taille maximum est de 10MB. Taille actuelle: ${this.formatFileSize(
          file.size
        )}`,
      };
    }

    return { valid: true };
  }

  /**
   * Formater la taille de fichier en format lisible
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Sélectionner un fichier avec validation
   */
  static async selectFile(options?: {
    type?: string;
    multiple?: boolean;
    fileCategory?: FileCategory;
  }): Promise<DocumentPicker.DocumentPickerAsset | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: options?.type || "*/*",
        multiple: options?.multiple || false,
        copyToCacheDirectory: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const selectedFile = result.assets[0];

      // Valider le fichier si une catégorie est spécifiée
      if (options?.fileCategory) {
        const validation = await this.validateFile(
          selectedFile,
          options.fileCategory
        );
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      return selectedFile;
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      throw error;
    }
  }

  /**
   * Uploader un fichier vers le backend avec validation
   */
  static async uploadFile(
    file: DocumentPicker.DocumentPickerAsset,
    params: UploadFileParams
  ): Promise<UploadResult> {
    try {
      // Validation côté client
      const validation = await this.validateFile(file, params.fileCategory);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          errorCode: "CLIENT_VALIDATION_ERROR",
        };
      }

      const formData = new FormData();

      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append("file", blob, file.name);
      } catch (blobError) {
        console.error("Erreur création blob:", blobError);
        return {
          success: false,
          error: "Impossible de traiter le fichier",
          errorCode: "BLOB_CREATION_ERROR",
        };
      }

      formData.append("label", params.label);
      formData.append("fileCategory", params.fileCategory);

      // Configuration de la requête avec timeout adaptatif basé sur la taille
      const timeout = this.calculateTimeout(file.size || 0);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${env.API_URL}/files/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.authToken}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Erreur HTTP: ${response.status}`,
          errorCode: errorData.errorCode || "HTTP_ERROR",
        };
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("❌ Erreur lors de l'upload:", error);

      let errorMessage = "Erreur lors de l'upload";
      let errorCode = "UNKNOWN_ERROR";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Timeout: l'upload a pris trop de temps";
          errorCode = "TIMEOUT_ERROR";
        } else {
          errorMessage = error.message;
          errorCode = "UPLOAD_ERROR";
        }
      }

      return {
        success: false,
        error: errorMessage,
        errorCode,
      };
    }
  }

  /**
   * Calculer le timeout en fonction de la taille du fichier
   */
  private static calculateTimeout(fileSize: number): number {
    const baseTimeout = 30000; // 30 secondes de base
    const sizeInMB = fileSize / (1024 * 1024);

    // Ajouter 10 secondes par MB
    return baseTimeout + sizeInMB * 10000;
  }

  /**
   * Obtenir les informations de limite pour une catégorie
   */
  static async getLimits() {
    return maxSize;
  }
}

export const getImageAsBase64 = async (
  filePicture: File,
  token: string
): Promise<string> => {
  if (!filePicture || filePicture.fileCategory !== FileCategory.IMAGE) {
    return "";
  }

  if (!token) {
    console.error("Token manquant !");
    return "";
  }

  // Construction de l'URL selon le type d'endpoint
  let fullUrl: string = `${env.API_URL}/files/image/${filePicture.id}`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    // Convertir en base64 pour React Native
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error("Erreur lors de la conversion en base64"));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'image:", error);
    return "";
  }
};

export const downloadFileFromDb = async (
  file: File,
  token: string
): Promise<boolean> => {
  if (!file || !file.id || !token) {
    console.error("⚠️ Fichier ou token manquant");
    return false;
  }

  try {
    const fullUrl = `${env.API_URL}/files/download/${file.id}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (Platform.OS === "web") {
      // 📌 Version Web (utilise Blob + createObjectURL)
      const response = await fetch(fullUrl, { headers });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Crée un lien invisible et clique dessus pour forcer le download
      const link = document.createElement("a");
      link.href = url;
      link.download = file.label || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Libérer l’URL mémoire
      window.URL.revokeObjectURL(url);

      return true;
    } else {
      // 📌 Version Mobile (expo-file-system + sharing)
      const fileUri = `${FileSystem.documentDirectory}${file.label}`;

      const downloadResult = await FileSystem.downloadAsync(fullUrl, fileUri, {
        headers,
      });

      if (downloadResult.status !== 200) {
        throw new Error(`Erreur HTTP: ${downloadResult.status}`);
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          UTI: "com.adobe.pdf",
          mimeType: "application/pdf",
        });
      }

      return true;
    }
  } catch (error) {
    console.error("❌ Erreur téléchargement fichier:", error);
    return false;
  }
};
