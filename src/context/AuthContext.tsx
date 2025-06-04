// contexts/AuthContext.tsx avec gestion d'erreur améliorée
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthContextType, LoggedUser, LoginCredentials } from "../models/auth";
import { authService } from "../services/api/authService";
import { ApiError } from "../services/api/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation : vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      const [storedToken, storedUser] = await Promise.all([
        authService.getStoredToken(),
        authService.getStoredUser(),
      ]);

      if (storedToken && storedUser) {
        // Vérifier si le token est encore valide
        const isValid = await authService.isTokenValid(storedToken);

        if (isValid) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          // Token expiré, nettoyer le stockage
          await authService.logout();
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de l'authentification:",
        error
      );
      // En cas d'erreur, nettoyer le stockage
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      console.error("Erreur login AuthContext:", error);

      // Améliorer la gestion des messages d'erreur
      if (error instanceof ApiError) {
        // Utiliser le message spécifique du backend
        const apiError = error as ApiError;
        if (apiError.status === 401) {
          throw new Error("Email ou mot de passe incorrect");
        } else if (apiError.status === 400) {
          throw new Error("Données manquantes ou invalides");
        } else if (apiError.status === 500) {
          throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          throw new Error(apiError.message || "Erreur de connexion");
        }
      } else if (error instanceof Error) {
        throw error; // Relancer l'erreur telle quelle
      } else {
        throw new Error("Une erreur inattendue est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
