import React, { useState } from 'react';
import { UserCheck, Shield, KeyRound, AlertTriangle, CheckCircle2, Clock, FileText, X, Search, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { UserProfile } from '../../types';

interface ShiftChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftChangeModal: React.FC<ShiftChangeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, availableUsers, switchUserAccount } = useAuth();
  const { 
    allActiveEmergencies, 
    cases, 
    unacknowledgedIncidentsCount, 
    createSituationReport, 
    logAuditEvent,
    isPatrolActive,
  } = useData();
  const { t } = useI18n();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'CONTROL_ROOM' | 'ALL'>('CONTROL_ROOM');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const openCases = cases.filter((c) => c.status !== 'closed');

  // Filter available users
  const eligibleUsers = availableUsers.filter((u) => {
    if (u.uid === currentUser.uid) return false;
    if (roleFilter === 'CONTROL_ROOM') {
      return u.role === 'CONTROL_ROOM' || u.role === 'MANAGEMENT';
    }
    return true;
  }).filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      (u.callsign && u.callsign.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const handleSelectOperator = (user: UserProfile) => {
    setSelectedUser(user);
    setPinInput('');
    setErrorMsg('');
  };

  const handleConfirmShiftChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMsg('Kies asseblief die inkomende operateur / Please select the incoming operator');
      return;
    }

    // Verify PIN
    if (selectedUser.pin && pinInput.trim() !== selectedUser.pin) {
      setErrorMsg('Ongeldige PIN kode vir die gekose operateur / Incorrect PIN for selected operator');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-ZA');

      // 1. Create a structured Situation Report in Voorvalleboek
      const sitrepDesc = `[SKOF WISSELING / SHIFT HANDOVER] Skof oorhandig om ${timeStr} op ${dateStr}.\n` +
        `Uitgaande Operateur: ${currentUser.name} ${currentUser.surname} (${currentUser.role})\n` +
        `Inkomende Operateur: ${selectedUser.name} ${selectedUser.surname} (${selectedUser.role})\n` +
        `Aktiewe Noodgevalle: ${allActiveEmergencies.length} | Patrollie Aktief: ${isPatrolActive ? 'JA' : 'NEE'} | Oop Sake: ${openCases.length}\n` +
        (handoverNotes.trim() ? `Notas / Instruksies: ${handoverNotes.trim()}` : 'Geen spesiale notas aangeteken nie.');

      await createSituationReport({
        sourceName: `Beheerkamer Wissel: ${selectedUser.name} ${selectedUser.surname}`,
        sourceType: 'radio',
        location: 'HBF Beheerkamer Hoofstasie',
        category: 'general_intel',
        description: sitrepDesc,
        notes: handoverNotes.trim() || 'Skof amptelik gewissel.',
        actionDecision: 'report_only',
        distributionOption: 'no_broadcast',
      });

      // 2. Log system audit trail
      logAuditEvent({
        recordType: 'USER',
        recordId: selectedUser.uid,
        action: 'SHIFT_CHANGE',
        description: `Control Room Shift Handover: Operator changed from ${currentUser.name} ${currentUser.surname} to ${selectedUser.name} ${selectedUser.surname}. Active emergencies: ${allActiveEmergencies.length}`,
      });

      // 3. Switch active user session seamlessly
      switchUserAccount(selectedUser.uid);

      setSuccessMsg(`Skof suksesvol oorgedra aan ${selectedUser.name} ${selectedUser.surname}!`);
      
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('[ShiftChangeModal] Error processing handover:', err);
      setErrorMsg(err?.message || 'Kon nie skof wissel nie. Probeer asseblief weer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white">
                Beheerkamer Skof Oorhandiging / Shift Change
              </h2>
              <p className="text-xs text-slate-400">
                Wissel operateur profiel vir deurlopende beheerkamer diens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successMsg ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">{successMsg}</h3>
              <p className="text-xs text-slate-400">Beheerkamer data en statusse bly onveranderd en gesinchroniseer.</p>
            </div>
          ) : (
            <>
              {/* Current Status Overview Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Huidige Operateur:</span>
                    <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      {currentUser.name} {currentUser.surname}
                      {currentUser.callsign && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {currentUser.callsign}
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Aktiewe Alarms</span>
                    <span className={`text-base font-black ${allActiveEmergencies.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {allActiveEmergencies.length}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Patrollie</span>
                    <span className={`text-base font-black ${isPatrolActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isPatrolActive ? 'AKTIEF' : 'AF'}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Oop Sake</span>
                    <span className="text-base font-black text-amber-400">
                      {openCases.length}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Kennisgewings</span>
                    <span className={`text-base font-black ${unacknowledgedIncidentsCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {unacknowledgedIncidentsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operator Selection */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Kies Inkomende Operateur / Select Incoming Operator</span>
                  </label>
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setRoleFilter('CONTROL_ROOM')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        roleFilter === 'CONTROL_ROOM' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Beheerkamer / Bestuur
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleFilter('ALL')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        roleFilter === 'ALL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Alle Personeel
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Soek operateur op naam, roepsein of selfoon..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {eligibleUsers.map((u) => {
                    const isSelected = selectedUser?.uid === u.uid;
                    return (
                      <button
                        key={u.uid}
                        type="button"
                        onClick={() => handleSelectOperator(u)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {u.name.charAt(0)}{u.surname.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{u.name} {u.surname}</span>
                              {u.callsign && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                                  {u.callsign}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {u.role} {u.primaryPhone ? `• ${u.primaryPhone}` : ''}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Handover Form */}
              <form onSubmit={handleConfirmShiftChange} className="space-y-4 pt-2 border-t border-slate-800">
                {selectedUser && (
                  <div className="space-y-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">
                        Inkomende Operateur PIN Verifikasie ({selectedUser.name} {selectedUser.surname}):
                      </span>
                      {selectedUser.pin && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          (Standaard toets PIN: {selectedUser.pin})
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="Voer operateur PIN in / Enter PIN..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Skof Oorhandiging Notas / Handover Notes (Opsioneel)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="Meld enige belangrike patrollie instruksies, kragonderbrekings, of radio notas aan..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
                  >
                    Kanselleer / Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedUser || isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg uppercase transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Oorhandig Skof...</span>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Bevestig Skof Wisseling</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
