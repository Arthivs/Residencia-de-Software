// frontend/src/services/authService.ts
import apiClient from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface User {
  id: string;
  nome: string;
  email: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // CORREÇÃO: Adicionar /api antes do login
    const response = await apiClient.post<LoginResponse>('/api/login', credentials);
    
    if (response.data.token) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  setAuthData(data: LoginResponse): void {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();