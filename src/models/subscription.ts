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
