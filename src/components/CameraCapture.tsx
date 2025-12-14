'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Nao foi possivel acessar a camera. Tente fazer upload de uma foto.');
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col h-screen">
      {/* Header - fixed height */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-black/50 z-10">
        <button onClick={onClose} className="text-white p-2">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium">Capturar Look</span>
        <button onClick={toggleCamera} className="text-white p-2">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Camera view - fills remaining space */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {capturedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
            <Camera className="w-16 h-16 mb-4 opacity-50" />
            <p className="mb-4">{error}</p>
            <button
              onClick={openFilePicker}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <ImageIcon className="w-5 h-5" />
              Selecionar da Galeria
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls - fixed height */}
      <div className="flex-shrink-0 p-6 bg-black/80 flex items-center justify-center gap-8 z-10">
        {capturedImage ? (
          <>
            <button
              onClick={retake}
              className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-white"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={confirm}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white"
            >
              <Check className="w-8 h-8" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={openFilePicker}
              className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={capture}
              disabled={!!error}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-full bg-white border-4 border-gray-300" />
            </button>
            <div className="w-12 h-12" /> {/* Spacer */}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
