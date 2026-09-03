import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Car,
  User,
  MapPin,
  Clock,
  Send,
  AlertOctagon,
  Eye,
  FileText,
  ShieldCheck,
  HelpCircle,
  Navigation,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BoloRecord, BoloTargetType, BoloDistribution, BoloStatus, BoloSighting } from '../../types';

export const BoloManagement: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const { bolos, createBolo, updateBoloStatus, boloSightings, verifyBoloSighting } = useData();

  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBoloId, setExpandedBoloId] = useState<string | null>(null);

  // Verification notes input state
  const [verifyingSightingId, setVerifyingSightingId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Form State
  const [targetType, setTargetType] = useState<BoloTargetType>('vehicle');
  const [distribution, setDistribution] = useState<BoloDistribution>('all_clients');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [lastKnownLocation, setLastKnownLocation] = useState('');
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState(
    new Date().toISOString().substring(0, 16)
  );

  // Vehicle sub-fields
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehColor, setVehColor] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehFeatures, setVehFeatures] = useState('');

  // Person sub-fields
  const [personAliases, setPersonAliases] = useState('');
  const [personAge, setPersonAge] = useState('');
  const [personDesc, setPersonDesc] = useState('');

  const filteredBolos = bolos.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (
      searchQuery &&
      !b.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.boloNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateBolo = async (e: React.FormEvent) => {
    e.preventDefault();

    await createBolo({
      title,
      reason,
      description,
      targetType,
      distribution,
      lastKnownLocation,
      lastSeenTimestamp: new Date(lastSeenTimestamp).toISOString(),
      photos: [],
      status: 'active',
      vehicleInfo:
        targetType === 'vehicle'
          ? {
              make: vehMake,
              model: vehModel,
              color: vehColor,
              licensePlate: vehPlate,
              distinguishingFeatures: vehFeatures,
            }
          : undefined,
      personInfo:
        targetType === 'person'
          ? {
              nameAliases: personAliases,
              approximateAge: personAge,
              physicalDescription: personDesc,
            }
          : undefined,
    });

    setIsCreating(false);
    setTitle('');
    setReason('');
    setDescription('');
    setLastKnownLocation('');
    setVehMake('');
    setVehModel('');
    setVehColor('');
    setVehPlate('');
    setVehFeatures('');
    setPersonAliases('');
    setPersonDesc('');
  };

  return (
    <div className="max-w-6xl mx-auto px-3.5 py-4 space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {t.bolo.title}
            </h2>
            <p className="text-xs text-slate-400">
              Active lookout notices, broadcast tracking and resolution registry
            </p>
          </div>
        </div>

        {activeRole !== 'CLIENT' && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.bolo.createTitle}</span>
          </button>
        )}
      </div>

      {/* CREATE BOLO MODAL */}
      {isCreating && (
        <form
          onSubmit={handleCreateBolo}
          className="bg-slate-900 border border-purple-500/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-purple-300 text-sm">{t.bolo.createTitle}</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-white"
            >
              {t.common.cancel}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.bolo.targetType}</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as BoloTargetType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
              >
                <option value="vehicle">{t.bolo.targets.vehicle}</option>
                <option value="person">{t.bolo.targets.person}</option>
                <option value="case">{t.bolo.targets.case}</option>
                <option value="location">{t.bolo.targets.location}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.bolo.distribution}</label>
              <select
                value={distribution}
                onChange={(e) => setDistribution(e.target.value as BoloDistribution)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
              >
                <option value="all_clients">{t.bolo.distAll}</option>
                <option value="internal_only">{t.bolo.distInternal}</option>
                <option value="selected_group">{t.bolo.distGroup}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">BOLO Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Red Isuzu KB 250 - Suspected Stock Theft"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          {/* Conditional Target Details */}
          {targetType === 'vehicle' && (
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-750 space-y-3">
              <h4 className="font-bold text-purple-300 text-[11px] uppercase">Vehicle Target Details</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Make (e.g. Toyota)"
                  value={vehMake}
                  onChange={(e) => setVehMake(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. Hilux)"
                  value={vehModel}
                  onChange={(e) => setVehModel(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Color (e.g. White)"
                  value={vehColor}
                  onChange={(e) => setVehColor(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Plate (e.g. HBF 902 NW)"
                  value={vehPlate}
                  onChange={(e) => setVehPlate(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase"
                />
              </div>
              <input
                type="text"
                placeholder="Distinguishing features (e.g. dented tailgate, roof rack)"
                value={vehFeatures}
                onChange={(e) => setVehFeatures(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          )}

          {targetType === 'person' && (
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-750 space-y-3">
              <h4 className="font-bold text-purple-300 text-[11px] uppercase">Person Target Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name / Aliases"
                  value={personAliases}
                  onChange={(e) => setPersonAliases(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Approximate Age"
                  value={personAge}
                  onChange={(e) => setPersonAge(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Clothing / Physical description"
                value={personDesc}
                onChange={(e) => setPersonDesc(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.bolo.lastKnownLocation} *</label>
              <input
                type="text"
                required
                value={lastKnownLocation}
                onChange={(e) => setLastKnownLocation(e.target.value)}
                placeholder="e.g. R503 heading towards Klerksdorp"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.bolo.lastSeenTime} *</label>
              <input
                type="datetime-local"
                required
                value={lastSeenTimestamp}
                onChange={(e) => setLastSeenTimestamp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t.bolo.reason} *</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Vehicle seen scouting livestock kraal on Rooipoort farm"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Full Instructions / Responder Advice</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Do not approach alone. Report all sightings directly to Control Room or channel 4."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg"
            >
              Issue BOLO & Broadcast Alert
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search BOLOs by number, vehicle plate, or description..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            {t.common.all}
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'active' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'resolved' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* BOLO List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredBolos.length === 0 ? (
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            No BOLO records found.
          </div>
        ) : (
          filteredBolos.map((bolo) => (
            <div
              key={bolo.id}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-sm text-xs space-y-3 transition ${
                bolo.status === 'active'
                  ? 'border-purple-500/40 hover:border-purple-500'
                  : 'border-slate-800 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-400 bg-purple-950/70 border border-purple-800 px-2 py-0.5 rounded text-[11px]">
                    {bolo.boloNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      bolo.status === 'active'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {bolo.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(bolo.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{bolo.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{bolo.reason}</p>
              </div>

              {bolo.vehicleInfo && (
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-750 flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-purple-400" />
                    <span>
                      {bolo.vehicleInfo.color} {bolo.vehicleInfo.make} {bolo.vehicleInfo.model}
                    </span>
                  </div>
                  {bolo.vehicleInfo.licensePlate && (
                    <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-white border border-slate-700 text-[10px]">
                      {bolo.vehicleInfo.licensePlate}
                    </span>
                  )}
                </div>
              )}

              {bolo.personInfo && (
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-750 flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>
                    {bolo.personInfo.nameAliases} • {bolo.personInfo.physicalDescription}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span>{bolo.lastKnownLocation}</span>
                </span>
                <span>By: {bolo.createdByName}</span>
              </div>

              {/* SIGHTINGS SECTION */}
              {(() => {
                const sightings = boloSightings.filter((s) => s.boloId === bolo.id);
                const unverifiedCount = sightings.filter((s) => s.verificationStatus === 'UNVERIFIED').length;

                return (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span>{t.communityResponse.boloSightingsTitle} ({sightings.length})</span>
                        </span>
                        {unverifiedCount > 0 && (
                          <span className="bg-amber-900/80 text-amber-300 border border-amber-600 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                            {unverifiedCount} {t.communityResponse.unverifiedBadge}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedBoloId(expandedBoloId === bolo.id ? null : bolo.id)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        {expandedBoloId === bolo.id ? t.communityResponse.hideSightingsBtn : t.communityResponse.viewSightingsBtn}
                      </button>
                    </div>

                    {expandedBoloId === bolo.id && (
                      <div className="space-y-2 pt-1">
                        {sightings.length === 0 ? (
                          <p className="text-slate-500 italic text-[11px] py-1">
                            {t.communityResponse.noSightingsReported}
                          </p>
                        ) : (
                          sightings.map((s) => (
                            <div
                              key={s.id}
                              className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 transition ${
                                s.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-950/40 border-emerald-800/70'
                                  : s.verificationStatus === 'DISPUTED'
                                  ? 'bg-red-950/40 border-red-900/70'
                                  : s.verificationStatus === 'IRRELEVANT'
                                  ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                                  : 'bg-slate-950/70 border-amber-500/40'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span className="text-white">{s.reportedByName}</span>
                                  <span className="text-slate-400 font-mono text-[10px]">({s.reportedByPhone})</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  s.verificationStatus === 'VERIFIED'
                                    ? 'bg-emerald-900 text-emerald-300'
                                    : s.verificationStatus === 'DISPUTED'
                                    ? 'bg-red-900 text-red-300'
                                    : s.verificationStatus === 'IRRELEVANT'
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-amber-900 text-amber-300 animate-pulse'
                                }`}>
                                  {s.verificationStatus}
                                </span>
                              </div>

                              <div className="text-slate-300">
                                <strong>Plek:</strong> {s.locationDescription}
                                {s.directionOfTravel && (
                                  <span className="text-purple-300 ml-2">
                                    • Rigting: {s.directionOfTravel}
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-400 italic bg-slate-900/80 p-1.5 rounded-lg">
                                "{s.description}"
                              </p>

                              {s.gpsLocation && s.gpsLocation.latitude != null && s.gpsLocation.longitude != null && (
                                <div className="text-[10px] font-mono text-emerald-400">
                                  GPS: {Number(s.gpsLocation.latitude).toFixed(5)}, {Number(s.gpsLocation.longitude).toFixed(5)}
                                </div>
                              )}

                              {s.verifiedByName && (
                                <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800">
                                  Geouditeer deur {s.verifiedByName} {s.verificationNotes ? `— "${s.verificationNotes}"` : ''}
                                </div>
                              )}

                              {activeRole !== 'CLIENT' && (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <button
                                    onClick={() => verifyBoloSighting(s.id, 'VERIFIED', 'Verified by Control Room operator')}
                                    className="px-2 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded font-bold text-[10px] border border-emerald-700/60"
                                  >
                                    {t.communityResponse.verifyBtn}
                                  </button>
                                  <button
                                    onClick={() => verifyBoloSighting(s.id, 'DISPUTED', 'Disputed by Control Room after cross-check')}
                                    className="px-2 py-0.5 bg-red-950 hover:bg-red-900 text-red-400 rounded font-bold text-[10px] border border-red-900"
                                  >
                                    {t.communityResponse.disputeBtn}
                                  </button>
                                  <button
                                    onClick={() => verifyBoloSighting(s.id, 'IRRELEVANT', 'Marked irrelevant')}
                                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded font-bold text-[10px]"
                                  >
                                    {t.communityResponse.irrelevantBtn}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeRole !== 'CLIENT' && bolo.status === 'active' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => updateBoloStatus(bolo.id, 'resolved')}
                    className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold py-1.5 rounded-xl text-center transition"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => updateBoloStatus(bolo.id, 'cancelled')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-1.5 rounded-xl text-center transition"
                  >
                    Cancel BOLO
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
