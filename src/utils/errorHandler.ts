import { ApiError } from "../services/api/client";

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return "Identifiants invalides";
      case 403:
        return "Accès non autorisé";
      case 404:
        return "Ressource non trouvée";
      case 500:
        return "Erreur serveur interne";
      default:
        return error.message;
    }
  }

  return "Une erreur inattendue est survenue";
};
