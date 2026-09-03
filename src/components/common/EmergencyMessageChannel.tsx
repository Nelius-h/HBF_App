import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  VolumeX,
  Shield,
  Check,
  CheckCheck,
  Clock,
  Camera,
  AlertTriangle,
  Flame,
  HeartPulse,
  Crosshair,
  UserCheck,
  Home,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent, EmergencyMessageRecord, QuickMessageTag } from '../../types';

interface EmergencyMessageChannelProps {
  emergency: EmergencyEvent;
  isClientView?: boolean;
}

const QUICK_TAGS: {
  tag: QuickMessageTag;
  labelEn: string;
  labelAf: string;
  icon: React.ElementType;
  colorClass: string;
}[] = [
  {
    tag: 'SUSPECT_NEARBY',
    labelEn: 'Intruders / Suspects Nearby',
    labelAf: 'Inbrekers / Verdagtes Naby',
    icon: Home,
    colorClass: 'bg-red-950/80 border-red-500/60 text-red-200 hover:bg-red-900',
  },
  {
    tag: 'IN_DANGER',
    labelEn: 'Immediate Danger / Send Help',
    labelAf: 'Onmiddellike Gevaar / Stuur Hulp',
    icon: AlertTriangle,
    colorClass: 'bg-red-900 border-red-400 text-white font-black hover:bg-red-800',
  },
  {
    tag: 'HIDING',
    labelEn: 'Family Hiding / In Safe Room',
    labelAf: 'Gesin Skuil / In Kluis',
    icon: Shield,
    colorClass: 'bg-purple-950/80 border-purple-500/60 text-purple-200 hover:bg-purple-900',
  },
  {
    tag: 'CANT_SPEAK',
    labelEn: "I Can't Speak / Silent",
    labelAf: 'Kan Nie Praat Nie / Stilte',
    icon: VolumeX,
    colorClass: 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 hover:bg-indigo-900',
  },
  {
    tag: 'FIRE_SPREADING',
    labelEn: 'Fire Spreading / Trapped',
    labelAf: 'Brand Versprei / Vasgekeer',
    icon: Flame,
    colorClass: 'bg-orange-950/80 border-orange-500/60 text-orange-200 hover:bg-orange-900',
  },
  {
    tag: 'NEED_MEDICAL',
    labelEn: 'Medical Urgent / Need Ambulance',
    labelAf: 'Medies Dringend / Ambulans Nodig',
    icon: HeartPulse,
    colorClass: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900',
  },
  {
    tag: 'SUSPECT_LEFT',
    labelEn: 'Suspects Left / Vehicle Leaving',
    labelAf: 'Verdagtes Weg / Voertuig Ry Weg',
    icon: Compass,
    colorClass: 'bg-amber-950/80 border-amber-500/60 text-amber-200 hover:bg-amber-900',
  },
];

export const EmergencyMessageChannel: React.FC<EmergencyMessageChannelProps> = ({
  emergency,
  isClientView = false,
}) => {
  const { currentUser, activeRole } = useAuth();
  const { sendEmergencyMessage } = useData();

  const [messageInput, setMessageInput] = useState('');
  const [isSilentMode, setIsSilentMode] = useState(isClientView);
  const [isSending, setIsSending] = useState(false);

  const messages = emergency.messages || [];

  const handleSendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsSending(true);
    await sendEmergencyMessage(emergency.id, {
      text: messageInput.trim(),
      messageType: isClientView ? 'CUSTOM_TEXT' : 'OPERATIONAL_INSTRUCTION',
      isSilentMode,
    });
    setMessageInput('');
    setIsSending(false);
  };

  const handleSendQuickTag = async (tagItem: typeof QUICK_TAGS[0]) => {
    await sendEmergencyMessage(emergency.id, {
      text: `${tagItem.labelEn} (${tagItem.labelAf})`,
      messageType: 'QUICK_TEXT',
      quickTag: tagItem.tag,
      isSilentMode: true,
    });
  };


  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header & Silent mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Dispatch Communications
              </h3>
              {isSilentMode && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <VolumeX className="w-3 h-3" />
                  <span>Silent Mode</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Instant priority channel between Client & Control Room
            </p>
          </div>
        </div>

        {isClientView && (
          <button
            onClick={() => setIsSilentMode(!isSilentMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isSilentMode
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>{isSilentMode ? "Can't Speak (Silent)" : 'Normal'}</span>
          </button>
        )}
      </div>

      {/* QUICK EMERGENCY PRESET BUTTONS (Silent / Can't speak mode) */}
      {isClientView && (
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              One-Tap Silent Emergency Updates:
            </span>
            <span className="text-[10px] text-slate-400">Transmits quietly to dispatch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_TAGS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.tag}
                  onClick={() => handleSendQuickTag(item)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition text-left shadow-sm ${item.colorClass}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="leading-tight">
                    <span className="block font-bold">{item.labelEn}</span>
                    <span className="text-[10px] opacity-75 font-normal">{item.labelAf}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MESSAGE FEED */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/60 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400">
              No direct messages yet. Send updates, suspect descriptions or instructions here.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderUid === currentUser.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs space-y-1 ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                    <span className="font-bold">
                      {msg.senderName} ({msg.senderRole})
                    </span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="font-medium whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Delivery Status Indicator */}
                  <div className="flex items-center justify-end gap-1 text-[9px] opacity-75 pt-0.5">
                    {msg.deliveryStatus === 'OPENED' ? (
                      <>
                        <CheckCheck className="w-3 h-3 text-emerald-300" />
                        <span>Read</span>
                      </>
                    ) : msg.deliveryStatus === 'DELIVERED_TO_DEVICE' ? (
                      <>
                        <CheckCheck className="w-3 h-3 text-slate-200" />
                        <span>Delivered</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-slate-300" />
                        <span>Sent</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleSendCustomText} className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={
            isClientView
              ? "Type quiet update or details here..."
              : "Type instructions to client..."
          }
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={!messageInput.trim() || isSending}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg transition flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
