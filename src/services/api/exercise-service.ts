import { apiClient } from "./client";
import { Exercise, ExerciseWithDetails } from "../../models/exercise";
import { Category } from "@/src/models/category";

export const exerciseService = {
  async createExercise(
    data: Omit<
      Exercise,
      "id" | "createdAt" | "updatedAt" | "isActive" | "filePicture"
    >,
    token: string
  ): Promise<{ message: string; exercice: Exercise }> {
    return apiClient.post<{ message: string; exercice: Exercise }>(
      "/exercises",
      data,
      token
    );
  },

  async getAllExercises(token: string): Promise<ExerciseWithDetails[]> {
    return apiClient.get<ExerciseWithDetails[]>("/exercises", token);
  },

  async getExerciseById(
    id: number,
    token: string
  ): Promise<{ exercice: Exercise; filePicture: any }> {
    return apiClient.get<{ exercice: Exercise; filePicture: any }>(
      `/exercises/${id}`,
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
    return apiClient.patch<{ message: string; exercice: Exercise }>(
      `/exercises/${id}`,
      data,
      token
    );
  },

  async softDeleteExerciseById(
    id: number,
    token: string
  ): Promise<{ message: string; exercice: Exercise }> {
    return apiClient.put<{ message: string; exercice: Exercise }>(
      `/exercises/${id}/soft-delete`,
      {},
      token
    );
  },

  async deleteExerciseById(
    id: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/exercises/${id}`, token);
  },

  async getMuscleGroupsForExercise(
    id: number,
    token: string
  ): Promise<{ muscleGroups: Category[] }> {
    return apiClient.get<{ muscleGroups: Category[] }>(
      `/exercises/${id}/muscle-groups`,
      token
    );
  },
};
