import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Phone,
  Home,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Car,
  Users,
  Volume2,
  Lock,
  ArrowRight,
  Sparkles,
  Camera,
  Navigation,
  Compass,
  FileText,
  Search,
  Check,
  Building2,
  Bell,
  Mic,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, UserProfile } from '../../types';
import { ACTUAL_CLIENT_PROFILES } from '../../data/actualClientProfilesData';
import { AppLogo } from './AppLogo';
import { systemPermissionsService, SystemPermissionStatus } from '../../services/systemPermissionsService';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { currentUser, updateCurrentUser, updateUser, createUser, switchUserAccount, allUsers } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Client search and claim state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExistingUid, setSelectedExistingUid] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form profile state
  const [name, setName] = useState(currentUser?.name || '');
  const [surname, setSurname] = useState(currentUser?.surname || '');
  const [phone, setPhone] = useState(currentUser?.primaryPhone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [farmName, setFarmName] = useState(currentUser?.farmName || '');
  const [portionNumber, setPortionNumber] = useState(currentUser?.portionNumber || '');
  const [sector, setSector] = useState(currentUser?.sector || 'Sektor 2 - Noord');
  const [emergencyNotes, setEmergencyNotes] = useState(currentUser?.emergencyNotes || '');

  // Next of kin / Emergency contact
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [nextOfKinRelation, setNextOfKinRelation] = useState('Spouse / Family');

  // Role Selection: 'CLIENT' (Member), 'REACTION_FORCE' (Tactical Unit), 'CONTROL_ROOM' (Operator)
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'REACTION_FORCE' | 'CONTROL_ROOM'>('CLIENT');
  const [callsign, setCallsign] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');

  // App Permissions state
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [audioGranted, setAudioGranted] = useState<boolean>(true);
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [isRequestingGps, setIsRequestingGps] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Combine loaded users with actual directory
  const clientDirectory = allUsers && allUsers.length > 0 ? allUsers : ACTUAL_CLIENT_PROFILES;

  const filteredClients = searchQuery.trim() === ''
    ? []
    : clientDirectory.filter((c) => {
        const query = searchQuery.toLowerCase();
        const fullName = `${c.name} ${c.surname}`.toLowerCase();
        const farm = (c.farmName || '').toLowerCase();
        const phoneNo = (c.primaryPhone || '').replace(/\s+/g, '');
        const sec = (c.sector || '').toLowerCase();
        return (
          fullName.includes(query) ||
          farm.includes(query) ||
          phoneNo.includes(query.replace(/\s+/g, '')) ||
          sec.includes(query)
        );
      }).slice(0, 8);

  const handleSelectClient = (c: UserProfile) => {
    setSelectedExistingUid(c.uid);
    setName(c.name);
    setSurname(c.surname);
    setPhone(c.primaryPhone || '');
    setEmail(c.email || '');
    setFarmName(c.farmName || '');
    setPortionNumber(c.portionNumber || '');
    setSector(c.sector || 'Sektor 2 - Noord');
    setEmergencyNotes(c.emergencyNotes || '');
    if (c.role && (c.role === 'CLIENT' || c.role === 'REACTION_FORCE' || c.role === 'CONTROL_ROOM')) {
      setSelectedRole(c.role);
    }
    if (c.farmGpsLocation) {
      setGpsCoords({
        lat: c.farmGpsLocation.latitude,
        lng: c.farmGpsLocation.longitude,
      });
      setLocationGranted(true);
    }
    setIsDropdownOpen(false);
    setSearchQuery(`${c.name} ${c.surname} - ${c.farmName}`);
  };

  if (!isOpen) return null;

  const handleRequestGps = () => {
    setIsRequestingGps(true);
    setErrorMsg(null);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationGranted(true);
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIsRequestingGps(false);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err);
          setLocationGranted(false);
          setIsRequestingGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationGranted(false);
      setIsRequestingGps(false);
    }
  };

  const handleRequestCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setCameraGranted(true);
      } else {
        setCameraGranted(true);
      }
    } catch (e) {
      setCameraGranted(false);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !surname.trim() || !phone.trim() || !farmName.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Surname, Phone Number, and Farm / Address).');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setErrorMsg(null);

    const familyList = nextOfKinName.trim()
      ? [
          {
            id: `FAM-${Date.now().toString().slice(-4)}`,
            name: nextOfKinName.trim(),
            surname: surname.trim(),
            relationship: nextOfKinRelation,
            phone: nextOfKinPhone.trim(),
            emergencyNotes: 'Primary Emergency Contact',
          },
        ]
      : [];

    const defaultLat = gpsCoords?.lat || -26.763;
    const defaultLng = gpsCoords?.lng || 26.402;

    const userPayload: Partial<UserProfile> & {
      name: string;
      surname: string;
      primaryPhone: string;
      role: UserRole;
    } = {
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim() || `${name.trim().toLowerCase()}.${surname.trim().toLowerCase()}@hbfveiligheid.co.za`,
      primaryPhone: phone.trim(),
      farmName: farmName.trim(),
      portionNumber: portionNumber.trim(),
      sector: sector,
      role: selectedRole,
      callsign: selectedRole === 'REACTION_FORCE' ? (callsign.trim() || `RF-${name.slice(0, 4).toUpperCase()}`) : undefined,
      vehicleDetails: selectedRole === 'REACTION_FORCE' && vehicleReg.trim() ? vehicleReg.trim() : undefined,
      emergencyNotes: emergencyNotes.trim(),
      familyMembers: familyList,
      farmGpsLocation: {
        latitude: defaultLat,
        longitude: defaultLng,
        accuracy: gpsCoords ? 5 : 20,
        source: gpsCoords ? 'GPS' : 'MANUAL_PIN',
        verifiedTimestamp: new Date().toISOString(),
      },
      communityResponseSettings: {
        participateNearbyEmergencies: selectedRole === 'REACTION_FORCE' || selectedRole === 'CONTROL_ROOM',
        availableToAssistNow: true,
        receiveSecurityAlerts: true,
        receiveFireAlerts: true,
        receiveTrafficAlerts: true,
        receiveBoloAlerts: true,
        receiveCommunityNotices: true,
        receiveAssistanceRequests: true,
      },
    };

    try {
      if (selectedExistingUid) {
        // Update the claimed client profile with any new edits, and switch to it
        updateUser(selectedExistingUid, {
          ...userPayload,
          isActive: true,
        });
        switchUserAccount(selectedExistingUid);
      } else {
        const isInitialDummy = currentUser.uid.startsWith('USR-CLIENT-001') || currentUser.uid.startsWith('USR-TEMP');
        if (isInitialDummy) {
          updateCurrentUser(userPayload);
        } else {
          const created = await createUser(userPayload);
          switchUserAccount(created.uid);
        }
      }

      // Record in localStorage that onboarding has been completed on this device
      localStorage.setItem('hv_onboarding_completed', 'true');
      onComplete();
    } catch (err: any) {
      setErrorMsg('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-5 text-white my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <AppLogo size="lg" className="p-0.5 rounded-2xl bg-slate-950/40 border border-emerald-500/30 shadow-lg shadow-black/30" />
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight">
                Hartbeesfontein Veiligheid
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Test Launch Setup &bull; Nuwe Gebruiker Registrasie
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
            Stap {step} van 3
          </span>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL & LOCATION PROFILE */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4 text-xs">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Vul u profiel inligting in</p>
              <p className="text-slate-400 text-[11px]">
                Kies u bestaande naam uit die HBF Ledelys om u rekening dadelik te koppel en u inligting by te werk, of vul nuwe besonderhede in.
              </p>
            </div>

            {/* Client Quick Search / Profile Selector */}
            <div className="relative bg-slate-950 p-3 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <Search className="w-3.5 h-3.5" />
                  <span>Kies U Bestaande Boerevereniging Profiel</span>
                </span>
                {selectedExistingUid && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExistingUid(null);
                      setSearchQuery('');
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                  >
                    Kies Ander / Maak Skoon
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Tik u naam, van of plaasnaam (bv. Danie, Pollard, Rooipoort)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 pl-8 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && filteredClients.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-emerald-500/50 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-800">
                  <div className="p-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80">
                    Bestaande HBF Lede Gevind ({filteredClients.length})
                  </div>
                  {filteredClients.map((client) => (
                    <button
                      key={client.uid}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left p-2.5 hover:bg-emerald-950/50 transition flex items-center justify-between gap-2 group"
                    >
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-300 text-xs flex items-center gap-1.5">
                          <span>{client.name} {client.surname}</span>
                          {client.portionNumber && (
                            <span className="text-[10px] text-slate-400">({client.portionNumber})</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Home className="w-3 h-3 text-slate-500" />
                            {client.farmName || 'Onbekend'}
                          </span>
                          <span>&bull;</span>
                          <span className="text-emerald-400">{client.sector}</span>
                          {client.primaryPhone && (
                            <>
                              <span>&bull;</span>
                              <span>{client.primaryPhone}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-emerald-600/30 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition">
                        <span>Kies</span>
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedExistingUid && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-[11px] text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Profiel Gekoppel:</strong> U besonderhede is gelaai. U kan enige velde hieronder wysig of opdateer.
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Naam / First Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bv. Johan"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Van / Surname <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="bv. van der Merwe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Selfoonnommer (WhatsApp) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="082 123 4567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  E-posadres (Opsioneel)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johan@plaas.co.za"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Plaas / Plot / Woonadres <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="bv. Rooipoort / Plot 14 / Dorp Straat"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Sektor / Wyk <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="Sektor 1 - Suid">Sektor 1 - Suid</option>
                  <option value="Sektor 2 - Noord">Sektor 2 - Noord</option>
                  <option value="Sektor 3 - Oos">Sektor 3 - Oos</option>
                  <option value="Hartbeesfontein Sentraal (Dorp)">Hartbeesfontein Sentraal (Dorp)</option>
                  <option value="Brakspruit / Palmietfontein">Brakspruit / Palmietfontein</option>
                  <option value="Schoemansfontein">Schoemansfontein</option>
                  <option value="Dupperspos">Dupperspos</option>
                </select>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs text-amber-300">
                <Users className="w-3.5 h-3.5" />
                <span>Noodkontak / Naasbestaande (Next of Kin)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={nextOfKinName}
                  onChange={(e) => setNextOfKinName(e.target.value)}
                  placeholder="Kontak Naam (bv. Vrou / Seun)"
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs"
                />
                <input
                  type="tel"
                  value={nextOfKinPhone}
                  onChange={(e) => setNextOfKinPhone(e.target.value)}
                  placeholder="Kontak Tel Nommer"
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <span>Volgende: Kies Rol</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OPERATIONAL ROLE SELECTION */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Kies u Operasionele Rol</p>
              <p className="text-slate-400 text-[11px]">
                Kies watter funksie u in die stelsel gaan verrig tydens hierdie toetslopie:
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Role 1: MEMBER / CLIENT */}
              <label
                onClick={() => setSelectedRole('CLIENT')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
                  selectedRole === 'CLIENT'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${selectedRole === 'CLIENT' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Lid / Plaaswag (Member)</span>
                    {selectedRole === 'CLIENT' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Toegang tot die SOS-paniekknoppie, plaasinligting, veediefstal en insident-aanmelding, en plaaswag waarskuwings.
                  </p>
                </div>
              </label>

              {/* Role 2: REACTION FORCE */}
              <label
                onClick={() => setSelectedRole('REACTION_FORCE')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
                  selectedRole === 'REACTION_FORCE'
                    ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${selectedRole === 'REACTION_FORCE' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Radio className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Reaksie Mag (Reaction Force)</span>
                    {selectedRole === 'REACTION_FORCE' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Gewapende reaksie, patrollie leiers &amp; noodhelpers. Sluit in lewendige GPS-ontplooiing, navigasie en reaksie-knoppies.
                  </p>
                </div>
              </label>

              {/* Role 3: CONTROL ROOM OPERATOR */}
              <label
                onClick={() => setSelectedRole('CONTROL_ROOM')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
                  selectedRole === 'CONTROL_ROOM'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${selectedRole === 'CONTROL_ROOM' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Beheerkamer (Control Room Operator)</span>
                    {selectedRole === 'CONTROL_ROOM' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    24/7 CAD versending paneel, inkomende paniek alarme, WhatsApp outo-versending, en kartering.
                  </p>
                </div>
              </label>
            </div>

            {/* If reaction force selected, ask for callsign */}
            {selectedRole === 'REACTION_FORCE' && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-red-900/50 space-y-2">
                <span className="font-bold text-red-300 text-xs flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>Reaksie Besonderhede</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder="Roepsein (bv. Alfa-1 / Bravo-2)"
                    className="bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    placeholder="Voertuig Reg & Model (bv. HBF 123 NW Hilux)"
                    className="bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
              >
                Terug
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
              >
                <span>Volgende: Toestemmings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: APP PERMISSIONS */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Toestemmings &amp; Finale Aktivering</p>
                <p className="text-slate-400 text-[11px]">
                  Gee die 4 nodige toestemmings sodat die app akkuraat kan funksioneer tydens noodgevalle:
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await systemPermissionsService.requestAllPermissionsSequentially();
                  setLocationGranted(true);
                  setCameraGranted(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verleen Almal (1-Klik)</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Permission 1: GPS GEOLOCATION */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${locationGranted ? 'bg-emerald-900/60 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>1. GPS Ligging (Noodkoördinate)</span>
                      {locationGranted && <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600 px-1.5 py-0.2 rounded">Geaktiveer</span>}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Stuur outomaties akkurate GPS-koördinate tydens aktiewe SOS-paniek.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRequestGps}
                  disabled={isRequestingGps || locationGranted === true}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    locationGranted
                      ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-600'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                  }`}
                >
                  {isRequestingGps ? 'Aktiveer...' : locationGranted ? 'Aan' : 'Aktiveer GPS'}
                </button>
              </div>

              {/* Permission 2: PUSH NOTIFICATIONS & SIRENS */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-900/60 text-amber-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>2. Noodwaarskuwings &amp; Sirenes</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Ontvang onmiddellike sirene-alarms en beheerkamer-versendings op u foon.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await systemPermissionsService.requestNotifications();
                  }}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow transition"
                >
                  Aktiveer Kennisgewings
                </button>
              </div>

              {/* Permission 3: EMERGENCY MICROPHONE */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-900/60 text-rose-400">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>3. Nood-Mikrofoon (Live Oudio)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Stroom lewendige omgewingsklank na die beheerkamer sodra SOS gedruk word.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await systemPermissionsService.requestMicrophone();
                  }}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow transition"
                >
                  Aktiveer Mikrofoon
                </button>
              </div>

              {/* Permission 4: CAMERA & MEDIA */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${cameraGranted ? 'bg-blue-900/60 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>4. Kamera &amp; Foto Oplaai</span>
                      {cameraGranted && <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-600 px-1.5 py-0.2 rounded">Geaktiveer</span>}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Vir die neem van foto's by verdagte voertuie, spore of insidente.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRequestCamera}
                  disabled={cameraGranted === true}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    cameraGranted
                      ? 'bg-blue-900/40 text-blue-400 border border-blue-600'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                  }`}
                >
                  {cameraGranted ? 'Aan' : 'Aktiveer Kamera'}
                </button>
              </div>
            </div>

            {/* Test launch management notice */}
            <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-2xl text-[11px] text-amber-200 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Toetsfase Kennisgewing:</strong> Die Bestuursopsie (Management) is tydens hierdie toetsfase uitsluitlik gereserveer vir Cornelius Hattingh om stelselintegriteit en sekuriteit te beskerm.
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
              >
                Terug
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Voltooi &amp; Begin Toets</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
