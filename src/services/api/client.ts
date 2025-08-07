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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async put<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async patch<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

export const apiClient = new ApiClient();
