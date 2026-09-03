import React, { useState } from 'react';
import { Shield, KeyRound, Lock, Eye, EyeOff, Check, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBackButton } from '../../hooks/useBackButton';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, changePin } = useAuth();
  useBackButton(isOpen, onClose, 'change-pin-modal', 25);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPin.length < 4) {
      setError('Nuwe PIN moet ten minste 4 syfers wees.');
      return;
    }
    if (!/^\d+$/.test(newPin)) {
      setError('PIN mag slegs syfers (0-9) bevat.');
      return;
    }
    if (newPin === '1234') {
      setError('U nuwe PIN mag nie die verstekkode 1234 wees nie.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Die twee nuwe PIN kodes stem nie ooreen nie.');
      return;
    }

    setLoading(true);
    const res = await changePin(currentUser.uid, currentPin, newPin);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Kon nie PIN verander nie.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Verander Sekuriteits-PIN</h3>
            <p className="text-xs text-slate-400">
              {currentUser.name} {currentUser.surname} &bull; {currentUser.farmName || 'Plaaswag'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">PIN Suksesvol Opgedateer!</h4>
            <p className="text-xs text-emerald-300">U nuwe sekuriteitskode is nou aktief.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Current PIN */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Huidige PIN (Verstek is 1234)
              </label>
              <div className="relative">
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={8}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Voer huidige PIN in"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* New PIN */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Nuwe 4-Syfer PIN
              </label>
              <div className="relative">
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="bv. 7482"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Mag nie 1234 wees nie. Gebruik slegs syfers.
              </p>
            </div>

            {/* Confirm New PIN */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Bevestig Nuwe PIN
              </label>
              <div className="relative">
                <input
                  type={showPins ? 'text' : 'password'}
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Herhaal nuwe PIN"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPins ? 'Versteek kodes' : 'Wys syfers'}</span>
              </button>
            </div>

            <div className="flex gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition"
              >
                Kanselleer
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-1.5"
              >
                {loading ? 'Besig om op te dateer...' : 'Stel Nuwe PIN'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
