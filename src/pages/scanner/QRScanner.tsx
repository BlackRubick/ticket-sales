import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useQRScanner } from '../../hooks/useQRScanner';
import type { TicketScanResult } from '../../types/ticket';

export const QRScanner: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [scanHistory, setScanHistory] = useState<TicketScanResult[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<TicketScanResult | null>(null);

  const {
    isScanning,
    scanResult,
    error,
    videoRef,
    startScanning,
    stopScanning,
    scanTicket
  } = useQRScanner();

  useEffect(() => {
    if (scanResult) {
      setCurrentResult(scanResult);
      setShowResultModal(true);
      setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]); // Keep last 10
      stopScanning();
    }
  }, [scanResult, stopScanning]);

  const handleManualScan = async () => {
    if (!manualCode.trim()) return;

    try {
      const result = await scanTicket(manualCode);
      setCurrentResult(result);
      setShowResultModal(true);
      setScanHistory(prev => [result, ...prev.slice(0, 9)]);
      setManualCode('');
      setShowManualInput(false);
    } catch (err) {
      console.error('Error scanning manual code:', err);
    }
  };

  const handleScanAgain = () => {
    setShowResultModal(false);
    setCurrentResult(null);
    startScanning();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Escáner QR</h1>
              <p className="text-gray-600">Escanea boletos para validar acceso</p>
            </div>
            <div className="space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowManualInput(true)}
              >
                Código Manual
              </Button>
              {!isScanning ? (
                <Button onClick={startScanning}>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Iniciar Cámara
                </Button>
              ) : (
                <Button variant="danger" onClick={stopScanning}>
                  Detener Cámara
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert type="error" message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <Card title="Escáner de Cámara">
            <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
              {isScanning ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-blue-500 rounded-lg w-48 h-48 relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                      Coloca el código QR dentro del marco
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>Haz clic en "Iniciar Cámara" para comenzar</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {isScanning ? 'Escaneando...' : 'Cámara desactivada'}
              </p>
            </div>
          </Card>

          {/* Scan History */}
          <Card title="Historial de Escaneos" subtitle="Últimos boletos escaneados">
            {scanHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2">No hay escaneos recientes</p>
                <p className="text-sm">Los resultados aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scanHistory.map((scan, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {scan.ticket.ticketNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {scan.ticket.eventName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {scan.ticket.buyerName}
                      </p>
                    </div>
                    <Badge
                      variant={scan.isValid ? 'success' : 'danger'}
                    >
                      {scan.isValid ? 'VÁLIDO' : 'INVÁLIDO'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Manual Input Modal */}
      <Modal
        isOpen={showManualInput}
        onClose={() => setShowManualInput(false)}
        title="Código Manual"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código QR
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ingresa el código del boleto"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowManualInput(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleManualScan}
              disabled={!manualCode.trim()}
            >
              Escanear
            </Button>
          </div>
        </div>
      </Modal>

      {/* Scan Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Resultado del Escaneo"
        size="lg"
      >
        {currentResult && (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                currentResult.isValid ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {currentResult.isValid ? (
                  <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                currentResult.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentResult.isValid ? 'BOLETO VÁLIDO' : 'BOLETO INVÁLIDO'}
              </h3>
              <p className="text-gray-600">{currentResult.message}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Número de Boleto</p>
                  <p className="font-medium">{currentResult.ticket.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge
                    variant={currentResult.ticket.status === 'active' ? 'success' : 
                            currentResult.ticket.status === 'used' ? 'warning' : 'danger'}
                  >
                    {currentResult.ticket.status === 'active' ? 'Activo' : 
                     currentResult.ticket.status === 'used' ? 'Usado' : 'Cancelado'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Evento</p>
                  <p className="font-medium">{currentResult.ticket.eventName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha del Evento</p>
                  <p className="font-medium">
                    {new Date(currentResult.ticket.eventDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comprador</p>
                  <p className="font-medium">{currentResult.ticket.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio</p>
                  <p className="font-medium">${currentResult.ticket.price}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <Button variant="secondary" onClick={() => setShowResultModal(false)}>
                Cerrar
              </Button>
              <Button onClick={handleScanAgain}>
                Escanear Otro
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};