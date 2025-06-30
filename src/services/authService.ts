// src/services/authService.ts
import type { LoginCredentials, AuthResponse } from '../types/auth.js';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock implementation - simular login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'admin@nebula.com' && credentials.password === 'admin123') {
          resolve({
            user: {
              id: '1',
              email: credentials.email,
              name: 'Administrador',
              role: 'admin',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            token: 'mock-jwt-token-12345',
            refreshToken: 'mock-refresh-token-67890'
          });
        } else {
          reject(new Error('Credenciales incorrectas'));
        }
      }, 1000);
    });
  },

  async logout(): Promise<void> {
    return Promise.resolve();
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return Promise.resolve({
      token: 'new-mock-jwt-token-54321'
    });
  },

  async getProfile() {
    return Promise.resolve({
      success: true,
      data: {
        id: '1',
        email: 'admin@nebula.com',
        name: 'Administrador',
        role: 'admin'
      }
    });
  }
};