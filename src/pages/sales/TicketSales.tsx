import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useTickets } from '../../hooks/useTickets';
import type { TicketFormData, Ticket } from '../../types/ticket';
import { qrService } from '../../services/qrService';

export const TicketSales: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<TicketFormData>({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    price: 0,
    buyerName: '',
    buyerEmail: '',
    buyerPhone: ''
  });

  const { createTicket, loading, error } = useTickets();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    try {
      const ticket = await createTicket(formData);
      setGeneratedTicket(ticket);
      setShowTicketModal(true);
      setShowForm(false);
      setSuccess('¡Boleto generado exitosamente!');
      
      // Reset form
      setFormData({
        eventName: '',
        eventDate: '',
        eventLocation: '',
        price: 0,
        buyerName: '',
        buyerEmail: '',
        buyerPhone: ''
      });
    } catch (err) {
      console.error('Error creating ticket:', err);
    }
  };

  const printTicket = () => {
    window.print();
  };

  const downloadTicket = () => {
    if (generatedTicket) {
      const ticketData = {
        ...generatedTicket,
        qrCodeImage: qrService.generateQRCode(generatedTicket.qrCode)
      };
      
      const dataStr = JSON.stringify(ticketData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${generatedTicket.ticketNumber}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Venta de Boletos</h1>
              <p className="text-gray-600">Genera nuevos boletos con código QR</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Boleto
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
        {error && <Alert type="error" message={error} />}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-blue-100 text-sm font-medium">Ventas Hoy</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-green-100 text-sm font-medium">Ingresos Hoy</p>
                <p className="text-3xl font-bold">$1,800</p>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-purple-100 text-sm font-medium">Promedio por Boleto</p>
                <p className="text-3xl font-bold">$150</p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card title="Ventas Recientes" subtitle="Últimos boletos generados">
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2">No hay ventas recientes</p>
            <p className="text-sm">Los boletos aparecerán aquí cuando generes algunos</p>
          </div>
        </Card>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Generar Nuevo Boleto"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Evento"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              placeholder="Ej: Concierto de Rock"
              required
            />
            
            <Input
              label="Fecha del Evento"
              name="eventDate"
              type="datetime-local"
              value={formData.eventDate}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="Ubicación"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              placeholder="Ej: Estadio Nacional"
              required
            />
            
            <Input
              label="Precio"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
            
            <Input
              label="Nombre del Comprador"
              name="buyerName"
              value={formData.buyerName}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
              required
            />
            
            <Input
              label="Email del Comprador"
              name="buyerEmail"
              type="email"
              value={formData.buyerEmail}
              onChange={handleInputChange}
              placeholder="juan@email.com"
              required
            />
          </div>
          
          <Input
            label="Teléfono del Comprador"
            name="buyerPhone"
            value={formData.buyerPhone}
            onChange={handleInputChange}
            placeholder="+52 999 123 4567"
            required
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Generar Boleto
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ticket Display Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="Boleto Generado"
        size="lg"
      >
        {generatedTicket && (
          <div className="space-y-6">
            {/* Ticket Preview */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{generatedTicket.eventName}</h3>
                  <p className="text-blue-100">{generatedTicket.eventLocation}</p>
                </div>
                <Badge variant="success" className="bg-white text-blue-600">
                  VÁLIDO
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-blue-100 text-sm">Fecha del Evento</p>
                  <p className="font-semibold">
                    {new Date(generatedTicket.eventDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Precio</p>
                  <p className="font-semibold">${generatedTicket.price}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Comprador</p>
                  <p className="font-semibold">{generatedTicket.buyerName}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Boleto #</p>
                  <p className="font-semibold">{generatedTicket.ticketNumber}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={qrService.generateQRCode(generatedTicket.qrCode)}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                  <p className="text-center text-gray-600 text-xs mt-2">
                    {generatedTicket.qrCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <Button variant="secondary" onClick={printTicket}>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </Button>
              <Button variant="secondary" onClick={downloadTicket}>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar
              </Button>
              <Button onClick={() => setShowTicketModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};