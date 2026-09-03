import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Vibrate,
  Moon,
  ShieldAlert,
  Car,
  Flame,
  Radio,
  FileText,
  AlertTriangle,
  Play,
  Check,
  X,
  Sparkles,
  Smartphone,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  AppNotificationPreferences,
  CategoryNotificationConfig,
  NotificationSoundTone,
} from '../../types';
import {
  notificationService,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useBackButton } from '../../hooks/useBackButton';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReactionForce?: boolean;
}

const TONE_OPTIONS: { id: NotificationSoundTone; label: string; description: string }[] = [
  { id: 'SOS_SIREN', label: '🚨 SOS Sirene (Dringend)', description: 'Hoë frekwensie waarskuwings-sirene' },
  { id: 'TRAFFIC_HORN', label: '🚗 Verkeerstoeter (Resonant)', description: 'Drieklank waarskuwing vir pad en verkeer' },
  { id: 'FIRE_WARBLE', label: '🔥 Brand Warble (Fluktuerend)', description: 'Vinnig wisselende veldbrand klaxon' },
  { id: 'SECURITY_BEEP', label: '🛡️ Sekuriteits-Piep (Taktiek)', description: 'Skerp dubbele radio-waarskuwing' },
  { id: 'BOLO_RADAR', label: '📻 BOLO Radar (Ping)', description: 'Hoë radar sweep klank vir verdagtes' },
  { id: 'TACTICAL_DOUBLE_BEEP', label: '⚡ Reaksie-Uitstuur (Taktiek)', description: 'Taktiese radio-opdrag bevestiging' },
  { id: 'CHIME_GENTLE', label: '🔔 Sagte Kennisgewing (Inligting)', description: 'Rustige drieklank vir sitreps' },
];

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  isReactionForce = false,
}) => {
  const { currentUser, updateCurrentUser } = useAuth();
  useBackButton(isOpen, onClose, 'notification-settings-modal', 25);
  const [prefs, setPrefs] = useState<AppNotificationPreferences>(() =>
    notificationService.getPreferences(currentUser?.uid)
  );
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>(
    notificationService.getPushPermissionStatus()
  );
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'GENERAL' | 'QUIET_HOURS'>('CATEGORIES');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = notificationService.getPreferences(currentUser?.uid);
      setPrefs(current);
      setPushStatus(notificationService.getPushPermissionStatus());
    }
  }, [isOpen, currentUser?.uid]);

  if (!isOpen) return null;

  const handleRequestPushPermission = async () => {
    const granted = await notificationService.requestPushPermission();
    setPushStatus(granted ? 'granted' : 'denied');
    if (granted) {
      setPrefs((prev) => ({ ...prev, masterPushEnabled: true }));
    }
  };

  const handleSave = () => {
    notificationService.savePreferences(prefs, currentUser?.uid);
    if (currentUser) {
      updateCurrentUser({
        notificationPreferences: prefs,
      });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetDefaults = () => {
    setPrefs(DEFAULT_NOTIFICATION_PREFERENCES);
  };

  const updateCategory = (
    key: keyof Pick<
      AppNotificationPreferences,
      'sosPanic' | 'trafficAlerts' | 'fireAlerts' | 'securityAlerts' | 'boloAlerts' | 'sitrepUpdates'
    >,
    updates: Partial<CategoryNotificationConfig>
  ) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  };

  const renderCategoryCard = (
    key: keyof Pick<
      AppNotificationPreferences,
      'sosPanic' | 'trafficAlerts' | 'fireAlerts' | 'securityAlerts' | 'boloAlerts' | 'sitrepUpdates'
    >,
    title: string,
    description: string,
    icon: React.ReactNode,
    colorClass: string,
    isCritical = false
  ) => {
    const cat = prefs[key];

    return (
      <div
        className={`bg-slate-900 border rounded-2xl p-4 space-y-3.5 transition shadow-sm ${
          cat.enabled ? 'border-slate-800' : 'border-slate-850 opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass} text-white shadow-sm`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{title}</h4>
                {isCritical && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/40">
                    KRITIEK
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{description}</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cat.enabled}
              onChange={(e) => updateCategory(key, { enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {cat.enabled && (
          <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
            {/* Tone Selector & Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Klank / Waarskuwingstoon:
                </label>
                <select
                  value={cat.soundTone}
                  onChange={(e) =>
                    updateCategory(key, { soundTone: e.target.value as NotificationSoundTone })
                  }
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-2 text-xs outline-none focus:border-emerald-500"
                >
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => notificationService.testTone(cat.soundTone, cat.volume)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 active:scale-95 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 rounded-xl py-2 px-3 font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  <span>Toets Klank</span>
                </button>
              </div>
            </div>

            {/* Volume Slider & Sound Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-slate-850 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                  {cat.soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Klank Aanskakel</span>
                </span>
                <input
                  type="checkbox"
                  checked={cat.soundEnabled}
                  onChange={(e) => updateCategory(key, { soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono w-10">
                  {Math.round(cat.volume * 100)}%
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={cat.volume}
                  disabled={!cat.soundEnabled}
                  onChange={(e) => updateCategory(key, { volume: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg disabled:opacity-40"
                />
              </div>
            </div>

            {/* Toggles for Banner Push and Vibrate */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition">
                <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Stootboodskap</span>
                </span>
                <input
                  type="checkbox"
                  checked={cat.pushBannerEnabled}
                  onChange={(e) => updateCategory(key, { pushBannerEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition">
                <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                  <Vibrate className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vibreer</span>
                </span>
                <input
                  type="checkbox"
                  checked={cat.vibrationEnabled}
                  onChange={(e) => updateCategory(key, { vibrationEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Kennisgewings & Waarskuwings</span>
                {isReactionForce && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    REAKSIE
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Pasmaak klankeffekte, stootkennisgewings en stil-ure vir alle waarskuwingstipes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Toestel Stootkennisgewings:</span>
            {pushStatus === 'granted' ? (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                ✓ Toegestaan
              </span>
            ) : pushStatus === 'denied' ? (
              <span className="bg-red-950 text-red-300 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                ✕ Geblokkeer in blaaier
              </span>
            ) : (
              <span className="bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                Nog nie geaktiveer nie
              </span>
            )}
          </div>

          {pushStatus !== 'granted' && pushStatus !== 'unsupported' && (
            <button
              type="button"
              onClick={handleRequestPushPermission}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition"
            >
              Aktiveer Stootkennisgewings
            </button>
          )}
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 bg-slate-900 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('CATEGORIES')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'CATEGORIES'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Waarskuwingskategorieë
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('QUIET_HOURS')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'QUIET_HOURS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Stil-ure (Quiet Hours)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'GENERAL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hoofinstellings
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'CATEGORIES' && (
            <div className="space-y-3.5">
              {/* 1. SOS Emergency */}
              {renderCategoryCard(
                'sosPanic',
                'Noodknoppie & SOS Noodseine',
                'Dringende lewensgevaar en persoonlike paniek-alarms vanaf lede en die beheerkamer',
                <AlertTriangle className="w-5 h-5 text-white" />,
                'bg-red-600',
                true
              )}

              {/* 2. Traffic Alerts */}
              {renderCategoryCard(
                'trafficAlerts',
                'Verkeer & Padblokkades',
                'Ongelukke, geslote paaie, botsings, verkeersophoping en padinsidente op die R503 en plaaspaaie',
                <Car className="w-5 h-5 text-slate-950" />,
                'bg-amber-500'
              )}

              {/* 3. Fire Alerts */}
              {renderCategoryCard(
                'fireAlerts',
                'Veldbrande & Brandgevaar',
                'Rookwaarnemings, brandweer-versoeke en veldbrand-koördinasie in die distrik',
                <Flame className="w-5 h-5 text-white" />,
                'bg-rose-600'
              )}

              {/* 4. Security Alerts */}
              {renderCategoryCard(
                'securityAlerts',
                'Plaasveiligheid & Misdaad',
                'Verdagte voertuie, veediefstal, inbrake en sekuriteitswaarskuwings',
                <ShieldAlert className="w-5 h-5 text-white" />,
                'bg-blue-600'
              )}

              {/* 5. BOLO Alerts */}
              {renderCategoryCard(
                'boloAlerts',
                'BOLO & Gesoekte Voertuie',
                'Wees Op Die Uitkyk (BOLO) kennisgewings vir gesoekte verdagtes en nommerplate',
                <Radio className="w-5 h-5 text-white" />,
                'bg-purple-600'
              )}

              {/* 6. SITREP Updates */}
              {renderCategoryCard(
                'sitrepUpdates',
                'SITREPS & Beheerkamer-verslae',
                'Situasieverslae en opvolgboodskappe vanaf die Beheerkamer',
                <FileText className="w-5 h-5 text-white" />,
                'bg-emerald-600'
              )}

              {/* Reaction Force Special Tone */}
              {isReactionForce && (
                <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Reaksie-eenheid Uitstuur-Opdrag Toon
                        </h4>
                        <p className="text-xs text-slate-400">
                          Spesifieke klank wanneer u eenheid direk aan 'n noodsein toegewys word
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs.reactionForceDispatchSound}
                        onChange={(e) =>
                          setPrefs((prev) => ({
                            ...prev,
                            reactionForceDispatchSound: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {prefs.reactionForceDispatchSound && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                          Uitstuur-toon:
                        </label>
                        <select
                          value={prefs.reactionForceDispatchTone}
                          onChange={(e) =>
                            setPrefs((prev) => ({
                              ...prev,
                              reactionForceDispatchTone: e.target.value as NotificationSoundTone,
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-2 text-xs outline-none"
                        >
                          {TONE_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            notificationService.testTone(prefs.reactionForceDispatchTone, 0.8)
                          }
                          className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 rounded-xl py-2 px-3 font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>Toets Uitstuur-Klank</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'QUIET_HOURS' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Stil-ure Skedule</h4>
                      <p className="text-slate-400 text-xs">
                        Demp nie-kritiese klanke en kennisgewings gedurende die nag
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.quietHoursEnabled}
                      onChange={(e) =>
                        setPrefs((prev) => ({ ...prev, quietHoursEnabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {prefs.quietHoursEnabled && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                          Begin Stil-ure:
                        </label>
                        <input
                          type="time"
                          value={prefs.quietHoursStart}
                          onChange={(e) =>
                            setPrefs((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                          Eindig Stil-ure:
                        </label>
                        <input
                          type="time"
                          value={prefs.quietHoursEnd}
                          onChange={(e) =>
                            setPrefs((prev) => ({ ...prev, quietHoursEnd: e.target.value }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs.overrideQuietHoursForSos}
                        onChange={(e) =>
                          setPrefs((prev) => ({
                            ...prev,
                            overrideQuietHoursForSos: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">
                          Laat Noodseine (SOS) altyd deurbreek
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          SOS Paniek-alarms sal steeds hard klink selfs wanneer stil-ure aktief is
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'GENERAL' && (
            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-white text-sm">Hoof-beheerskakelaars</h4>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block">Meester Klankeffekte</span>
                      <span className="text-[11px] text-slate-400">
                        Skakel alle klankchimes en alarms in of uit
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.masterSoundEnabled}
                    onChange={(e) =>
                      setPrefs((prev) => ({ ...prev, masterSoundEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block">Meester Stootkennisgewings</span>
                      <span className="text-[11px] text-slate-400">
                        Vertoon popups bo-oor ander programme
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.masterPushEnabled}
                    onChange={(e) =>
                      setPrefs((prev) => ({ ...prev, masterPushEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Vibrate className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block">Meester Vibrasie</span>
                      <span className="text-[11px] text-slate-400">
                        Vibreer foon op mobiele toestelle
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.masterVibrationEnabled}
                    onChange={(e) =>
                      setPrefs((prev) => ({ ...prev, masterVibrationEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Herstel na Verstek</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Kanselleer
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Gestoor!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Stoor Verstellings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
