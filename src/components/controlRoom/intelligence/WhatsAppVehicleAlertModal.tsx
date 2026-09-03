import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Car,
  MapPin,
  ExternalLink,
  Users,
  X,
  Phone,
  Copy,
  Radio,
} from 'lucide-react';
import { VehicleOfInterest } from '../../../types';
import { useData } from '../../../context/DataContext';
import {
  sendVehicleFlaggedWhatsAppAlert,
  formatVehicleFlaggedWhatsAppMessage,
} from '../../../services/whatsappService';

interface WhatsAppVehicleAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleOfInterest;
}

export const WhatsAppVehicleAlertModal: React.FC<WhatsAppVehicleAlertModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const { settings, cameras } = useData();

  const defaultRecipients = [
    { id: 'REC-1', name: 'Hartbeesfontein Beheerkamer & Reaksiemag', phone: '+27 82 306 5808', role: 'Beheerkamer Toetsnommer', selected: true },
    { id: 'REC-2', name: 'Cornelius Hattingh (Beheerkamer)', phone: '+27 82 306 5808', role: 'Security Manager / Beheerkamer', selected: true },
    { id: 'REC-3', name: 'Sektor 1 & 2 Plaaswag Operasioneel', phone: '+27 83 555 9012', role: 'Farm Watch Broadcast', selected: false },
    { id: 'REC-4', name: 'SAPS Hartbeesfontein Vispol', phone: '+27 18 432 1000', role: 'Police Dispatch', selected: false },
  ];

  const [recipients, setRecipients] = useState(defaultRecipients);
  const [threatLevel, setThreatLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [flagReason, setFlagReason] = useState(
    vehicle.status === 'STOLEN'
      ? 'Gesteelde voertuig gemerk op LPR kamerasisteem - SAPS CAS saak geopen'
      : 'Verdagte bakkie besig met verkenning langs plase - Moontlik gekoppel aan veediefstal sindikaat'
  );
  const [detectedLocation, setDetectedLocation] = useState(
    vehicle.lastSeen || 'R503 Klerksdorp / Hartbeesfontein korridor'
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || '');
  const [directionOfTravel, setDirectionOfTravel] = useState('Oos in rigting van Ottosdal / R507');
  const [operatorNotes, setOperatorNotes] = useState(
    vehicle.notes || 'Moenie voertuig konfronteer nie. Monitor op veilige afstand en koördineer met beheerkamer.'
  );

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [dispatchedCount, setDispatchedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const chosenCam = cameras.find((c) => c.id === selectedCameraId);

  const payload = {
    registration: vehicle.registration,
    make: vehicle.make,
    model: vehicle.model,
    colour: vehicle.colour,
    status: vehicle.status,
    flagReason,
    threatLevel,
    detectedLocation,
    cameraCode: chosenCam?.code || 'CAM-H44',
    cameraName: chosenCam?.name || 'Lapfontein ALPR',
    directionOfTravel,
    timestamp: new Date().toISOString(),
    operatorNotes,
    distinguishingMarks: vehicle.distinguishingMarks || vehicle.damage || vehicle.canopyOrAccessories,
    coordinates: chosenCam ? { latitude: chosenCam.latitude, longitude: chosenCam.longitude } : undefined,
  };

  const previewMessage = formatVehicleFlaggedWhatsAppMessage(payload, {
    recipientName: 'Wagspan / Reaksiemag',
    language: 'AFRIKAANS',
  });

  const handleToggleRecipient = (id: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsAppAlerts = async () => {
    const selectedList = recipients.filter((r) => r.selected);
    if (selectedList.length === 0) return;

    setIsSending(true);
    let count = 0;

    for (const r of selectedList) {
      await sendVehicleFlaggedWhatsAppAlert(
        payload,
        r.phone,
        r.name,
        settings.whatsAppConfig
      );
      count++;
    }

    setDispatchedCount(count);
    setIsSending(false);
    setSendSuccess(true);
  };

  const primaryRecipient = recipients.find((r) => r.selected) || recipients[0];
  const webWhatsAppUrl = `https://wa.me/${primaryRecipient.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(previewMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Stuur Voertuig WhatsApp Waarskuwing
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {vehicle.registration}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Outomatiese kennisgewing aan Reaksiemag, Beheerkamer en Plaaswagte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {sendSuccess ? (
            <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">WhatsApp Kennisgewings Suksesvol Gestuur!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Waarskuwing vir <strong>{vehicle.registration}</strong> is outomaties aan {dispatchedCount} gekose ontvangskanale uitgestuur.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={webWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Maak Oop in WhatsApp Web</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition"
                >
                  Voltooi
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Alert Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Dreigingsvlak:</label>
                  <select
                    value={threatLevel}
                    onChange={(e) => setThreatLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  >
                    <option value="CRITICAL">🚨 KRITIES (Gewapend / Veediefstal op heterdaad)</option>
                    <option value="HIGH">⚠️ HOOG (Bevestigde Gevlagde Bakkie)</option>
                    <option value="MEDIUM">⚡ MEDIUM (Verdagte Beweging)</option>
                    <option value="LOW">ℹ️ LAAG (Inligtingskennisgewing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Gekoppelde LPR Kamera / Paal:</label>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name} ({c.sector})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Ligging Opgemerk:</label>
                  <input
                    type="text"
                    value={detectedLocation}
                    onChange={(e) => setDetectedLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bewegingsrigting:</label>
                  <input
                    type="text"
                    value={directionOfTravel}
                    onChange={(e) => setDirectionOfTravel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rede vir Vlag / Waarskuwing:</label>
                <input
                  type="text"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Beheerkamer Notas & Taktiese Instruksies:</label>
                <textarea
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white min-h-[50px]"
                />
              </div>

              {/* Recipients Selection */}
              <div>
                <label className="block text-slate-400 mb-2 font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Ontvangers & Uitsaai Groepe:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipients.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleToggleRecipient(rec.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                        rec.selected
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rec.selected}
                          onChange={() => {}}
                          className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                        />
                        <div>
                          <div className="font-semibold text-xs text-slate-200">{rec.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rec.phone} • {rec.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Boodskap Voorskou (WhatsApp Format):
                  </span>
                  <button
                    onClick={handleCopyMessage}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Gekopieer!' : 'Kopieer Teks'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                  {previewMessage}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!sendSuccess && (
          <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
            <a
              href={webWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Maak Oop in WhatsApp</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs transition"
              >
                Kanselleer
              </button>
              <button
                type="button"
                onClick={handleSendWhatsAppAlerts}
                disabled={isSending || recipients.filter((r) => r.selected).length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                {isSending ? 'Stuur tans...' : `Stuur WhatsApp Waarskuwing (${recipients.filter((r) => r.selected).length})`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
