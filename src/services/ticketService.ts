// src/services/ticketService.ts
import { apiClient } from '../config/api';
import type { Ticket, TicketFormData, TicketScanResult } from '../types/ticket';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import { API_ENDPOINTS } from '../config/endpoints';

// Función para mapear los datos de la API al formato del frontend
const mapApiTicketToTicket = (apiTicket: any): Ticket => {
  return {
    id: apiTicket.id,
    ticketNumber: apiTicket.ticket_number || apiTicket.ticketNumber,
    eventName: apiTicket.event_name || apiTicket.eventName,
    eventDate: new Date(apiTicket.event_date || apiTicket.eventDate),
    eventLocation: apiTicket.event_location || apiTicket.eventLocation,
    price: parseFloat(apiTicket.price) || 0,
    buyerName: apiTicket.buyer_name || apiTicket.buyerName,
    buyerEmail: apiTicket.buyer_email || apiTicket.buyerEmail,
    buyerPhone: apiTicket.buyer_phone || apiTicket.buyerPhone,
    qrCode: apiTicket.qr_code || apiTicket.qrCode,
    status: apiTicket.status,
    createdAt: new Date(apiTicket.created_at || apiTicket.createdAt),
    updatedAt: new Date(apiTicket.updated_at || apiTicket.updatedAt),
    usedAt: apiTicket.used_at ? new Date(apiTicket.used_at) : undefined
  };
};

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
      
      
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
        meta?: {
          pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
        error?: string;
      }>(url);


      if (response.data.success && Array.isArray(response.data.data)) {
        // Mapear los datos de la API al formato del frontend
        const mappedTickets = response.data.data.map(mapApiTicketToTicket);
        

        return {
          data: mappedTickets,
          total: response.data.meta?.pagination?.total || mappedTickets.length,
          page: response.data.meta?.pagination?.page || params?.page || 1,
          limit: response.data.meta?.pagination?.limit || params?.limit || 10,
          totalPages: response.data.meta?.pagination?.totalPages || 1
        };
      } else {
        throw new Error(response.data.error || 'Error obteniendo boletos');
      }
    } catch (error: any) {
      console.error('❌ Error fetching tickets:', error);
      
      // Si hay un error de red o la API no está disponible, usar datos mock en desarrollo
      if (import.meta.env.DEV && (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' ||
        error.code === 'NETWORK_ERROR' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('connect ECONNREFUSED')
      )) {
        console.warn('⚠️ API no disponible, usando datos mock...');
        return this.getMockTickets(params);
      }
      
      throw new Error(error.response?.data?.error?.message || error.message || 'Error obteniendo boletos');
    }
  },

  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any;
        message?: string;
        error?: string;
      }>(API_ENDPOINTS.TICKETS.GET.replace(':id', id));
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: mapApiTicketToTicket(response.data.data),
          message: response.data.message || 'Boleto obtenido exitosamente'
        };
      } else {
        throw new Error(response.data.error || 'Error obteniendo boleto');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error obteniendo boleto');
    }
  },

  async createTicket(ticketData: TicketFormData): Promise<ApiResponse<Ticket>> {
    try {
      
      const response = await apiClient.post<{
        success: boolean;
        data: any;
        message?: string;
        error?: string;
      }>(API_ENDPOINTS.TICKETS.CREATE, ticketData);


      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: mapApiTicketToTicket(response.data.data),
          message: response.data.message || 'Boleto creado exitosamente'
        };
      } else {
        throw new Error(response.data.error || 'Error creando boleto');
      }
    } catch (error: any) {
      console.error('❌ Error creating ticket:', error);
      
      // Fallback a mock en desarrollo si la API no está disponible
      if (import.meta.env.DEV && (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' ||
        error.code === 'NETWORK_ERROR' ||
        error.message?.includes('Network Error')
      )) {
        console.warn('⚠️ API no disponible, creando boleto mock...');
        return this.createMockTicket(ticketData);
      }
      
      throw new Error(error.response?.data?.error?.message || error.message || 'Error creando boleto');
    }
  },

  async resendTicket(ticketId: string, email: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_ENDPOINTS.TICKETS.RESEND.replace(':id', ticketId), { email });

      if (response.data.success) {
        return {
          success: true,
          data: undefined,
          message: response.data.message || `Boleto reenviado a ${email}`
        };
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
      const response = await apiClient.post<{
        success: boolean;
        data: {
          ticket: any;
          isValid: boolean;
          message: string;
        };
        error?: string;
      }>(API_ENDPOINTS.TICKETS.SCAN, { qrData });

      if (response.data.success && response.data.data) {
        return {
          ticket: mapApiTicketToTicket(response.data.data.ticket),
          isValid: response.data.data.isValid,
          message: response.data.data.message
        };
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
      const response = await apiClient.put<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_ENDPOINTS.TICKETS.UPDATE.replace(':id', ticketId) + '/mark-used');

      if (response.data.success) {
        return {
          success: true,
          data: undefined,
          message: response.data.message || 'Boleto marcado como usado'
        };
      } else {
        throw new Error(response.data.error || 'Error marcando boleto como usado');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error marcando boleto como usado');
    }
  },

  async cancelTicket(ticketId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_ENDPOINTS.TICKETS.DELETE.replace(':id', ticketId));

      if (response.data.success) {
        return {
          success: true,
          data: undefined,
          message: response.data.message || 'Boleto cancelado'
        };
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
        qrCode: 'NEBULA-789-ghi012',
        status: 'active',
        createdAt: new Date('2025-06-20'),
        updatedAt: new Date('2025-06-20')
      }
    ];

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Filtrar por búsqueda si se proporciona
    let filteredTickets = mockTickets;
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredTickets = mockTickets.filter(ticket =>
        ticket.ticketNumber.toLowerCase().includes(search) ||
        ticket.buyerName.toLowerCase().includes(search) ||
        ticket.eventName.toLowerCase().includes(search) ||
        ticket.buyerEmail.toLowerCase().includes(search)
      );
    }

    // Filtrar por estado
    if (params?.status && params.status !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    return {
      data: paginatedTickets,
      total: filteredTickets.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTickets.length / limit)
    };
  },

  async createMockTicket(ticketData: TicketFormData): Promise<ApiResponse<Ticket>> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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

    return {
      success: true,
      data: mockTicket,
      message: 'Boleto creado exitosamente'
    };
  },

  async mockScanTicket(qrData: string): Promise<TicketScanResult> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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

    return {
      ticket: mockTicket,
      isValid: mockTicket.status === 'active',
      message: mockTicket.status === 'active' 
        ? 'Boleto válido' 
        : mockTicket.status === 'used'
        ? 'Boleto ya utilizado'
        : 'Boleto cancelado'
    };
  }
};