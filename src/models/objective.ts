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

export interface CreateObjective {
  sportsmanId: number;
  label: string;
  responsibleId: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateObjective {
  sportsmanId?: number;
  label?: string;
  responsibleId?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
