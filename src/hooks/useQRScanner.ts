import { useState, useRef, useCallback } from 'react';
import { type TicketScanResult } from '../types/ticket';
import { qrService } from '../services/qrService';

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TicketScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara');
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const scanTicket = async (qrData: string) => {
    try {
      setError(null);
      const result = await qrService.scanTicket(qrData);
      setScanResult(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al escanear boleto');
      throw err;
    }
  };

  return {
    isScanning,
    scanResult,
    error,
    videoRef,
    startScanning,
    stopScanning,
    scanTicket
  };
};