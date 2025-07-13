// src/hooks/useQRScanner.ts - Versión final con jsQR
import { useState, useRef, useCallback, useEffect } from 'react';
import { type TicketScanResult } from '../types/ticket';
import { qrService } from '../services/qrService';

// Importar jsQR
import jsQR from 'jsqr';

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
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    checkCameraPermission();
    getCameraDevices();
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
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment')
      );
      
      if (backCamera) {
        setCurrentCameraId(backCamera.deviceId);
      } else if (cameras.length > 0) {
        setCurrentCameraId(cameras[0].deviceId);
      }
    } catch (err) {
      console.warn('No se pueden obtener dispositivos de cámara:', err);
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

  // 🎯 DETECCIÓN REAL DE QR CON jsQR
  const detectQRCode = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return null;

    try {
      // Configurar canvas con alta resolución para mejor detección
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Dibujar frame actual del video
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      
      // Obtener datos de imagen
      const imageData = context.getImageData(0, 0, videoWidth, videoHeight);
      
      // 🎯 USAR jsQR PARA DETECTAR CÓDIGO QR
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert", // Mejora el rendimiento
      });
      
      if (qrCode && qrCode.data) {
        console.log('🎯 QR detectado:', qrCode.data);
        console.log('📍 Posición:', qrCode.location);
        return qrCode.data;
      }
      
      return null;
    } catch (err) {
      console.error('Error detectando QR:', err);
      return null;
    }
  }, []);

  // 🎯 BUCLE DE DETECCIÓN
  const startQRDetection = useCallback(() => {
    if (!videoRef.current || !isScanning) return;

    // Crear canvas si no existe
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const detectLoop = () => {
      if (!isScanning || !videoRef.current) return;
      
      // Evitar escaneos muy frecuentes (máximo cada 500ms)
      const now = Date.now();
      if (now - lastScanTime < 500) {
        scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
        return;
      }
      
      const qrData = detectQRCode();
      
      if (qrData) {
        console.log('🎯 QR Code encontrado:', qrData);
        setLastScanTime(now);
        
        // Escanear el boleto
        scanTicket(qrData).catch(err => {
          console.error('Error escaneando boleto:', err);
          // Continuar escaneando en caso de error
          if (isScanning) {
            scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
          }
        });
        return;
      }
      
      // Continuar el bucle de detección
      if (isScanning) {
        scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
      }
    };
    
    // Iniciar el bucle
    detectLoop();
  }, [isScanning, lastScanTime, detectQRCode]);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(false);
      setScanResult(null);

      console.log('🎥 Iniciando escáner QR...');

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara.');
      }

      if (location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname)) {
        throw new Error('Se requiere HTTPS para acceder a la cámara.');
      }

      // Esperar elemento de video
      let attempts = 0;
      while (!videoRef.current && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!videoRef.current) {
        throw new Error('Elemento de video no disponible.');
      }

      // Detener stream anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Configurar constraints optimizadas para QR
      const constraints: MediaStreamConstraints = {
        video: {
          ...(currentCameraId && { deviceId: { exact: currentCameraId } }),
          facingMode: currentCameraId ? undefined : 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Esperar a que el video esté listo
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current!;
        
        const onReady = () => {
          video.removeEventListener('loadedmetadata', onReady);
          video.removeEventListener('error', onError);
          
          video.play()
            .then(() => {
              console.log('✅ Video iniciado, comenzando detección QR...');
              setIsScanning(true);
              setCameraPermission('granted');
              
              // Iniciar detección después de un momento
              setTimeout(() => {
                startQRDetection();
              }, 500);
              
              resolve();
            })
            .catch(reject);
        };

        const onError = (err: any) => {
          video.removeEventListener('loadedmetadata', onReady);
          video.removeEventListener('error', onError);
          reject(err);
        };

        video.addEventListener('loadedmetadata', onReady);
        video.addEventListener('error', onError);

        // Timeout de seguridad
        setTimeout(() => {
          if (video.readyState >= 1) {
            onReady();
          } else {
            reject(new Error('Timeout cargando video'));
          }
        }, 5000);
      });

      await getCameraDevices();

    } catch (err: any) {
      console.error('❌ Error iniciando cámara:', err);
      setError(getErrorMessage(err));
      setCameraPermission('denied');
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsScanning(false);
    }
  }, [currentCameraId, startQRDetection]);

  const stopScanning = useCallback(() => {
    console.log('🛑 Deteniendo escáner...');
    
    if (scanIntervalRef.current) {
      window.cancelAnimationFrame(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setError(null);
  }, []);

  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return;
    
    const currentIndex = availableCameras.findIndex(camera => camera.deviceId === currentCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    setCurrentCameraId(availableCameras[nextIndex].deviceId);
    
    if (isScanning) {
      stopScanning();
      setTimeout(startScanning, 500);
    }
  }, [availableCameras, currentCameraId, isScanning, startScanning, stopScanning]);

  const scanTicket = async (qrData: string) => {
    try {
      setError(null);
      console.log('🔍 Validando boleto:', qrData);
      
      const result = await qrService.scanTicket(qrData);
      setScanResult(result);
      
      // Detener escáner después de encontrar un código válido
      if (result.isValid) {
        stopScanning();
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al escanear boleto';
      setError(errorMessage);
      console.error('Error escaneando:', err);
      throw new Error(errorMessage);
    }
  };

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    // Estado
    isScanning,
    scanResult,
    error,
    cameraPermission,
    availableCameras,
    currentCameraId,
    
    // Referencias
    videoRef,
    
    // Acciones
    startScanning,
    stopScanning,
    switchCamera,
    scanTicket,
    
    // Utilidades
    canSwitchCamera: availableCameras.length > 1,
    hasMultipleCameras: availableCameras.length > 1,
    currentCameraLabel: availableCameras.find(c => c.deviceId === currentCameraId)?.label || 'Cámara'
  };
};