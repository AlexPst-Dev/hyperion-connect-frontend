import { apiClient } from "./client";
import { File, FileCategory } from "../../models/file";

export const fileService = {
  async createFile(
    data: Pick<File, "label" | "url" | "fileCategory">,
    token: string,
  ): Promise<File> {
    return apiClient.post<File>("/files", data, token);
  },

  async getAllFiles(token: string): Promise<File[]> {
    return apiClient.get<File[]>("/files", token);
  },

  async getFileById(id: number, token: string): Promise<File> {
    return apiClient.get<File>(`/files/${id}`, token);
  },

  async getFilesByCategory(
    category: FileCategory,
    token: string
  ): Promise<File[]> {
    return apiClient.get<File[]>(`/files/category/${category}`, token);
  },

  async updateFile(
    id: number,
    data: Partial<Pick<File, "label" | "url" | "fileCategory">>,
    token: string
  ): Promise<{ message: string; file: File }> {
    return apiClient.patch<{ message: string; file: File }>(
      `/files/${id}`,
      data,
      token
    );
  },

  async deleteFile(id: number, token: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/files/${id}`, token);
  },
};
