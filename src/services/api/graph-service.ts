import {
  GraphResponse,
  Graph,
  CreateGraph,
  UpdateGraph,
} from "@/src/models/graph";
import { apiClient } from "./client";

export const mapGraphResponse = (response: GraphResponse): Graph => ({
  id: response.id,
  user: response.user!,
  userId: response.userId,
  responsible: response.responsible!,
  responsibleId: response.responsibleId,
  title: response.title,
  measuredValue: response.measuredValue,
  listMonthlyValue: response.listMonthlyValue,
  isActive: response.isActive,
  startDate: response.startDate,
  endDate: response.endDate,
  createdAt: response.createdAt,
  updatedAt: response.updatedAt,
});

export class GraphService {
  private static readonly BASE_ENDPOINT = "/graphs";

  /**
   * Create new graph
   */
  static async createGraph(
    data: CreateGraph,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(this.BASE_ENDPOINT, data, token);
  }

  /**
   * Find all graphs
   */
  static async getAllGraphs(token: string): Promise<GraphResponse[]> {
    return apiClient.get<GraphResponse[]>(this.BASE_ENDPOINT, token);
  }

  /**
   * Retrieves a graph by its ID with user and responsible relationships
   */
  static async getGraphById(id: number, token: string): Promise<Graph> {
    const response = await apiClient.get<GraphResponse>(
      `${this.BASE_ENDPOINT}/${id}`,
      token
    );
    return mapGraphResponse(response);
  }

  /**
   * Retrieves all graphs of a user (athlete)
   */
  static async getGraphsByUserId(
    userId: number,
    token: string
  ): Promise<Graph[]> {
    const responses = await apiClient.get<GraphResponse[]>(
      `${this.BASE_ENDPOINT}/user/${userId}`,
      token
    );
    return responses.map(mapGraphResponse);
  }

  /**
   * Updates a graph
   */
  static async updateGraph(
    id: number,
    data: UpdateGraph,
    token: string
  ): Promise<Graph> {
    const response = await apiClient.patch<GraphResponse>(
      `${this.BASE_ENDPOINT}/${id}`,
      data,
      token
    );
    return mapGraphResponse(response);
  }

  /**
   * Hard delete a graph
   */
  static async deleteGraph(
    id: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.BASE_ENDPOINT}/${id}`,
      token
    );
  }
}

// Export individual methods for more flexibility
export const {
  createGraph,
  getAllGraphs,
  getGraphById,
  getGraphsByUserId,
  updateGraph,
  deleteGraph,
} = GraphService;
