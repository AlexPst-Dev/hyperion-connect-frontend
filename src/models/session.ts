import { Exercise, ExerciseWithDetails } from "./exercise";
import { File } from "./file";
import { User } from "./user";

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
  author: User;
  authorId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  label: string;
  numberOfExercises: number;
  durationTime: string;
  filePictureId?: number;
  authorId?: number;
  listExercises?: string;
  recommendations?: string;
  contributions?: string;
}

export interface UpdateSessionRequest {
  label?: string;
  numberOfExercises?: number;
  durationTime?: string;
  filePictureId?: number;
  authorId?: number;
  listExercises?: string;
  recommendations?: string;
  contributions?: string;
  done?: boolean;
  isActive?: boolean;
}

export interface SessionWithFile {
  session: Session;
  filePicture: File | null;
}

export interface SessionExercisesResponse {
  exercises: ExerciseWithDetails[];
}

export interface LinkedSessions {
  id: number;
  userId: number;
  sessionId: number;
}
