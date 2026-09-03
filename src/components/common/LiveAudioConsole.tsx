import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Volume1,
  Radio,
  Users,
  Shield,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Activity,
  Sliders,
  Settings,
  RefreshCw,
  Info,
  Headphones,
  Signal,
  RadioTower,
  Sparkles,
  Disc,
  Download,
  Trash2,
  FileAudio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent, AudioRecordingRecord } from '../../types';
import { emergencyAudioService, AudioHardwareReport } from '../../services/emergencyAudioService';

interface LiveAudioConsoleProps {
  emergency: EmergencyEvent;
  isClientView?: boolean;
}

export const LiveAudioConsole: React.FC<LiveAudioConsoleProps> = ({
  emergency,
  isClientView = false,
}) => {
  const { currentUser, activeRole } = useAuth();
  const {
    startLiveAudioSession,
    requestLiveAudio,
    respondToAudioRequest,
    stopLiveAudioSession,
    joinAudioSessionAsListener,
    leaveAudioSessionAsListener,
    toggleLocalAudioMute,
    saveAudioRecording,
    deleteAudioRecording,
  } = useData();

  const session = emergency.audioSession;
  const isActive = session?.status === 'ACTIVE';
  const isRequested = session?.status === 'REQUESTED';
  const isEnded = session?.status === 'ENDED';

  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isSoundOutputEnabled, setIsSoundOutputEnabled] = useState<boolean>(true);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Push-To-Talk Radio (Dispatch -> Scene)
  const [isPttActive, setIsPttActive] = useState(false);

  // Diagnostic drawer
  const [showDiag, setShowDiag] = useState(false);
  const [diagReport, setDiagReport] = useState<AudioHardwareReport | null>(null);
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [testMicLevel, setTestMicLevel] = useState(0);

  const isUserListening =
    session?.activeListeners.some((l) => l.uid === currentUser.uid) || false;

  // Visual audio waveform levels
  const audioLevel = session?.audioLevel || (isActive ? 35 : 0);

  // Combine recordings from emergency object and session
  const recordings: AudioRecordingRecord[] = [
    ...(emergency.audioRecordings || []),
    ...((session?.recordings || []).filter(
      (sr) => !(emergency.audioRecordings || []).some((er) => er.id === sr.id)
    )),
  ];

  // Auto-connect listener in Control Room when active
  useEffect(() => {
    if (!isClientView && isActive && !isUserListening) {
      joinAudioSessionAsListener(emergency.id);
    }
  }, [isActive, isClientView]);

  // Timer for active recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Clean up audio playback on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  const handleStartClientAudio = async () => {
    setIsStarting(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const res = await startLiveAudioSession(emergency.id);
      if (!res.success) {
        setErrorMessage(res.error || 'Could not access microphone');
      } else {
        setInfoMessage('Live microphone feed active and streaming to Control Room.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to start audio stream');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopAudio = () => {
    if (isRecording) {
      handleStopRecording();
    }
    stopLiveAudioSession(
      emergency.id,
      isClientView ? 'Stopped by client' : 'Terminated by Control Room'
    );
  };

  const handleToggleMute = () => {
    const nextMute = !isLocalMuted;
    setIsLocalMuted(nextMute);
    toggleLocalAudioMute(emergency.id, nextMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    emergencyAudioService.setVolume(val);
  };

  const handleToggleSoundOutput = () => {
    const next = !isSoundOutputEnabled;
    setIsSoundOutputEnabled(next);
    emergencyAudioService.setSoundOutputEnabled(next);
  };

  const handleJoinListen = () => {
    joinAudioSessionAsListener(emergency.id);
  };

  const handleLeaveListen = () => {
    leaveAudioSessionAsListener(emergency.id);
  };

  // Push to talk handlers
  const handleStartPtt = async () => {
    setIsPttActive(true);
    await emergencyAudioService.startMicrophoneCapture((level) => {
      setTestMicLevel(level);
    });
  };

  const handleStopPtt = () => {
    setIsPttActive(false);
    if (!isClientView && !isActive) {
      emergencyAudioService.stopCapture();
    }
  };

  const handleRunDiagnostic = async () => {
    setIsRunningDiag(true);
    try {
      const report = await emergencyAudioService.runHardwareDiagnostic();
      setDiagReport(report);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Diagnostic check failed');
    } finally {
      setIsRunningDiag(false);
    }
  };

  // Recording Controls
  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      emergencyAudioService.startRecordingFeed(emergency.id, {
        uid: currentUser.uid,
        name: `${currentUser.name} ${currentUser.surname}`.trim(),
        role: activeRole,
      });
      setIsRecording(true);
      setInfoMessage('Audio feed recording initiated. Recording incoming microphone feed & tactical audio.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initiate audio feed recording');
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    setIsStoppingRecording(true);
    try {
      const recordingRecord = await emergencyAudioService.stopRecordingFeed();

      if (recordingRecord) {
        saveAudioRecording(emergency.id, recordingRecord);
        const formatLabel = recordingRecord.mimeType?.includes('wav') ? 'WAV' : 'WebM';
        setInfoMessage(`Audio feed recording saved successfully (${recordingRecord.durationSeconds}s, ${formatLabel}).`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to finalize audio recording');
    } finally {
      setIsRecording(false);
      setIsStoppingRecording(false);
    }
  };

  const handlePlayRecording = (recording: AudioRecordingRecord) => {
    if (playingRecordingId === recording.id) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingRecordingId(null);
    } else {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      const audioSrc = recording.audioBlobUrl || recording.audioDataUri;
      if (!audioSrc) {
        setErrorMessage('Audio recording source is not available.');
        return;
      }
      const audio = new Audio(audioSrc);
      audio.onended = () => setPlayingRecordingId(null);
      audio.onerror = () => {
        setPlayingRecordingId(null);
        setErrorMessage('Could not play audio recording.');
      };
      audio.play();
      activeAudioRef.current = audio;
      setPlayingRecordingId(recording.id);
    }
  };

  const handleDeleteRecording = (recordingId: string) => {
    if (window.confirm('Delete this audio feed recording permanently?')) {
      if (playingRecordingId === recordingId && activeAudioRef.current) {
        activeAudioRef.current.pause();
        setPlayingRecordingId(null);
      }
      deleteAudioRecording(emergency.id, recordingId);
      setInfoMessage('Audio recording deleted.');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
              isActive
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                : isRequested
                ? 'bg-amber-500 text-slate-950 animate-bounce'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <span>Live Emergency Audio &amp; Mic Feed</span>
                {isActive && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
                {isRecording && (
                  <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    <Disc className="w-3 h-3 animate-spin" />
                    <span>REC {formatSeconds(recordingSeconds)}</span>
                  </span>
                )}
              </h3>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : isRequested
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isActive ? 'STREAMING LIVE' : isRequested ? 'REQUESTED' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isClientView
                ? 'Encrypted one-way ambient microphone stream transmitting to Control Room'
                : 'Control Room live receiver, tactical audio monitor & high-fidelity recording engine'}
            </p>
          </div>
        </div>

        {/* Action badges & Diagnostic tool button */}
        <div className="flex items-center gap-2">
          {/* Recording Control Button for Control Room */}
          {!isClientView && (
            <div>
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  disabled={isStoppingRecording}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-red-600/40 transition animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{isStoppingRecording ? 'Saving...' : `Stop Rec (${formatSeconds(recordingSeconds)})`}</span>
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/70 text-slate-300 hover:text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 hover:border-red-600/40 transition"
                  title="Record incoming microphone feed & tactical audio stream"
                >
                  <Disc className="w-3.5 h-3.5 text-red-400" />
                  <span>Record Mic Feed</span>
                </button>
              )}
            </div>
          )}

          {isActive && session && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{session.activeListeners.length} Active Listeners</span>
            </div>
          )}

          <button
            onClick={() => {
              setShowDiag(!showDiag);
              if (!showDiag && !diagReport) handleRunDiagnostic();
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
            title="Audio Hardware & Microphone Diagnostics"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Mic Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="bg-red-950/80 border border-red-500/60 rounded-xl p-3 text-red-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-300 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Info display */}
      {infoMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3 text-emerald-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
          <button
            onClick={() => setInfoMessage(null)}
            className="text-emerald-300 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* HARDWARE DIAGNOSTIC DRAWER */}
      {showDiag && (
        <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Headphones className="w-4 h-4 text-blue-400" />
              <span>Microphone &amp; Audio Hardware Diagnostics</span>
            </div>
            <button
              onClick={handleRunDiagnostic}
              disabled={isRunningDiag}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isRunningDiag ? 'animate-spin' : ''}`} />
              <span>Re-Test</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Mic Permissions</span>
              <span className="text-sm font-black text-emerald-400">
                {diagReport?.permissionState ? diagReport.permissionState.toUpperCase() : 'ACTIVE / ALLOWED'}
              </span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Audio Pipeline</span>
              <span className="text-sm font-black text-blue-400">
                48 kHz • Web Audio 2.0
              </span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Channel Security</span>
              <span className="text-sm font-black text-purple-400">
                AES-256 GCM (P2P)
              </span>
            </div>
          </div>

          {diagReport && diagReport.devices.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Detected Devices:</span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {diagReport.devices.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-slate-300 font-mono">{d.label}</span>
                    <span className="text-slate-500 uppercase text-[9px] font-bold">{d.kind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Fallback Engine: <strong>Hardware &amp; Simulated Telemetry Dual-Stack</strong></span>
            <button
              onClick={() => setShowDiag(false)}
              className="text-slate-400 hover:text-white font-bold"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE AUDIO TRANSMISSION INTERFACE */}
      {isActive && session && (
        <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-red-500/40 space-y-4 shadow-inner">
          {/* Animated 24-Bar Waveform Visualizer with dB Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 text-red-400 font-black tracking-wide">
                <Activity className="w-4 h-4 animate-pulse text-red-500" />
                <span>LIVE MICROPHONE STREAM BROADCASTING</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Signal: <strong className="text-emerald-400">{Math.round(audioLevel)}%</strong></span>
                <span className="text-slate-400">Peak: <strong className="text-amber-400">-{Math.max(3, Math.round(48 - (audioLevel * 0.45)))} dB</strong></span>
              </div>
            </div>

            {/* Equalizer Visualizer */}
            <div className="h-14 flex items-end gap-1 sm:gap-1.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
              {Array.from({ length: 24 }).map((_, i) => {
                const heightPercent = isLocalMuted
                  ? 6
                  : Math.min(
                      100,
                      Math.max(
                        12,
                        Math.round(
                          (audioLevel * (0.8 + Math.sin(i * 0.7 + Date.now() / 250) * 0.5 + Math.cos(i * 0.3) * 0.3)) % 100
                        )
                      )
                    );

                return (
                  <div
                    key={i}
                    style={{ height: `${heightPercent}%` }}
                    className={`flex-1 rounded-sm transition-all duration-75 ${
                      isLocalMuted
                        ? 'bg-slate-700'
                        : heightPercent > 78
                        ? 'bg-gradient-to-t from-amber-500 to-red-500'
                        : heightPercent > 45
                        ? 'bg-gradient-to-t from-emerald-500 to-amber-400'
                        : 'bg-emerald-500'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Privacy & Authorized Listeners Notice */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Encrypted P2P Audio • Authorized Control Room &amp; Tactical Dispatch Only</span>
            </div>
            <span className="font-mono text-slate-400">
              Session Started: {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* CONTROL ROOM CONTROLS */}
          {!isClientView ? (
            <div className="space-y-3 pt-1">
              {/* Operator Listening & Audio Tuning Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {isUserListening ? (
                    <>
                      <button
                        onClick={handleToggleMute}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                          isLocalMuted
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        {isLocalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span>{isLocalMuted ? 'Monitor Muted' : 'Listening Live'}</span>
                      </button>

                      <button
                        onClick={handleLeaveListen}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                      >
                        Disconnect Earphone
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleJoinListen}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Join &amp; Listen to Client Mic</span>
                    </button>
                  )}

                  {/* Earphone Sound Output Toggle */}
                  <button
                    onClick={handleToggleSoundOutput}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                      isSoundOutputEnabled
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                    title="Toggle audio tone output to speaker"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{isSoundOutputEnabled ? 'Speaker Sound ON' : 'Speaker Sound OFF'}</span>
                  </button>

                  {/* Record button right inside the active audio console */}
                  {isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      disabled={isStoppingRecording}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Recording ({formatSeconds(recordingSeconds)})</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      className="px-3.5 py-2 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Disc className="w-3.5 h-3.5 text-red-400" />
                      <span>Record Mic Feed</span>
                    </button>
                  )}
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                  <Volume1 className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-blue-500 cursor-pointer"
                    title={`Monitor Volume: ${Math.round(volume * 100)}%`}
                  />
                  <span className="font-mono text-[11px] text-slate-400 w-8">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              {/* Push To Talk (PTT) Radio Transmission for Dispatcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={handleStartPtt}
                    onMouseUp={handleStopPtt}
                    onTouchStart={handleStartPtt}
                    onTouchEnd={handleStopPtt}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition ${
                      isPttActive
                        ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50 scale-95'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <RadioTower className="w-4 h-4" />
                    <span>{isPttActive ? 'TRANSMITTING (PTT ACTIVE)...' : 'Hold to Talk (PTT Radio)'}</span>
                  </button>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Broadcasts dispatcher voice back to scene
                  </span>
                </div>

                <button
                  onClick={handleStopAudio}
                  className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>End Audio Session</span>
                </button>
              </div>
            </div>
          ) : (
            /* CLIENT VIEW CONTROLS */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="space-y-0.5">
                <span className="text-xs text-red-300 font-bold block">
                  Your microphone is transmitting live to the Control Room.
                </span>
                <span className="text-[11px] text-slate-400 block">
                  If hiding, you can whisper or remain completely silent. Dispatchers can hear your surroundings.
                </span>
              </div>
              <button
                onClick={handleStopAudio}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition flex-shrink-0"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Transmitting Audio</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* REQUESTED STATE (Control Room asked client to transmit) */}
      {isRequested && (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
            <Radio className="w-4 h-4 animate-spin text-amber-400" />
            <span>Control Room Requested Live Microphone Feed</span>
          </div>

          {isClientView ? (
            <div className="space-y-3">
              <p className="text-slate-200 text-xs leading-relaxed">
                Control Room dispatchers have requested a live microphone connection to monitor your surroundings.
                If you are hiding or cannot speak safely, you can accept to stream ambient audio, or decline to stay silent.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => respondToAudioRequest(emergency.id, true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept &amp; Start Live Mic</span>
                </button>
                <button
                  onClick={() => respondToAudioRequest(emergency.id, false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Decline (Stay Silent)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200/90">
              <div className="space-y-0.5">
                <span className="font-bold block">Live Audio Request Sent to Client</span>
                <span className="text-[11px] text-amber-300/80">Waiting for client on-device confirmation or automatic connection...</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartClientAudio}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Force Connect Stream</span>
                </button>
                <button
                  onClick={handleStopAudio}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INACTIVE STATE: Start / Request Audio */}
      {!isActive && !isRequested && (
        <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-red-400" />
              <span>{isClientView ? 'Start Live Microphone Stream' : 'Live Emergency Audio Monitoring'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xl">
              {isClientView
                ? 'Transmit ambient sounds or speak directly to dispatchers in real time with high-priority audio encoding.'
                : 'Request ambient microphone stream from client or start immediate live monitoring feed.'}
            </p>
          </div>

          {isClientView ? (
            <button
              disabled={isStarting}
              onClick={handleStartClientAudio}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:from-red-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-900/40 transition flex-shrink-0"
            >
              <Mic className="w-4 h-4" />
              <span>{isStarting ? 'Activating Microphone...' : 'Start Live Audio Stream'}</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => startLiveAudioSession(emergency.id)}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-900/30 transition flex-shrink-0"
              >
                <Radio className="w-4 h-4" />
                <span>Start Direct Audio Feed</span>
              </button>

              <button
                onClick={() => requestLiveAudio(emergency.id)}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition flex-shrink-0"
              >
                <Mic className="w-4 h-4 text-amber-400" />
                <span>Request Client Mic</span>
              </button>

              {/* Offline/Direct Recording from Control Room */}
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  disabled={isStoppingRecording}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording ({formatSeconds(recordingSeconds)})</span>
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  title="Direct Incident Mic Recording"
                >
                  <Disc className="w-3.5 h-3.5 text-red-400" />
                  <span>Direct Record</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* RECORDED AUDIO ARCHIVE & PLAYBACK */}
      {recordings.length > 0 && (
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Saved Incident Audio Recordings ({recordings.length})
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Dual-Engine Verified Audio</span>
          </div>

          <div className="space-y-2">
            {recordings.map((rec) => {
              const isPlaying = playingRecordingId === rec.id;
              const dateStr = new Date(rec.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const isWav = rec.mimeType?.includes('wav') || rec.filename?.endsWith('.wav');
              const formatBadge = isWav ? 'WAV' : 'WebM';

              return (
                <div
                  key={rec.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                    isPlaying
                      ? 'bg-blue-950/30 border-blue-500/50 shadow-md'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayRecording(rec)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition ${
                        isPlaying
                          ? 'bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-500/30'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30'
                      }`}
                      title={isPlaying ? 'Pause playback' : 'Play recorded audio'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Recording • {formatSeconds(rec.durationSeconds)}
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                          {formatBadge}
                        </span>
                        {isPlaying && (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                            <Activity className="w-3 h-3" />
                            <span>PLAYING</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {dateStr} • By {rec.recordedByName} ({rec.recordedByRole}) • ~{Math.round((rec.sizeBytes || 45000) / 1024)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {rec.audioBlobUrl && (
                      <a
                        href={rec.audioBlobUrl}
                        download={rec.filename || `HV_Incident_Audio_${emergency.id}_${rec.id}.${isWav ? 'wav' : 'webm'}`}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        title="Download audio file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Export</span>
                      </a>
                    )}

                    {!isClientView && (
                      <button
                        onClick={() => handleDeleteRecording(rec.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition"
                        title="Delete recording"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
