import { File } from "./file";

export enum MonthlyMonitoringEnum {
  COMPLETE = "COMPLETE",
  DIETETIC = "DIETETIC",
  MENTAL_COACHING = "MENTAL_COACHING",
}

export interface Subscription {
  id: number;
  isBilanComplete?: boolean;
  monthlyMonitoringCategory?: MonthlyMonitoringEnum;
  startDate: string;
  endDate: string;
  otherServises?: string;
  subscriptionFile: File;
  subscriptionFileId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  isBilanComplete?: boolean;
  monthlyMonitoringCategory?: MonthlyMonitoringEnum;
  startDate: string;
  endDate: string;
  otherServises?: string;
  subscriptionFileId: number;
}

export interface UpdateSubscriptionRequest {
  isBilanComplete?: boolean;
  monthlyMonitoringCategory?: MonthlyMonitoringEnum;
  startDate: string;
  endDate: string;
  otherServises?: string;
  subscriptionFileId?: number;
}
