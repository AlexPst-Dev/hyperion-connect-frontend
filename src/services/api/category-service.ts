import { apiClient } from "./client";
import { Category, CategoryType } from "../../models/category";

export const categoryService = {
  async createCategory(
    data: Pick<
      Category,
      "label" | "backgroundColor" | "textColor" | "categoryType"
    >,
    token: string
  ): Promise<Category> {
    return apiClient.post<Category>("/categories", data, token);
  },

  async getAllCategories(token: string): Promise<Category[]> {
    return apiClient.get<Category[]>("/categories", token);
  },

  async getCategoryById(id: number, token: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`, token);
  },

  async getCategoriesByType(
    type: CategoryType,
    token: string
  ): Promise<Category[]> {
    return apiClient.get<Category[]>(`/categories/type/${type}`, token);
  },

  async updateCategory(
    id: number,
    data: Partial<
      Pick<Category, "label" | "backgroundColor" | "textColor" | "categoryType">
    >,
    token: string
  ): Promise<Category> {
    return apiClient.put<Category>(`/categories/${id}`, data, token);
  },

  async deleteCategory(
    id: number,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/categories/${id}`, token);
  },
};
