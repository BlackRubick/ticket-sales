import { apiClient } from '../config/api';
import { DashboardStats } from '../types/api';
import { API_ENDPOINTS } from '../config/endpoints';

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    // Mock data for now
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
              eventName: 'Concierto de Rock',
              eventDate: new Date('2025-07-15'),
              eventLocation: 'Estadio Nacional',
              price: 150,
              buyerName: 'Juan Pérez',
              buyerEmail: 'juan@email.com',
              buyerPhone: '+52 999 123 4567',
              qrCode: 'NEBULA-123-abc',
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        });
      }, 1000);
    });

    // When API is ready:
    // const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.ADMIN.STATS);
    // return response.data;
  },

  async getUsers() {
    // Mock implementation
    return {
      success: true,
      data: [],
      message: 'Lista de usuarios'
    };
  }
};