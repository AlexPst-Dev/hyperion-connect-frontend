export enum FileCategory {
  IMAGE = "IMAGE",
  MEDICAL_FILE = "MEDICAL_FILE",
  SESSION_IMPORTED = "SESSION_IMPORTED",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export interface File {
  id: number;
  label: string;
  url: string;
  fileCategory: FileCategory;
  createdAt: string;
  updatedAt: string;
}
