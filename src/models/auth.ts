export interface LoggedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileCategory: string;
  imageUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: LoggedUser;
  token: string;
}

export interface AuthContextType {
  user: LoggedUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
