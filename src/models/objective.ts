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

// Helper to calculate months between two dates
export const getMonthsBetween = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth()) +
    1 // +1 to include the starting month
  );
};

// Helper to calculate ongoing month number
export const getOngoingMonth = (start: string, end: string) => {
  const startDate = new Date(start);
  const now = new Date();
  if (now < startDate) return 0;
  const endDate = new Date(end);
  if (now > endDate) return getMonthsBetween(start, end);
  return (
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth()) +
    1
  );
};
