import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert';

interface CameraDiagnosticsProps {
  onClose: () => void;
}

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const CameraDiagnostics: React.FC<CameraDiagnosticsProps> = ({ onClose }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Test 1: Verificar soporte del navegador
    if (navigator.mediaDevices && await navigator.mediaDevices.getUserMedia()) {
      results.push({
        test: 'Soporte del navegador',
        status: 'success',
        message: 'El navegador soporta acceso a la cámara'
      });
    } else {
      results.push({
        test: 'Soporte del navegador',
        status: 'error',
        message: 'El navegador no soporta getUserMedia',
        details: 'Prueba con Chrome, Firefox o Safari actualizado'
      });
    }

    // Test 2: Verificar HTTPS
    const isSecure = location.protocol === 'https:' || 
                    location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1';
    
    if (isSecure) {
      results.push({
        test: 'Conexión segura',
        status: 'success',
        message: 'Conexión HTTPS verificada'
      });
    } else {
      results.push({
        test: 'Conexión segura',
        status: 'error',
        message: 'Se requiere HTTPS para acceder a la cámara',
        details: 'La cámara solo funciona en conexiones seguras (HTTPS)'
      });
    }

    // Test 3: Verificar permisos
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permissionStatus.state === 'granted') {
        results.push({
          test: 'Permisos de cámara',
          status: 'success',
          message: 'Permisos de cámara otorgados'
        });
      } else if (permissionStatus.state === 'denied') {
        results.push({
          test: 'Permisos de cámara',
          status: 'error',
          message: 'Permisos de cámara denegados',
          details: 'Ve a configuración del navegador y permite el acceso a la cámara'
        });
      } else {
        results.push({
          test: 'Permisos de cámara',
          status: 'warning',
          message: 'Permisos de cámara no determinados',
          details: 'Los permisos se solicitarán al intentar usar la cámara'
        });
      }
    } catch (err) {
      results.push({
        test: 'Permisos de cámara',
        status: 'warning',
        message: 'No se pueden verificar permisos automáticamente'
      });
    }

    // Test 4: Enumerar dispositivos de cámara
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length > 0) {
        results.push({
          test: 'Dispositivos de cámara',
          status: 'success',
          message: `${cameras.length} cámara(s) detectada(s)`,
          details: cameras.map(cam => cam.label || 'Cámara sin nombre').join(', ')
        });
      } else {
        results.push({
          test: 'Dispositivos de cámara',
          status: 'error',
          message: 'No se detectaron cámaras',
          details: 'Verifica que tu dispositivo tenga cámara y esté conectada'
        });
      }
    } catch (err) {
      results.push({
        test: 'Dispositivos de cámara',
        status: 'error',
        message: 'Error al enumerar dispositivos de cámara'
      });
    }

    // Test 5: Prueba de acceso básico
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      results.push({
        test: 'Acceso a cámara',
        status: 'success',
        message: 'Acceso a cámara exitoso'
      });
      
      // Detener el stream inmediatamente
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      let errorMessage = 'Error desconocido';
      let details = '';
      
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage = 'Permisos denegados';
          details = 'El usuario denegó el acceso a la cámara';
          break;
        case 'NotFoundError':
          errorMessage = 'Cámara no encontrada';
          details = 'No hay cámaras disponibles en el dispositivo';
          break;
        case 'NotReadableError':
          errorMessage = 'Cámara en uso';
          details = 'La cámara está siendo utilizada por otra aplicación';
          break;
        case 'OverconstrainedError':
          errorMessage = 'Restricciones no soportadas';
          details = 'La cámara no soporta las restricciones solicitadas';
          break;
        default:
          errorMessage = err.message || 'Error al acceder a la cámara';
      }
      
      results.push({
        test: 'Acceso a cámara',
        status: 'error',
        message: errorMessage,
        details
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const hasWarnings = diagnostics.some(d => d.status === 'warning');

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Diagnóstico de Cámara</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isRunning && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Ejecutando diagnósticos...</span>
        </div>
      )}

      {!isRunning && (
        <>
          {/* Resumen */}
          <div className="mb-6">
            {!hasErrors && !hasWarnings && (
              <Alert type="success" message="¡Todo está funcionando correctamente! Tu cámara debería funcionar sin problemas." />
            )}
            {hasWarnings && !hasErrors && (
              <Alert type="warning" message="Se detectaron algunas advertencias. La cámara podría funcionar con limitaciones." />
            )}
            {hasErrors && (
              <Alert type="error" message="Se detectaron problemas que impiden el uso de la cámara. Revisa los detalles a continuación." />
            )}
          </div>

          {/* Resultados detallados */}
          <div className="space-y-4 mb-6">
            {diagnostics.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  result.status === 'success'
                    ? 'border-green-500 bg-green-50'
                    : result.status === 'error'
                    ? 'border-red-500 bg-red-50'
                    : 'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-xl mr-3 mt-0.5">
                    {getStatusIcon(result.status)}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {result.test}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-sm text-gray-600 bg-white/50 p-2 rounded">
                        💡 {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Soluciones comunes */}
          {hasErrors && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">🔧 Soluciones Comunes</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• <strong>Permisos denegados:</strong> Haz clic en el ícono de candado 🔒 en la barra de direcciones y permite el acceso a la cámara</li>
                <li>• <strong>Cámara en uso:</strong> Cierra otras aplicaciones que puedan estar usando la cámara (Zoom, Teams, etc.)</li>
                <li>• <strong>Sin HTTPS:</strong> Asegúrate de acceder al sitio con https:// o desde localhost</li>
                <li>• <strong>Navegador no compatible:</strong> Usa Chrome, Firefox o Safari actualizado</li>
                <li>• <strong>Sin cámara detectada:</strong> Verifica que tu dispositivo tenga cámara y esté conectada correctamente</li>
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={runDiagnostics}
              variant="secondary"
              className="flex-1"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Ejecutar Nuevamente
            </Button>
            
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Cerrar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};