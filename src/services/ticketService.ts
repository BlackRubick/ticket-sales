import { apiClient } from '../config/api';
import type { Ticket, TicketFormData, TicketScanResult } from '../types/ticket';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import { API_ENDPOINTS } from '../config/endpoints';

export const ticketService = {
  async getTickets(page = 1, limit = 10): Promise<PaginatedResponse<Ticket>> {
    const response = await apiClient.get<PaginatedResponse<Ticket>>(
      `${API_ENDPOINTS.TICKETS.LIST}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    const response = await apiClient.get<ApiResponse<Ticket>>(
      API_ENDPOINTS.TICKETS.GET.replace(':id', id)
    );
    return response.data;
  },

  async createTicket(ticketData: TicketFormData): Promise<ApiResponse<Ticket>> {
    // Simulate QR generation for now
    const qrCode = `NEBULA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ticketNumber = `NBL-${Date.now().toString().slice(-8)}`;
    
    const fullTicketData = {
      ...ticketData,
      qrCode,
      ticketNumber,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // For now, return mock data since API is not ready
    const mockTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      ...fullTicketData,
      eventDate: new Date(ticketData.eventDate)
    };

    return {
      success: true,
      data: mockTicket,
      message: 'Boleto creado exitosamente'
    };

    // When API is ready, uncomment this:
    // const response = await apiClient.post<ApiResponse<Ticket>>(
    //   API_ENDPOINTS.TICKETS.CREATE,
    //   fullTicketData
    // );
    // return response.data;
  },

  async resendTicket(ticketId: string, email: string): Promise<ApiResponse<void>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: undefined,
          message: `Boleto reenviado a ${email}`
        });
      }, 1000);
    });

    // When API is ready:
    // const response = await apiClient.post<ApiResponse<void>>(
    //   API_ENDPOINTS.TICKETS.RESEND.replace(':id', ticketId),
    //   { email }
    // );
    // return response.data;
  },

  async scanTicket(qrData: string): Promise<TicketScanResult> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTicket: Ticket = {
          id: '1',
          ticketNumber: 'NBL-12345678',
          eventName: 'Concierto de Rock',
          eventDate: new Date('2025-07-15'),
          eventLocation: 'Estadio Nacional',
          price: 150,
          buyerName: 'Juan Pérez',
          buyerEmail: 'juan@email.com',
          buyerPhone: '+52 999 123 4567',
          qrCode: qrData,
          status: Math.random() > 0.3 ? 'active' : 'used',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        resolve({
          ticket: mockTicket,
          isValid: mockTicket.status === 'active',
          message: mockTicket.status === 'active' 
            ? 'Boleto válido' 
            : 'Boleto ya utilizado'
        });
      }, 1500);
    });

    // When API is ready:
    // const response = await apiClient.post<TicketScanResult>(
    //   API_ENDPOINTS.TICKETS.SCAN,
    //   { qrData }
    // );
    // return response.data;
  }
};
