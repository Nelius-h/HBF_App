import React, { useState, useMemo } from 'react';
import {
  Send,
  MessageSquare,
  Radio,
  Phone,
  Users,
  Shield,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  AlertTriangle,
  Car,
  Bell,
  Search,
  Sparkles,
  QrCode,
  Smartphone,
  Info,
  Clock,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent, WhatsAppMessageRecord } from '../../types';
import { generateManualWhatsAppUrl } from '../../services/whatsappService';

interface QuickRecipient {
  id: string;
  name: string;
  role: string;
  phone: string;
  category: 'REACTION' | 'POLICE' | 'MEDICAL' | 'MANAGEMENT' | 'GROUP' | 'CLIENT';
  callsign?: string;
}

const DEFAULT_RECIPIENTS: QuickRecipient[] = [
  {
    id: 'REC-CMD',
    name: 'Cornelius Hattingh (Beheerkamer)',
    role: 'Beheerkamer Toetsnommer',
    phone: '+27823065808',
    category: 'MANAGEMENT',
    callsign: 'Beheerkamer Hoof',
  },
  {
    id: 'REC-ALFA1',
    name: 'test user1',
    role: 'Sektor 1 Rapid Response',
    phone: '',
    category: 'REACTION',
    callsign: 'Alfa-1',
  },
  {
    id: 'REC-BRAVO1',
    name: 'test user2',
    role: 'Sektor 2 Rapid Response',
    phone: '',
    category: 'REACTION',
    callsign: 'Bravo-1',
  },
  {
    id: 'REC-CHARLIE1',
    name: 'test user4',
    role: 'Sektor 3 Rapid Response',
    phone: '',
    category: 'REACTION',
    callsign: 'Charlie-1',
  },
  {
    id: 'REC-SAPS',
    name: 'Hartbeesfontein SAPS Station',
    role: 'Station Watch Commander',
    phone: '+27184310911',
    category: 'POLICE',
    callsign: 'SAPS Charge Office',
  },
  {
    id: 'REC-AMB',
    name: 'Klerksdorp Emergency EMS',
    role: 'Trauma & Ambulance Dispatch',
    phone: '+27184064600',
    category: 'MEDICAL',
    callsign: 'EMS Control',
  },
  {
    id: 'REC-MGMT',
    name: 'Cornelius Hattingh (Bestuur)',
    role: 'Control Room Director',
    phone: '+27823065808',
    category: 'MANAGEMENT',
    callsign: 'Command-1',
  },
];

