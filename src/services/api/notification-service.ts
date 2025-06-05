import {
  CreateNotificationDto,
  NotificationCategory,
  UpdateNotificationDto,
  Notification,
} from "@/src/models/notification";
import { apiClient } from "./client";

export class NotificationService {
  private static readonly BASE_ENDPOINT = "/notifications";

  /**
   * Creates a new notification
   */
  static async createNotification(
    data: CreateNotificationDto,
    token: string
  ): Promise<Notification> {
    return apiClient.post<Notification>("/notifications", data, token);
  }

  /**
   * Retrieves all notifications
   */
  static async getAllNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/notifications");
  }

  /**
   * Retrieves a notification by its ID
   */
  static async getNotificationById(id: number): Promise<Notification> {
    return apiClient.get<Notification>(`/notifications/${id}`);
  }

  /**
   * Retrieves notifications by category
   */
  static async getNotificationsByCategory(
    category: NotificationCategory,
    token: string
  ): Promise<Notification[]> {
    return apiClient.get<Notification[]>(
      `/notifications/category/${category}`,
      token
    );
  }

  /**
   * Updates a notification
   */
  static async updateNotification(
    id: number,
    data: UpdateNotificationDto,
    token: string
  ): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${id}`, data, token);
  }

  /**
   * Deletes a notification
   */
  static async deleteNotification(
    id: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/notifications/${id}`, token);
  }
}

// Export individual methods for more flexibility
export const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getNotificationsByCategory,
  updateNotification,
  deleteNotification,
} = NotificationService;
