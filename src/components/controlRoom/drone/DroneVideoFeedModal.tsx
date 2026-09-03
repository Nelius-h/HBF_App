import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Crosshair,
  Battery,
  Radio,
  Compass,
  Maximize2,
  Minimize2,
  X,
  Camera,
  Sun,
  Thermometer,
  Phone,
  MessageCircle,
  RotateCcw,
  Play,
  Pause,
  Flame,
  CheckCircle2,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import {
  droneTelemetryService,
  DroneTelemetryData,
  ThermalPalette,
  CameraViewMode,
} from '../../../services/droneTelemetryService';

interface DroneVideoFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFloatingPip?: boolean;
  onTogglePip?: () => void;
  onPinPointTarget?: (lat: number, lng: number, label: string) => void;
  onFlyToEmergency?: () => void;
}

export const DroneVideoFeedModal: React.FC<DroneVideoFeedModalProps> = ({
  isOpen,
  onClose,
  isFloatingPip = false,
  onTogglePip,
  onPinPointTarget,
  onFlyToEmergency,
}) => {
  const [telemetry, setTelemetry] = useState<DroneTelemetryData>(droneTelemetryService.getTelemetry());
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);
  const [photoFlash, setPhotoFlash] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check if live feed is truly streaming and active
  const isFeedActive = telemetry.isOnline && telemetry.stream.isStreaming && telemetry.flightState !== 'OFFLINE';

  // Subscribe to real-time telemetry updates
  useEffect(() => {
    const unsub = droneTelemetryService.subscribe((t) => {
      setTelemetry(t);
    });
    return () => unsub();
  }, []);

  // Tactical Canvas Rendering Engine for FLIR Thermal / Optical View
  useEffect(() => {
    if (!isOpen) return;

    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // When NO FEED is received: render dark static noise raster
      if (!isFeedActive) {
        ctx.fillStyle = '#050914';
        ctx.fillRect(0, 0, w, h);

        // TV / Signal loss scanlines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let y = 0; y < h; y += 4) {
          ctx.fillRect(0, y, w, 1.5);
        }

        // Faint noise particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 60; i++) {
          const rx = Math.random() * w;
          const ry = Math.random() * h;
          ctx.fillRect(rx, ry, 2, 2);
        }

        animationId = requestAnimationFrame(render);
        return;
      }

      // 1. Draw Thermal / Optical Synthetic Background
      const isThermal = telemetry.gimbal.viewMode === 'THERMAL' || telemetry.gimbal.viewMode === 'SPLIT';
      const palette = telemetry.gimbal.thermalPalette;

      if (isThermal) {
        // Palette background gradients
        if (palette === 'WHITE_HOT') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, w, h);
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(0.5, '#0f172a');
          grad.addColorStop(1, '#020617');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else if (palette === 'BLACK_HOT') {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, w, h);
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, '#cbd5e1');
          grad.addColorStop(0.5, '#f1f5f9');
          grad.addColorStop(1, '#e2e8f0');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else if (palette === 'IRONBOW') {
          ctx.fillStyle = '#1e0538';
          ctx.fillRect(0, 0, w, h);
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, '#1e0538');
          grad.addColorStop(0.4, '#3b0764');
          grad.addColorStop(0.7, '#831843');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else if (palette === 'RAINBOW') {
          ctx.fillStyle = '#030712';
          ctx.fillRect(0, 0, w, h);
        } else {
          // Night IR (Green Phosphor)
          ctx.fillStyle = '#022c22';
          ctx.fillRect(0, 0, w, h);
        }

        // Clean Camera Feed Rendering (No synthetic targets/simulated people)
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 80) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.fillText(`DJI ZENMUSE H20T • SENSOR LIVE FEED • ${telemetry.gimbal.viewMode}`, 30, 40);
      }

      // Tactical Scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    isOpen,
    isFeedActive,
    telemetry.gimbal.viewMode,
  ]);

  if (!isOpen) return null;

  const handleDropLaserPin = () => {
    const pin = droneTelemetryService.dropLaserPinPoint();
    setPinFeedback(`PinPoint laat val by ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}!`);
    if (onPinPointTarget) {
      onPinPointTarget(pin.latitude, pin.longitude, pin.label);
    }
    setTimeout(() => setPinFeedback(null), 4000);
  };

  const handleSnapPhoto = () => {
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 200);
  };

  const handleToggleFeedConnection = () => {
    if (isFeedActive) {
      droneTelemetryService.disconnectFeed();
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        droneTelemetryService.connectFeed();
        setIsConnecting(false);
      }, 600);
    }
  };

  return (
    <div
      className={
        isFloatingPip
          ? 'fixed bottom-5 right-5 z-[9999] w-[420px] bg-slate-950/95 border-2 border-cyan-500 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95'
          : 'fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4'
      }
    >
      <div
        className={
          isFloatingPip
            ? 'w-full flex flex-col'
            : 'relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden'
        }
      >
        {/* Flash effect when snapping photos */}
        {photoFlash && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200" />}

        {/* TOP HUD BAR */}
        <div className="h-12 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isFeedActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 ring-2 ring-rose-500/30'
                }`}
              />
              <span className="font-bold text-white font-mono tracking-wide">
                DJI MATRICE T4 [M30T]
              </span>
            </div>

            {/* Prominent Status Badge */}
            {isFeedActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>AANLYN ({telemetry.flightState})</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>STATUS: AFLYN (GEEN TOEVOER)</span>
              </span>
            )}

            {isFeedActive && (
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono text-[10px] font-bold">
                RTK FIXED ({telemetry.position.satellites} SATS)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Battery Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-[11px] font-mono">
              <Battery
                className={`w-3.5 h-3.5 ${
                  !isFeedActive
                    ? 'text-slate-500'
                    : telemetry.battery.percentage < 25
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              />
              <span className="font-bold text-white">
                {isFeedActive ? `${telemetry.battery.percentage.toFixed(0)}%` : 'AFLYN'}
              </span>
              {isFeedActive && (
                <span className="text-slate-400 text-[10px]">({telemetry.battery.estimatedMinutesRemaining}m)</span>
              )}
            </div>

            {/* Link / Radio Quality */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-cyan-300">
              <Radio className={`w-3.5 h-3.5 ${isFeedActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{isFeedActive ? `${telemetry.smartController.linkQualityPercent}%` : 'GEEN SEIN'}</span>
            </div>

            {/* Window Controls */}
            {onTogglePip && (
              <button
                onClick={onTogglePip}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title={isFloatingPip ? 'Vergroot Venster' : 'Miniatuur Prent-in-Prent (PiP)'}
              >
                {isFloatingPip ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition"
              title="Sluit Venster"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN VIDEO & HUD VIEWPORT */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          {/* Tactical Canvas Display */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain"
          />

          {/* ============================================================ */}
          {/* OFFLINE STATE OVERLAY (When no feed is received from drone) */}
          {/* ============================================================ */}
          {!isFeedActive && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
              <div className="max-w-xl w-full bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/30 text-center relative overflow-hidden">
                {/* Background accent glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950/50 animate-pulse">
                  <VideoOff className="w-8 h-8" />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold mb-3">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span>STATUS: AFLYN (GEEN TOEVOER)</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  GEEN VIDEOTOEVOER ONTVANG NIE
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-lg mx-auto">
                  Die DJI Matrice T4 stuur tans geen aktiewe videotoevoer na die beheerkamer nie. Kontroleer dat die
                  hommeltuig aangeskakel is en dat die vlieënier se RC Plus beheerder met die O3 Pro skakel gekoppel is.
                </p>

                {/* Diagnostics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-5 text-left text-xs font-mono">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Regstreekse Videosein</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <WifiOff className="w-3.5 h-3.5" /> Aflyn (0 fps)
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">O3 Pro Skakel</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <Radio className="w-3.5 h-3.5" /> Geen Verbinding
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Toets Kontrolesentrum</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> +27 82 306 5808
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleToggleFeedConnection}
                    disabled={isConnecting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/60 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                        <span>Koppel tans aan toevoer...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-cyan-200" />
                        <span>Koppel / Toets Regstreekse Toevoer</span>
                      </>
                    )}
                  </button>

                  <a
                    href="tel:+27823065808"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Skakel Vlieënier (082 306 5808)</span>
                  </a>

                  <a
                    href="https://wa.me/27823065808?text=Beheerkamer%20meld:%20Geen%20videotoevoer%20word%20tans%20vanaf%20die%20DJI%20Matrice%20ontvang%20nie."
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs flex items-center gap-2 border border-emerald-500/40 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Vlieënier</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ONLINE HUD OVERLAY: FLIR / PILOT 2 TACTICAL HUD */}
          {/* ============================================================ */}
          {isFeedActive && (
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none">
              {/* TOP HUD INFO */}
              <div className="flex items-start justify-between text-[11px] font-mono text-cyan-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {/* Left Top: Coordinates & Height */}
                <div className="space-y-0.5 bg-slate-950/60 p-2 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                  <div>
                    GPS: {telemetry.position.latitude.toFixed(5)}°, {telemetry.position.longitude.toFixed(5)}°
                  </div>
                  <div>
                    AGL: <span className="text-white font-bold">{telemetry.position.heightAglMeters}m</span> | MSL:{' '}
                    {telemetry.position.altitudeMslMeters}m
                  </div>
                  <div>
                    SPOED: <span className="text-white font-bold">{telemetry.position.speedKmh.toFixed(1)} km/h</span>
                  </div>
                </div>

                {/* Center Top: Artificial Horizon Pitch & Heading Compass Tape */}
                <div className="flex flex-col items-center bg-slate-950/60 px-4 py-1.5 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-1 text-white font-bold text-xs">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      KOP: {telemetry.position.heading.toFixed(0)}° (
                      {telemetry.position.heading > 315 || telemetry.position.heading <= 45
                        ? 'N'
                        : telemetry.position.heading <= 135
                        ? 'O'
                        : telemetry.position.heading <= 225
                        ? 'S'
                        : 'W'}
                      )
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    GIMBAL HOEK: {telemetry.gimbal.pitch.toFixed(1)}° | ZOOM: {telemetry.gimbal.zoomLevel}x
                  </div>
                </div>

                {/* Right Top: Thermal Palette & Spot Temperatures */}
                <div className="space-y-0.5 bg-slate-950/60 p-2 rounded-lg border border-cyan-500/30 backdrop-blur-sm text-right">
                  <div className="flex items-center justify-end gap-1 text-amber-300 font-bold">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>SPOT: {telemetry.gimbal.thermalSpotTempC.toFixed(1)}°C</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    PALET: <span className="text-white">{telemetry.gimbal.thermalPalette}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    LRF AFSTAND: {telemetry.laserRangefinder.targetDistanceMeters}m
                  </div>
                </div>
              </div>

              {/* CENTER HUD: RETICLE & ARTIFICIAL HORIZON */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Central Crosshair */}
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border border-cyan-400/60 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  {/* Horizontal Level Marks */}
                  <div className="absolute w-32 h-[1px] bg-cyan-400/40" />
                  <div className="absolute h-24 w-[1px] bg-cyan-400/40" />
                </div>
              </div>

              {/* BOTTOM HUD: PILOT & STATUS */}
              <div className="flex items-end justify-between text-[11px] font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-700 text-slate-300">
                  <div>
                    VLUGTYD:{' '}
                    <span className="text-white font-bold">
                      {Math.floor(telemetry.flightLog.totalFlightSeconds / 60)}m{' '}
                      {telemetry.flightLog.totalFlightSeconds % 60}s
                    </span>
                  </div>
                  <div>
                    PILOT:{' '}
                    <span className="text-cyan-300 font-bold">
                      {telemetry.smartController.pilotName} ({telemetry.smartController.pilotCallsign})
                    </span>
                  </div>
                </div>

                {/* Pin Feedback Banner */}
                {pinFeedback && (
                  <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{pinFeedback}</span>
                  </div>
                )}

                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-700 text-right text-slate-300">
                  <div>
                    STROOM: <span className="text-emerald-400 font-bold">{telemetry.stream.resolution}</span>
                  </div>
                  <div>
                    LATENSIE: <span className="text-white font-bold">{telemetry.stream.latencyMs}ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM TACTICAL CONTROLS (Only visible in full view) */}
        {!isFloatingPip && (
          <div className="bg-slate-900 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* View Mode & Palette Switches */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Sensor:</span>
              {(['THERMAL', 'RGB', 'SPLIT', 'NIGHT_IR'] as CameraViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => droneTelemetryService.setViewMode(mode)}
                  disabled={!isFeedActive}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    telemetry.gimbal.viewMode === mode && isFeedActive
                      ? 'bg-cyan-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'THERMAL'
                    ? 'FLIR Termies'
                    : mode === 'RGB'
                    ? '4K Opties'
                    : mode === 'SPLIT'
                    ? 'Gesplete'
                    : 'Nag-IR'}
                </button>
              ))}

              <span className="text-slate-600 mx-1">|</span>

              {/* Thermal Palettes */}
              {(['WHITE_HOT', 'BLACK_HOT', 'IRONBOW', 'RAINBOW'] as ThermalPalette[]).map((pal) => (
                <button
                  key={pal}
                  onClick={() => droneTelemetryService.setThermalPalette(pal)}
                  disabled={!isFeedActive}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    telemetry.gimbal.thermalPalette === pal && isFeedActive
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pal === 'WHITE_HOT'
                    ? 'Wit-Warm'
                    : pal === 'BLACK_HOT'
                    ? 'Swart-Warm'
                    : pal === 'IRONBOW'
                    ? 'Ysterboog'
                    : 'Reënboog'}
                </button>
              ))}
            </div>

            {/* Tactical Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Laser Pinpoint Button */}
              <button
                onClick={handleDropLaserPin}
                disabled={!isFeedActive}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Plaas 'n akkurate GPS merker op die teiken vir grondspanne"
              >
                <Crosshair className="w-4 h-4 animate-spin text-white" />
                <span>Merk Teiken op Kaart (LRF PinPoint)</span>
              </button>

              {/* Snap Recon Photo */}
              <button
                onClick={handleSnapPhoto}
                disabled={!isFeedActive}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Neem Hoë-Resolusie FLIR Verkenningsfoto"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Spotlight Toggle */}
              <button
                onClick={() => droneTelemetryService.toggleSpotlight()}
                disabled={!isFeedActive}
                className={`p-2 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  telemetry.gimbal.spotlightActive && isFeedActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
                title="Skakel Helder Lug-Soeklig Aan / Af"
              >
                <Sun className="w-4 h-4" />
              </button>

              {/* RTH Button */}
              <button
                onClick={() => droneTelemetryService.triggerRTH()}
                disabled={!isFeedActive}
                className="px-3 py-1.5 rounded-xl bg-amber-700/40 hover:bg-amber-700/60 border border-amber-500/50 text-amber-200 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Beveel Drone om terug te keer na Ops HQ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RTH (Huis Toe)</span>
              </button>

              {/* Direct Pilot Call & WhatsApp */}
              <a
                href="tel:+27823065808"
                className="p-2 rounded-xl bg-emerald-800/40 hover:bg-emerald-700/60 border border-emerald-500/50 text-emerald-300 transition"
                title="Bel Beheerkamer / Loods (082 306 5808)"
              >
                <Phone className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/27823065808?text=Beheerkamer%20kontak%20insake%20DJI%20Matrice%20toevoer."
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition"
                title="WhatsApp Beheerkamer / Loods (082 306 5808)"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              {/* Feed Connection Toggle */}
              <button
                onClick={handleToggleFeedConnection}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                  isFeedActive
                    ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300 hover:bg-rose-900'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                }`}
              >
                {isFeedActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Ontkoppel Toevoer (Toets Aflyn)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Koppel Toevoer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
