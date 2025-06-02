import {
  CreateSubscriptionRequest,
  Subscription,
  UpdateSubscriptionRequest,
} from "@/src/models/subscription";
import { apiClient } from "./client";

export class SubscriptionService {
  /**
   * Get all subscriptions
   */
  async getAllSubscriptions(token?: string): Promise<Subscription[]> {
    try {
      return await apiClient.get<Subscription[]>("/subscriptions", token);
    } catch (error) {
      console.error("Erreur récupération abonnements :", error);
      throw error;
    }
  }

  /**
   * Get a subscription by it's id
   */
  async getSubscriptionById(id: number, token?: string): Promise<Subscription> {
    if (isNaN(id)) {
      throw new Error("L'ID doit être un nombre.");
    }

    try {
      return await apiClient.get<Subscription>(`/subscriptions/${id}`, token);
    } catch (error) {
      console.error("Erreur récupération abonnement :", error);
      throw error;
    }
  }

  /**
   * Get subscription by user id
   */
  async getSubscriptionByUserId(
    userId: number,
    token?: string
  ): Promise<Subscription> {
    if (isNaN(userId)) {
      throw new Error("ID utilisateur invalide");
    }

    try {
      return await apiClient.get<Subscription>(
        `/subscriptions/user/${userId}`,
        token
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de l'abonnement :", error);
      throw error;
    }
  }

  /**
   * Create new subscription
   */
  async createSubscription(
    data: CreateSubscriptionRequest,
    token?: string
  ): Promise<Subscription> {
    const { labelDiagnostic, labelPerformancePlan, subscriptionFileId } = data;

    if (!labelDiagnostic || !labelPerformancePlan || !subscriptionFileId) {
      throw new Error("Tous les champs sont requis.");
    }

    try {
      return await apiClient.post<Subscription>("/subscriptions", data, token);
    } catch (error) {
      console.error("Erreur création abonnement :", error);
      throw error;
    }
  }

  /**
   * Update existing subscription
   */
  async updateSubscription(
    id: number,
    data: UpdateSubscriptionRequest,
    token?: string
  ): Promise<Subscription> {
    if (isNaN(id)) {
      throw new Error("L'ID doit être un nombre.");
    }

    try {
      return await apiClient.put<Subscription>(
        `/subscriptions/${id}`,
        data,
        token
      );
    } catch (error) {
      console.error("Erreur mise à jour abonnement :", error);
      throw error;
    }
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(
    id: number,
    token?: string
  ): Promise<{ message: string }> {
    if (isNaN(id)) {
      throw new Error("L'ID doit être un nombre.");
    }

    try {
      return await apiClient.delete<{ message: string }>(
        `/subscriptions/${id}`,
        token
      );
    } catch (error) {
      console.error("Erreur suppression abonnement :", error);
      throw error;
    }
  }
}
