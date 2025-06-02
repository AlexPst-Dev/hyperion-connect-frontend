import { apiClient } from "./client";
import { Exercise, ExerciseWithDetails } from "../../models/exercise";

export const exerciseService = {
  async createExercise(
    data: Omit<
      Exercise,
      "id" | "createdAt" | "updatedAt" | "isActive" | "filePicture"
    >,
    token: string
  ): Promise<{ message: string; exercice: Exercise }> {
    return apiClient.post<{ message: string; exercice: Exercise }>(
      "/exercices",
      data,
      token
    );
  },

  async getAllExercises(token: string): Promise<Exercise[]> {
    return apiClient.get<Exercise[]>("/exercices", token);
  },

  async getExerciseById(
    id: number,
    token: string
  ): Promise<{ exercice: Exercise; filePicture: any }> {
    return apiClient.get<{ exercice: Exercise; filePicture: any }>(
      `/exercices/${id}`,
      token
    );
  },

  async updateExerciseById(
    id: number,
    data: Partial<
      Omit<Exercise, "id" | "createdAt" | "updatedAt" | "filePicture">
    >,
    token: string
  ): Promise<{ message: string; exercice: Exercise }> {
    return apiClient.put<{ message: string; exercice: Exercise }>(
      `/exercices/${id}`,
      data,
      token
    );
  },

  async softDeleteExerciseById(
    id: number,
    token: string
  ): Promise<{ message: string; exercice: Exercise }> {
    return apiClient.put<{ message: string; exercice: Exercise }>(
      `/exercices/${id}/soft-delete`,
      {},
      token
    );
  },

  async deleteExerciseById(
    id: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/exercices/${id}`, token);
  },

  async getMuscleGroupsForExercise(
    id: number,
    token: string
  ): Promise<{ muscleGroups: any[] }> {
    return apiClient.get<{ muscleGroups: any[] }>(
      `/exercices/${id}/muscle-groups`,
      token
    );
  },
};
