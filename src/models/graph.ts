import { User } from "./user";

export interface Graph {
  id: number;
  user: User;
  userId: number;
  responsible: User;
  responsibleId: number;
  title: string;
  measuredValue: string;
  listMonthlyValue: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGraph {
  userId: number;
  responsibleId: number;
  title: string;
  measuredValue: string;
  listMonthlyValue: string;
  startDate: string;
  endDate: string;
}

export interface UpdateGraph {
  title?: string;
  measuredValue?: string;
  listMonthlyValue?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface GraphResponse {
  id: number;
  userId: number;
  responsibleId: number;
  title: string;
  measuredValue: string;
  listMonthlyValue: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  responsible?: User;
}

export const mapGraphResponse = (
  response: GraphResponse,
  user: User,
  responsible: User
): Graph => ({
  id: response.id,
  user,
  userId: response.userId,
  responsible,
  responsibleId: response.responsibleId,
  title: response.title,
  measuredValue: response.measuredValue,
  listMonthlyValue: response.listMonthlyValue,
  isActive: response.isActive,
  startDate: new Date(response.startDate).toString(),
  endDate: new Date(response.endDate).toString(),
  createdAt: new Date(response.createdAt).toString(),
  updatedAt: new Date(response.updatedAt).toString(),
});

export const DEFAULT_GRAPH_VALUES = {
  isActive: true,
} as const;

export function getDynamicMonthLabels(startDate: string, count: number) {
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aou",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [year, month] = startDate.split("-").map(Number); // YYYY-MM-DD
  let labels = [];
  let currentMonth = month - 1; // JS months are 0-based
  for (let i = 0; i < count; i++) {
    labels.push(months[(currentMonth + i) % 12]);
  }
  return labels;
}

export function getCurrentMonthIndex(startDate: string) {
  const start = new Date(startDate);
  const now = new Date();
  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth()) +
    1 // +1 because your DB starts at 1
  );
}
