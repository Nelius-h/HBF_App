import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Shield,
  WifiOff,
  Zap,
  Lock,
  ExternalLink,
  Monitor,
  Apple,
  Copy,
  Check,
} from 'lucide-react';
import { pwaService, PwaInstallState } from '../../services/pwaService';
import { useBackButton } from '../../hooks/useBackButton';

interface PhoneInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneInstallGuideModal: React.FC<PhoneInstallGuideModalProps> = ({ isOpen, onClose }) => {
  useBackButton(isOpen, onClose, 'phone-install-guide-modal', 25);
  const [pwaState, setPwaState] = useState<PwaInstallState>(() => pwaService.getState());
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'IOS' | 'WINDOWS'>(() => {
    const s = pwaService.getState();
    if (s.isIOS) return 'IOS';
    if (s.isWindows) return 'WINDOWS';
    return 'ANDROID';
  });

  const [installSuccess, setInstallSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const unsub = pwaService.subscribe((newState) => {
      setPwaState(newState);
      if (newState.isInstalled) {
        setInstallSuccess(true);
      }
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      if (pwaState.isIframe) {
        // In iframe environment (AI Studio preview), open in direct window for native PWA installation
        handleOpenDirect();
        return;
      }

      const res = await pwaService.promptInstall();
      if (res === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (res === 'manual_ios') {
        setActiveTab('IOS');
      } else if (res === 'manual_windows') {
        setActiveTab('WINDOWS');
      } else if (res === 'manual_android') {
        setActiveTab('ANDROID');
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = () => {
    const url = pwaService.getDirectAppUrl();
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleOpenDirect = () => {
    const url = pwaService.getDirectAppUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const modalContent = (
    <div
      id="phone-install-modal-overlay"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      style={{ isolation: 'isolate' }}
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="relative p-5 pb-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/70">
          <button
            id="btn-close-install-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition shadow-sm"
            aria-label="Sluit Installasie"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-950">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight">Installeer op u Toestel</h3>
              <p className="text-xs text-slate-300">Android, Apple iPhone (iOS) & Windows</p>
            </div>
          </div>

          {/* Operational Benefits Badges */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sluitskerm SOS</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <WifiOff className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Vanlyn Werking</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>1-Tik Noodknoppie</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {installSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-white">Toep Suksesvol Geïnstalleer!</h4>
              <p className="text-xs text-emerald-200">
                Hartbeesfontein Veiligheid is nou beskikbaar op u tuisskerm / lessenaar.
              </p>
            </div>
          ) : (
            <>
              {/* OS Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  id="tab-install-android"
                  onClick={() => setActiveTab('ANDROID')}
                  className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'ANDROID'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  id="tab-install-ios"
                  onClick={() => setActiveTab('IOS')}
                  className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'IOS'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>iPhone / iPad</span>
                </button>
                <button
                  id="tab-install-windows"
                  onClick={() => setActiveTab('WINDOWS')}
                  className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'WINDOWS'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Windows</span>
                </button>
              </div>

              {/* DIRECT 1-CLICK ACTION BUTTON */}
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/80 space-y-3 shadow-inner">
                <button
                  id="btn-trigger-pwa-install-auto"
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>{isInstalling ? 'Installeer tans...' : 'Installeer Outomaties (1-Tik)'}</span>
                </button>

                {/* If in iframe / preview, provide direct browser launch */}
                {pwaState.isIframe && (
                  <div className="pt-2 border-t border-slate-750 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      id="btn-open-app-direct"
                      onClick={handleOpenDirect}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 border border-cyan-500/30 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Maak oop in Blaaier vir 1-Tik Installasie</span>
                    </button>
                    <button
                      id="btn-copy-app-link"
                      onClick={handleCopyLink}
                      className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition flex-shrink-0"
                      title="Kopieer skakel"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Gekopieer!' : 'Kopieer'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ANDROID INSTRUCTIONS */}
              {activeTab === 'ANDROID' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Android Installasie (Samsung &amp; Chrome):</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      PWA Gereed
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span className="text-slate-300">
                        Tik op die groen <strong>"Installeer Outomaties (1-Tik)"</strong> knoppie hierbo.
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span className="text-slate-300">
                        Of tik op Chrome/Samsung kieslys <strong className="text-white">(3 kolletjies ⋮ regs bo)</strong> en kies <strong className="text-cyan-300">"Installeer toep"</strong> of <strong className="text-cyan-300">"Voeg by tuisskerm"</strong>.
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span className="text-slate-300">
                        Die <strong>Hartbeesfontein Veiligheid</strong> ikoon verskyn nou op u foon se hoofskerm vir onmiddellike noodtoegang.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* APPLE IPHONE / IPAD INSTRUCTIONS */}
              {activeTab === 'IOS' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>iPhone (Apple Safari) Stappe:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Apple vereis dat u die toep via Safari se Deelknoppie by u tuisskerm voeg:
                  </p>

                  <div className="space-y-2.5 pt-1 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Tik op Safari se</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            <Share2 className="w-3.5 h-3.5" /> Deel-knoppie
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Onderaan Safari se skerm (die vierkant met 'n pyltjie boontoe).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Rol af en kies</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-700">
                            <PlusSquare className="w-3.5 h-3.5 text-cyan-400" /> "Voeg by tuisskerm"
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">("Add to Home Screen" in Engels).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <div className="space-y-1">
                        <div className="font-bold text-white">Tik op "Voeg by" (Add)</div>
                        <p className="text-[11px] text-slate-400">Regs bo op die skerm om te voltooi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WINDOWS PC INSTRUCTIONS */}
              {activeTab === 'WINDOWS' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Windows Rekenaar (Microsoft Edge / Chrome):</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      Desktop App
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span className="text-slate-300">
                        Tik op die <strong>"Installeer Outomaties (1-Tik)"</strong> knoppie hierbo of klik op die <strong>Installeer-ikoon (⊕)</strong> regs in u blaaier se adresbalk.
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span className="text-slate-300">
                        Kies <strong>"Installeer"</strong> in die pop-up venster.
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span className="text-slate-300">
                        Die beheerkamer-toep open as 'n selfstandige Windows-toepassing en kan aan u Taakbalk of Begin-kieslys vasgespeld word.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Emergency Note */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Noodgereedheid:</strong> As 'n geïnstalleerde toep kry u direkte een-klik toegang, vinniger kaartlaai, en direkte integrasie met die beheerkamer se noodprotokolle.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">Hartbeesfontein Veiligheid V0.1</span>
          <button
            id="btn-footer-close-install"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Maak Toe
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
