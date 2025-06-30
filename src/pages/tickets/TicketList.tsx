import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { useTickets } from '../../hooks/useTickets';
import type { Ticket } from '../../types/ticket';
import { qrService } from '../../services/qrService';

export const TicketList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { tickets, loading, error, resendTicket } = useTickets();

  // Mock tickets for demonstration
  const mockTickets: Ticket[] = [
    {
      id: '1',
      ticketNumber: 'NBL-12345678',
      eventName: 'Concierto de Rock',
      eventDate: new Date('2025-07-15'),
      eventLocation: 'Estadio Nacional',
      price: 150,
      buyerName: 'Juan Pérez',
      buyerEmail: 'juan@email.com',
      buyerPhone: '+52 999 123 4567',
      qrCode: 'NEBULA-123-abc',
      status: 'active',
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01')
    },
    {
      id: '2',
      ticketNumber: 'NBL-87654321',
      eventName: 'Festival de Jazz',
      eventDate: new Date('2025-08-20'),
      eventLocation: 'Teatro Principal',
      price: 85,
      buyerName: 'María González',
      buyerEmail: 'maria@email.com',
      buyerPhone: '+52 999 765 4321',
      qrCode: 'NEBULA-456-def',
      status: 'used',
      createdAt: new Date('2025-05-15'),
      updatedAt: new Date('2025-06-15'),
      usedAt: new Date('2025-06-15')
    },
    {
      id: '3',
      ticketNumber: 'NBL-11223344',
      eventName: 'Obra de Teatro',
      eventDate: new Date('2025-09-10'),
      eventLocation: 'Centro Cultural',
      price: 45,
      buyerName: 'Carlos Rodríguez',
      buyerEmail: 'carlos@email.com',
      buyerPhone: '+52 999 112 2334',
      qrCode: 'NEBULA-789-ghi',
      status: 'active',
      createdAt: new Date('2025-06-20'),
      updatedAt: new Date('2025-06-20')
    }
  ];

  const displayTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleResendTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResendEmail(ticket.buyerEmail);
    setShowResendModal(true);
  };

  const handleConfirmResend = async () => {
    if (!selectedTicket || !resendEmail) return;

    try {
      setResendLoading(true);
      await resendTicket(selectedTicket.id, resendEmail);
      setSuccess(`Boleto reenviado exitosamente a ${resendEmail}`);
      setShowResendModal(false);
      setResendEmail('');
      setSelectedTicket(null);
    } catch (err) {
      console.error('Error resending ticket:', err);
    } finally {
      setResendLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Activo</Badge>;
      case 'used':
        return <Badge variant="warning">Usado</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lista de Boletos</h1>
              <p className="text-gray-600">Gestiona y consulta todos los boletos</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="used">Usados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
        {error && <Alert type="error" message={error} />}

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Buscar por número, comprador o evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {displayTickets.length} de {mockTickets.length} boletos
            </div>
          </div>
        </Card>

        {/* Tickets Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boleto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comprador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.ticketNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.eventName}</div>
                      <div className="text-sm text-gray-500">{ticket.eventLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.buyerName}</div>
                      <div className="text-sm text-gray-500">{ticket.buyerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${ticket.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewDetails(ticket)}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResendTicket(ticket)}
                        >
                          Reenviar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayTickets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2">No se encontraron boletos</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </Card>
      </div>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles del Boleto"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Preview */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedTicket.eventName}</h3>
                  <p className="text-blue-100">{selectedTicket.eventLocation}</p>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-blue-100 text-sm">Fecha del Evento</p>
                  <p className="font-semibold">
                    {selectedTicket.eventDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Precio</p>
                  <p className="font-semibold">${selectedTicket.price}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Comprador</p>
                  <p className="font-semibold">{selectedTicket.buyerName}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Boleto #</p>
                  <p className="font-semibold">{selectedTicket.ticketNumber}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={qrService.generateQRCode(selectedTicket.qrCode)}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                  <p className="text-center text-gray-600 text-xs mt-2">
                    {selectedTicket.qrCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Información Adicional</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{selectedTicket.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600">Teléfono</p>
                  <p className="font-medium">{selectedTicket.buyerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fecha de Creación</p>
                  <p className="font-medium">{selectedTicket.createdAt.toLocaleDateString()}</p>
                </div>
                {selectedTicket.usedAt && (
                  <div>
                    <p className="text-gray-600">Fecha de Uso</p>
                    <p className="font-medium">{selectedTicket.usedAt.toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Cerrar
              </Button>
              <Button onClick={() => {
                setShowDetailModal(false);
                handleResendTicket(selectedTicket);
              }}>
                Reenviar Boleto
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Resend Ticket Modal */}
      <Modal
        isOpen={showResendModal}
        onClose={() => setShowResendModal(false)}
        title="Reenviar Boleto"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Reenviar el boleto <strong>{selectedTicket?.ticketNumber}</strong>
            </p>
            <Input
              label="Email de destino"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="correo@email.com"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowResendModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmResend}
              loading={resendLoading}
              disabled={!resendEmail}
            >
              Reenviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};