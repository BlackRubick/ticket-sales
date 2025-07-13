// src/hooks/useQRScanner.ts - COMPLETO Y CORREGIDO
import { useState, useRef, useCallback, useEffect } from 'react';
import { type TicketScanResult } from '../types/ticket';
import { qrService } from '../services/qrService';

// 🎯 Declarar ZXing global desde CDN
declare global {
  interface Window {
    ZXing: any;
  }
}

interface CameraError {
  name: string;
  message: string;
  constraint?: string;
}

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TicketScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string>('');
  const [zxingReady, setZxingReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<any>(null);

  // ✅ Verificar si ZXing está disponible
  useEffect(() => {
    const checkZXing = () => {
      if (window.ZXing) {
        console.log('✅ ZXing cargado desde CDN');
        try {
          codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();
          setZxingReady(true);
        } catch (err) {
          console.error('❌ Error inicializando ZXing:', err);
          setZxingReady(false);
        }
      } else {
        console.log('⏳ Esperando ZXing...');
        setTimeout(checkZXing, 500);
      }
    };

    checkZXing();
    checkCameraPermission();
    getCameraDevices();

    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permissionStatus.state as 'granted' | 'denied');
      
      permissionStatus.onchange = () => {
        setCameraPermission(permissionStatus.state as 'granted' | 'denied');
      };
    } catch (err) {
      console.warn('No se puede verificar permisos de cámara:', err);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (!codeReaderRef.current) return;
      
      const devices = await codeReaderRef.current.listVideoInputDevices();
      setAvailableCameras(devices);
      
      // Preferir cámara trasera
      const backCamera = devices.find((camera: any) => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment')
      );
      
      if (backCamera) {
        setCurrentCameraId(backCamera.deviceId);
      } else if (devices.length > 0) {
        setCurrentCameraId(devices[0].deviceId);
      }
    } catch (err) {
      console.warn('Error obteniendo cámaras:', err);
      // Fallback a método nativo
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        if (cameras.length > 0) {
          setCurrentCameraId(cameras[0].deviceId);
        }
      } catch (fallbackErr) {
        console.warn('Fallback error:', fallbackErr);
      }
    }
  };

  const getErrorMessage = (error: CameraError): string => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara.';
      case 'NotFoundError':
        return 'No se encontró ninguna cámara en este dispositivo.';
      case 'NotReadableError':
        return 'La cámara está siendo utilizada por otra aplicación.';
      case 'OverconstrainedError':
        return 'Las restricciones de cámara no pueden ser satisfechas.';
      case 'SecurityError':
        return 'Error de seguridad. Asegúrate de estar usando HTTPS.';
      default:
        return `Error al acceder a la cámara: ${error.message}`;
    }
  };

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(false);
      setScanResult(null);

      console.log('🎥 Iniciando escáner con ZXing...');

      if (!zxingReady || !codeReaderRef.current) {
        throw new Error('ZXing no está disponible. Asegúrate de que el CDN esté cargado.');
      }

      if (!videoRef.current) {
        throw new Error('Elemento de video no disponible.');
      }

      const deviceId = currentCameraId || undefined;
      
      console.log(`📹 Usando cámara: ${deviceId || 'por defecto'}`);

      // 🎯 INICIAR ESCANEO REAL CON ZXING
      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result: any, error: any) => {
          if (result) {
            const qrText = result.getText();
            console.log('🎯 ¡QR CODE DETECTADO!:', qrText);
            console.log('📍 Formato:', result.getBarcodeFormat());
            
            // 🎯 PROCESAR EL QR DETECTADO
            handleQRDetected(qrText);
          }
          
          if (error && !(error instanceof window.ZXing.NotFoundException)) {
            // Solo mostrar errores que no sean "not found" (normal durante scanning)
            console.debug('ZXing scan error (normal):', error.message);
          }
        }
      );

      setIsScanning(true);
      setCameraPermission('granted');
      console.log('✅ Escáner ZXing iniciado correctamente');

    } catch (err: any) {
      console.error('❌ Error iniciando ZXing scanner:', err);
      setError(getErrorMessage(err));
      setCameraPermission('denied');
      setIsScanning(false);
    }
  }, [currentCameraId, zxingReady]);

  const handleQRDetected = async (qrText: string) => {
    try {
      console.log('🔍 Procesando QR detectado:', qrText);
      
      // Evitar procesar el mismo QR múltiples veces
      if (scanResult && scanResult.ticket.qrCode === qrText) {
        return;
      }
      
      const result = await qrService.scanTicket(qrText);
      setScanResult(result);
      
      // Detener escáner después de encontrar un código
      stopScanning();
      
    } catch (err: any) {
      console.error('❌ Error procesando QR:', err);
      setError(`Error validando boleto: ${err.message}`);
    }
  };

  const stopScanning = useCallback(() => {
    console.log('🛑 Deteniendo ZXing scanner...');
    
    try {
      if (codeReaderRef.current && isScanning) {
        codeReaderRef.current.reset();
      }
    } catch (err) {
      console.warn('Error deteniendo scanner:', err);
    }
    
    setIsScanning(false);
    setError(null);
  }, [isScanning]);

  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return;
    
    const currentIndex = availableCameras.findIndex(camera => camera.deviceId === currentCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    
    console.log(`🔄 Cambiando a cámara: ${nextCamera.label}`);
    setCurrentCameraId(nextCamera.deviceId);
    
    if (isScanning) {
      stopScanning();
      setTimeout(startScanning, 1000);
    }
  }, [availableCameras, currentCameraId, isScanning, startScanning, stopScanning]);

  const scanTicket = async (qrData: string) => {
    try {
      setError(null);
      console.log('🔍 Validando boleto manualmente:', qrData);
      
      const result = await qrService.scanTicket(qrData);
      setScanResult(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al escanear boleto';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 🎯 NUEVA FUNCIÓN: Marcar boleto como usado
  const markTicketAsUsed = async (ticketId: string) => {
    try {
      console.log('🔄 Marcando ticket como usado:', ticketId);
      
      // 🎯 LLAMADA REAL A TU API
      const token = localStorage.getItem('nebula_auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://venta-nebula.ddns.net/api';
      
      const response = await fetch(`${apiUrl}/tickets/${ticketId}/mark-used`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error marcando boleto como usado');
      }
      
      const result = await response.json();
      console.log('✅ Ticket marcado como usado:', result);
      
      return result;
    } catch (error: any) {
      console.error('❌ Error en markTicketAsUsed:', error);
      throw error;
    }
  };

  return {
    // Estado
    isScanning,
    scanResult,
    error,
    cameraPermission,
    availableCameras,
    currentCameraId,
    zxingReady, // ✅ Nuevo: indica si ZXing está listo
    
    // Referencias
    videoRef,
    
    // Acciones
    startScanning,
    stopScanning,
    switchCamera,
    scanTicket,
    markTicketAsUsed, // ✅ NUEVA FUNCIÓN AGREGADA
    
    // Utilidades
    canSwitchCamera: availableCameras.length > 1,
    hasMultipleCameras: availableCameras.length > 1,
    currentCameraLabel: availableCameras.find(c => c.deviceId === currentCameraId)?.label || 'Cámara'
  };
};