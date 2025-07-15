import * as DocumentPicker from "expo-document-picker";
import { FileCategory } from "../models/file";
import env from "@/env";

export interface UploadFileParams {
  label: string;
  fileCategory: FileCategory;
  authToken: string;
  uploadToASpecificId?: number;
  companyId?: number;
}

export interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class FileUploadService {
  /**
   * Sélectionner un fichier avec des options personnalisées
   */
  static async selectFile(options?: {
    type?: string;
    multiple?: boolean;
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

      return result.assets[0];
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      throw new Error("Impossible de sélectionner le fichier");
    }
  }

  /**
   * Uploader un fichier vers le backend
   */
  static async uploadFile(
    file: DocumentPicker.DocumentPickerAsset,
    params: UploadFileParams
  ): Promise<UploadResult> {
    try {
      // Vérifier la taille du fichier (limite à 10MB par exemple)
      if (file.size && file.size > 10 * 1024 * 1024) {
        throw new Error("Le fichier est trop volumineux (max 10MB)");
      }

      const formData = new FormData();

      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append("file", blob, file.name);
      } catch (blobError) {
        console.error("Erreur création blob:", blobError);
        throw new Error("Impossible de traiter le fichier");
      }

      formData.append("label", params.label);
      formData.append("fileCategory", params.fileCategory);
      if (params.uploadToASpecificId) {
        formData.append(
          "uploadToASpecificId",
          params.uploadToASpecificId.toString()
        );
      }
      if (params.companyId) {
        formData.append("companyId", params.companyId.toString());
      }

      // Configuration de la requête avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes

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
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);

      let errorMessage = "Erreur lors de l'upload";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Timeout: l'upload a pris trop de temps";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
