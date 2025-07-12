// src/services/ticketService.ts
import { apiClient } from '../config/api';
import type { Ticket, TicketFormData, TicketScanResult } from '../types/ticket';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import { API_ENDPOINTS } from '../config/endpoints';

export const ticketService = {
  async getTickets(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    eventId?: string;
  }): Promise<PaginatedResponse<Ticket>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.search) queryParams.set('search', params.search);
      if (params?.status) queryParams.set('status', params.status);
      if (params?.eventId) queryParams.set('eventId', params.eventId);

      const url = `${API_ENDPOINTS.TICKETS.LIST}?${queryParams.toString()}`;
      const response = await apiClient.get<ApiResponse<Ticket[]> & { meta: any }>(url);

      if (response.data.success) {
        return {
          data: response.data.data,
          total: response.data.meta?.pagination?.total || response.data.data.length,
          page: response.data.meta?.pagination?.page || 1,
          limit: response.data.meta?.pagination?.limit || 10,
          totalPages: response.data.meta?.pagination?.totalPages || 1
        };
      } else {
        throw new Error(response.data.error || 'Error obteniendo boletos');
      }
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      
      // Fallback a datos mock si la API falla
      if (import.meta.env.DEV) {
        console.warn('⚠️ Usando datos mock para boletos...');
        return this.getMockTickets(params);
      }
      
      throw new Error(error.response?.data?.error?.message || 'Error obteniendo boletos');
    }
  },

  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    try {
      const response = await apiClient.get<ApiResponse<Ticket>>(
        API_ENDPOINTS.TICKETS.GET.replace(':id', id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error obteniendo boleto');
    }
  },

  async createTicket(ticketData: TicketFormData): Promise<ApiResponse<Ticket>> {
    try {
      const response = await apiClient.post<ApiResponse<Ticket>>(
        API_ENDPOINTS.TICKETS.CREATE,
        ticketData
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error creando boleto');
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      
      // Fallback a mock en desarrollo
      if (import.meta.env.DEV && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
        console.warn('⚠️ API no disponible, creando boleto mock...');
        return this.createMockTicket(ticketData);
      }
      
      throw new Error(error.response?.data?.error?.message || 'Error creando boleto');
    }
  },

  async resendTicket(ticketId: string, email: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        API_ENDPOINTS.TICKETS.RESEND.replace(':id', ticketId),
        { email }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error reenviando boleto');
      }
    } catch (error: any) {
      // Mock para desarrollo
      if (import.meta.env.DEV) {
        console.warn('⚠️ Usando mock para reenvío de boleto...');
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              data: undefined,
              message: `Boleto reenviado a ${email}`
            });
          }, 1000);
        });
      }
      
      throw new Error(error.response?.data?.error?.message || 'Error reenviando boleto');
    }
  },

  async scanTicket(qrData: string): Promise<TicketScanResult> {
    try {
      const response = await apiClient.post<ApiResponse<TicketScanResult>>(
        API_ENDPOINTS.TICKETS.SCAN,
        { qrData }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error escaneando boleto');
      }
    } catch (error: any) {
      // Mock para desarrollo
      if (import.meta.env.DEV) {
        console.warn('⚠️ Usando mock para escaneo de boleto...');
        return this.mockScanTicket(qrData);
      }
      
      throw new Error(error.response?.data?.error?.message || 'Error escaneando boleto');
    }
  },

  async markTicketAsUsed(ticketId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.TICKETS.UPDATE.replace(':id', ticketId) + '/mark-used'
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error marcando boleto como usado');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error marcando boleto como usado');
    }
  },

  async cancelTicket(ticketId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.TICKETS.DELETE.replace(':id', ticketId)
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error cancelando boleto');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error cancelando boleto');
    }
  },

  // Métodos mock para desarrollo
  async getMockTickets(params?: any): Promise<PaginatedResponse<Ticket>> {
    const mockTickets: Ticket[] = [
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
        qrCode: 'NEBULA-123-abc456',
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
        qrCode: 'NEBULA-456-def789',
        status: 'used',
        createdAt: new Date('2025-05-15'),
        updatedAt: new Date('2025-06-15'),
        usedAt: new Date('2025-06-15')
      }
    ];

    // Filtrar por búsqueda si se proporciona
    let filteredTickets = mockTickets;
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredTickets = mockTickets.filter(ticket =>
        ticket.ticketNumber.toLowerCase().includes(search) ||
        ticket.buyerName.toLowerCase().includes(search) ||
        ticket.eventName.toLowerCase().includes(search)
      );
    }

    // Filtrar por estado
    if (params?.status && params.status !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === params.status);
    }

    return {
      data: filteredTickets,
      total: filteredTickets.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1
    };
  },

  async createMockTicket(ticketData: TicketFormData): Promise<ApiResponse<Ticket>> {
    const mockTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      ticketNumber: `NBL-${Date.now().toString().slice(-8)}`,
      eventName: ticketData.eventName,
      eventDate: new Date(ticketData.eventDate),
      eventLocation: ticketData.eventLocation,
      price: ticketData.price,
      buyerName: ticketData.buyerName,
      buyerEmail: ticketData.buyerEmail,
      buyerPhone: ticketData.buyerPhone,
      qrCode: `NEBULA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockTicket,
          message: 'Boleto creado exitosamente'
        });
      }, 1500);
    });
  },

  async mockScanTicket(qrData: string): Promise<TicketScanResult> {
    const mockTicket: Ticket = {
      id: '1',
      ticketNumber: 'NBL-12345678',
      eventName: 'Fiesta Suchiapa',
      eventDate: new Date('2025-07-15T20:00:00'),
      eventLocation: 'Los aguacates, Suchiapa',
      price: 150,
      buyerName: 'Juan Pérez García',
      buyerEmail: 'juan.perez@email.com',
      buyerPhone: '+52 999 123 4567',
      qrCode: qrData,
      status: Math.random() > 0.3 ? 'active' : 'used',
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01'),
      usedAt: Math.random() > 0.3 ? undefined : new Date()
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ticket: mockTicket,
          isValid: mockTicket.status === 'active',
          message: mockTicket.status === 'active' 
            ? 'Boleto válido' 
            : mockTicket.status === 'used'
            ? 'Boleto ya utilizado'
            : 'Boleto cancelado'
        });
      }, 1500);
    });
  }
};