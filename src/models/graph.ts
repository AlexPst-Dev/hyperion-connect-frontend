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
