import React, { useState } from 'react';
import {
  AlertOctagon,
  Phone,
  Shield,
  HeartPulse,
  Flame,
  X,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Mic,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyType } from '../../types';

interface EmergencyActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyActionModal: React.FC<EmergencyActionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { triggerEmergency, settings } = useData();

  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Acquiring high-accuracy GPS...');

  if (!isOpen) return null;

  const handleActivate = async (type: EmergencyType, externalCallNumber?: string) => {
    try {
      setIsSubmitting(true);
      // 1. FIRST: Create the emergency securely in the backend (Requirement 1 & 2)
      const emergencyId = await triggerEmergency(type, customNotes);

      // 2. THEN: Trigger external communication / dialler if requested
      if (externalCallNumber) {
        window.location.href = `tel:${externalCallNumber.replace(/[^0-9+]/g, '')}`;
      }

      onClose();
    } catch (err) {
      console.error('Failed to trigger emergency:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-red-500/60 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-rose-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-700 flex items-center justify-center font-black shadow-lg">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide uppercase">
                {t.emergency.title}
              </h2>
              <p className="text-[11px] text-red-100 font-medium">
                {currentUser.farmName || 'Hartbeesfontein District'} • {currentUser.sector || 'Sektor 2'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          <p className="text-center text-slate-300 font-medium px-2">
            {t.emergency.subtitle}
          </p>

          {/* THREE VERY LARGE EMERGENCY BUTTONS (Requirement 2) */}
          <div className="space-y-3">
            {/* 1. NOTIFY CONTROL ROOM (Default: SECURITY) */}
            <button
              disabled={isSubmitting}
              onClick={() => handleActivate('SECURITY')}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-[0.98] transition border-2 border-red-400/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <Radio className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-white uppercase block">
                      {t.emergency.notifyControlRoom}
                    </span>
                    <span className="bg-black/30 text-red-200 border border-red-300/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                      <Mic className="w-3 h-3 text-red-300 animate-pulse" />
                      <span>Auto-Mic</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-red-100 block mt-0.5 leading-snug">
                    {t.emergency.notifyControlRoomSub} • Microphone feed starts automatically
                  </span>
                </div>
              </div>
            </button>

            {/* 2. CALL AMBULANCE (Creates: MEDICAL) */}
            <button
              disabled={isSubmitting}
              onClick={() => handleActivate('MEDICAL', settings.ambulanceDirectPhone)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.98] transition border-2 border-emerald-400/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <HeartPulse className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black text-white uppercase block">
                    {t.emergency.callAmbulance}
                  </span>
                  <span className="text-[11px] text-emerald-100 block mt-0.5 leading-snug">
                    {t.emergency.callAmbulanceSub} ({settings.ambulanceDirectPhone})
                  </span>
                </div>
              </div>
            </button>

            {/* 3. CALL POLICE (Creates: POLICE_ASSISTANCE) */}
            <button
              disabled={isSubmitting}
              onClick={() => handleActivate('POLICE_ASSISTANCE', settings.policeDirectPhone)}
              className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition border-2 border-blue-400/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black text-white uppercase block">
                    {t.emergency.callPolice}
                  </span>
                  <span className="text-[11px] text-blue-100 block mt-0.5 leading-snug">
                    {t.emergency.callPoliceSub} ({settings.policeDirectPhone})
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Secondary / Fire Option */}
          <div className="pt-1">
            <button
              disabled={isSubmitting}
              onClick={() => handleActivate('FIRE')}
              className="w-full bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/40 rounded-xl p-3 flex items-center justify-center gap-2 font-bold transition"
            >
              <Flame className="w-5 h-5 text-amber-400" />
              <span>{t.emergency.fireEmergency}</span>
            </button>
          </div>

          {/* Optional Quick Brief Note */}
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750 space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-300">
              Optional Emergency Note (Voice / Text):
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. 3 armed individuals near dairy / Need ER24 for asthma attack..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Sensitive Snapshot Notice */}
          <div className="flex items-start gap-2 bg-slate-800/50 p-2.5 rounded-xl text-[10px] text-slate-400 border border-slate-750">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Your gate code, coordinates, dangerous animals warning, and medical aid info will be securely transmitted directly to verified Control Room operators.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-850 p-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            {t.common.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
