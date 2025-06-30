import { useState, useEffect } from 'react';
import type { Ticket, TicketFormData } from '../types/ticket';
import { ticketService } from '../services/ticketService';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getTickets();
      setTickets(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar boletos');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: TicketFormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.createTicket(ticketData);
      setTickets(prev => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
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
      await ticketService.resendTicket(ticketId, email);
    } catch (err: any) {
      setError(err.message || 'Error al reenviar boleto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    resendTicket
  };
};
