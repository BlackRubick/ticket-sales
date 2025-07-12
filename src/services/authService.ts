// src/services/authService.ts
import { apiClient } from '../config/api';
import type { LoginCredentials, AuthResponse, User } from '../types/auth';
import type { ApiResponse } from '../types/api';
import { API_ENDPOINTS } from '../config/endpoints';
import { DEV_USERS } from '../config/constants';

// Interfaces para las respuestas de la API
interface LoginResponse {
  success: boolean;
  data: AuthResponse;
  error?: string;
}

interface RefreshResponse {
  success: boolean;
  data: { token: string };
  error?: string;
}

interface ProfileResponse {
  success: boolean;
  data: User;
  error?: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error en el login');
      }
    } catch (error: any) {
      // Si la API no está disponible, usar datos mock en desarrollo
      if (import.meta.env.DEV && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
        console.warn('⚠️ API no disponible, usando datos mock...');
        return this.mockLogin(credentials);
      }

      // Manejar errores de la API
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Credenciales incorrectas');
      }
      
      throw new Error(error.message || 'Error de conexión');
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('nebula_refresh_token');
      if (refreshToken) {
        await apiClient.post<{ success: boolean }>(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // No lanzar error, siempre hacer logout local
    }
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const response = await apiClient.post<RefreshResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error renovando token');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error renovando token');
    }
  },

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<ProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
      return {
        success: response.data.success,
        data: response.data.data,
        message: 'Perfil obtenido correctamente'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error obteniendo perfil');
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.put<ChangePasswordResponse>(
        '/auth/change-password',
        { currentPassword, newPassword }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error cambiando contraseña');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error cambiando contraseña');
    }
  },

  // Mock login para desarrollo cuando la API no está disponible
  mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Verificar credenciales mock
        const mockUser = Object.values(DEV_USERS).find(
          user => user.email === credentials.email && user.password === credentials.password
        );

        if (mockUser) {
          resolve({
            user: {
              id: '1',
              email: mockUser.email,
              name: mockUser.role === 'admin' ? 'Administrador' : 
                    mockUser.role === 'sales' ? 'Vendedor' : 'Escáner',
              role: mockUser.role as any,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            token: `mock-jwt-token-${Date.now()}`,
            refreshToken: `mock-refresh-token-${Date.now()}`
          });
        } else {
          reject(new Error('Credenciales incorrectas'));
        }
      }, 1000);
    });
  }
};