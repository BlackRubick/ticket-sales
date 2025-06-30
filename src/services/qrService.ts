import { TicketScanResult } from '../types/ticket';
import { ticketService } from './ticketService';

export const qrService = {
  generateQRCode(data: string): string {
    // In a real app, you'd use a QR code library like qrcode
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" fill="black" font-size="12">
          QR: ${data.slice(0, 10)}...
        </text>
      </svg>
    `)}`;
  },

  async scanTicket(qrData: string): Promise<TicketScanResult> {
    return ticketService.scanTicket(qrData);
  },

  parseQRData(qrData: string): { ticketId?: string; isValid: boolean } {
    try {
      // Simple validation for NEBULA QR codes
      if (qrData.startsWith('NEBULA-')) {
        const parts = qrData.split('-');
        return {
          ticketId: parts[1],
          isValid: parts.length >= 3
        };
      }
      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  }
};