// src/services/adminService.ts
import { apiClient } from '../config/api';
import type { DashboardStats } from '../types/api';
import type { User } from '../types/auth';
import { API_ENDPOINTS } from '../config/endpoints';

interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'sales' | 'scanner';
}

interface UpdateUserData {
  email?: string;
  name?: string;
  role?: 'admin' | 'sales' | 'scanner';
  is_active?: boolean;
}

// Interfaces para las respuestas de la API
interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  error?: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

interface CreateUserResponse {
  success: boolean;
  data: User;
  message: string;
  error?: string;
}

interface UpdateUserResponse {
  success: boolean;
  data: User;
  message: string;
  error?: string;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStatsResponse>(
        API_ENDPOINTS.ADMIN.STATS
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error obteniendo estadísticas');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      
      // Fallback a datos mock en desarrollo
      if (import.meta.env.DEV) {
        console.warn('⚠️ Usando datos mock para estadísticas...');
        return this.getMockStats();
      }
      
      throw new Error(error.response?.data?.error?.message || 'Error obteniendo estadísticas');
    }
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: User[];
    meta: {
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());

      const url = `${API_ENDPOINTS.ADMIN.USERS}?${queryParams.toString()}`;
      const response = await apiClient.get<UsersResponse>(url);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error obteniendo usuarios');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      // Fallback a datos mock en desarrollo
      if (import.meta.env.DEV) {
        console.warn('⚠️ Usando datos mock para usuarios...');
        return this.getMockUsers();
      }
      
      throw new Error(error.response?.data?.error?.message || 'Error obteniendo usuarios');
    }
  },

  async createUser(userData: CreateUserData): Promise<{
    success: boolean;
    data: User;
    message: string;
  }> {
    try {
      const response = await apiClient.post<CreateUserResponse>(
        API_ENDPOINTS.ADMIN.USERS, 
        userData
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error creando usuario');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error creando usuario');
    }
  },

  async updateUser(userId: string, userData: UpdateUserData): Promise<{
    success: boolean;
    data: User;
    message: string;
  }> {
    try {
      const response = await apiClient.put<UpdateUserResponse>(
        `${API_ENDPOINTS.ADMIN.USERS}/${userId}`, 
        userData
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error actualizando usuario');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error actualizando usuario');
    }
  },

  async deleteUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.delete<DeleteUserResponse>(
        `${API_ENDPOINTS.ADMIN.USERS}/${userId}`
      );

      if (response.data.success) {
        return {
          success: response.data.success,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.error || 'Error eliminando usuario');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error eliminando usuario');
    }
  },

  // Métodos mock para desarrollo (sin async en la definición del objeto)
  getMockStats(): Promise<DashboardStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalTickets: 1247,
          activeTickets: 856,
          usedTickets: 391,
          totalRevenue: 186750,
          todaysSales: 12,
          monthlyRevenue: 45230,
          recentTickets: [
            {
              id: '1',
              ticketNumber: 'NBL-12345678',
              eventName: 'Fiesta Suchiapa',
              eventDate: new Date('2025-07-15T20:00:00'),
              eventLocation: 'Los aguacates, Suchiapa',
              price: 150,
              buyerName: 'Juan Pérez García',
              buyerEmail: 'juan.perez@email.com',
              buyerPhone: '+52 999 123 4567',
              qrCode: 'NEBULA-123-abc',
              status: 'active',
              createdAt: new Date('2025-06-01'),
              updatedAt: new Date('2025-06-01')
            },
            {
              id: '2',
              ticketNumber: 'NBL-87654321',
              eventName: 'Concierto Rock',
              eventDate: new Date('2025-08-20T19:30:00'),
              eventLocation: 'Estadio Nacional',
              price: 200,
              buyerName: 'María González López',
              buyerEmail: 'maria.gonzalez@email.com',
              buyerPhone: '+52 999 765 4321',
              qrCode: 'NEBULA-456-def',
              status: 'used',
              createdAt: new Date('2025-05-15'),
              updatedAt: new Date('2025-06-15'),
              usedAt: new Date('2025-06-15')
            },
            {
              id: '3',
              ticketNumber: 'NBL-11223344',
              eventName: 'Teatro Musical',
              eventDate: new Date('2025-09-10T18:00:00'),
              eventLocation: 'Teatro Principal',
              price: 180,
              buyerName: 'Carlos Rodríguez Martínez',
              buyerEmail: 'carlos.rodriguez@email.com',
              buyerPhone: '+52 999 112 2334',
              qrCode: 'NEBULA-789-ghi',
              status: 'active',
              createdAt: new Date('2025-06-20'),
              updatedAt: new Date('2025-06-20')
            }
          ]
        });
      }, 1000);
    });
  },

  getMockUsers(): Promise<{
    success: boolean;
    data: User[];
    meta: {
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: '1',
              email: 'admin@nebula.com',
              name: 'Administrador Principal',
              role: 'admin',
              createdAt: new Date('2025-01-01'),
              updatedAt: new Date('2025-06-01')
            },
            {
              id: '2',
              email: 'sales@nebula.com',
              name: 'Vendedor Principal',
              role: 'sales',
              createdAt: new Date('2025-01-15'),
              updatedAt: new Date('2025-05-20')
            },
            {
              id: '3',
              email: 'scanner@nebula.com',
              name: 'Escáner Principal',
              role: 'scanner',
              createdAt: new Date('2025-02-01'),
              updatedAt: new Date('2025-05-15')
            }
          ],
          meta: {
            pagination: {
              page: 1,
              limit: 10,
              total: 3,
              totalPages: 1,
              hasNext: false,
              hasPrev: false
            }
          }
        });
      }, 800);
    });
  }
};