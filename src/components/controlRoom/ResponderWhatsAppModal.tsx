import React, { useState } from 'react';
import {
  X,
  Send,
  Phone,
  Shield,
  Radio,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Car,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { generateManualWhatsAppUrl } from '../../services/whatsappService';

export interface ResponderWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  responder: {
    id: string;
    name: string;
    callsign: string;
    role?: string;
    phone: string;
    vehicle?: string;
    radioChannel?: string;
    status?: string;
    lat?: number;
    lng?: number;
  };
}

const PRESET_MESSAGES = [
  {
    title: 'Status & SITREP Check',
    text: (callsign: string) =>
      `🚨 *HARTBEESFONTEIN BEHEERKAMER*\n\nOps Beheerkamer aan *${callsign}*: Doen asb 'n status- en liggingsverslag (SITREP). Is alle stelsels aktief en sektor veilig?`,
  },
  {
    title: 'Patrol Redirect Request',
    text: (callsign: string) =>
      `⚠️ *TAKTIESE RIGTINGVERANDERING*\n\nBeheerkamer aan *${callsign}*: Beweeg asb in die rigting van die R503 / Sektor kruising vir verhoogde sigbaarheid en waaksaamheid. Rapporteer sodra ter plaatse.`,
  },
  {
    title: 'Radio Channel Alignment',
    text: (callsign: string, channel?: string) =>
      `📻 *RADIO KANAAL KONTROLE*\n\nBeheerkamer aan *${callsign}*: Bevestig asb dat u radio ingestel is op *${channel || 'CH 01 Ops Prime'}*. Skakel asb beheerkamer as sein swak is.`,
  },
  {
    title: 'Standby / High-Alert Notice',
    text: (callsign: string) =>
      `🛡️ *HOË GEREEDHEID WAARSKUWING*\n\nBeheerkamer aan *${callsign}*: Plaas asb u eenheid op hoë gereedheid (Standby). Rapporteer enige verdagte voertuie of beweging dadelik.`,
  },
];

export const ResponderWhatsAppModal: React.FC<ResponderWhatsAppModalProps> = ({
  isOpen,
  onClose,
  responder,
}) => {
  const defaultText = `🚨 *HARTBEESFONTEIN BEHEERKAMER BERICHT*\n\nBeheerkamer aan *${responder.callsign}* (${responder.name}):\n\n`;
  const [message, setMessage] = useState(defaultText);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawPhone = responder.phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? `27${cleanPhone.slice(1)}`
    : cleanPhone.startsWith('27')
    ? cleanPhone
    : cleanPhone
    ? `27${cleanPhone}`
    : '27820000000';

  const waUrl = generateManualWhatsAppUrl(formattedPhone, message);

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{responder.callsign}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  {responder.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {responder.name} • <span className="text-emerald-400 font-mono">{responder.phone}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Unit Details Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Vehicle</span>
              <span className="font-medium text-white flex items-center gap-1 mt-0.5">
                <Car className="w-3 h-3 text-slate-400" />
                {responder.vehicle || 'Patrol Unit'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Radio Channel</span>
              <span className="font-medium text-cyan-300 flex items-center gap-1 mt-0.5">
                <Radio className="w-3 h-3 text-cyan-400" />
                {responder.radioChannel || 'CH 01 Ops Prime'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Role</span>
              <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                {responder.role || 'Reaction Member'}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Dispatch Presets:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_MESSAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(preset.text(responder.callsign, responder.radioChannel))}
                  className="p-2 text-left rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 hover:border-emerald-500/50 transition text-[11px] font-medium"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Message TextArea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 text-xs font-semibold">
                WhatsApp Dispatch Message:
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white text-xs font-mono outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <a
            href={`tel:${responder.phone}`}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Call: {responder.phone}</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
