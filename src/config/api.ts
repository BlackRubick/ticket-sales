// src/config/api.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from './constants';

// Interfaces para las respuestas de la API
interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

interface HealthCheckResponse {
  success: boolean;
  data: {
    status: string;
    timestamp: string;
    version: string;
    environment: string;
  };
  message: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - agregar token a todas las requests
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.auth_token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log para debugging en desarrollo
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - manejar tokens expirados
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log para debugging en desarrollo
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
        }
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Si el token expiró (401), intentar renovarlo
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem(STORAGE_KEYS.refresh_token);
          if (refreshToken) {
            try {
              const response = await this.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
              const { token } = response.data.data;
              
              localStorage.setItem(STORAGE_KEYS.auth_token, token);
              
              // Reintentar la request original con el nuevo token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              
              return this.instance.request(originalRequest);
            } catch (refreshError) {
              console.error('❌ Refresh token failed:', refreshError);
              this.clearAuthData();
              this.redirectToLogin();
              return Promise.reject(refreshError);
            }
          } else {
            this.clearAuthData();
            this.redirectToLogin();
          }
        }

        // Log del error para debugging
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            message: error.response?.data?.error?.message || error.message,
            data: error.response?.data
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.auth_token);
    localStorage.removeItem(STORAGE_KEYS.refresh_token);
    localStorage.removeItem(STORAGE_KEYS.user_data);
  }

  private redirectToLogin() {
    // Solo redirigir si no estamos ya en login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Métodos HTTP con tipos genéricos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  // Método para health check con tipo específico
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get<HealthCheckResponse>('/health');
      return response.status === 200 && response.data.success;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  // Método auxiliar para manejar respuestas de error tipadas
  handleApiError(error: any): never {
    if (error.response?.data?.error) {
      const apiError = error.response.data as ApiErrorResponse;
      throw new Error(apiError.error.message || 'Error de la API');
    }
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Error desconocido de la API');
  }
}

export const apiClient = new ApiClient();