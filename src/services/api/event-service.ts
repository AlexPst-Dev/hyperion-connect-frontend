import { apiClient } from "./client";
import {
  CreateEventComplete,
  EventCompleteResponse,
  EventCategory,
  UpdateEvent,
  UpdateCoachingEvent,
} from "../../models/event";

export const eventService = {
  async getAllEvents(
    token: string
  ): Promise<{ events: EventCompleteResponse[] }> {
    return apiClient.get<{ events: EventCompleteResponse[] }>("/events", token);
  },

  async getEventById(
    id: number,
    token: string
  ): Promise<{ event: EventCompleteResponse }> {
    return apiClient.get<{ event: EventCompleteResponse }>(
      `/events/${id}`,
      token
    );
  },

  async getEventsByCategory(
    category: EventCategory,
    token: string
  ): Promise<{ events: EventCompleteResponse[] }> {
    return apiClient.get<{ events: EventCompleteResponse[] }>(
      `/events/category/${category}`,
      token
    );
  },

  async getEventsByUserId(
    userId: number,
    token: string
  ): Promise<{ events: EventCompleteResponse[] }> {
    return apiClient.get<{ events: EventCompleteResponse[] }>(
      `/events/user/${userId}`,
      token
    );
  },

  async createEvent(
    data: CreateEventComplete,
    token: string
  ): Promise<{ message: string; specificEvent: any }> {
    return apiClient.post<{ message: string; specificEvent: any }>(
      "/events",
      data,
      token
    );
  },

  async notifyValidationEvent(
    eventId: number,
    token: string
  ): Promise<{ message: string }> {
    if (!eventId) {
      throw new Error("Un id d'évenement est requis.");
    }

    try {
      return await apiClient.post<{ message: string }>(
        "/events/notifyValidation",
        { eventId },
        token
      );
    } catch (error) {
      console.error(
        "Erreur d'envoi de mail pour la validation d'un événement :",
        error
      );
      throw error;
    }
  },

  async notifySportingActivityParticipation(
    eventId: number,
    sportsmanId: number,
    token: string
  ): Promise<{ message: string }> {
    if (!eventId || !sportsmanId) {
      throw new Error("Un id d'évenement et un id d'un sportif est requis.");
    }

    try {
      return await apiClient.post<{ message: string }>(
        "/events/notifySportingActivityParticipation",
        { eventId, sportsmanId },
        token
      );
    } catch (error) {
      console.error(
        "Erreur d'envoi de mail pour la participation à un événement :",
        error
      );
      throw error;
    }
  },

  async updateEvent(
    id: number,
    data: Omit<UpdateEvent | UpdateCoachingEvent, "id"> & Record<string, any>,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>(`/events/${id}`, data, token);
  },

  async deleteEvent(id: number, token: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/events/${id}`, token);
  },

  async getEventUsers(
    id: number,
    token: string
  ): Promise<{ responsibles: any[]; participants: any[] }> {
    return apiClient.get<{ responsibles: any[]; participants: any[] }>(
      `/events/${id}/users`,
      token
    );
  },
};
