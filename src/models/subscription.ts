import { File } from "./file";

export interface Subscription {
  id: number;
  labelDiagnostic: string;
  labelPerformancePlan: string;
  subscriptionFile: File;
  subscriptionFileId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  labelDiagnostic: string;
  labelPerformancePlan: string;
  subscriptionFileId: number;
}

export interface UpdateSubscriptionRequest {
  labelDiagnostic?: string;
  labelPerformancePlan?: string;
  subscriptionFileId?: number;
}
