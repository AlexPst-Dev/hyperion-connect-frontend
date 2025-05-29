import { apiClient } from "./client";
import { User, CreateUserPayload } from "../../models/user";
import { LoginResponse, RegisterResponse } from "../../types/api";

export class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", { email, password });
  }

  async register(payload: CreateUserPayload): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>("/auth/register", {
      ...payload,
      profileCategory: "free",
    });
  }

  async getMe(token: string): Promise<User> {
    return apiClient.get<User>("/auth/me", token);
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    return apiClient.post<{ token: string }>("/auth/refresh", {}, token);
  }
}

export const authService = new AuthService();
