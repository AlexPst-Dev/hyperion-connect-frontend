import { apiClient } from "./client";
import {
  CreateObjective,
  Objective,
  UpdateObjective,
} from "../../models/objective";

// Types for backend responses
interface ObjectiveResponse {
  message: string;
  objective: Objective;
}

interface ObjectivesListResponse {
  objectives: Objective[];
}

export class ObjectivesApiService {
  private static readonly ENDPOINTS = {
    OBJECTIVES: "/objectives",
    OBJECTIVE_BY_ID: (id: number) => `/objectives/${id}`,
    OBJECTIVES_BY_SPORTSMAN: (sportsmanId: number) =>
      `/objectives/by-sportsman/${sportsmanId}`,
    OBJECTIVES_BY_RESPONSIBLE: (responsibleId: number) =>
      `/objectives/by-responsible/${responsibleId}`,
    INACTIVE_OBJECTIVES_BY_SPORTSMAN: (sportsmanId: number) =>
      `/objectives/sportsman/${sportsmanId}/inactive`,
  } as const;

  /**
   * Create a new objective
   */
  static async createObjective(
    objectiveData: CreateObjective,
    token: string
  ): Promise<{ message: string; objective: Objective }> {
    return apiClient.post<ObjectiveResponse>(
      this.ENDPOINTS.OBJECTIVES,
      objectiveData,
      token
    );
  }

  /**
   * Get all objectives
   */
  static async getAllObjectives(token: string): Promise<Objective[]> {
    const response = await apiClient.get<ObjectivesListResponse>(
      this.ENDPOINTS.OBJECTIVES,
      token
    );
    return response.objectives;
  }

  /**
   * Get an objective by it's id
   */
  static async getObjectiveById(id: number, token: string): Promise<Objective> {
    const response = await apiClient.get<ObjectiveResponse>(
      this.ENDPOINTS.OBJECTIVE_BY_ID(id),
      token
    );
    return response.objective;
  }

  /**
   * Find all objectives of a sportsman
   */
  static async getObjectivesBySportsman(
    sportsmanId: number,
    token: string
  ): Promise<Objective[]> {
    const response = await apiClient.get<ObjectivesListResponse>(
      this.ENDPOINTS.OBJECTIVES_BY_SPORTSMAN(sportsmanId),
      token
    );
    return response.objectives;
  }

  /**
   * Find all objectives of a responsible
   */
  static async getObjectivesByResponsible(
    responsibleId: number,
    token: string
  ): Promise<Objective[]> {
    const response = await apiClient.get<ObjectivesListResponse>(
      this.ENDPOINTS.OBJECTIVES_BY_RESPONSIBLE(responsibleId),
      token
    );
    return response.objectives;
  }

  /**
   * Find all inactive objectives of a sportsman
   */
  static async getInactiveObjectivesBySportsman(
    sportsmanId: number,
    token: string
  ): Promise<Objective[]> {
    const response = await apiClient.get<ObjectivesListResponse>(
      this.ENDPOINTS.INACTIVE_OBJECTIVES_BY_SPORTSMAN(sportsmanId),
      token
    );
    return response.objectives;
  }

  /**
   * Update objective
   */
  static async updateObjective(
    id: number,
    updateData: UpdateObjective,
    token: string
  ): Promise<{ message: string; objective: Objective }> {
    return apiClient.put<ObjectiveResponse>(
      this.ENDPOINTS.OBJECTIVE_BY_ID(id),
      updateData,
      token
    );
  }

  /**
   * Hard delete
   */
  static async deleteObjective(
    id: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      this.ENDPOINTS.OBJECTIVE_BY_ID(id),
      token
    );
  }

  // Utility methods

  /**
   * Récupère les objectifs actifs d'un responsable
   */
  static async getActiveObjectivesByResponsible(
    responsibleId: number,
    token: string
  ): Promise<Objective[]> {
    const allObjectives = await this.getObjectivesByResponsible(
      responsibleId,
      token
    );
    return allObjectives.filter((objective) => objective.isActive);
  }

  /**
   * Unactive an objective
   */
  static async deactivateObjective(
    id: number,
    token: string
  ): Promise<{ message: string; objective: Objective }> {
    return this.updateObjective(id, { isActive: false }, token);
  }

  /**
   * Active an objective
   */
  static async activateObjective(
    id: number,
    token: string
  ): Promise<{ message: string; objective: Objective }> {
    return this.updateObjective(id, { isActive: true }, token);
  }

  /**
   * Check if an objective is expired
   */
  static isObjectiveExpired(objective: Objective): boolean {
    const endDate = new Date(objective.endDate);
    const currentDate = new Date();
    return endDate < currentDate;
  }

  /**
   * Check if an objective is ongoing
   */
  static isObjectiveOngoing(objective: Objective): boolean {
    const startDate = new Date(objective.startDate);
    const endDate = new Date(objective.endDate);
    const currentDate = new Date();
    return currentDate >= startDate && currentDate <= endDate;
  }
}

// Export indvidual methods for more flexibility
export const {
  createObjective,
  getAllObjectives,
  getObjectiveById,
  getObjectivesBySportsman,
  getObjectivesByResponsible,
  getInactiveObjectivesBySportsman,
  updateObjective,
  deleteObjective,
  getActiveObjectivesByResponsible,
  deactivateObjective,
  activateObjective,
} = ObjectivesApiService;
