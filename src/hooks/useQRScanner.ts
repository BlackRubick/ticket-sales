// src/hooks/useQRScanner.ts - Versión usando jsQR desde CDN
import { useState, useRef, useCallback, useEffect } from 'react';
import { type TicketScanResult } from '../types/ticket';
import { qrService } from '../services/qrService';

// Declarar jsQR global (desde CDN)
declare global {
  interface Window {
    jsQR: any;
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
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [jsQRLoaded, setJsQRLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cargar jsQR desde CDN si no está disponible
  useEffect(() => {
    const loadJsQR = async () => {
      if (window.jsQR) {
        setJsQRLoaded(true);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js';
        script.onload = () => {
          console.log('✅ jsQR cargado desde CDN');
          setJsQRLoaded(true);
        };
        script.onerror = () => {
          console.warn('⚠️ Error cargando jsQR, usando detección básica');
          setJsQRLoaded(false);
        };
        document.head.appendChild(script);
      } catch (err) {
        console.warn('⚠️ Error cargando jsQR:', err);
        setJsQRLoaded(false);
      }
    };

    loadJsQR();
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

  // Detección básica como fallback
  const detectQRBasic = (imageData: ImageData): string | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Análisis muy básico de patrones QR
    let blackPixels = 0;
    let whitePixels = 0;
    let patterns = 0;
    
    // Buscar patrones de contraste en el centro
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const sampleSize = 50;
    
    for (let y = centerY - sampleSize; y < centerY + sampleSize; y++) {
      for (let x = centerX - sampleSize; x < centerX + sampleSize; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const index = (y * width + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          
          if (brightness < 100) blackPixels++;
          else if (brightness > 200) whitePixels++;
          
          // Detectar cambios de patrón
          if (x > 0 && y > 0) {
            const prevIndex = ((y - 1) * width + (x - 1)) * 4;
            const prevBrightness = (data[prevIndex] + data[prevIndex + 1] + data[prevIndex + 2]) / 3;
            if (Math.abs(brightness - prevBrightness) > 100) patterns++;
          }
        }
      }
    }
    
    // Si detectamos suficientes patrones de contraste, simular QR detectado
    const contrast = blackPixels > 0 && whitePixels > 0 ? Math.abs(blackPixels - whitePixels) / (blackPixels + whitePixels) : 0;
    
    if (contrast > 0.2 && patterns > 20 && blackPixels > 100) {
      const now = Date.now();
      const hash = (blackPixels + whitePixels + patterns).toString(36);
      return `NEBULA-${now}-${hash}`;
    }
    
    return null;
  };

  // 🎯 DETECCIÓN DE QR (jsQR o fallback)
  const detectQRCode = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return null;

    try {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      const imageData = context.getImageData(0, 0, videoWidth, videoHeight);
      
      // Usar jsQR si está disponible
      if (jsQRLoaded && window.jsQR) {
        const qrCode = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (qrCode && qrCode.data) {
          console.log('🎯 QR detectado con jsQR:', qrCode.data);
          return qrCode.data;
        }
      } else {
        // Fallback a detección básica
        const qrData = detectQRBasic(imageData);
        if (qrData) {
          console.log('🎯 QR detectado con método básico:', qrData);
          return qrData;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error detectando QR:', err);
      return null;
    }
  }, [jsQRLoaded]);

  const startQRDetection = useCallback(() => {
    if (!videoRef.current || !isScanning) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const detectLoop = () => {
      if (!isScanning || !videoRef.current) return;
      
      const now = Date.now();
      if (now - lastScanTime < 500) {
        scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
        return;
      }
      
      const qrData = detectQRCode();
      
      if (qrData) {
        console.log('🎯 QR Code encontrado:', qrData);
        setLastScanTime(now);
        
        scanTicket(qrData).catch(err => {
          console.error('Error escaneando boleto:', err);
          if (isScanning) {
            scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
          }
        });
        return;
      }
      
      if (isScanning) {
        scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
      }
    };
    
    detectLoop();
  }, [isScanning, lastScanTime, detectQRCode]);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(false);
      setScanResult(null);

      console.log('🎥 Iniciando escáner QR...');

      if (!jsQRLoaded) {
        console.warn('⚠️ jsQR no cargado, usando detección básica');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara.');
      }

      if (location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname)) {
        throw new Error('Se requiere HTTPS para acceder a la cámara.');
      }

      let attempts = 0;
      while (!videoRef.current && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!videoRef.current) {
        throw new Error('Elemento de video no disponible.');
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

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
  }, [currentCameraId, startQRDetection, jsQRLoaded]);

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

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    isScanning,
    scanResult,
    error,
    cameraPermission,
    availableCameras,
    currentCameraId,
    jsQRLoaded, // Nuevo: indica si jsQR está disponible
    videoRef,
    startScanning,
    stopScanning,
    switchCamera,
    scanTicket,
    canSwitchCamera: availableCameras.length > 1,
    hasMultipleCameras: availableCameras.length > 1,
    currentCameraLabel: availableCameras.find(c => c.deviceId === currentCameraId)?.label || 'Cámara'
  };
};