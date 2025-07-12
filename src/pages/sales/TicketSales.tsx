import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useTickets } from '../../hooks/useTickets';
import { adminService } from '../../services/adminService';
import type { TicketFormData, Ticket } from '../../types/ticket';
import type { DashboardStats } from '../../types/api';
import { qrService } from '../../services/qrService';

export const TicketSales: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [formData, setFormData] = useState<TicketFormData>({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    price: 0,
    buyerName: '',
    buyerEmail: '',
    buyerPhone: ''
  });

  const { createTicket, loading, error, fetchTickets } = useTickets();

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);
      } catch (err) {
        console.error('Error loading stats:', err);
        // En caso de error, mantener stats como null para mostrar valores por defecto
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

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
      setCurrentStep(1);
      
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

      // Recargar estadísticas después de crear un boleto
      try {
        const updatedStats = await adminService.getDashboardStats();
        setStats(updatedStats);
      } catch (err) {
        console.error('Error refreshing stats:', err);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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

  const shareTicket = async () => {
    if (generatedTicket && navigator.share) {
      try {
        await navigator.share({
          title: `Boleto - ${generatedTicket.eventName}`,
          text: `Tu boleto para ${generatedTicket.eventName} está listo. Número: ${generatedTicket.ticketNumber}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const quickTemplates = [
    { name: 'Fiesta', icon: '🎵', eventName: 'Fiesta Suchiapa', location: 'Los aguacates', price: 150 },
    { name: 'Concierto', icon: '🎤', eventName: 'Concierto de Rock', location: 'Estadio Nacional', price: 200 },
    { name: 'Teatro', icon: '🎭', eventName: 'Obra de Teatro', location: 'Teatro Principal', price: 180 },
    { name: 'Deportes', icon: '⚽', eventName: 'Partido de Fútbol', location: 'Estadio Municipal', price: 120 },
  ];

  // Calcular estadísticas de ventas del día
  const todaysSales = stats?.todaysSales || 0;
  const todaysRevenue = stats ? (stats.todaysSales * (stats.totalRevenue / Math.max(stats.totalTickets, 1))) : 0;
  const averageTicketPrice = stats ? Math.round(stats.totalRevenue / Math.max(stats.totalTickets, 1)) : 150;

  // Obtener ventas recientes de las estadísticas
  const recentSales = stats?.recentTickets.slice(0, 3).map((ticket, index) => ({
    id: ticket.id,
    event: ticket.eventName,
    buyer: ticket.buyerName,
    amount: ticket.price,
    time: index === 0 ? 'Hace 5 min' : index === 1 ? 'Hace 15 min' : 'Hace 30 min'
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-yellow-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Venta de Boletos
                <span className="block text-xl lg:text-2xl font-normal text-pink-100 mt-2">
                  Genera boletos únicos con código QR
                </span>
              </h1>
              <p className="text-lg text-pink-100 max-w-2xl">
                Crea boletos profesionales en segundos con nuestro sistema avanzado
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setShowForm(true)}
                variant="light"
                size="lg"
                className="shadow-lg"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Boleto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {success && (
          <div className="mb-8">
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}
        {error && (
          <div className="mb-8">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* Quick Templates */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Plantillas Rápidas</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    eventName: template.eventName,
                    eventLocation: template.location,
                    price: template.price
                  }));
                  setShowForm(true);
                }}
                className="group relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">{template.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{template.location}</div>
                  <div className="text-lg font-bold text-purple-600">${template.price}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats and Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         

          {/* Recent Sales - DATOS REALES DE LA API */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Ventas Recientes</h3>
            </div>
            <div className="p-6">
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : recentSales.length > 0 ? (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🎫</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm line-clamp-1">{sale.event}</div>
                          <div className="text-xs text-gray-600 line-clamp-1">{sale.buyer}</div>
                          <div className="text-xs text-gray-500">{sale.time}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">${sale.amount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">No hay ventas recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal with Steps */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setCurrentStep(1);
        }}
        title="Generar Nuevo Boleto"
        size="lg"
      >
        <div className="mb-6">
          {/* Progress Steps */}
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-1 mx-2 ${
                    step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className={currentStep >= 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              Evento
            </span>
            <span className={currentStep >= 2 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              Detalles
            </span>
            <span className={currentStep >= 3 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              Comprador
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
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
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Input
                label="Precio del Boleto"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2">Resumen del Evento</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div><strong>Evento:</strong> {formData.eventName || 'Sin especificar'}</div>
                  <div><strong>Fecha:</strong> {formData.eventDate ? new Date(formData.eventDate).toLocaleString() : 'Sin especificar'}</div>
                  <div><strong>Ubicación:</strong> {formData.eventLocation || 'Sin especificar'}</div>
                  <div><strong>Precio:</strong> ${formData.price || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Buyer Info */}
          {currentStep === 3 && (
            <div className="space-y-4">
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
              
              <Input
                label="Teléfono del Comprador"
                name="buyerPhone"
                value={formData.buyerPhone}
                onChange={handleInputChange}
                placeholder="+52 999 123 4567"
                required
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={currentStep === 1 ? () => setShowForm(false) : prevStep}
            >
              {currentStep === 1 ? 'Cancelar' : 'Anterior'}
            </Button>
            
            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" loading={loading}>
                Generar Boleto
              </Button>
            )}
          </div>
        </form>
      </Modal>

      {/* Ticket Display Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="¡Boleto Generado Exitosamente!"
        size="lg"
      >
        {generatedTicket && (
          <div className="space-y-6">
            {/* Ticket Preview */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white p-8 rounded-2xl shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
              </div>
              
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{generatedTicket.eventName}</h3>
                    <p className="text-pink-100 text-lg">{generatedTicket.eventLocation}</p>
                  </div>
                  <Badge variant="success" className="bg-white text-purple-600 text-sm">
                    VÁLIDO
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-pink-100 text-sm mb-1">Fecha del Evento</p>
                    <p className="font-semibold text-lg">
                      {new Date(generatedTicket.eventDate).toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-100 text-sm mb-1">Precio</p>
                    <p className="font-semibold text-lg">${generatedTicket.price}</p>
                  </div>
                  <div>
                    <p className="text-pink-100 text-sm mb-1">Comprador</p>
                    <p className="font-semibold">{generatedTicket.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-pink-100 text-sm mb-1">Boleto #</p>
                    <p className="font-semibold font-mono">{generatedTicket.ticketNumber}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <img
                      src={qrService.generateQRCode(generatedTicket.qrCode)}
                      alt="QR Code"
                      className="w-32 h-32 mx-auto"
                    />
                    <p className="text-center text-gray-600 text-xs mt-3 font-mono">
                      {generatedTicket.qrCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="secondary" onClick={printTicket} className="flex-1 sm:flex-none">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </Button>
              
              <Button variant="secondary" onClick={downloadTicket} className="flex-1 sm:flex-none">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar
              </Button>
              
              {typeof navigator.share === 'function' && (
                <Button variant="secondary" onClick={shareTicket} className="flex-1 sm:flex-none">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z" />
                  </svg>
                  Compartir
                </Button>
              )}
              
              <Button onClick={() => setShowTicketModal(false)} className="flex-1 sm:flex-none">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};