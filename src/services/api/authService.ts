import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";
import { LoginCredentials, LoginResponse, LoggedUser } from "../../models/auth";

const STORAGE_KEYS = {
  TOKEN: "@auth_token",
  USER: "@auth_user",
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      // Stocker le token et les infos utilisateur
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(response.user)
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Supprimer les données stockées
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error("Erreur lors de la récupération du token:", error);
      return null;
    }
  }

  async getStoredUser(): Promise<LoggedUser | null> {
    try {
      const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  }

  async isTokenValid(token: string): Promise<boolean> {
    try {
      // Vérifier la validité du token avec une route protégée
      await apiClient.get("/auth/verify", token);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
