import { apiClient } from '../config/api';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { API_ENDPOINTS } from '../config/endpoints';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken
    });
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  }
};