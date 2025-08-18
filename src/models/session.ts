import { ExerciseWithDetails } from "./exercise";
import { User } from "./user";

export interface Session {
  id: number;
  label: string;
  numberOfExercises: number;
  durationTime: string;
  publicImageUrl: string;
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
  publicImageUrl?: string;
  authorId?: number;
  listExercises?: string;
  recommendations?: string;
  contributions?: string;
}

export interface UpdateSessionRequest {
  label?: string;
  numberOfExercises?: number;
  durationTime?: string;
  publicImageUrl?: string;
  authorId?: number;
  listExercises?: string;
  recommendations?: string;
  contributions?: string;
  done?: boolean;
  isActive?: boolean;
}

export interface SessionExercisesResponse {
  exercises: ExerciseWithDetails[];
}

export interface LinkedSessions {
  id: number;
  userId: number;
  sessionId: number;
}
