import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from './constants';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.auth_token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem(STORAGE_KEYS.refresh_token);
          if (refreshToken) {
            try {
              const response = await this.post('/auth/refresh', { refreshToken });
              const { token } = response.data as { token: string };
              localStorage.setItem(STORAGE_KEYS.auth_token, token);
              
              // Retry original request
              error.config.headers.Authorization = `Bearer ${token}`;
              return this.instance.request(error.config);
            } catch (refreshError) {
              // Refresh failed, logout user
              localStorage.removeItem(STORAGE_KEYS.auth_token);
              localStorage.removeItem(STORAGE_KEYS.refresh_token);
              localStorage.removeItem(STORAGE_KEYS.user_data);
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }
}

export const apiClient = new ApiClient();