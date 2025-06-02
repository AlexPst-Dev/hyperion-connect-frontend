import { apiClient } from "./client";
import { Client } from "../../models/client";

export const clientService = {
  async createClientList(
    professionalId: number,
    clientId: number,
    token: string
  ): Promise<{ message: string; clientList: Client }> {
    return apiClient.post<{ message: string; clientList: Client }>(
      "/clients",
      { professionalId, clientId },
      token
    );
  },

  async getClientListByProfessionalId(
    professionalId: number,
    token: string
  ): Promise<{ professionalId: number; clientIds: number[] }> {
    return apiClient.get<{ professionalId: number; clientIds: number[] }>(
      `/clients/${professionalId}`,
      token
    );
  },

  async updateClientListByProfessionalId(
    professionalId: number,
    clientId: number,
    method: "add" | "remove",
    token: string
  ): Promise<{ message: string; clientIds: string[] }> {
    return apiClient.put<{ message: string; clientIds: string[] }>(
      `/clients/${professionalId}`,
      { clientId, method },
      token
    );
  },

  async clearClientListByProfessionalId(
    professionalId: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `/clients/${professionalId}/clear`,
      {},
      token
    );
  },
};
