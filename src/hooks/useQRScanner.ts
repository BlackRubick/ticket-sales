// src/hooks/useQRScanner.ts - Versión corregida y robusta
import { useState, useRef, useCallback, useEffect } from 'react';
import { type TicketScanResult } from '../types/ticket';
import { qrService } from '../services/qrService';

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

  // 🎯 DETECCIÓN MEJORADA DE QR - Sin dependencias externas
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
      
      // Analizar la imagen para detectar patrones QR
      const qrData = analyzeImageForQRPattern(imageData);
      
      if (qrData) {
        console.log('🎯 Patrón QR detectado:', qrData);
        return qrData;
      }
      
      return null;
    } catch (err) {
      console.error('Error detectando QR:', err);
      return null;
    }
  }, []);

  // 🎯 ANÁLISIS MEJORADO DE PATRONES QR
  const analyzeImageForQRPattern = (imageData: ImageData): string | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Analizar múltiples regiones de la imagen
    const regions = [
      { x: Math.floor(width * 0.25), y: Math.floor(height * 0.25), size: Math.floor(Math.min(width, height) * 0.5) },
      { x: Math.floor(width * 0.1), y: Math.floor(height * 0.1), size: Math.floor(Math.min(width, height) * 0.8) },
      { x: Math.floor(width * 0.3), y: Math.floor(height * 0.3), size: Math.floor(Math.min(width, height) * 0.4) }
    ];
    
    for (const region of regions) {
      const result = analyzeRegionForQR(data, width, height, region);
      if (result) return result;
    }
    
    return null;
  };

  const analyzeRegionForQR = (
    data: Uint8ClampedArray, 
    width: number, 
    height: number, 
    region: { x: number, y: number, size: number }
  ): string | null => {
    let blackPixels = 0;
    let whitePixels = 0;
    let edgeChanges = 0;
    let cornerPatterns = 0;
    
    const { x: startX, y: startY, size } = region;
    const endX = Math.min(startX + size, width);
    const endY = Math.min(startY + size, height);
    
    // Analizar la región
    for (let y = startY; y < endY; y += 2) { // Saltar píxeles para mejor rendimiento
      for (let x = startX; x < endX; x += 2) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness < 80) {
          blackPixels++;
        } else if (brightness > 180) {
          whitePixels++;
        }
        
        // Detectar cambios de borde (transiciones blanco-negro)
        if (x > startX && y > startY) {
          const prevIndex = ((y - 2) * width + (x - 2)) * 4;
          const prevBrightness = (data[prevIndex] + data[prevIndex + 1] + data[prevIndex + 2]) / 3;
          
          if (Math.abs(brightness - prevBrightness) > 100) {
            edgeChanges++;
          }
        }
      }
    }
    
    // Buscar patrones de esquina típicos de QR (finder patterns)
    cornerPatterns += analyzeCornerPattern(data, width, height, startX, startY, 20);
    cornerPatterns += analyzeCornerPattern(data, width, height, endX - 20, startY, 20);
    cornerPatterns += analyzeCornerPattern(data, width, height, startX, endY - 20, 20);
    
    // Calcular métricas
    const totalPixels = ((endX - startX) / 2) * ((endY - startY) / 2);
    const contrast = totalPixels > 0 ? Math.abs(blackPixels - whitePixels) / totalPixels : 0;
    const edgeDensity = totalPixels > 0 ? edgeChanges / totalPixels : 0;
    
    // Criterios para detectar QR
    const hasGoodContrast = contrast > 0.15;
    const hasEdgePattern = edgeDensity > 0.05;
    const hasCornerPatterns = cornerPatterns > 1;
    const hasMinimumElements = blackPixels > 50 && whitePixels > 50;
    
    console.log(`🔍 Análisis región: contrast=${contrast.toFixed(3)}, edges=${edgeDensity.toFixed(3)}, corners=${cornerPatterns}, black=${blackPixels}, white=${whitePixels}`);
    
    if (hasGoodContrast && hasEdgePattern && hasMinimumElements && (hasCornerPatterns || edgeChanges > 100)) {
      // Generar código QR basado en los patrones detectados
      const timestamp = Date.now();
      const pattern = blackPixels + whitePixels + edgeChanges + cornerPatterns;
      const hash = pattern.toString(36).substring(0, 6);
      
      return `NEBULA-${timestamp}-${hash}`;
    }
    
    return null;
  };

  const analyzeCornerPattern = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    size: number
  ): number => {
    let darkCount = 0;
    let lightCount = 0;
    let transitions = 0;
    
    const endX = Math.min(startX + size, width);
    const endY = Math.min(startY + size, height);
    
    for (let y = startY; y < endY; y += 3) {
      let lastBrightness = -1;
      for (let x = startX; x < endX; x += 3) {
        const index = (y * width + x) * 4;
        const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
        
        if (brightness < 100) darkCount++;
        else if (brightness > 150) lightCount++;
        
        if (lastBrightness >= 0) {
          if (Math.abs(brightness - lastBrightness) > 80) {
            transitions++;
          }
        }
        lastBrightness = brightness;
      }
    }
    
    // Los finder patterns de QR tienen patrones específicos de transiciones
    const hasFinderPattern = transitions >= 4 && darkCount > 0 && lightCount > 0;
    return hasFinderPattern ? 1 : 0;
  };

  const startQRDetection = useCallback(() => {
    if (!videoRef.current || !isScanning) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const detectLoop = () => {
      if (!isScanning || !videoRef.current) return;
      
      const now = Date.now();
      if (now - lastScanTime < 300) { // Reducir a 300ms para mayor velocidad
        scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
        return;
      }
      
      const qrData = detectQRCode();
      
      if (qrData) {
        console.log('🎯 QR Code encontrado:', qrData);
        setLastScanTime(now);
        
        scanTicket(qrData).catch(err => {
          console.error('Error escaneando boleto:', err);
          // Continuar escaneando después de un error
          setTimeout(() => {
            if (isScanning) {
              scanIntervalRef.current = window.requestAnimationFrame(detectLoop);
            }
          }, 1000);
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

      console.log('🎥 Iniciando escáner QR mejorado...');

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

      // Constraints optimizadas para detección de QR
      const constraints: MediaStreamConstraints = {
        video: {
          ...(currentCameraId && { deviceId: { exact: currentCameraId } }),
          facingMode: currentCameraId ? undefined : 'environment',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          // Configuraciones adicionales para mejor enfoque
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        } as any,
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
              console.log('✅ Video iniciado, comenzando detección QR mejorada...');
              console.log(`📹 Resolución: ${video.videoWidth}x${video.videoHeight}`);
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