import { apiClient } from "./client";
import { Billing } from "../../models/billing";

export const billingService = {
  async createBilling(
    data: Omit<Billing, "objective" | "createdAt" | "updatedAt">,
    token: string
  ): Promise<{ message: string; billing: Billing }> {
    return apiClient.post<{ message: string; billing: Billing }>(
      "/billings",
      data,
      token
    );
  },

  async getAllBillings(
    token: string
  ): Promise<{ message: string; billings: Billing[] }> {
    return apiClient.get<{ message: string; billings: Billing[] }>(
      "/billings",
      token
    );
  },

  async getBillingById(
    billingId: number,
    token: string
  ): Promise<{ message: string; billing: Billing }> {
    return apiClient.get<{ message: string; billing: Billing }>(
      `/billings/${billingId}`,
      token
    );
  },

  async getBillingsByObjectiveId(
    objectiveId: number,
    token: string
  ): Promise<{ message: string; billings: Billing[] }> {
    return apiClient.get<{ message: string; billings: Billing[] }>(
      `/billings/objective/${objectiveId}`,
      token
    );
  },

  async getBillingsByUser(
    sportsmanId: number,
    token: string
  ): Promise<{ message: string; billings: Billing[] }> {
    return apiClient.get<{ message: string; billings: Billing[] }>(
      `/billings/user/${sportsmanId}`,
      token
    );
  },

  async updateBilling(
    billingId: number,
    data: Partial<
      Omit<
        Billing,
        | "billingId"
        | "objective"
        | "objectiveId"
        | "date"
        | "createdAt"
        | "updatedAt"
      >
    >,
    token: string
  ): Promise<{ message: string; billing: Billing }> {
    return apiClient.put<{ message: string; billing: Billing }>(
      `/billings/${billingId}`,
      data,
      token
    );
  },

  async deleteBilling(
    billingId: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/billings/${billingId}`,
      token
    );
  },
};
