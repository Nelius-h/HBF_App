import React, { useState } from 'react';
import {
  Radio,
  Navigation,
  MessageSquare,
  Phone,
  Send,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Plus,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  EmergencyEvent,
  ReactionForceMethod,
  ReactionForceStatus,
} from '../../types';
import { LiveAudioConsole } from '../common/LiveAudioConsole';
import { LiveLocationMapTracker } from '../common/LiveLocationMapTracker';
import { EmergencyMessageChannel } from '../common/EmergencyMessageChannel';

interface LiveCommunicationsPanelProps {
  emergency: EmergencyEvent;
}

export const LiveCommunicationsPanel: React.FC<LiveCommunicationsPanelProps> = ({
  emergency,
}) => {
  const { currentUser, activeRole } = useAuth();
  const {
    recordReactionForceContact,
    callClientDirect,
    emergencyContacts,
    settings,
    sendEmergencyMessage,
  } = useData();

  // Active sub-view within communications panel
  const [activeCommSection, setActiveCommSection] = useState<'AUDIO_LOCATION' | 'MESSAGES' | 'REACTION_CONTACTS'>('AUDIO_LOCATION');

  // Reaction force contact logging modal/state
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactMethod, setContactMethod] = useState<ReactionForceMethod>('WHATSAPP');
  const [contactStatus, setContactStatus] = useState<ReactionForceStatus>('RESPONDING');
  const [contactNotes, setContactNotes] = useState('');
  const [isLoggingContact, setIsLoggingContact] = useState(false);

  // Filter reaction force & emergency responder contacts
  const reactionContacts = emergencyContacts.filter(
    (c) => c.category === 'REACTION_FORCE' || c.category === 'POLICE' || c.category === 'AMBULANCE' || c.category === 'FIRE'
  );

  const handleLogContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = emergencyContacts.find((c) => c.id === selectedContactId);
    const targetName = contact ? contact.name : 'Reaction Responder';
    const targetPhone = contact ? contact.phone : settings.reactionForceContact;

    recordReactionForceContact(emergency.id, {
      contactId: selectedContactId || 'CNT-MANUAL',
      contactName: targetName,
      targetPhone,
      method: contactMethod,
      status: contactStatus,
      notes: contactNotes,
    });

    setIsLoggingContact(false);
    setContactNotes('');
  };

  const handleQuickClientCall = () => {
    callClientDirect(emergency.id, emergency.clientPhone, emergency.clientName);
  };

  const handleQuickInstruction = async (text: string) => {
    await sendEmergencyMessage(emergency.id, {
      text,
      messageType: 'CUSTOM_TEXT',
      isSilentMode: false,
    });
  };

  return (
    <div className="space-y-4">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveCommSection('AUDIO_LOCATION')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition ${
            activeCommSection === 'AUDIO_LOCATION'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Audio &amp; Location Map</span>
        </button>

        <button
          onClick={() => setActiveCommSection('MESSAGES')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition ${
            activeCommSection === 'MESSAGES'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Messaging &amp; Silent Feed ({(emergency.messages || []).length})</span>
        </button>

        <button
          onClick={() => setActiveCommSection('REACTION_CONTACTS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition ${
            activeCommSection === 'REACTION_CONTACTS'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Reaction Force Log ({(emergency.reactionForceContactLogs || []).length})</span>
        </button>
      </div>

      {/* SECTION 1: LIVE AUDIO & LOCATION */}
      {activeCommSection === 'AUDIO_LOCATION' && (
        <div className="space-y-4">
          <LiveAudioConsole emergency={emergency} isClientView={false} />
          <LiveLocationMapTracker emergency={emergency} isClientView={false} />

          {/* Quick Direct Client Phone Call Bar */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Direct Voice Contact with Client</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Client: {emergency.clientName} • Phone: {emergency.clientPhone}
              </p>
            </div>

            <a
              href={`tel:${emergency.clientPhone.replace(/[^0-9+]/g, '')}`}
              onClick={handleQuickClientCall}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Client Directly</span>
            </a>
          </div>
        </div>
      )}

      {/* SECTION 2: MESSAGING & SILENT FEED */}
      {activeCommSection === 'MESSAGES' && (
        <div className="space-y-4">
          <EmergencyMessageChannel emergency={emergency} isClientView={false} />

          {/* Quick Operator Directives */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Quick Safety Directives to Client:
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handleQuickInstruction('Reaction force dispatched. Stay locked inside safe room.')
                }
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-200 rounded-xl text-xs border border-slate-700"
              >
                🔒 Stay in Safe Room
              </button>
              <button
                onClick={() =>
                  handleQuickInstruction('Keep phone silent. Do not switch on lights.')
                }
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-200 rounded-xl text-xs border border-slate-700"
              >
                🔇 Keep Phone Silent
              </button>
              <button
                onClick={() =>
                  handleQuickInstruction('SAPS & Reaction vehicle arriving at main farm gate in ~5 mins.')
                }
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-200 rounded-xl text-xs border border-slate-700"
              >
                🚓 Vehicle Arriving at Gate
              </button>
              <button
                onClick={() =>
                  handleQuickInstruction('Standby. All clear confirmed by patrol.')
                }
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-200 rounded-xl text-xs border border-slate-700"
              >
                ✅ Standby for All Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: REACTION FORCE LOG */}
      {activeCommSection === 'REACTION_CONTACTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              Reaction Force &amp; Responder Outreach Log
            </h3>
            <button
              onClick={() => setIsLoggingContact(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Contact Attempt</span>
            </button>
          </div>

          {/* Contact attempts list */}
          {(emergency.reactionForceContactLogs || []).length === 0 ? (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                No external contact records logged yet for this emergency.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {emergency.reactionForceContactLogs?.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.contactName}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {log.targetPhone}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        log.status === 'RESPONDING'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : log.status === 'SENT' || log.status === 'DELIVERED'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : log.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Method: <strong>{log.method}</strong> • Logged by {log.actorName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-slate-500" />
                      <span>{new Date(log.timestamp).toLocaleDateString('en-ZA')} {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}</span>
                    </span>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      &quot;{log.notes}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick Reaction Contacts Call Sheet */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Emergency Directory Quick Call:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reactionContacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.category} • {c.phone}</span>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG REACTION CONTACT */}
      {isLoggingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleLogContactSubmit}
            className="bg-slate-900 border border-blue-500/50 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-blue-300 text-sm">Log Reaction Force / External Contact</h3>
              <button
                type="button"
                onClick={() => setIsLoggingContact(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Contact:</label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="">Default Reaction Head ({settings.reactionForceContact})</option>
                {reactionContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category}) - {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Method:</label>
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value as ReactionForceMethod)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="WHATSAPP">WhatsApp Alert</option>
                  <option value="PHONE">Direct Phone Call</option>
                  <option value="INTERNAL">Internal App Channel</option>
                  <option value="OTHER">Other / Two-Way Radio</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Status:</label>
                <select
                  value={contactStatus}
                  onChange={(e) => setContactStatus(e.target.value as ReactionForceStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="INITIATED">Initiated</option>
                  <option value="SENT">Sent</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="RESPONDING">Responding</option>
                  <option value="FAILED">Failed</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            </div>


            <div>
              <label className="block text-slate-300 font-semibold mb-1">Notes / ETA / Vehicle Info:</label>
              <textarea
                rows={2}
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="e.g. Kobus en route with 2 armed guards, ETA 8 mins via R503..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsLoggingContact(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
              >
                Save Contact Log
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
