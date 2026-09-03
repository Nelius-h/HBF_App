import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForceChangePinModal: React.FC = () => {
  const { currentUser, setUserPinDirectly } = useAuth();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = newPin.trim();
    if (!clean || clean.length < 4) {
      setError('U nuwe sekuriteits-PIN moet ten minste 4 syfers wees.');
      return;
    }
    if (!/^\d+$/.test(clean)) {
      setError('PIN mag slegs syfers (0-9) bevat.');
      return;
    }
    if (clean === '1234') {
      setError('U nuwe PIN mag nie die verstekkode (1234) bly nie. Kies asseblief u eie unieke PIN.');
      return;
    }
    if (clean !== confirmPin.trim()) {
      setError('Die twee PIN inskrywings stem nie ooreen nie.');
      return;
    }

    setLoading(true);
    const res = await setUserPinDirectly(currentUser.uid, clean);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Kon nie PIN stel nie.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950 flex-shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded uppercase tracking-wider">
              Verpligte Sekuriteitstap
            </span>
            <h3 className="text-lg font-black text-white mt-1">
              Kies U Persoonlike PIN
            </h3>
            <p className="text-xs text-slate-300">
              Welkom, {currentUser.name} {currentUser.surname}!
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-4 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            U registrasie is suksesvol voltooi.
          </p>
          <p className="text-slate-400">
            Vir u eie veiligheid en beskerming van nooddata moet u nou u verstek PIN (<span className="font-mono text-amber-300 font-bold">1234</span>) verander na &apos;n geheime 4-syfer PIN.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-700/80 rounded-xl text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              Nuwe 4-Syfer PIN <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="bv. 8923"
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono text-base tracking-widest focus:outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kies enige 4 syfers wat u maklik kan onthou (mag nie 1234 wees nie).
            </p>
          </div>

          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              Herhaal Nuwe PIN <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Herhaal u nuwe PIN"
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono text-base tracking-widest focus:outline-none transition"
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
              <span>{showPins ? 'Versteek syfers' : 'Wys syfers'}</span>
            </button>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading || !newPin || !confirmPin}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Besig om op te dateer...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Stoor PIN &amp; Gaan na Toepassing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
