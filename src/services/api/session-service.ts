import {
  CreateSessionRequest,
  Session,
  SessionExercisesResponse,
  SessionWithFile,
  UpdateSessionRequest,
  LinkedSessions,
} from "../../models/session";
import { apiClient } from "./client";

export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(
    data: CreateSessionRequest,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    const { label, numberOfExercises, durationTime } = data;

    if (
      !label ||
      typeof numberOfExercises !== "number" ||
      typeof durationTime !== "string"
    ) {
      throw new Error("label, numberOfExercises et durationTime sont requis.");
    }

    try {
      return await apiClient.post<{ message: string; session: Session }>(
        "/sessions",
        data,
        token
      );
    } catch (error) {
      console.error("Erreur lors de la création de la session :", error);
      throw error;
    }
  }

  /**
   * Retrieve all actives session
   */
  static async getAllSessions(token?: string): Promise<Session[]> {
    try {
      return await apiClient.get<Session[]>("/sessions", token);
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions :", error);
      throw error;
    }
  }

  /**
   * Retrieve a session by it's id with the picture
   */
  static async getSessionById(
    id: number,
    token?: string
  ): Promise<SessionWithFile> {
    if (isNaN(id)) {
      throw new Error("ID de session invalide");
    }

    try {
      return await apiClient.get<SessionWithFile>(`/sessions/${id}`, token);
    } catch (error) {
      console.error("Erreur lors de la récupération de la session :", error);
      throw error;
    }
  }

  /**
   * Update a session by it's id
   */
  static async updateSessionById(
    id: number,
    data: UpdateSessionRequest,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    if (isNaN(id)) {
      throw new Error("ID de session invalide");
    }

    try {
      return await apiClient.patch<{ message: string; session: Session }>(
        `/sessions/${id}`,
        data,
        token
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la session :", error);
      throw error;
    }
  }

  /**
   * Sof delete
   */
  static async softDeleteSessionById(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    if (isNaN(id)) {
      throw new Error("ID de session invalide");
    }

    try {
      return await apiClient.put<{ message: string; session: Session }>(
        `/sessions/${id}/archive`,
        {},
        token
      );
    } catch (error) {
      console.error("Erreur lors de l'archivage :", error);
      throw error;
    }
  }

  /**
   * Hard delete
   */
  static async deleteSessionById(
    id: number,
    token?: string
  ): Promise<{ message: string }> {
    if (isNaN(id)) {
      throw new Error("ID de session invalide");
    }

    try {
      return await apiClient.delete<{ message: string }>(
        `/sessions/${id}`,
        token
      );
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      throw error;
    }
  }

  /**
   * Find all exercises of a session with details
   */
  static async getExercisesBySessionId(
    id: number,
    token: string
  ): Promise<SessionExercisesResponse> {
    if (isNaN(id)) {
      throw new Error("ID de session invalide");
    }

    try {
      return await apiClient.get<SessionExercisesResponse>(
        `/sessions/${id}/exercises`,
        token
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des exercices :", error);
      throw error;
    }
  }

  /**
   * Find all sessions of a sportsman
   */
  static async getSessionsByUser(
    userId: number,
    token?: string
  ): Promise<LinkedSessions[]> {
    if (isNaN(userId)) {
      throw new Error("ID de sportsman invalide");
    }

    try {
      const allLinkedSessions = await apiClient.get<LinkedSessions[]>(
        `/linkedSessions`,
        token
      );
      // Filter only those for the given userId
      return allLinkedSessions.filter((ls) => ls.userId === userId);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des linked sessions :",
        error
      );
      throw error;
    }
  }

  /**
   * Add a session to the list of an user
   */
  static async addSessionToUser(
    userId: number,
    sessionId: number,
    token?: string
  ): Promise<LinkedSessions[]> {
    if (!userId || isNaN(userId) || !sessionId || isNaN(sessionId)) {
      throw new Error("ID invalides");
    }

    try {
      const newLinkedSession = await apiClient.post<LinkedSessions[]>(
        `/linkedSessions`,
        { userId, sessionId },
        token
      );
      return newLinkedSession;
    } catch (error) {
      console.error("Erreur lors de la création de la linked session :", error);
      throw error;
    }
  }

  /**
   * Add a session to the list of an user
   */
  static async removeSessionToUser(
    userId: number,
    sessionId: number,
    token?: string
  ): Promise<{ message: string }> {
    if (isNaN(userId) || isNaN(sessionId)) {
      throw new Error("ID de session ou d'utilisateur invalide");
    }

    try {
      const linkedSessionToRemove = (
        await SessionService.getSessionsByUser(userId, token)
      ).filter((s) => s.sessionId === sessionId);
      return await apiClient.delete<{ message: string }>(
        `/linkedSessions/${linkedSessionToRemove[0].id}`,
        token
      );
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      throw error;
    }
  }

  /**
   * Set a session as "isDone"
   */
  static async markSessionAsDone(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    return this.updateSessionById(id, { done: true }, token);
  }

  /**
   * Set a session as "unDone"
   */
  static async markSessionAsUndone(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    return this.updateSessionById(id, { done: false }, token);
  }

  /**
   * Set a session to active
   */
  static async activateSession(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    return this.updateSessionById(id, { isActive: true }, token);
  }

  /**
   * Set a session to unactive
   */
  static async deactivateSession(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    return this.updateSessionById(id, { isActive: false }, token);
  }
}

export function getMinutesFromDuration(durationTime: string): number {
  if (!durationTime) return 0;
  const [hours, minutes] = durationTime.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function addExercisesToSessionList(
  currentList: string,
  newIds: number[]
): string {
  // Split current list into array, filter out empty strings, and convert to numbers
  const currentIds = currentList
    .split(";")
    .map((id) => id.trim())
    .filter((id) => id !== "")
    .map(Number);

  // Create a Set to avoid duplicates
  const idSet = new Set(currentIds);

  // Add new IDs
  newIds.forEach((id) => idSet.add(id));

  // Join back to string with "; " separator and a trailing ";"
  return Array.from(idSet).join("; ") + ";";
}

export function isDuplicateLinkedSession(
  linkedSessions: LinkedSessions[],
  sessionId: number,
  sportsmanId: number
): boolean {
  return linkedSessions.some(
    (ls) => ls.sessionId === sessionId && ls.userId === sportsmanId
  );
}

export const {
  createSession,
  getAllSessions,
  getExercisesBySessionId,
  getSessionById,
  getSessionsByUser,
  updateSessionById,
  markSessionAsDone,
  markSessionAsUndone,
  activateSession,
  addSessionToUser,
  deactivateSession,
  deleteSessionById,
  softDeleteSessionById,
} = SessionService;
