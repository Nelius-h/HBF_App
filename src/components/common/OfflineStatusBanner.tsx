import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload, ShieldAlert, AlertTriangle } from 'lucide-react';
import { offlineSyncService } from '../../services/offlineSyncService';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(offlineSyncService.isOnline());
  const [pendingCount, setPendingCount] = useState<number>(offlineSyncService.getPendingCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = offlineSyncService.subscribe((online, pending) => {
      setIsOnline(online);
      setPendingCount(pending);
    });
    return () => unsub();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await offlineSyncService.processQueue();
      if (result.synced > 0) {
        setSyncFeedback(`${result.synced} item(s) suksesvol gesinkroniseer!`);
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } catch (e) {
      console.warn('[OfflineBanner] Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // If online and no pending items and no feedback, do not render banner
  if (isOnline && pendingCount === 0 && !syncFeedback) {
    return null;
  }

  return (
    <div
      className={`w-full py-2 px-4 text-xs flex items-center justify-between gap-3 shadow-md transition-all duration-300 ${
        !isOnline
          ? 'bg-amber-950/95 border-b border-amber-500/40 text-amber-200'
          : pendingCount > 0
          ? 'bg-cyan-950/95 border-b border-cyan-500/40 text-cyan-200'
          : 'bg-emerald-950/95 border-b border-emerald-500/40 text-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {!isOnline ? (
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 shrink-0">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
        ) : pendingCount > 0 ? (
          <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 shrink-0">
            <CloudUpload className="w-4 h-4" />
          </div>
        ) : (
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        <div className="min-w-0">
          <div className="font-bold flex items-center gap-2">
            {!isOnline ? (
              <span>Geen Netwerkdekking (Vanlyn Modus)</span>
            ) : pendingCount > 0 ? (
              <span>Herkoppel - Data gereed vir sinkronisering</span>
            ) : (
              <span>Data Gesinkroniseer</span>
            )}

            {pendingCount > 0 && (
              <span className="px-2 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-mono text-[10px] font-extrabold">
                {pendingCount} in uitboks
              </span>
            )}
          </div>
          <p className="text-[11px] opacity-90 truncate">
            {!isOnline
              ? 'Noodseine & GPS-data word plaaslik bewaar en outomaties uitgestuur sodra sein herstel.'
              : syncFeedback || `${pendingCount} uitstaande aksies word oorgedra na die beheerkamer.`}
          </p>
        </div>
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sinkroniseer...' : 'Sinkroniseer Nou'}</span>
        </button>
      )}
    </div>
  );
};
