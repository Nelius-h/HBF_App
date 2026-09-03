import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Radio,
  PhoneCall,
  Info,
  ChevronRight,
  HelpCircle,
  Search,
  X,
  Check,
  Users,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAuth, ClientRegistrationData } from '../../context/AuthContext';
import { DEFAULT_LOCATION_AREAS } from '../../context/DataContext';
import { AppLogo } from '../common/AppLogo';
import { searchMembersForSuggestions, findUserByLoginIdentifier } from '../../utils/memberLookup';
import { UserProfile } from '../../types';
import { systemPermissionsService, SystemPermissionStatus } from '../../services/systemPermissionsService';

interface AuthPageProps {
  onSuccess?: () => void;
  onOpenPermissions?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onOpenPermissions }) => {
  const { login, registerClient, availableUsers, allUsers } = useAuth();
  const [permStatus, setPermStatus] = useState<SystemPermissionStatus>(() => systemPermissionsService.getStatus());

  useEffect(() => {
    const unsub = systemPermissionsService.subscribe((s) => setPermStatus(s));
    return unsub;
  }, []);

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isMemberDirectoryOpen, setIsMemberDirectoryOpen] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');

  // Register Form State
  const [regData, setRegData] = useState<ClientRegistrationData>({
    name: '',
    surname: '',
    primaryPhone: '',
    email: '',
    farmName: '',
    portionNumber: '',
    sector: 'Sektor 2 - Noord',
    locationArea: 'Hartbeesfontein',
    gateCode: '',
    emergencyNotes: '',
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Live member suggestions as user types name or sell number
  const suggestions = useMemo(() => {
    if (!loginIdentifier.trim() || loginIdentifier.trim().length < 2) return [];
    return searchMembersForSuggestions(availableUsers && availableUsers.length > 0 ? availableUsers : allUsers, loginIdentifier, 4);
  }, [loginIdentifier, availableUsers, allUsers]);

  // Directory filtered list
  const directoryList = useMemo(() => {
    const list = availableUsers && availableUsers.length > 0 ? availableUsers : allUsers;
    if (!directorySearchQuery.trim()) return list;
    return searchMembersForSuggestions(list, directorySearchQuery, 50);
  }, [directorySearchQuery, availableUsers, allUsers]);

  const handleSelectMember = (member: UserProfile) => {
    setLoginIdentifier(`${member.name} ${member.surname}`.trim());
    if (!loginPin) {
      setLoginPin('');
    }
    setShowSuggestions(false);
    setIsMemberDirectoryOpen(false);
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const res = await login(loginIdentifier, loginPin);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.error || 'Aanmelding het misluk. Kontroleer asseblief u besonderhede.');
    } else {
      if (onSuccess) onSuccess();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regData.name.trim() || !regData.surname.trim()) {
      setRegError('Voer asseblief u volle Naam en Van in.');
      return;
    }
    if (!regData.primaryPhone.trim()) {
      setRegError('Voer asseblief u primêre selfoonnommer in.');
      return;
    }
    if (!regData.farmName.trim()) {
      setRegError('Voer asseblief u Plaasnaam / Hoewe in.');
      return;
    }
    if (!agreedTerms) {
      setRegError('U moet instem tot die gemeenskapsveiligheidsreëls om te registreer.');
      return;
    }

    setRegLoading(true);
    const res = await registerClient(regData);
    setRegLoading(false);

    if (!res.success) {
      setRegError(res.error || 'Registrasie het misluk.');
    } else {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Ambience / Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Brand Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size="lg" className="p-0.5 rounded-xl bg-slate-950/40 border border-emerald-500/30 shadow-md shadow-black/30" />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Hartbeesfontein Veiligheid</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded">
                  Plaaswag V0.1
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Gemeenskapsbeheerkamer &amp; Noodreaksie Portaal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPermissions && (
              <button
                type="button"
                onClick={onOpenPermissions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-750 hover:border-emerald-500/40 text-xs font-bold text-slate-200 transition shadow-sm"
                title="Stelsel Toestemmings (GPS, Kennisgewings, Mic, Kamera)"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Toestemmings</span>
                {systemPermissionsService.hasMissingCriticalPermissions() ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Beheerkamer 24/7 Aanlyn</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
          {/* Header Tabs: Login vs Register */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setLoginError(null);
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'LOGIN'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Teken In (Log In)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setRegError(null);
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'REGISTER'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Registreer Nuwe Lid</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* --------------------- LOGIN TAB --------------------- */}
            {mode === 'LOGIN' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Meld Aan by U Rekening</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Voer u <strong className="text-emerald-400 font-bold">Naam</strong> (bv. Cornelius of Hendrik) of <strong className="text-emerald-400 font-bold">Selfoonnommer</strong> (Sell Number bv. 082 306 5808) in.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-5 p-3.5 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="leading-relaxed font-semibold">{loginError}</p>
                      <button
                        type="button"
                        onClick={() => setIsMemberDirectoryOpen(true)}
                        className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Kliek hier om u naam in die Ledelys te soek</span>
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Identifier Input (Name or Sell Number) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-200">
                        Naam of Selfoonnommer <span className="text-emerald-400 font-normal">(Sell Number)</span> <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsMemberDirectoryOpen(true)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Users className="w-3 h-3" />
                        <span>Ledelys Soektog</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoFocus
                        value={loginIdentifier}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="bv. Cornelius, Hendrik Badenhorst, of 082 306 5808"
                        className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 pl-10 pr-9 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
                      />
                      <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                      {loginIdentifier && (
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier('');
                            setShowSuggestions(false);
                          }}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Live Smart Suggestions when typing name or sell number */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="mt-2 p-2 bg-slate-950/90 border border-emerald-500/40 rounded-xl shadow-xl space-y-1 animate-in fade-in">
                        <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Gevonde Lede (Kliek om te kies):</span>
                          </span>
                          <span className="text-slate-500">{suggestions.length} gevind</span>
                        </div>
                        {suggestions.map((member) => (
                          <button
                            key={member.uid}
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className="w-full text-left px-2.5 py-2 hover:bg-emerald-950/60 rounded-lg transition flex items-center justify-between gap-2 group border border-transparent hover:border-emerald-500/30"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white group-hover:text-emerald-300">
                                  {member.name} {member.surname}
                                </span>
                                {member.portionNumber && (
                                  <span className="text-[10px] text-slate-400 font-mono">({member.portionNumber})</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="text-emerald-400/90 font-medium">{member.farmName || 'Plaaswag'}</span>
                                <span>&bull;</span>
                                <span className="font-mono text-slate-300">{member.primaryPhone}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                              Kies &rarr;
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PIN Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-200">
                        4-Syfer Sekuriteits-PIN <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setLoginPin('1234')}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        title="Vul verstek PIN 1234 in"
                      >
                        <span>Verstek PIN:</span>
                        <span className="font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 text-white font-bold">1234</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPin ? 'text' : 'password'}
                        required
                        inputMode="numeric"
                        maxLength={8}
                        value={loginPin}
                        onChange={(e) => setLoginPin(e.target.value)}
                        placeholder="Voer 4-syfer PIN in (verstek 1234)"
                        className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 pl-10 pr-10 text-xs sm:text-sm text-white font-mono tracking-wider placeholder-slate-500 focus:outline-none transition"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPin(!showLoginPin)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                        title={showLoginPin ? 'Versteek PIN' : 'Wys PIN'}
                      >
                        {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loginLoading || !loginIdentifier.trim() || !loginPin.trim()}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
                    >
                      {loginLoading ? (
                        <span>Besig om aan te meld...</span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Meld Aan (Log In)</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Persistent Login Guarantee Info */}
                <div className="mt-5 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Sodra u aangemeld is, bly u veilig ingeteken op hierdie toestel. U hoef nie elke keer weer aan te meld nie.
                  </span>
                </div>

                {/* Quick Helper Button: Search Full Directory */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsMemberDirectoryOpen(true)}
                    className="text-xs text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 font-semibold transition"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Soek in die 171-Lede Plaaswag Gids</span>
                  </button>

                  <a
                    href="tel:+27823065808"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold font-mono text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>+27 82 306 5808</span>
                  </a>
                </div>
              </div>
            )}

            {/* --------------------- REGISTER TAB --------------------- */}
            {mode === 'REGISTER' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-white">Registreer as Nuwe Lid / Boer</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sluit aan by die Hartbeesfontein Plaaswag Noodnetwerk. U verstek PIN sal <strong className="text-slate-200 font-mono">1234</strong> wees en u sal dadelik gevra word om u eie PIN te kies.
                  </p>
                </div>

                {regError && (
                  <div className="mb-5 p-3.5 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  {/* Step 1: Personal Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Voornaam <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        placeholder="bv. Johan"
                        className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Van <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regData.surname}
                        onChange={(e) => setRegData({ ...regData, surname: e.target.value })}
                        placeholder="bv. van der Merwe"
                        className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Primêre Selfoonnommer <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={regData.primaryPhone}
                        onChange={(e) => setRegData({ ...regData, primaryPhone: e.target.value })}
                        placeholder="bv. 082 123 4567"
                        className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        E-posadres (Opsioneel)
                      </label>
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="bv. johan@plaas.co.za"
                        className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 2: Farm & Area (With 57 Locations List) */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      Plaas &amp; Gebied Inligting
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Plaasnaam / Hoewe <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regData.farmName}
                          onChange={(e) => setRegData({ ...regData, farmName: e.target.value })}
                          placeholder="bv. Rietfontein"
                          className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Gedeelte Nommer (Opsioneel)
                        </label>
                        <input
                          type="text"
                          value={regData.portionNumber}
                          onChange={(e) => setRegData({ ...regData, portionNumber: e.target.value })}
                          placeholder="bv. Ged 4 / Gedeelte 2"
                          className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Gebied / Wyk (57 Gebiede) <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={regData.locationArea}
                          onChange={(e) => setRegData({ ...regData, locationArea: e.target.value })}
                          className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                        >
                          {DEFAULT_LOCATION_AREAS.map((area) => (
                            <option key={area.id} value={area.name}>
                              {area.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Sektor Indeling
                        </label>
                        <select
                          value={regData.sector}
                          onChange={(e) => setRegData({ ...regData, sector: e.target.value })}
                          className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                        >
                          <option value="Sektor 1 - Dorp &amp; Buite">Sektor 1 - Dorp &amp; Buite</option>
                          <option value="Sektor 2 - Noord">Sektor 2 - Noord</option>
                          <option value="Sektor 3 - Suid">Sektor 3 - Suid</option>
                          <option value="Sektor 4 - Oos (Brakspruit/Rietkuil)">Sektor 4 - Oos</option>
                          <option value="Sektor 5 - Wes (Palmietfontein/Wolverand)">Sektor 5 - Wes</option>
                          <option value="Algemene Gemeenskap">Algemene Gemeenskap</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Emergency & Gate Info */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      Noodinligting Vir Reaksie
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Hoofhek Kode / Toegang (Opsioneel)
                        </label>
                        <input
                          type="text"
                          value={regData.gateCode}
                          onChange={(e) => setRegData({ ...regData, gateCode: e.target.value })}
                          placeholder="bv. *1234# of Sleutel by hek"
                          className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Noodnota / Honde / Brandtoerusting
                        </label>
                        <input
                          type="text"
                          value={regData.emergencyNotes}
                          onChange={(e) => setRegData({ ...regData, emergencyNotes: e.target.value })}
                          placeholder="bv. 2x Boerboele, brandspuit by skuur"
                          className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms agreement */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-400">
                        Ek stem in tot die Hartbeesfontein Gemeenskapsveiligheid &amp; Plaaswag Veiligheidsreëls en magtig die beheerkamer om bystand te lewer in noodgevalle.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={regLoading || !regData.name || !regData.surname || !regData.primaryPhone || !regData.farmName}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <span>Besig om te registreer...</span>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>Voltooi Registrasie &amp; Stel PIN</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Emergency Hotline Bar at Bottom */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 py-3 sm:px-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-slate-200">Dringende Noodgeval?</span>
            <span className="text-slate-400">Bel Hartbeesfontein SAPD:</span>
            <a
              href="tel:0184320700"
              className="text-emerald-400 font-bold hover:underline font-mono"
            >
              (018) 432-0700
            </a>
          </div>
          <div className="text-[11px] text-slate-500">
            Hartbeesfontein Plaaswag &bull; Veiligheid &amp; Gemeenskapskontrole
          </div>
        </div>
      </footer>

      {/* Member Directory Search Modal */}
      {isMemberDirectoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Hartbeesfontein Ledelys Gids</h3>
                  <p className="text-[11px] text-slate-400">Soek u naam of nommer om aan te meld</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMemberDirectoryOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/90">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
                  placeholder="Soek op naam, van, selfoonnommer of plaas..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                {directorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDirectorySearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>{directoryList.length} lede gevind</span>
                <span className="text-emerald-400 font-semibold">Verstek PIN: 1234</span>
              </div>
            </div>

            {/* Member List */}
            <div className="overflow-y-auto divide-y divide-slate-800/60 p-1 flex-1">
              {directoryList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Geen lede gevind vir &quot;{directorySearchQuery}&quot; nie.
                </div>
              ) : (
                directoryList.map((member) => (
                  <button
                    key={member.uid}
                    type="button"
                    onClick={() => handleSelectMember(member)}
                    className="w-full text-left p-3 hover:bg-slate-800/80 rounded-xl transition flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300">
                          {member.name} {member.surname}
                        </span>
                        {member.portionNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">({member.portionNumber})</span>
                        )}
                        {member.role === 'MANAGEMENT' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60">
                            Bestuur
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 font-medium">{member.farmName || 'Plaaswag'}</span>
                        <span>&bull;</span>
                        <span className="text-slate-300 font-mono">{member.primaryPhone}</span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1.5 rounded-lg border border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition flex-shrink-0">
                      Kies Lid &rarr;
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