export const ControlRoomWhatsAppWidget: React.FC<{
  activeEmergencies?: EmergencyEvent[];
}> = ({ activeEmergencies = [] }) => {
  const { currentUser, allUsers } = useAuth();
  const { emergencies, bolos, emergencyContacts, settings } = useData();

  // Widget collapse/expand state
  const [isExpanded, setIsExpanded] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  // Active Control Room WhatsApp Number
  const controlRoomNumber = settings.whatsAppConfig?.defaultReactionGroupNumber || '+27823065808';

  // Selection state
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('REC-CMD');
  const [customPhone, setCustomPhone] = useState('');
  const [customRecipientName, setCustomRecipientName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Message compose state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('PATROL_CHECK');
  const [messageContent, setMessageContent] = useState<string>(
    '📢 *HARTBEESFONTEIN BEHEERKAMER STATUSKONTROLE*\n\nAlle reaksiemag-eenhede en patrollievoertuie: Rapporteer asseblief julle huidige posisie (10-20), brandstofstatus en sektor-gereedheid.\n\n_Beheerkamer Operateur: ' +
      currentUser.name +
      ' ' +
      currentUser.surname +
      '_'
  );

  const [copied, setCopied] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [lastDispatchedInfo, setLastDispatchedInfo] = useState<{
    recipient: string;
    phone: string;
    timestamp: string;
    url: string;
  } | null>(null);

  // Build combined recipients list from static presets + live emergency contacts + registered users
  const recipientsList: QuickRecipient[] = useMemo(() => {
    const list = [...DEFAULT_RECIPIENTS];

    // Add extra reaction/police from emergencyContacts
    emergencyContacts.forEach((c) => {
      if (!list.some((existing) => existing.phone.replace(/\D/g, '') === c.phone.replace(/\D/g, ''))) {
        list.push({
          id: `CNT-${c.id}`,
          name: c.name,
          role: c.organisation || c.category,
          phone: c.phone,
          category:
            c.category === 'REACTION_FORCE'
              ? 'REACTION'
              : c.category === 'POLICE'
              ? 'POLICE'
              : c.category === 'AMBULANCE'
              ? 'MEDICAL'
              : 'MANAGEMENT',
        });
      }
    });

    return list;
  }, [emergencyContacts]);

  // Current active recipient details
  const activeRecipient = useMemo(() => {
    if (isCustomMode) {
      return {
        id: 'CUSTOM',
        name: customRecipientName || 'Custom Recipient',
        role: 'Direct Number',
        phone: customPhone,
        category: 'CLIENT' as const,
      };
    }
    return recipientsList.find((r) => r.id === selectedRecipientId) || recipientsList[0];
  }, [isCustomMode, customPhone, customRecipientName, selectedRecipientId, recipientsList]);

  // Recent transmission logs gathered from active emergencies
  const recentLogs = useMemo(() => {
    const logs: {
      id: string;
      emergencyId?: string;
      recipient: string;
      recipientName: string;
      content: string;
      timestamp: string;
      status: string;
    }[] = [];

    emergencies.forEach((emg) => {
      if (emg.whatsappLogs && emg.whatsappLogs.length > 0) {
        emg.whatsappLogs.forEach((log) => {
          logs.push({
            id: log.id,
            emergencyId: emg.id,
            recipient: log.recipient,
            recipientName: log.recipientName || log.recipient,
            content: log.content,
            timestamp: log.requestedTimestamp,
            status: log.sendStatus || 'SENT',
          });
        });
      }
    });

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 4);
  }, [emergencies]);

  // Preset Template Switcher
  const handleSelectTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const opName = `${currentUser.name} ${currentUser.surname}`;

    switch (templateKey) {
      case 'PATROL_CHECK':
        setMessageContent(
          `📢 *HARTBEESFONTEIN BEHEERKAMER STATUSKONTROLE*\n\nAlle reaksiemag-eenhede en patrollievoertuie: Rapporteer asseblief julle huidige posisie (10-20), brandstofstatus en sektor-gereedheid.\n\n_Beheerkamer Operateur: ${opName}_`
        );
        break;

      case 'EMERGENCY_ALERT':
        if (activeEmergencies.length > 0) {
          const emg = activeEmergencies[0];
          const lat = emg.location?.latitude ?? -26.7641;
          const lng = emg.location?.longitude ?? 26.4132;
          const gateCode = emg.propertySnapshot?.mainGateCode || 'Geen';
          setMessageContent(
            `🚨 *HARTBEESFONTEIN NOODREAKSIE KENNISGEWING* 🚨\n\n*Tipe:* ${emg.emergencyType}\n*Lid:* ${emg.clientName} (${emg.farmName})\n*Foon:* ${emg.clientPhone}\n*Hekkode:* ${gateCode}\n*GPS:* ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}\n*Google Maps:* https://www.google.com/maps/search/?api=1&query=${lat},${lng}\n\n_Dringend: Reageer asseblief onmiddellik!_`
          );
        } else {
          setMessageContent(
            `🚨 *HARTBEESFONTEIN NOODREAKSIE KENNISGEWING* 🚨\n\n*Tipe:* Prioriteit Noodgeval\n*Status:* Aktiewe Reaksie Vereis\n*GPS:* -26.764100, 26.413200\n\n_Alle eenhede gereed vir uitstuur._`
          );
        }
        break;

      case 'BOLO_ALERT':
        const activeBolo = bolos.find((b) => b.status === 'active');
        if (activeBolo) {
          setMessageContent(
            `📢 *HARTBEESFONTEIN BOLO WAARSKUWING* 📢\n\n*BOLO Verwysing:* #${activeBolo.boloNumber || activeBolo.id}\n*Titel:* ${activeBolo.title}\n*Rede:* ${activeBolo.reason}\n${
              activeBolo.vehicleInfo?.licensePlate
                ? `*Registrasie:* ${activeBolo.vehicleInfo.licensePlate}\n`
                : ''
            }${
              activeBolo.vehicleInfo?.make
                ? `*Voertuig:* ${activeBolo.vehicleInfo.make} ${activeBolo.vehicleInfo.model || ''} (${activeBolo.vehicleInfo.color || ''})\n`
                : ''
            }*Beskrywing:* ${activeBolo.description}\n*Rigting van beweging:* ${activeBolo.directionOfTravel || 'Onbekend'}\n\n_Wees asseblief op die uitkyk en rapporteer enige visuele kontak dadelik._`
          );
        } else {
          setMessageContent(
            `📢 *HARTBEESFONTEIN BOLO / UITKYK WAARSKUWING* 📢\n\n*Kategorie:* Verdagte Voertuig / Persone\n*Beskrywing:* Wit Toyota Hilux dubbelkajuit sonder agterste nommerplaat gesien naby R503 afdraai.\n\n_Rapporteer enige waarneming dadelik aan Beheerkamer._`
          );
        }
        break;

      case 'VELD_FIRE':
        setMessageContent(
          `🔥 *HARTBEESFONTEIN BRANDWAARSKUWING / VELD FIRE NOTICE* 🔥\n\nVeldbrand aangemeld in Sektor 2 (naby Hartbeesfontein Oos grens).\n• Brandspanne en bakkiesak-eenhede wees asseblief op bystand.\n• Let op sterk noordoostelike winde.\n\n_Beheerkamer Operateur: ${opName}_`
        );
        break;

      case 'ALL_CLEAR':
        setMessageContent(
          `✅ *HARTBEESFONTEIN BEHEERKAMER: ALLES VEILIG / ALL CLEAR* ✅\n\nDie vorige noodgeval/situasie is suksesvol afgehandel en veilig verklaar.\nAlle eenhede kan terugkeer na normale patrollieroetes.\n\n_Dankie aan alle reaksiepersoneel vir vinnige optrede._`
        );
        break;

      case 'CUSTOM':
      default:
        setMessageContent('');
        break;
    }
  };

  // Launch WhatsApp Web or Direct App
  const handleSendWhatsApp = () => {
    const targetPhone = activeRecipient.phone.replace(/\D/g, '');
    if (!targetPhone) {
      alert('Voer asseblief \'n geldige selfoonnommer in.');
      return;
    }

    setTransmitting(true);
    const waUrl = generateManualWhatsAppUrl(activeRecipient.phone, messageContent);

    // Auto copy text
    try {
      navigator.clipboard.writeText(messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }

    // Open WhatsApp Web/App
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setLastDispatchedInfo({
      recipient: activeRecipient.name,
      phone: activeRecipient.phone,
      timestamp: new Date().toLocaleTimeString('en-ZA'),
      url: waUrl,
    });

    setTransmitting(false);
  };

  // Open Direct WhatsApp Web Home
  const handleOpenWhatsAppWeb = () => {
    window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 text-white">
      {/* 1. HEADER & CONTROL ROOM WHATSAPP STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                <span>Control Room WhatsApp Live Hub</span>
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected & Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Official Dispatch Line: <strong className="text-emerald-400 font-mono">{controlRoomNumber}</strong> • 24/7 Multi-Channel Responder Link
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenWhatsAppWeb}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            title="Launch WhatsApp Web in separate tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open WhatsApp Web</span>
          </button>

          <button
            onClick={() => setShowQrModal(!showQrModal)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Scan QR Code / Pair Device"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pair Device</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            title={isExpanded ? 'Collapse Hub' : 'Expand Hub'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. QR CODE / MULTI-DEVICE PAIRING MODAL */}
      {showQrModal && (
        <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Control Room WhatsApp Multi-Device Setup</span>
            </span>
            <button
              onClick={() => setShowQrModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-300">
            To link the Control Room desktop console with the official Hartbeesfontein 24/7 WhatsApp phone:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 pl-1">
            <li>Open WhatsApp on the Control Room cell phone (<strong className="text-white">{controlRoomNumber}</strong>).</li>
            <li>Tap <strong className="text-white">Settings</strong> &gt; <strong className="text-white">Linked Devices</strong> &gt; <strong className="text-white">Link a Device</strong>.</li>
            <li>Click <strong className="text-emerald-400">"Open WhatsApp Web"</strong> above and scan the on-screen QR code.</li>
          </ol>
        </div>
      )}

      {/* 3. MAIN EXPANDED LIVE COMMUNICATIONS WORKSPACE */}
      {isExpanded && (
        <div className="space-y-4 pt-1">
          {/* Quick Preset Template Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Presets:</span>
            </span>

            <button
              type="button"
              onClick={() => handleSelectTemplate('PATROL_CHECK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTemplate === 'PATROL_CHECK'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Radio className="w-3 h-3 text-cyan-300" />
              <span>Patrol Check-In</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate('EMERGENCY_ALERT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTemplate === 'EMERGENCY_ALERT'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>SOS Dispatch</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate('BOLO_ALERT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTemplate === 'BOLO_ALERT'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Car className="w-3 h-3 text-purple-300" />
              <span>BOLO Lookout</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate('VELD_FIRE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTemplate === 'VELD_FIRE'
                  ? 'bg-amber-600 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Veld Fire Warning</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate('ALL_CLEAR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTemplate === 'ALL_CLEAR'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>All Clear Notice</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate('CUSTOM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTemplate === 'CUSTOM'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <span>Custom Text</span>
            </button>
          </div>

          {/* Two-column layout: Left = Recipient Picker & Message Composer; Right = Quick Roster & Recent Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT: Composer & Dispatch */}
            <div className="lg:col-span-7 space-y-3">
              {/* Recipient Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Target Recipient / Unit:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className="text-[11px] text-emerald-400 hover:underline font-semibold"
                  >
                    {isCustomMode ? '← Pick from Roster' : '+ Enter Custom Number'}
                  </button>
                </div>

                {isCustomMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Recipient Name (e.g. Johan Landbouer)"
                      value={customRecipientName}
                      onChange={(e) => setCustomRecipientName(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Cell Number (e.g. +27 82 123 4567)"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <optgroup label="🚨 Reaction Units & Commanders">
                      {recipientsList
                        .filter((r) => r.category === 'REACTION')
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.role} ({r.phone})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🚓 Emergency Services & SAPS">
                      {recipientsList
                        .filter((r) => r.category === 'POLICE' || r.category === 'MEDICAL')
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.role} ({r.phone})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🛡️ Management & Other Contacts">
                      {recipientsList
                        .filter((r) => r.category === 'MANAGEMENT' || r.category === 'CLIENT')
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.role} ({r.phone})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                )}
              </div>

              {/* Message Composer Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Message Payload:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(messageContent);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type WhatsApp message here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
                />
              </div>

              {/* Dispatch Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-slate-400">
                  Target: <strong className="text-white">{activeRecipient.name}</strong> •{' '}
                  <span className="font-mono text-emerald-400">{activeRecipient.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const waUrl = generateManualWhatsAppUrl(activeRecipient.phone, messageContent);
                      window.open(waUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Direct Web Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Direct Web Link</span>
                  </button>

                  <button
                    type="button"
                    disabled={transmitting || !messageContent.trim()}
                    onClick={handleSendWhatsApp}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{transmitting ? 'Transmitting...' : 'Send WhatsApp Message'}</span>
                  </button>
                </div>
              </div>

              {/* Transmission Confirmation Banner */}
              {lastDispatchedInfo && (
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-white">Dispatched to {lastDispatchedInfo.recipient}</span>
                      <span className="text-slate-400 block text-[10px]">
                        At {lastDispatchedInfo.timestamp} • Phone: {lastDispatchedInfo.phone}
                      </span>
                    </div>
                  </div>
                  <a
                    href={lastDispatchedInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>Re-Open Chat</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>

            {/* RIGHT: Quick Unit Roster & Recent Transmission Log */}
            <div className="lg:col-span-5 space-y-3">
              {/* Quick Unit Roster */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Responder Roster</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">1-Click Chat</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {DEFAULT_RECIPIENTS.slice(0, 5).map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => {
                        setSelectedRecipientId(unit.id);
                        setIsCustomMode(false);
                      }}
                      className={`p-2 rounded-xl flex items-center justify-between gap-2 text-xs transition cursor-pointer ${
                        selectedRecipientId === unit.id && !isCustomMode
                          ? 'bg-emerald-950/80 border border-emerald-500/60 text-white'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold text-white text-[11px] truncate">{unit.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{unit.role}</div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const waUrl = generateManualWhatsAppUrl(unit.phone, messageContent);
                            window.open(waUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow"
                          title="Open WhatsApp Chat"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent WhatsApp Dispatches */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recent Dispatches</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Live Audit</span>
                </div>

                {recentLogs.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No recent WhatsApp transmissions logged in current session.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentLogs.map((log, idx) => (
                      <div
                        key={`${log.id || 'log'}-${idx}-${log.timestamp || ''}`}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 truncate max-w-[150px]">
                            {log.recipientName}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">
                            {log.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] line-clamp-1 font-mono">
                          {log.content.replace(/\*/g, '').replace(/_/g, '')}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-slate-500" />
                            <span>{new Date(log.timestamp).toLocaleDateString('en-ZA')} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                          <a
                            href={generateManualWhatsAppUrl(log.recipient, log.content)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
