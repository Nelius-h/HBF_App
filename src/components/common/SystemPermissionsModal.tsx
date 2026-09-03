import React, { useState, useEffect } from 'react';
import {
  Shield,
  MapPin,
  Bell,
  Mic,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  Volume2,
  Radio,
  Lock,
} from 'lucide-react';
import {
  systemPermissionsService,
  SystemPermissionStatus,
  PermissionType,
  PERMISSION_METADATA,
} from '../../services/systemPermissionsService';
import { useI18n } from '../../i18n/I18nContext';
import { useBackButton } from '../../hooks/useBackButton';
import { AppLogo } from './AppLogo';

interface SystemPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceRequired?: boolean;
}

export const SystemPermissionsModal: React.FC<SystemPermissionsModalProps> = ({
  isOpen,
  onClose,
  forceRequired = false,
}) => {
  const { language } = useI18n();
  const isAf = language === 'af';

  useBackButton(isOpen && !forceRequired, onClose, 'system-permissions-modal', 30);

  const [status, setStatus] = useState<SystemPermissionStatus>(() => systemPermissionsService.getStatus());
  const [isRequestingAll, setIsRequestingAll] = useState(false);
  const [currentPrompting, setCurrentPrompting] = useState<PermissionType | null>(null);
  const [requestingSingle, setRequestingSingle] = useState<PermissionType | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Check statuses on open
    systemPermissionsService.checkAllStatuses();

    const unsubscribe = systemPermissionsService.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const grantedCount = systemPermissionsService.getGrantedCount();
  const allCriticalGranted =
    status.geolocation === 'granted' &&
    status.notifications === 'granted' &&
    status.microphone === 'granted';

  const handleRequestAll = async () => {
    setIsRequestingAll(true);
    try {
      await systemPermissionsService.requestAllPermissionsSequentially((current) => {
        setCurrentPrompting(current);
      });
    } finally {
      setIsRequestingAll(false);
      setCurrentPrompting(null);
    }
  };

  const handleRequestSingle = async (type: PermissionType) => {
    setRequestingSingle(type);
    try {
      await systemPermissionsService.requestPermission(type);
    } finally {
      setRequestingSingle(null);
    }
  };

  const handleComplete = () => {
    systemPermissionsService.markPrompted();
    onClose();
  };

  const permissionKeys: PermissionType[] = ['geolocation', 'notifications', 'microphone', 'camera'];

  const getStatusBadge = (permState: string) => {
    switch (permState) {
      case 'granted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[11px] font-black uppercase shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAf ? 'TOEGELAAT' : 'GRANTED'}</span>
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/50 text-[11px] font-black uppercase shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isAf ? 'GEWEIER' : 'BLOCKED'}</span>
          </span>
        );
      case 'unsupported':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-bold uppercase">
            <span>{isAf ? 'NIE ONDERSTEUN' : 'UNSUPPORTED'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/50 text-[11px] font-black uppercase animate-pulse shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAf ? 'WAGTEND' : 'REQUIRED'}</span>
          </span>
        );
    }
  };

  const renderIcon = (name: string, isGranted: boolean) => {
    const cls = `w-6 h-6 ${isGranted ? 'text-emerald-400' : 'text-amber-400'}`;
    switch (name) {
      case 'MapPin':
        return <MapPin className={cls} />;
      case 'Bell':
        return <Bell className={cls} />;
      case 'Mic':
        return <Mic className={cls} />;
      case 'Camera':
        return <Camera className={cls} />;
      default:
        return <Shield className={cls} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <AppLogo size="md" className="p-1 rounded-2xl bg-slate-950/60 border border-emerald-500/40 shadow-lg flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{isAf ? 'Vereiste Stelseltoestemmings' : 'Required System Permissions'}</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                  {grantedCount}/4 {isAf ? 'Aktief' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isAf
                  ? 'Vir u veiligheid en kits-reaksie benodig Hartbeesfontein Veiligheid toegang tot u toestelfunksies.'
                  : 'For real-time emergency dispatch and safety tracking, Hartbeesfontein Veiligheid requires device access.'}
              </p>
            </div>
          </div>

          {!forceRequired && (
            <button
              onClick={handleComplete}
              className="p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition flex-shrink-0"
              title={isAf ? 'Maak toe' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-slate-950/50">
          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAf ? (
                <>
                  <strong className="text-white">Privaatheid en Sekuriteit:</strong> Toestemmings word uitsluitlik gebruik tydens aktiewe noodgevalle, sekuriteitsversendings en wanneer u die paniekknoppie druk. U inligting bly ten volle geënkripteer.
                </>
              ) : (
                <>
                  <strong className="text-white">Privacy and Security:</strong> Permissions are strictly used during active emergencies, tactical dispatches, and SOS panic triggers. Your data is encrypted and secure.
                </>
              )}
            </p>
          </div>

          {/* 4 Permission Cards */}
          <div className="space-y-3">
            {permissionKeys.map((key) => {
              const meta = PERMISSION_METADATA[key];
              const permState = status[key];
              const isGranted = permState === 'granted';
              const isDenied = permState === 'denied';
              const isPrompting = currentPrompting === key || requestingSingle === key;

              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isGranted
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : isDenied
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-md'
                      : 'bg-slate-900/90 border-slate-750 hover:border-slate-600 shadow-md'
                  } ${isPrompting ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isGranted
                            ? 'bg-emerald-900/40 border border-emerald-500/40 text-emerald-400'
                            : isDenied
                            ? 'bg-rose-900/40 border border-rose-500/40 text-rose-400'
                            : 'bg-amber-950/40 border border-amber-500/40 text-amber-400'
                        }`}
                      >
                        {renderIcon(meta.iconName, isGranted)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white">
                            {isAf ? meta.titleAf : meta.titleEn}
                          </h4>
                          {meta.required && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                              {isAf ? 'NOODSAAKLIK' : 'MANDATORY'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {isAf ? meta.descAf : meta.descEn}
                        </p>
                        <p className="text-[11px] text-emerald-400/90 mt-1 font-semibold flex items-center gap-1">
                          <span>💡</span> {isAf ? meta.impactAf : meta.impactEn}
                        </p>
                      </div>
                    </div>

                    {/* Action / Status Area */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      {getStatusBadge(permState)}

                      {!isGranted && permState !== 'unsupported' && (
                        <button
                          onClick={() => handleRequestSingle(key)}
                          disabled={isRequestingAll || isPrompting}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer ${
                            isDenied
                              ? 'bg-rose-700 hover:bg-rose-600 text-white'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                          }`}
                        >
                          {isPrompting ? (
                            <>
                              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              <span>{isAf ? 'Vra...' : 'Prompting...'}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{isDenied ? (isAf ? 'Probeer Weer' : 'Retry') : (isAf ? 'Toelaat' : 'Allow')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Troubleshoot hint if denied */}
                  {isDenied && (
                    <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs text-rose-300 flex items-start gap-2 bg-rose-950/40 p-2.5 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold">
                          {isAf ? 'Toegang is voorheen geweier in u blaaier.' : 'Permission was previously blocked.'}
                        </span>{' '}
                        {isAf
                          ? 'Klik op die slotjie-ikoon (🔒) langs die webadres boaan u skerm, kies Toestemmings en stel dit op "Toelaat".'
                          : 'Click the lock icon (🔒) in your browser address bar, choose Site Settings, and toggle this permission to "Allow".'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Any Troubleshoot accordion */}
          {(status.geolocation === 'denied' || status.notifications === 'denied' || status.microphone === 'denied') && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-2">
              <button
                onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                className="w-full flex items-center justify-between text-amber-300 font-bold text-left"
              >
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{isAf ? 'Hoe om geblokkeerde toestemmings te ontsluit' : 'How to unblock permissions in your browser'}</span>
                </span>
                <span className="text-xs underline">{showTroubleshoot ? (isAf ? 'Steek weg' : 'Hide') : (isAf ? 'Wys gids' : 'Show guide')}</span>
              </button>

              {showTroubleshoot && (
                <div className="text-slate-300 space-y-1.5 pt-2 border-t border-amber-500/20 font-sans">
                  <p>1. <strong>Chrome / Edge / Brave:</strong> Klik op die slot- of instellings-ikoon (🔒 of ⚙️) links van die webadres.</p>
                  <p>2. Stel <strong>Ligging (Location)</strong>, <strong>Kennisgewings (Notifications)</strong>, en <strong>Mikrofoon (Microphone)</strong> op <em>"Toelaat / Allow"</em>.</p>
                  <p>3. <strong>Safari / iOS:</strong> Gaan na Instellings &gt; Safari &gt; Ligging / Mikrofoon &gt; Stel op "Vra" of "Toelaat".</p>
                  <p>4. Herlaai die bladsy daarna om die nuwe instellings toe te pas.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            {allCriticalGranted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isAf ? 'Alle noodsaaklike stelseltoestemmings is aktief!' : 'All mandatory system permissions are granted!'}</span>
              </span>
            ) : (
              <span>{isAf ? 'Klik hieronder om alle toestemmings met een aksie te aktiveer.' : 'Click below to grant all permissions in sequence.'}</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!allCriticalGranted ? (
              <button
                onClick={handleRequestAll}
                disabled={isRequestingAll}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                {isRequestingAll ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>
                      {isAf
                        ? `Vra ${currentPrompting ? PERMISSION_METADATA[currentPrompting]?.titleAf : 'Toestemmings'}...`
                        : `Prompting ${currentPrompting || 'Permissions'}...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isAf ? 'Verleen Alle Toestemmings' : 'Grant All Permissions'}</span>
                  </>
                )}
              </button>
            ) : null}

            <button
              onClick={handleComplete}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                allCriticalGranted
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{isAf ? 'Gaan Voort na Toepassing' : 'Continue to Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
