import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  X,
  Check,
  RotateCcw,
  AlertTriangle,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { compressImageFile, ProcessedImage } from '../../utils/imageUtils';
import { useBackButton } from '../../hooks/useBackButton';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (image: ProcessedImage) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
}) => {
  const { t } = useI18n();
  useBackButton(isOpen, onClose, 'camera-capture-modal', 30);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const activeRequestIdRef = useRef<number>(0);

  const stopStream = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null;
      try {
        videoRef.current.pause();
      } catch {
        // Ignored
      }
      videoRef.current.srcObject = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignored
        }
      });
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopStream();
    const requestId = ++activeRequestIdRef.current;
    setIsLoadingCamera(true);
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not supported in this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Check if this request is still the active one
      if (activeRequestIdRef.current !== requestId) {
        newStream.getTracks().forEach((track) => track.stop());
        return;
      }

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          if (activeRequestIdRef.current === requestId && videoRef.current) {
            videoRef.current.play().catch((playErr: unknown) => {
              // AbortError or NotAllowedError when interrupted by new stream or tab switch is expected
              if (
                playErr instanceof DOMException &&
                (playErr.name === 'AbortError' || playErr.name === 'NotAllowedError')
              ) {
                return;
              }
              console.warn('Video play interrupted:', playErr);
            });
          }
        };
      }
    } catch (err: any) {
      if (activeRequestIdRef.current === requestId) {
        console.warn('Camera access failed, falling back to native file input:', err);
        setErrorMessage(
          'Direct camera viewfinder unavailable. You can still use your phone camera via the native capture button below.'
        );
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setIsLoadingCamera(false);
      }
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen && !capturedDataUrl) {
      startCamera();
    }
    return () => {
      activeRequestIdRef.current++;
      stopStream();
    };
  }, [isOpen, startCamera, capturedDataUrl, stopStream]);

  if (!isOpen) return null;

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedDataUrl(dataUrl);

    // Pause stream while previewing
    stopStream();
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera();
  };

  const handleConfirmPhoto = async () => {
    if (!capturedDataUrl) return;
    try {
      // Convert dataUrl to blob and compress
      const res = await fetch(capturedDataUrl);
      const blob = await res.blob();
      const processed = await compressImageFile(blob);
      onPhotoCaptured(processed);
      onClose();
    } catch (err) {
      console.error('Failed to process captured photo:', err);
    }
  };

  const handleNativeFallbackCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await compressImageFile(file);
      onPhotoCaptured(processed);
      onClose();
    } catch (err) {
      console.error('Failed to process fallback photo:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Phone Camera Capture</h3>
              <p className="text-[10px] text-slate-400">Attach photo evidence to incident</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="p-4 space-y-4">
          <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Shutter flash overlay */}
            {isFlashing && <div className="absolute inset-0 bg-white z-20 transition-opacity" />}

            {/* Error or Fallback View */}
            {errorMessage && !capturedDataUrl && (
              <div className="p-6 text-center space-y-3 z-10 max-w-sm">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Device Camera</span>
                </button>
                <input
                  ref={fileFallbackRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeFallbackCapture}
                  className="hidden"
                />
              </div>
            )}

            {/* Loading Camera State */}
            {isLoadingCamera && !errorMessage && !capturedDataUrl && (
              <div className="text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Initializing camera...</p>
              </div>
            )}

            {/* Live Video Viewfinder */}
            {!capturedDataUrl && !errorMessage && (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Grid Target Overlay */}
                <div className="absolute inset-0 pointer-events-none border border-white/20 m-4 rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-amber-400/40 rounded-full" />
                </div>

                {/* Switch Camera Button */}
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white rounded-full transition active:scale-95"
                  title="Switch camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Captured Photo Preview */}
            {capturedDataUrl && (
              <img
                src={capturedDataUrl}
                alt="Captured Preview"
                className="w-full h-full object-contain bg-slate-950"
              />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {!capturedDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Native Picker</span>
                </button>
                <input
                  ref={fileFallbackRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeFallbackCapture}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isLoadingCamera || !!errorMessage}
                  onClick={handleSnap}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-950" />
                  <span>Capture Photo</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Use This Photo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
