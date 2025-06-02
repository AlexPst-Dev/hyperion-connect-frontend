import {
  CreateNotificationDto,
  NotificationCategory,
  UpdateNotificationDto,
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
    return apiClient.post<Notification>(this.BASE_ENDPOINT, data, token);
  }

  /**
   * Retrieves all notifications
   */
  static async getAllNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>(this.BASE_ENDPOINT);
  }

  /**
   * Retrieves a notification by its ID
   */
  static async getNotificationById(id: number): Promise<Notification> {
    return apiClient.get<Notification>(`${this.BASE_ENDPOINT}/${id}`);
  }

  /**
   * Retrieves notifications by category
   */
  static async getNotificationsByCategory(
    category: NotificationCategory,
    token: string
  ): Promise<Notification[]> {
    return apiClient.get<Notification[]>(
      `${this.BASE_ENDPOINT}/category/${category}`,
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
    return apiClient.put<Notification>(
      `${this.BASE_ENDPOINT}/${id}`,
      data,
      token
    );
  }

  /**
   * Deletes a notification
   */
  static async deleteNotification(
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
  createNotification,
  getAllNotifications,
  getNotificationById,
  getNotificationsByCategory,
  updateNotification,
  deleteNotification,
} = NotificationService;
