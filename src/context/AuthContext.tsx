import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getToken, setToken, removeToken } from "../utils/storage";
import { getMe } from "../services/api";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileCategory: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const userData = await getMe(token);
      setUser(userData.user);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const login = async (token: string) => {
    await setToken(token);
    await fetchUser();
  };

  const logout = async () => {
    try {
      setUser(null);
      await removeToken();
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await fetchUser();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
