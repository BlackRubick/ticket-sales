import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { CameraDiagnostics } from "../../components/ui/CameraDiagnostics";
import { useQRScanner } from "../../hooks/useQRScanner";
import type { TicketScanResult } from "../../types/ticket";

export const QRScanner: React.FC = () => {
  const [manualCode, setManualCode] = useState("");
  const [scanHistory, setScanHistory] = useState<TicketScanResult[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [currentResult, setCurrentResult] = useState<TicketScanResult | null>(null);
  const [scanCount, setScanCount] = useState({ valid: 0, invalid: 0 });
  const [isMarkingAsUsed, setIsMarkingAsUsed] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const {
    isScanning,
    scanResult,
    error,
    cameraPermission,
    availableCameras,
    currentCameraLabel,
    videoRef,
    startScanning,
    stopScanning,
    switchCamera,
    scanTicket,
    markTicketAsUsed,
    reactivateTicket,
    canSwitchCamera,
  } = useQRScanner();

  useEffect(() => {
    if (scanResult) {
      setCurrentResult(scanResult);
      setShowResultModal(true);
      setScanHistory((prev) => [scanResult, ...prev.slice(0, 9)]);
      setScanCount((prev) => ({
        valid: prev.valid + (scanResult.isValid ? 1 : 0),
        invalid: prev.invalid + (scanResult.isValid ? 0 : 1),
      }));
      stopScanning();
    }
  }, [scanResult, stopScanning]);

  const handleManualScan = async () => {
    if (!manualCode.trim()) return;

    try {
      const result = await scanTicket(manualCode);
      setCurrentResult(result);
      setShowResultModal(true);
      setScanHistory((prev) => [result, ...prev.slice(0, 9)]);
      setScanCount((prev) => ({
        valid: prev.valid + (result.isValid ? 1 : 0),
        invalid: prev.invalid + (result.isValid ? 0 : 1),
      }));
      setManualCode("");
      setShowManualInput(false);
    } catch (err) {
      console.error("Error scanning manual code:", err);
    }
  };

  const handleScanAgain = () => {
    setShowResultModal(false);
    setCurrentResult(null);
    startScanning();
  };

  // ✅ FUNCIÓN: Marcar boleto como usado - CORREGIDA PARA MANTENER isValid
  const handleMarkAsUsed = async () => {
    if (!currentResult?.ticket?.id || !currentResult.isValid) return;

    setIsMarkingAsUsed(true);
    try {
      console.log('🔄 Iniciando proceso para marcar como usado:', currentResult.ticket.id);
      
      await markTicketAsUsed(currentResult.ticket.id);
      
      // ✅ MANTENER isValid: true incluso cuando está "used"
      const updatedResult: TicketScanResult = {
        ...currentResult,
        isValid: true, // ✅ MANTENER COMO VÁLIDO
        ticket: {
          ...currentResult.ticket,
          status: 'used' as const,
          usedAt: new Date() // ✅ Usando Date object como en tu interface
        }
      };
      
      setCurrentResult(updatedResult);
      
      // ✅ ACTUALIZAR HISTORIAL: Buscar y actualizar el boleto en el historial  
      setScanHistory((prev) => 
        prev.map((scan) => 
          scan.ticket.id === currentResult.ticket.id ? updatedResult : scan
        )
      );
      
      console.log('✅ Boleto marcado como usado exitosamente');
      
    } catch (error: any) {
      console.error('❌ Error al marcar boleto como usado:', error);
      alert(`Error: ${error.message || 'No se pudo marcar el boleto como usado'}`);
    } finally {
      setIsMarkingAsUsed(false);
    }
  };

  // Reactivar boleto usado
  const handleReactivateTicket = async () => {
    if (!currentResult?.ticket?.id || !currentResult.isValid) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres reactivar este boleto?\n\n` +
      `Boleto: ${currentResult.ticket.ticketNumber}\n` +
      `Evento: ${currentResult.ticket.eventName}\n\n` +
      `Esto permitirá que el boleto sea usado nuevamente.`
    );

    if (!confirmed) return;

    setIsReactivating(true);
    try {
      console.log('🔄 Iniciando proceso para reactivar boleto:', currentResult.ticket.id);
      
      await reactivateTicket(currentResult.ticket.id);
      
      const updatedResult: TicketScanResult = {
        ...currentResult,
        ticket: {
          ...currentResult.ticket,
          status: 'active' as const,
          usedAt: undefined
        }
      };
      
      setCurrentResult(updatedResult);
      
      setScanHistory((prev) => 
        prev.map((scan, index) => 
          index === 0 ? updatedResult : scan
        )
      );
      
      console.log('✅ Boleto reactivado exitosamente');
      alert('✅ Boleto reactivado correctamente. Ahora puede ser usado nuevamente.');
      
    } catch (error: any) {
      console.error('❌ Error al reactivar boleto:', error);
      alert(`Error: ${error.message || 'No se pudo reactivar el boleto'}`);
    } finally {
      setIsReactivating(false);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    setScanCount({ valid: 0, invalid: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Escáner QR
                <span className="block text-xl lg:text-2xl font-normal text-cyan-100 mt-2">
                  Valida boletos de forma instantánea
                </span>
              </h1>
              <p className="text-lg text-cyan-100 max-w-2xl">
                Escanea códigos QR para verificar la autenticidad de los boletos
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowManualInput(true)}
                className="!bg-white/10 !backdrop-blur-lg !text-white !border-white/20 hover:!bg-white/20"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Código Manual
              </Button>
              
              {!isScanning ? (
                <Button onClick={startScanning} variant="light" className="shadow-lg">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Iniciar Cámara
                </Button>
              ) : (
                <Button variant="danger" onClick={stopScanning} className="!bg-red-500 !text-white hover:!bg-red-600">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Detener
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error de Cámara</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDiagnostics(true)}
                  className="!bg-red-100 !text-red-700 hover:!bg-red-200 !border-red-300"
                >
                  🔧 Diagnóstico
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{scanCount.valid}</div>
                <div className="text-sm text-gray-600">Válidos</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{scanCount.invalid}</div>
                <div className="text-sm text-gray-600">Inválidos</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{scanHistory.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {scanHistory.length > 0 ? Math.round((scanCount.valid / scanHistory.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Éxito</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Escáner de Cámara</h3>
                <div className="flex items-center space-x-2">
                  {cameraPermission === 'granted' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✅ Permisos OK
                    </span>
                  )}
                  {isScanning && (
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm font-medium">Activo</span>
                    </div>
                  )}
                  {canSwitchCamera && isScanning && (
                    <Button size="sm" variant="secondary" onClick={switchCamera}>
                      🔄 Cambiar
                    </Button>
                  )}
                </div>
              </div>
              {availableCameras.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">📷 {currentCameraLabel}</p>
              )}
            </div>

            <div className="relative">
              <div className="aspect-square bg-gray-900 overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: isScanning ? 'block' : 'none' }}
                />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Cámara Desactivada</h4>
                      <p className="text-gray-600 mb-4">Haz clic en "Iniciar Cámara" para comenzar a escanear</p>
                      <Button onClick={startScanning} variant="light" size="sm">
                        Activar Cámara
                      </Button>
                    </div>
                  </div>
                )}
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-64 h-64 border-4 border-cyan-500 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                      </div>
                      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-80">
                        <div className="bg-black/80 backdrop-blur-sm text-white text-center py-3 px-6 rounded-2xl">
                          <p className="text-sm font-medium">Coloca el código QR dentro del marco</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Estado: <span className="font-medium">{isScanning ? "Escaneando..." : "Inactivo"}</span>
                </div>
                {scanHistory.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={clearHistory}>
                    Limpiar Historial
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Scan History */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Historial de Escaneos</h3>
                <span className="text-sm text-gray-500">Últimos {scanHistory.length}</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {scanHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay escaneos</h4>
                  <p className="text-sm">Los resultados aparecerán aquí cuando escanees códigos QR</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setCurrentResult(scan);
                        setShowResultModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            scan.isValid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}>
                            {scan.isValid ? (
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{scan.ticket.ticketNumber}</p>
                            <p className="text-sm text-gray-600 truncate">{scan.ticket.eventName}</p>
                            <p className="text-xs text-gray-500 truncate">{scan.ticket.buyerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={scan.isValid ? "success" : "danger"} size="sm">
                            {scan.isValid ? "VÁLIDO" : "INVÁLIDO"}
                          </Badge>
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics Modal */}
      <Modal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        title=""
        size="xl"
      >
        <CameraDiagnostics onClose={() => setShowDiagnostics(false)} />
      </Modal>

      {/* Manual Input Modal */}
      <Modal
        isOpen={showManualInput}
        onClose={() => setShowManualInput(false)}
        title="Código Manual"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código QR del Boleto
            </label>
            <div className="relative">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="NEBULA-123-abc456..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Ingresa el código completo que aparece en el boleto
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Formato del Código</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Los códigos válidos siguen el formato:{" "}
                    <code className="bg-blue-100 px-1 rounded">NEBULA-XXX-XXXXXX</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowManualInput(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleManualScan} disabled={!manualCode.trim()}>
              Escanear Código
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
            {/* Result Header */}
            <div className="text-center">
              <div
                className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                  currentResult.isValid
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {currentResult.isValid ? (
                  <svg
                    className="h-10 w-10"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-10 w-10"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <h3
                className={`text-3xl font-bold mb-3 ${
                  currentResult.isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentResult.isValid
                  ? "✅ BOLETO VÁLIDO"
                  : "❌ BOLETO INVÁLIDO"}
              </h3>

              <p className="text-lg text-gray-600 mb-6">
                {currentResult.message}
              </p>

              {currentResult.isValid && currentResult.ticket.status === 'active' && (
                <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-800 rounded-full text-sm font-medium">
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Acceso Autorizado
                </div>
              )}
            </div>

            {/* Ticket Details */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Detalles del Boleto
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Número de Boleto
                    </p>
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {currentResult.ticket.ticketNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estado</p>
                    <Badge
                      variant={
                        currentResult.ticket.status === "active"
                          ? "success"
                          : currentResult.ticket.status === "used"
                          ? "warning"
                          : "danger"
                      }
                      size="md"
                    >
                      {currentResult.ticket.status === "active"
                        ? "🟢 Activo"
                        : currentResult.ticket.status === "used"
                        ? "🟡 Usado"
                        : "🔴 Cancelado"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Evento</p>
                    <p className="font-semibold text-gray-900">
                      {currentResult.ticket.eventName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentResult.ticket.eventLocation}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Fecha del Evento
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(
                        currentResult.ticket.eventDate
                      ).toLocaleDateString("es-MX", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Comprador</p>
                    <p className="font-semibold text-gray-900">
                      {currentResult.ticket.buyerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentResult.ticket.buyerEmail}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Precio</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${currentResult.ticket.price}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {currentResult.ticket.usedAt && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Boleto Previamente Usado
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Este boleto fue utilizado el{" "}
                        {new Date(
                          currentResult.ticket.usedAt
                        ).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowResultModal(false)}
                className="flex-1 sm:flex-none"
              >
                Cerrar
              </Button>

              <Button onClick={handleScanAgain} className="flex-1 sm:flex-none">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Escanear Otro
              </Button>

              {/* 🔍 DEBUG: Mostrar info del estado actual */}
              <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                <strong>DEBUG:</strong><br/>
                isValid: {currentResult.isValid ? 'true' : 'false'}<br/>
                status: "{currentResult.ticket.status}"<br/>
                usedAt: {currentResult.ticket.usedAt ? 'SI' : 'NO'}
              </div>

              {/* Botón: Marcar como Usado (solo si está activo Y válido) */}
              {currentResult.isValid && currentResult.ticket.status === 'active' && (
                <Button
                  variant="success"
                  onClick={handleMarkAsUsed}
                  disabled={isMarkingAsUsed || isReactivating}
                  className="flex-1 sm:flex-none !bg-green-600 hover:!bg-green-700"
                >
                  {isMarkingAsUsed ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Marcar como Usado
                    </>
                  )}
                </Button>
              )}

              {/* ✅ Botón: Reactivar Boleto - CON API */}
              {(currentResult.isValid || currentResult.ticket.status === 'used') && currentResult.ticket.status === 'used' && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      // Primero actualizar UI
                      const updatedResult: TicketScanResult = {
                        ...currentResult,
                        isValid: true,
                        ticket: {
                          ...currentResult.ticket,
                          status: 'active' as const,
                          usedAt: undefined
                        }
                      };
                      setCurrentResult(updatedResult);
                      setScanHistory((prev) => 
                        prev.map((scan) => 
                          scan.ticket.id === currentResult.ticket.id ? updatedResult : scan
                        )
                      );

                      // Luego llamar API (si existe)
                      if (reactivateTicket) {
                        await reactivateTicket(currentResult.ticket.id);
                        alert('✅ Boleto reactivado correctamente en la base de datos');
                      } else {
                      }
                    } catch (error: any) {
                      alert(`Error: ${error.message}`);
                    }
                  }}
                  className="flex-1 sm:flex-none !bg-orange-600 hover:!bg-orange-700 !text-white !border-orange-600 hover:!border-orange-700"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reactivar Boleto
                </Button>
              )}

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};