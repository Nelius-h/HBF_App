import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';
import { pwaService, PwaInstallState } from '../../services/pwaService';
import { PhoneInstallGuideModal } from './PhoneInstallGuideModal';

export const PwaInstallBanner: React.FC = () => {
  const [pwaState, setPwaState] = useState<PwaInstallState>(() => pwaService.getState());
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('hv_pwa_banner_dismissed') === 'true';
  });
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const unsub = pwaService.subscribe((state) => {
      setPwaState(state);
    });
    return () => unsub();
  }, []);

  // If already running standalone (installed as app) or dismissed, do not show
  if (pwaState.isStandalone || isDismissed) {
    return (
      <PhoneInstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    );
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('hv_pwa_banner_dismissed', 'true');
  };

  const handleAction = async () => {
    if (pwaState.isInstallable && !pwaState.isIframe) {
      const outcome = await pwaService.promptInstall();
      if (outcome !== 'accepted') {
        setIsGuideOpen(true);
      }
    } else {
      setIsGuideOpen(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border-b border-cyan-500/30 text-white px-3.5 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white truncate flex items-center gap-1.5">
              <span>Installeer op Foon</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-mono">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Vinniger SOS, sluitskerm GPS-spoor en vanlyn werking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAction}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            {pwaState.isIOS ? <Share2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{pwaState.isIOS ? 'Instruksies' : 'Installeer'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Maak toe"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PhoneInstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};
