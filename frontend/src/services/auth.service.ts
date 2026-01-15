import { apiClient } from './api';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'Owner' | 'Manager' | 'Staff';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  message?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<any>('/auth/login', credentials);
    
    // Backend returns { success, token, user } not { success, data: { token, user } }
    if (response.success && response.token && response.user) {
      // Store token and user info
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return {
        success: true,
        data: {
          token: response.token,
          user: response.user,
        },
      };
    }
    
    return {
      success: false,
      message: response.message || 'Login failed',
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<any>('/auth/register', data);
    
    // Backend register might return token or just user
    if (response.success) {
      if (response.data) {
        // If token is in data
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          // Just user data, need to login after registration
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      }
      
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    }
    
    return {
      success: false,
      message: response.message || 'Registration failed',
    };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

