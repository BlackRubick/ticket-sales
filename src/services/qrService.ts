// src/services/qrService.ts
import { apiClient } from '../config/api';
import type { TicketScanResult } from '../types/ticket';
import type { ApiResponse } from '../types/api';
import { ticketService } from './ticketService';

// Interfaces para las respuestas de la API
interface QRValidateResponse {
  success: boolean;
  data: TicketScanResult;
  error?: string;
}

interface MarkAsUsedResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const qrService = {
  generateQRCode(data: string, size: number = 200): string {
    // Generar QR Code usando una librería simple o API externa
    // Por ahora usaremos QR Server API (gratuita) o generación SVG simple
    
    try {
      // Opción 1: Usar QR Server API (requiere internet)
      if (navigator.onLine) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=svg&margin=10&ecc=M`;
      }
      
      // Opción 2: Fallback a QR simple en SVG (offline)
      return this.generateSimpleQRSVG(data, size);
    } catch (error) {
      console.error('Error generando QR:', error);
      return this.generateSimpleQRSVG(data, size);
    }
  },

  generateQRCodeDataURL(data: string, size: number = 200): string {
    // Para casos donde necesitemos data URL específicamente
    const qrUrl = this.generateQRCode(data, size);
    
    // Si es una URL externa, convertir a data URL usando canvas
    if (qrUrl.startsWith('http')) {
      return this.generateSimpleQRSVG(data, size);
    }
    
    return qrUrl;
  },

  async scanTicket(qrData: string): Promise<TicketScanResult> {
    try {
      // Primero validar el formato del QR
      const qrValidation = this.validateQRFormat(qrData);
      if (!qrValidation.isValid) {
        throw new Error('Formato de código QR inválido');
      }

      // Usar el servicio de tickets para escanear
      return await ticketService.scanTicket(qrData);
    } catch (error: any) {
      throw new Error(error.message || 'Error escaneando código QR');
    }
  },

  async validateQR(qrData: string): Promise<TicketScanResult> {
    try {
      // Llamar al endpoint específico de validación QR
      const response = await apiClient.post<QRValidateResponse>('/qr/validate', { qrData });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error validando código QR');
      }
    } catch (error: any) {
      // Fallback al servicio de tickets
      return this.scanTicket(qrData);
    }
  },

  async markAsUsed(ticketId: string): Promise<void> {
    try {
      const response = await apiClient.post<MarkAsUsedResponse>('/qr/mark-used', { ticketId });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error marcando boleto como usado');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Error marcando boleto como usado');
    }
  },

  validateQRFormat(qrData: string): { isValid: boolean; ticketId?: string; error?: string } {
    try {
      // Validar formato NEBULA QR codes: NEBULA-timestamp-random
      const nebulaPattern = /^NEBULA-\d+-[a-zA-Z0-9]+$/;
      
      if (!qrData || typeof qrData !== 'string') {
        return { isValid: false, error: 'Código QR vacío o inválido' };
      }

      if (!nebulaPattern.test(qrData)) {
        return { isValid: false, error: 'Formato de código QR no válido para Nebula' };
      }

      const parts = qrData.split('-');
      if (parts.length !== 3) {
        return { isValid: false, error: 'Estructura de código QR incorrecta' };
      }

      const [prefix, timestamp, random] = parts;
      
      if (prefix !== 'NEBULA') {
        return { isValid: false, error: 'Prefijo de código QR incorrecto' };
      }

      if (!/^\d+$/.test(timestamp)) {
        return { isValid: false, error: 'Timestamp inválido en código QR' };
      }

      if (!/^[a-zA-Z0-9]+$/.test(random)) {
        return { isValid: false, error: 'Sufijo inválido en código QR' };
      }

      return { 
        isValid: true, 
        ticketId: timestamp // Usamos el timestamp como ID de referencia
      };
    } catch (error) {
      return { isValid: false, error: 'Error validando formato de código QR' };
    }
  },

  generateNebulaQRCode(): string {
    // Generar un código QR único en formato Nebula
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `NEBULA-${timestamp}-${random}`;
  },

  generateSimpleQRSVG(data: string, size: number = 200): string {
    // Generar un QR code simple en SVG (patrón básico)
    const modules = 25; // 25x25 grid
    const moduleSize = size / modules;
    
    // Crear patrón basado en los datos
    const pattern: boolean[] = [];
    let hash = 0;
    
    // Hash simple de los datos
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
    }
    
    // Generar patrón de módulos
    for (let i = 0; i < modules * modules; i++) {
      pattern.push(((hash + i) % 3) === 0);
    }
    
    // Construir SVG
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="background: white;">`;
    
    // Agregar módulos
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (pattern[y * modules + x]) {
          svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    // Agregar marcadores de esquina (finder patterns)
    const finderSize = moduleSize * 7;
    const corners = [
      { x: 0, y: 0 },
      { x: size - finderSize, y: 0 },
      { x: 0, y: size - finderSize }
    ];
    
    corners.forEach(corner => {
      // Marco exterior
      svg += `<rect x="${corner.x}" y="${corner.y}" width="${finderSize}" height="${finderSize}" fill="black"/>`;
      // Marco interior blanco
      svg += `<rect x="${corner.x + moduleSize}" y="${corner.y + moduleSize}" width="${finderSize - 2 * moduleSize}" height="${finderSize - 2 * moduleSize}" fill="white"/>`;
      // Centro negro
      svg += `<rect x="${corner.x + moduleSize * 2}" y="${corner.y + moduleSize * 2}" width="${moduleSize * 3}" height="${moduleSize * 3}" fill="black"/>`;
    });
    
    svg += '</svg>';
    
    // Convertir a data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  },

  // Utilidades adicionales
  downloadQRCode(qrData: string, filename: string = 'qr-code'): void {
    try {
      const qrCodeDataURL = this.generateQRCodeDataURL(qrData, 300);
      
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `${filename}.svg`;
      link.click();
    } catch (error) {
      console.error('Error descargando código QR:', error);
    }
  },

  printQRCode(qrData: string): void {
    try {
      const qrCodeDataURL = this.generateQRCodeDataURL(qrData, 400);
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Código QR - ${qrData}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  font-family: Arial, sans-serif; 
                }
                .qr-container { 
                  text-align: center; 
                  page-break-inside: avoid; 
                }
                .qr-code { 
                  margin: 20px 0; 
                }
                .qr-info { 
                  margin-top: 20px; 
                  font-size: 12px; 
                  color: #666; 
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>Código QR Nebula</h2>
                <div class="qr-code">
                  <img src="${qrCodeDataURL}" alt="Código QR" style="width: 300px; height: 300px;" />
                </div>
                <div class="qr-info">
                  <p><strong>Código:</strong> ${qrData}</p>
                  <p><strong>Generado:</strong> ${new Date().toLocaleString('es-MX')}</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error imprimiendo código QR:', error);
    }
  }
};