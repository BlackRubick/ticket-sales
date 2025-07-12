import { useState, useCallback } from 'react';
import type { Ticket, TicketFormData } from '../types/ticket';
import { ticketService } from '../services/ticketService';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    eventId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching tickets with params:', params);
      
      const response = await ticketService.getTickets(params);
      
      console.log('✅ Tickets fetched successfully:', response);
      
      setTickets(response.data);
      setTotal(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      
      return response;
    } catch (err: any) {
      console.error('❌ Error fetching tickets:', err);
      setError(err.message || 'Error al cargar boletos');
      
      // En caso de error, mantener los datos actuales si existen
      if (tickets.length === 0) {
        setTickets([]);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tickets.length]);

  const createTicket = async (ticketData: TicketFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎫 Creating ticket:', ticketData);
      
      const response = await ticketService.createTicket(ticketData);
      
      if (response.success && response.data) {
        console.log('✅ Ticket created successfully:', response.data);
        
        // Agregar el nuevo ticket al inicio de la lista
        setTickets(prev => [response.data, ...prev]);
        setTotal(prev => prev + 1);
        
        return response.data;
      } else {
        throw new Error(response.error || 'Error creando boleto');
      }
    } catch (err: any) {
      console.error('❌ Error creating ticket:', err);
      setError(err.message || 'Error al crear boleto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendTicket = async (ticketId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📧 Resending ticket:', { ticketId, email });
      
      const response = await ticketService.resendTicket(ticketId, email);
      
      if (response.success) {
        console.log('✅ Ticket resent successfully');
        
        // Actualizar el ticket en la lista si el email cambió
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, buyerEmail: email, updatedAt: new Date() }
            : ticket
        ));
        
        return response;
      } else {
        throw new Error(response.error || 'Error reenviando boleto');
      }
    } catch (err: any) {
      console.error('❌ Error resending ticket:', err);
      setError(err.message || 'Error al reenviar boleto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsUsed = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('✅ Marking ticket as used:', ticketId);
      
      const response = await ticketService.markTicketAsUsed(ticketId);
      
      if (response.success) {
        console.log('✅ Ticket marked as used successfully');
        
        // Actualizar el estado del ticket en la lista
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId 
            ? { 
                ...ticket, 
                status: 'used' as const, 
                usedAt: new Date(),
                updatedAt: new Date() 
              }
            : ticket
        ));
        
        return response;
      } else {
        throw new Error(response.error || 'Error marcando boleto como usado');
      }
    } catch (err: any) {
      console.error('❌ Error marking ticket as used:', err);
      setError(err.message || 'Error al marcar boleto como usado');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('❌ Canceling ticket:', ticketId);
      
      const response = await ticketService.cancelTicket(ticketId);
      
      if (response.success) {
        console.log('✅ Ticket canceled successfully');
        
        // Actualizar el estado del ticket en la lista
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId 
            ? { 
                ...ticket, 
                status: 'cancelled' as const,
                updatedAt: new Date() 
              }
            : ticket
        ));
        
        return response;
      } else {
        throw new Error(response.error || 'Error cancelando boleto');
      }
    } catch (err: any) {
      console.error('❌ Error canceling ticket:', err);
      setError(err.message || 'Error al cancelar boleto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Getting ticket:', ticketId);
      
      const response = await ticketService.getTicket(ticketId);
      
      if (response.success && response.data) {
        console.log('✅ Ticket retrieved successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Error obteniendo boleto');
      }
    } catch (err: any) {
      console.error('❌ Error getting ticket:', err);
      setError(err.message || 'Error al obtener boleto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar los datos actuales
  const refreshTickets = useCallback(() => {
    return fetchTickets({
      page: currentPage,
      limit: 12 // Default limit
    });
  }, [currentPage, fetchTickets]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    tickets,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    
    // Acciones
    fetchTickets,
    createTicket,
    resendTicket,
    markTicketAsUsed,
    cancelTicket,
    getTicket,
    refreshTickets,
    clearError,
    
    // Funciones de utilidad
    hasMore: currentPage < totalPages,
    isEmpty: tickets.length === 0 && !loading,
    isFirstLoad: tickets.length === 0 && loading
  };
};