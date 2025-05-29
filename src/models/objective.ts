import { User } from "./user";

export interface Objective {
  id: number;
  sportsman: User;
  sportsmanId: number;
  label: string;
  responsible: User;
  responsibleId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
