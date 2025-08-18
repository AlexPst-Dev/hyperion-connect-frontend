import { Category } from "./category";

export interface Exercise {
  id: number;
  label: string;
  listMuscleGroupIds: string;
  durationTime: string;
  description: string;
  recommendations: string;
  publicImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateExerciseRequest {
  label?: string;
  listMuscleGroupIds?: string;
  durationTime?: string;
  description?: string;
  recommendations?: string;
  publicImageUrl?: string;
  isActive?: boolean;
}

export interface CreateExerciseRequest {
  label?: string;
  listMuscleGroupIds?: string;
  durationTime?: string;
  description?: string;
  recommendations?: string;
  publicImageUrl?: string;
}

export interface ExerciseWithDetails extends Exercise {
  muscleGroups: Category[];
}
