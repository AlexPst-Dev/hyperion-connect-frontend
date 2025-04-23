import ENV from "../../env";

const BASE_URL = ENV.API_URL;

export const login = async (email: string, password: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error(errorData.message || "Identifiants invalides");
      }
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return data.token;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(
        "Le serveur ne répond pas. Vérifiez votre connexion ou réessayez plus tard."
      );
    }

    if (
      error instanceof TypeError &&
      error.message === "Network request failed"
    ) {
      throw new Error(
        "Échec de la connexion. Veuillez vérifier votre connexion internet ou le serveur."
      );
    }

    console.error("Erreur lors du login:", error);
    throw new Error(error.message || "Une erreur est survenue");
  }
};

export const getMe = async (token: string) => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data;
};

export const registerFreeAccount = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        profileCategory: "free",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'inscription.");
    }
    return data; // { message, user, token }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Le serveur ne répond pas. Réessayez plus tard.");
    }
    if (
      error instanceof TypeError &&
      error.message === "Network request failed"
    ) {
      throw new Error("Échec de la connexion. Vérifiez votre réseau.");
    }
    throw new Error(error.message || "Une erreur est survenue.");
  }
};
