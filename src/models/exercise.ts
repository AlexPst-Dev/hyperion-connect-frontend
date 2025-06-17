import { Category } from "./category";
import { File as FileModel } from "./file";

export interface Exercise {
  id: number;
  label: string;
  listMuscleGroupIds: string;
  durationTime: string;
  description: string;
  recommendations: string;
  filePicture: FileModel;
  filePictureId: number;
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
  filePictureId?: number;
  isActive?: boolean;
}

export interface ExerciseWithDetails extends Exercise {
  filePicture: FileModel;
  muscleGroups: Category[];
}
