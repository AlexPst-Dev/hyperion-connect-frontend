import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/api/authService";
import { authStorage } from "../services/storage/authStorage";
import { User } from "../models/user";
import { ApiError } from "../services/api/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const savedToken = await authStorage.getToken();
      const savedUser = await authStorage.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut auth:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);

      await authStorage.saveToken(response.token);
      await authStorage.saveUser(response.user);

      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authStorage.clearAll();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  }, []);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
  };
};
