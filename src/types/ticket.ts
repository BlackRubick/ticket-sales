export interface Ticket {
  id: string;
  ticketNumber: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  price: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  usedAt?: Date;
}

export interface TicketFormData {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  price: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

export interface TicketScanResult {
  ticket: Ticket;
  isValid: boolean;
  message: string;
}