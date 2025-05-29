export interface Exercice {
  id: number;
  label: string;
  listMuscleGroupIds: string;
  durationTime: string;
  description: string;
  recommendations: string;
  filePicture: File;
  filePictureId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
