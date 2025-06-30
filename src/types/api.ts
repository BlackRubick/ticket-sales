import type { Ticket } from './ticket';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalTickets: number;
  activeTickets: number;
  usedTickets: number;
  totalRevenue: number;
  todaysSales: number;
  monthlyRevenue: number;
  recentTickets: Ticket[];
}