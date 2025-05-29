export enum NotificationCategory {
  HOME_POPUP = "HOME_POPUP",
  NEWS = "NEWS",
}

export interface Notification {
  id: number;
  notificationCategory: NotificationCategory;
  title: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}
