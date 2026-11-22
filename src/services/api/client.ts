import ENV from "../../../env";

export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  // Token of the signed-in user, kept up to date by AuthContext. Used when a
  // call does not pass its own token: every API route except sign-in and the
  // news feed requires authentication.
  private sessionToken: string | null = null;

  setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  private authHeader(token?: string): Record<string, string> {
    const value = token || this.sessionToken;
    return value ? { Authorization: `Bearer ${value}` } : {};
  }

  constructor() {
    this.baseURL = ENV.API_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || "Erreur serveur",
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new ApiError("Timeout: Le serveur ne répond pas");
      }

      if (
        error instanceof TypeError &&
        error.message === "Network request failed"
      ) {
        throw new ApiError("Erreur de connexion réseau");
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      headers: this.authHeader(token),
    });
  }

  async post<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: this.authHeader(token),
    });
  }

  async put<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: this.authHeader(token),
    });
  }

  async patch<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      headers: this.authHeader(token),
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers: this.authHeader(token),
    });
  }
}

export const apiClient = new ApiClient();
