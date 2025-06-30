import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { useTickets } from '../../hooks/useTickets';

export const ResendTicket: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { resendTicket, error } = useTickets();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber || !email) return;

    try {
      setLoading(true);
      // Mock ticket ID - in real app, you'd search by ticket number
      await resendTicket('mock-id', email);
      setSuccess(`Boleto ${ticketNumber} reenviado exitosamente a ${email}`);
      setTicketNumber('');
      setEmail('');
    } catch (err) {
      console.error('Error resending ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reenviar Boleto</h1>
              <p className="text-gray-600">Reenvía boletos a clientes que los hayan perdido</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
        {error && <Alert type="error" message={error} />}

        <Card title="Reenviar Boleto" subtitle="Ingresa los datos del boleto a reenviar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Número de Boleto"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="NBL-12345678"
              helper="Ingresa el número del boleto que aparece en el ticket original"
              required
            />

            <Input
              label="Email de Destino"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              helper="El boleto será enviado a esta dirección de correo"
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Información Importante
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>El boleto será enviado con el mismo código QR original</li>
                      <li>Verifica que el email sea correcto antes de enviar</li>
                      <li>El cliente recibirá una copia exacta del boleto original</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!ticketNumber || !email}
            >
              {loading ? 'Reenviando...' : 'Reenviar Boleto'}
            </Button>
          </form>
        </Card>

        {/* Quick Search */}
        <Card title="Búsqueda Rápida" className="mt-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-2 text-gray-600">¿No tienes el número de boleto?</p>
            <p className="text-sm text-gray-500 mb-4">
              Busca en la lista completa de boletos
            </p>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/tickets'}
            >
              Ver Lista de Boletos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};