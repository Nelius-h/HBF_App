// Hartbeesfontein Veiligheid - Reaction Force WhatsApp Dispatch Modal
// 2 Tactical Options:
// 1. Send to Reaction Force Commander
// 2. Sent to all Reaction Force Personnel

import React, { useState, useMemo } from 'react';
import {
  X,
  Radio,
  Send,
  Shield,
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Phone,
  Car,
  Clock,
  KeyRound,
  FileText,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { EmergencyEvent, WhatsAppMessageRecord, EmergencyContact } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  formatEmergencyWhatsAppMessage,
  generateManualWhatsAppUrl,
} from '../../services/whatsappService';

export interface DispatchReactionForceWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyEvent;
  onDispatched?: (records: WhatsAppMessageRecord[]) => void;
}

export type DispatchOptionType = 'COMMANDER' | 'ALL_PERSONNEL';

export interface ReactionPersonnelItem {
  id: string;
  name: string;
  surname?: string;
  callsign: string;
  role: string;
  phone: string;
  whatsappNumber?: string;
  vehicle?: string;
  sector?: string;
  isCommander?: boolean;
  isAvailable?: boolean;
}

export const DispatchReactionForceWhatsAppModal: React.FC<DispatchReactionForceWhatsAppModalProps> = ({
  isOpen,
  onClose,
  emergency,
  onDispatched,
}) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const {
    emergencyContacts,
    settings,
    notifyReactionForce,
    notifyAllReactionForce,
  } = useData();

  // Active Dispatch Option: 'COMMANDER' | 'ALL_PERSONNEL'
  const [dispatchOption, setDispatchOption] = useState<DispatchOptionType>('COMMANDER');

  // Custom operator tactical note
  const [customTacticalNotes, setCustomTacticalNotes] = useState('');
  const [includeLiveLocationTrail, setIncludeLiveLocationTrail] = useState(true);
  const [includeGateCode, setIncludeGateCode] = useState(true);
  const [includeFamilyContacts, setIncludeFamilyContacts] = useState(true);

  // Copy state
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Dispatch progress & results
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [dispatchedRecords, setDispatchedRecords] = useState<WhatsAppMessageRecord[]>([]);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // 1. Compile Reaction Force Commander(s)
  const commanderContacts = useMemo<ReactionPersonnelItem[]>(() => {
    const commanders: ReactionPersonnelItem[] = [];

    // From emergency contacts
    const rfEmergencyContacts = emergencyContacts.filter(
      (c) => c.category === 'REACTION_FORCE' || c.notes?.toLowerCase().includes('commander')
    );

    rfEmergencyContacts.forEach((c) => {
      commanders.push({
        id: c.id,
        name: c.name,
        callsign: c.notes?.includes('CMD') ? 'CMD-1' : 'REAKSIEHOOF',
        role: 'Reaction Force Commander / Reaksiehoof',
        phone: c.phone,
        whatsappNumber: c.whatsappNumber || c.phone,
        sector: c.areaSector || 'All Sectors',
        vehicle: 'Toyota Land Cruiser 4x4 / Command Post',
        isCommander: true,
        isAvailable: c.isActive,
      });
    });

    // Default primary commander if none found in contacts
    if (commanders.length === 0) {
      commanders.push({
        id: 'DEFAULT-CMD-01',
        name: 'test user3 (Reaksiehoof)',
        callsign: 'COMMANDER-1',
        role: 'Reaction Force Dispatch Commander',
        phone: '',
        whatsappNumber: '',
        sector: 'Hartbeesfontein Plaaswag Hoofkwartier',
        vehicle: 'Command Post',
        isCommander: true,
        isAvailable: true,
      });
    }

    return commanders;
  }, [emergencyContacts]);

  const [selectedCommanderId, setSelectedCommanderId] = useState<string>(
    commanderContacts[0]?.id || 'DEFAULT-CMD-01'
  );

  const selectedCommander = useMemo(() => {
    return commanderContacts.find((c) => c.id === selectedCommanderId) || commanderContacts[0];
  }, [commanderContacts, selectedCommanderId]);

  // 2. Compile All Reaction Force Personnel
  const allPersonnelList = useMemo<ReactionPersonnelItem[]>(() => {
    const list: ReactionPersonnelItem[] = [];

    // Include Commander(s)
    commanderContacts.forEach((cmd) => {
      list.push(cmd);
    });

    // Known / registered armed reaction & farmwatch patrol units
    const standardUnits: ReactionPersonnelItem[] = [
      {
        id: 'RF-UNIT-01',
        name: 'test user1',
        callsign: 'Bravo-1',
        role: 'Armed Reaction Unit (Heavy Response)',
        phone: '',
        whatsappNumber: '',
        sector: 'Sektor 2 - Noord',
        vehicle: '',
        isCommander: false,
        isAvailable: true,
      },
      {
        id: 'RF-UNIT-02',
        name: 'test user2',
        callsign: 'Alfa-2',
        role: 'Plaaswag Vrywillige Reaksie & Brandweer',
        phone: '',
        whatsappNumber: '',
        sector: 'Sektor 1 - Suid',
        vehicle: '',
        isCommander: false,
        isAvailable: true,
      },
      {
        id: 'RF-UNIT-03',
        name: 'test user4',
        callsign: 'Alfa-1',
        role: 'Armed Reaction & Thermal Drone Lead',
        phone: '',
        whatsappNumber: '',
        sector: 'Sektor 3 - Oos',
        vehicle: '',
        isCommander: false,
        isAvailable: true,
      },
      {
        id: 'RF-UNIT-04',
        name: 'test user5',
        callsign: 'Bravo-2',
        role: 'Fire & Heavy Rescue Support',
        phone: '',
        whatsappNumber: '',
        sector: 'Sektor 4 - Wes',
        vehicle: '',
        isCommander: false,
        isAvailable: true,
      },
    ];

    standardUnits.forEach((u) => {
      if (!list.some((existing) => existing.phone.replace(/[^0-9]/g, '') === u.phone.replace(/[^0-9]/g, ''))) {
        list.push(u);
      }
    });

    return list;
  }, [commanderContacts]);

  // Selected Personnel IDs for option 2 (All selected by default)
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(() =>
    allPersonnelList.map((p) => p.id)
  );

  const toggleSelectAllPersonnel = () => {
    if (selectedPersonnelIds.length === allPersonnelList.length) {
      setSelectedPersonnelIds([]);
    } else {
      setSelectedPersonnelIds(allPersonnelList.map((p) => p.id));
    }
  };

  const togglePersonnelSelection = (id: string) => {
    setSelectedPersonnelIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Preview Message Builder
  const previewMessage = useMemo(() => {
    const recipientLabel =
      dispatchOption === 'COMMANDER'
        ? `Reaksiebevelvoerder (${selectedCommander?.name || 'Kobus Eloff'})`
        : `Alle Reaksiespan-Personeel (${selectedPersonnelIds.length} Eenhede)`;

    let baseMsg = formatEmergencyWhatsAppMessage(emergency, recipientLabel, {
      includeGpsLink: true,
      includeAccessDetails: includeGateCode,
      includeFamilyMembers: includeFamilyContacts,
      language: 'BILINGUAL',
    });

    if (customTacticalNotes.trim()) {
      baseMsg += `\n\n📌 *OPERATEUR TAKTIESE NOTAS / BEVEL:* \n${customTacticalNotes.trim()}`;
    }

    if (includeLiveLocationTrail && emergency.locationSession?.history?.length) {
      baseMsg += `\n\n📍 *LEWENDIGE GPS SPOOR:* ${emergency.locationSession.history.length} punte geregistreer. https://maps.google.com/?q=${emergency.location.latitude},${emergency.location.longitude}`;
    }

    return baseMsg;
  }, [
    emergency,
    dispatchOption,
    selectedCommander,
    selectedPersonnelIds.length,
    customTacticalNotes,
    includeGateCode,
    includeFamilyContacts,
    includeLiveLocationTrail,
  ]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  // Dispatch Action Handler
  const handleExecuteDispatch = async (forcedOption?: 'COMMANDER' | 'ALL_PERSONNEL' | any) => {
    const targetOption: 'COMMANDER' | 'ALL_PERSONNEL' =
      forcedOption === 'COMMANDER' || forcedOption === 'ALL_PERSONNEL'
        ? forcedOption
        : dispatchOption;

    setIsTransmitting(true);
    setResultMessage(null);

    try {
      if (targetOption === 'COMMANDER') {
        // Dispatch to Commander
        const record = await notifyReactionForce(
          emergency.id,
          selectedCommander.id,
          customTacticalNotes
        );

        setDispatchedRecords([record]);
        setDispatchSuccess(true);
        setResultMessage(
          `✅ High-priority dispatch transmitted directly to Reaction Force Commander ${selectedCommander.name} (${selectedCommander.phone}).`
        );

        // Copy payload to clipboard for instant pasting
        try {
          await navigator.clipboard.writeText(previewMessage);
          setCopiedPayload(true);
          setTimeout(() => setCopiedPayload(false), 2500);
        } catch {
          // fallback
        }

        // Open WhatsApp directly for the commander
        const waUrl = generateManualWhatsAppUrl(selectedCommander.phone, previewMessage);
        window.open(waUrl, '_blank', 'noopener,noreferrer');

        if (onDispatched) onDispatched([record]);
      } else {
        // Dispatch to All Reaction Force Personnel
        let effectiveIds = selectedPersonnelIds;
        if (!effectiveIds || effectiveIds.length === 0) {
          effectiveIds = allPersonnelList.map((p) => p.id);
          setSelectedPersonnelIds(effectiveIds);
        }

        const targets = allPersonnelList
          .filter((p) => effectiveIds.includes(p.id))
          .map((p) => ({
            name: `${p.name} (${p.callsign})`,
            phone: p.phone,
            role: p.role,
            callsign: p.callsign,
          }));

        const records = await notifyAllReactionForce(
          emergency.id,
          customTacticalNotes,
          targets
        );

        setDispatchedRecords(records);
        setDispatchSuccess(true);
        setResultMessage(
          `✅ Tactical broadcast successfully transmitted to ${records.length} Reaction Force personnel & units.`
        );

        // Copy payload to clipboard for instant pasting
        try {
          await navigator.clipboard.writeText(previewMessage);
          setCopiedPayload(true);
          setTimeout(() => setCopiedPayload(false), 2500);
        } catch {
          // fallback
        }

        // Open WhatsApp for the first/lead responder
        if (targets.length > 0) {
          const leadUnit = targets[0];
          const waUrl = generateManualWhatsAppUrl(leadUnit.phone, previewMessage);
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        }

        if (onDispatched) onDispatched(records);
      }
    } catch (err: any) {
      setResultMessage(`⚠️ Dispatch Error: ${err?.message || 'Failed to complete dispatch'}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-red-500/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 px-5 py-4 flex items-center justify-between border-b border-red-500/40 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-red-700 flex items-center justify-center font-black shadow-xl flex-shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
                  Dispatch Reaction Force (WhatsApp)
                </h3>
                <span className="bg-red-950/90 text-red-200 border border-red-400 font-mono text-[11px] px-2 py-0.5 rounded-full font-bold">
                  #{emergency.id}
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium">
                {emergency.farmName} • {emergency.sector} • Client: {emergency.clientName} ({emergency.clientPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 2 DISPATCH OPTIONS TABS / SELECTOR */}
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              Select Dispatch Target Option:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* OPTION 1: SEND TO COMMANDER */}
              <div
                onClick={() => setDispatchOption('COMMANDER')}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 shadow-md cursor-pointer ${
                  dispatchOption === 'COMMANDER'
                    ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500/40 text-white'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        dispatchOption === 'COMMANDER'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-white flex items-center gap-1.5">
                        <span>Send to Reaction Commander</span>
                        <span className="text-[10px] bg-red-600 text-white font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                          CMD
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300">
                        Direct tactical dispatch to unit chief
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      dispatchOption === 'COMMANDER'
                        ? 'border-red-400 bg-red-500'
                        : 'border-slate-500'
                    }`}
                  >
                    {dispatchOption === 'COMMANDER' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 text-[11px] flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-red-300">
                    {selectedCommander.name}
                  </span>
                  <span className="font-mono text-slate-400">
                    {selectedCommander.phone}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isTransmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDispatchOption('COMMANDER');
                    handleExecuteDispatch('COMMANDER');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Commander Now</span>
                </button>
              </div>

              {/* OPTION 2: SENT TO ALL PERSONNEL */}
              <div
                onClick={() => setDispatchOption('ALL_PERSONNEL')}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 shadow-md cursor-pointer ${
                  dispatchOption === 'ALL_PERSONNEL'
                    ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500/40 text-white'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        dispatchOption === 'ALL_PERSONNEL'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-white flex items-center gap-1.5">
                        <span>Sent to All Reaction Personnel</span>
                        <span className="text-[10px] bg-emerald-600 text-white font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                          ALL ({allPersonnelList.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300">
                        Simultaneous broadcast to all units
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      dispatchOption === 'ALL_PERSONNEL'
                        ? 'border-red-400 bg-red-500'
                        : 'border-slate-500'
                    }`}
                  >
                    {dispatchOption === 'ALL_PERSONNEL' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 text-[11px] flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-emerald-400">
                    {selectedPersonnelIds.length} of {allPersonnelList.length} Units Active
                  </span>
                  <span className="font-mono text-slate-400">Multi-Channel Broadcast</span>
                </div>

                <button
                  type="button"
                  disabled={isTransmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDispatchOption('ALL_PERSONNEL');
                    handleExecuteDispatch('ALL_PERSONNEL');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sent to All ({selectedPersonnelIds.length || allPersonnelList.length}) Personnel Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* OPTION 1 DETAIL VIEW: COMMANDER SELECTION & INFO */}
          {dispatchOption === 'COMMANDER' && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span>Designated Reaction Force Commander:</span>
                </span>
                {commanderContacts.length > 1 && (
                  <select
                    value={selectedCommanderId}
                    onChange={(e) => setSelectedCommanderId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-2.5 py-1 text-white"
                  >
                    {commanderContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.callsign}) - {c.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-red-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Commander Name & Callsign</span>
                  <div className="font-black text-white text-sm mt-0.5 flex items-center gap-1.5">
                    <span>{selectedCommander.name}</span>
                    <span className="bg-red-900/80 text-red-300 border border-red-600 px-1.5 py-0.2 rounded font-mono text-[10px]">
                      {selectedCommander.callsign}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 block mt-0.5">{selectedCommander.role}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp Direct Contact</span>
                  <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{selectedCommander.phone}</span>
                  </div>
                  <span className="text-[11px] text-slate-300 block mt-0.5">
                    Vehicle: {selectedCommander.vehicle}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 2 DETAIL VIEW: ALL PERSONNEL MULTI-ROSTER */}
          {dispatchOption === 'ALL_PERSONNEL' && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Reaction Personnel Recipient Roster ({selectedPersonnelIds.length} Selected):</span>
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAllPersonnel}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                >
                  {selectedPersonnelIds.length === allPersonnelList.length ? 'Deselect All' : 'Select All Units'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {allPersonnelList.map((personnel) => {
                  const isSelected = selectedPersonnelIds.includes(personnel.id);
                  return (
                    <div
                      key={personnel.id}
                      onClick={() => togglePersonnelSelection(personnel.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 text-xs ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500/70 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePersonnelSelection(personnel.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{personnel.name}</span>
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-cyan-300 font-semibold">
                              {personnel.callsign}
                            </span>
                            {personnel.isCommander && (
                              <span className="text-[9px] bg-red-950 text-red-300 border border-red-600 px-1 rounded font-bold uppercase">
                                HOOF
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {personnel.vehicle || personnel.role} • <strong className="font-mono text-slate-300">{personnel.phone}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const waUrl = generateManualWhatsAppUrl(personnel.phone, previewMessage);
                            window.open(waUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition"
                          title="Open WhatsApp chat with this unit"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </button>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online for Duty" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DISPATCH CUSTOMIZATION & INCLUSIONS */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1">
                Add Tactical Notes / Instructions (Optional):
              </label>
              <textarea
                value={customTacticalNotes}
                onChange={(e) => setCustomTacticalNotes(e.target.value)}
                placeholder="e.g., 2 armed suspects fled on foot towards R503 gravel road; bring dog unit and medical kit..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Quick Inclusions Toggles */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIncludeGateCode(!includeGateCode)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium transition ${
                  includeGateCode
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Gate Code: {emergency.propertySnapshot?.mainGateCode || 'None'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeFamilyContacts(!includeFamilyContacts)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium transition ${
                  includeFamilyContacts
                    ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Family Numbers ({emergency.familySnapshot?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeLiveLocationTrail(!includeLiveLocationTrail)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium transition ${
                  includeLiveLocationTrail
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>1-Min GPS Trail</span>
              </button>
            </div>
          </div>

          {/* STRUCTURED WHATSAPP MESSAGE PREVIEW */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>WhatsApp Message Preview:</span>
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold transition"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl font-mono text-[11px] text-slate-300 max-h-44 overflow-y-auto whitespace-pre-wrap border border-slate-800 leading-relaxed shadow-inner">
              {previewMessage}
            </div>
          </div>

          {/* POST-DISPATCH RESULTS & 1-CLICK WHATSAPP LINKS */}
          {resultMessage && (
            <div
              className={`p-4 rounded-2xl border space-y-3 text-xs animate-in fade-in duration-200 ${
                dispatchSuccess
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
                  : 'bg-red-950/60 border-red-500/60 text-red-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {dispatchSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <span>{resultMessage}</span>
                </div>
              </div>

              {/* 1-Click WhatsApp links for dispatched records */}
              {dispatchedRecords.length > 0 && (
                <div className="pt-2 border-t border-emerald-500/30 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Launch WhatsApp Chat Links:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dispatchedRecords.map((rec, idx) => (
                      <a
                        key={idx}
                        href={generateManualWhatsAppUrl(rec.recipient, rec.content)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-md transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Chat with {rec.recipientName}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER CONTROLS */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-xs transition"
          >
            {t.common.close || 'Close'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
            </button>

            <button
              type="button"
              disabled={isTransmitting || (dispatchOption === 'ALL_PERSONNEL' && selectedPersonnelIds.length === 0)}
              onClick={handleExecuteDispatch}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition cursor-pointer ${
                isTransmitting || (dispatchOption === 'ALL_PERSONNEL' && selectedPersonnelIds.length === 0)
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              <Send className={`w-4 h-4 ${isTransmitting ? 'animate-spin' : ''}`} />
              <span>
                {isTransmitting
                  ? 'Transmitting Dispatch...'
                  : dispatchOption === 'COMMANDER'
                  ? 'Send to Reaction Commander'
                  : `Sent to all (${selectedPersonnelIds.length}) Personnel`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
