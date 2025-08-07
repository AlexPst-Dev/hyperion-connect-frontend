import { Objective } from "./objective";

export interface Billing {
  billingId: number;
  objective: Objective;
  objectiveId: number;
  date: string;
  globalAmount: number;
  isMonthly: boolean;
  monthlyAmount: number;
  paymentReceived: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
