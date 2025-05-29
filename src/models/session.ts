import { File } from "./file";

export interface Session {
  id: number;
  label: string;
  numberOfExercises: number;
  durationTime: string;
  filePicture: File;
  filePictureId: number;
  listExercises: string;
  recommendations: string;
  contributions: string;
  done: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
