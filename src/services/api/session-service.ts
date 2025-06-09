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
  async createSession(
    data: CreateSessionRequest,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    const { label, numberOfExercises, durationTime } = data;

    if (!label || !numberOfExercises || !durationTime) {
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
  async getAllSessions(token?: string): Promise<Session[]> {
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
  async getSessionById(id: number, token?: string): Promise<SessionWithFile> {
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
  async updateSessionById(
    id: number,
    data: UpdateSessionRequest,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    if (isNaN(id)) {
      throw new Error("ID de session invalide");
    }

    try {
      return await apiClient.put<{ message: string; session: Session }>(
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
  async softDeleteSessionById(
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
  async deleteSessionById(
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
  async getExercisesBySessionId(
    id: number,
    token?: string
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
  async getSessionsBySportsman(
    sportsmanId: number,
    token?: string
  ): Promise<LinkedSessions[]> {
    if (isNaN(sportsmanId)) {
      throw new Error("ID de sportsman invalide");
    }

    try {
      const allLinkedSessions = await apiClient.get<LinkedSessions[]>(
        `/linkedSessions`,
        token
      );
      // Filter only those for the given sportsmanId
      return allLinkedSessions.filter((ls) => ls.sportsmanId === sportsmanId);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des linked sessions :",
        error
      );
      throw error;
    }
  }

  /**
   * Add a session to the list of a sportsman
   */
  async addSessionToSportsman(
    sportsmanId: number,
    sessionId: number,
    token?: string
  ): Promise<LinkedSessions[]> {
    if (!sportsmanId || isNaN(sportsmanId) || !sessionId || isNaN(sessionId)) {
      throw new Error("ID invalides");
    }

    try {
      const newLinkedSession = await apiClient.post<LinkedSessions[]>(
        `/linkedSessions`,
        { sportsmanId, sessionId },
        token
      );
      return newLinkedSession;
    } catch (error) {
      console.error("Erreur lors de la création de la linked session :", error);
      throw error;
    }
  }

  /**
   * Set a session as "isDone"
   */
  async markSessionAsDone(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    return this.updateSessionById(id, { done: true }, token);
  }

  /**
   * Set a session as "unDone"
   */
  async markSessionAsUndone(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    return this.updateSessionById(id, { done: false }, token);
  }

  /**
   * Set a session to active
   */
  async activateSession(
    id: number,
    token?: string
  ): Promise<{ message: string; session: Session }> {
    return this.updateSessionById(id, { isActive: true }, token);
  }

  /**
   * Set a session to unactive
   */
  async deactivateSession(
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
