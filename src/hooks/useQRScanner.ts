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
 
 const videoRef = useRef<HTMLVideoElement>(null);
 const streamRef = useRef<MediaStream | null>(null);
 const scanIntervalRef = useRef<number | null>(null);

 // Verificar permisos de cámara al montar el componente
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
     
     // Preferir cámara trasera si está disponible
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
       return 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración del navegador.';
     case 'NotFoundError':
       return 'No se encontró ninguna cámara en este dispositivo.';
     case 'NotReadableError':
       return 'La cámara está siendo utilizada por otra aplicación.';
     case 'OverconstrainedError':
       return 'Las restricciones de cámara no pueden ser satisfechas.';
     case 'SecurityError':
       return 'Error de seguridad al acceder a la cámara. Asegúrate de estar usando HTTPS.';
     case 'AbortError':
       return 'El acceso a la cámara fue abortado.';
     default:
       return `Error al acceder a la cámara: ${error.message}`;
   }
 };

 const startScanning = useCallback(async () => {
   try {
     setError(null);
     setIsScanning(false);

     console.log('🎥 Iniciando proceso de cámara...');

     // Verificar si el navegador soporta getUserMedia
     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
       throw new Error('Tu navegador no soporta acceso a la cámara. Prueba con Chrome, Firefox o Safari.');
     }

     // Verificar si estamos en HTTPS (requerido para cámara en producción)
     if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
       throw new Error('El acceso a la cámara requiere HTTPS. Por favor, usa una conexión segura.');
     }

     // Detener stream anterior si existe
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
     }

     // Configurar restricciones de la cámara
     let constraints: MediaStreamConstraints = {
       video: {
         facingMode: 'environment', // Preferir cámara trasera
         width: { ideal: 1280, min: 640 },
         height: { ideal: 720, min: 480 },
         frameRate: { ideal: 30, min: 15 }
       },
       audio: false
     };

     // Si tenemos un ID específico de cámara, crear nuevas restricciones
     if (currentCameraId) {
       constraints = {
         video: {
           deviceId: { exact: currentCameraId },
           width: { ideal: 1280, min: 640 },
           height: { ideal: 720, min: 480 },
           frameRate: { ideal: 30, min: 15 }
         },
         audio: false
       };
     }

     console.log('🚀 Solicitando acceso a cámara...');
     
     const stream = await navigator.mediaDevices.getUserMedia(constraints);
     
     console.log('✅ Stream obtenido');

     // ESPERAR MÁS TIEMPO Y VERIFICAR VARIAS VECES
     let videoElement = null;
     let attempts = 0;
     const maxAttempts = 10;

     while (!videoElement && attempts < maxAttempts) {
       videoElement = videoRef.current;
       if (!videoElement) {
         console.log(`⏳ Intento ${attempts + 1}/${maxAttempts} - Esperando video element...`);
         await new Promise(resolve => setTimeout(resolve, 300));
         attempts++;
       }
     }

     if (!videoElement) {
       throw new Error('No se pudo encontrar el elemento de video después de varios intentos. Intenta recargar la página.');
     }

     console.log('✅ Video element encontrado después de', attempts, 'intentos');

     // Ahora sí asignar el stream
     videoElement.srcObject = stream;
     streamRef.current = stream;
     
     // Esperar a que el video esté listo
     await new Promise<void>((resolve, reject) => {
       const video = videoElement;
       
       const onLoadedMetadata = () => {
         console.log('📊 Video metadata loaded');
         video.removeEventListener('loadedmetadata', onLoadedMetadata);
         video.removeEventListener('error', onError);
         
         video.play()
           .then(() => {
             console.log('▶️ Video iniciado correctamente');
             setIsScanning(true);
             setCameraPermission('granted');
             resolve();
           })
           .catch((playError) => {
             console.error('❌ Error reproduciendo video:', playError);
             reject(new Error('Error reproduciendo el video'));
           });
       };

       const onError = (err: any) => {
         console.error('❌ Video error:', err);
         video.removeEventListener('loadedmetadata', onLoadedMetadata);
         video.removeEventListener('error', onError);
         reject(new Error('Error cargando el video'));
       };

       video.addEventListener('loadedmetadata', onLoadedMetadata);
       video.addEventListener('error', onError);

       // Timeout de seguridad
       setTimeout(() => {
         video.removeEventListener('loadedmetadata', onLoadedMetadata);
         video.removeEventListener('error', onError);
         
         if (video.readyState >= 2) {
           console.log('⏰ Timeout pero video tiene datos, intentando reproducir...');
           video.play()
             .then(() => {
               setIsScanning(true);
               setCameraPermission('granted');
               resolve();
             })
             .catch(() => {
               reject(new Error('Timeout esperando que el video esté listo'));
             });
         } else {
           reject(new Error('Timeout esperando que el video esté listo'));
         }
       }, 8000);
     });

     // Actualizar lista de cámaras después del acceso exitoso
     await getCameraDevices();

   } catch (err: any) {
     console.error('❌ Error iniciando cámara:', err);
     
     const errorMessage = getErrorMessage(err);
     setError(errorMessage);
     setCameraPermission('denied');
     
     // Limpiar recursos
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
     }
     setIsScanning(false);
   }
 }, [currentCameraId]);

 const stopScanning = useCallback(() => {
   console.log('🛑 Deteniendo escáner...');
   
   // Detener el intervalo de escaneo
   if (scanIntervalRef.current) {
     clearInterval(scanIntervalRef.current);
     scanIntervalRef.current = null;
   }

   // Detener el stream de video
   if (streamRef.current) {
     streamRef.current.getTracks().forEach(track => {
       console.log(`Deteniendo track: ${track.kind} - ${track.label}`);
       track.stop();
     });
     streamRef.current = null;
   }

   // Limpiar el video
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
   const nextCamera = availableCameras[nextIndex];
   
   setCurrentCameraId(nextCamera.deviceId);
   
   // Reiniciar cámara con el nuevo dispositivo
   if (isScanning) {
     stopScanning();
     setTimeout(() => startScanning(), 500);
   }
 }, [availableCameras, currentCameraId, isScanning, startScanning, stopScanning]);

 const scanTicket = async (qrData: string) => {
   try {
     setError(null);
     console.log('🔍 Escaneando ticket:', qrData);
     
     const result = await qrService.scanTicket(qrData);
     setScanResult(result);
     return result;
   } catch (err: any) {
     const errorMessage = err.message || 'Error al escanear boleto';
     setError(errorMessage);
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