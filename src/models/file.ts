export enum FileCategory {
  IMAGE = "IMAGE",
  MEDICAL_FILE = "MEDICAL_FILE",
  SESSION_IMPORTED = "SESSION_IMPORTED",
  SUBSCRIPTION = "SUBSCRIPTION",
  USER_FILE = "USER_FILE",
}

export interface File {
  id: number;
  label: string;
  url?: string;
  mime?: string;
  blob?: Buffer;
  fileCategory: FileCategory;
  createdAt: string;
  updatedAt: string;
}
