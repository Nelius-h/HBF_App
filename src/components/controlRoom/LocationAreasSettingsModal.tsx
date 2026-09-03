import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Users,
  Search,
  Filter,
  Shield,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useData, DEFAULT_LOCATION_AREAS } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { LocationArea, UserProfile } from '../../types';

interface LocationAreasManagerProps {
  onClose?: () => void;
  isModal?: boolean;
  onSelectArea?: (areaName: string) => void;
}

export const LocationAreasManager: React.FC<LocationAreasManagerProps> = ({
  onClose,
  isModal = false,
  onSelectArea,
}) => {
  const {
    locationAreas,
    createLocationArea,
    updateLocationArea,
    deleteLocationArea,
  } = useData();
  const { allUsers, updateUser } = useAuth();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Form State for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<LocationArea | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('Sektor 1 - Suid');
  const [isActive, setIsActive] = useState(true);

  // Selected Area for Client Assignment Drawer / Modal
  const [viewingAreaForAssignment, setViewingAreaForAssignment] = useState<LocationArea | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Client list
  const clientUsers = allUsers.filter(
    (u) => u.role === 'CLIENT' || (!u.role && u.farmName)
  );

  // Preset suggested areas if needed
  const presetSuggestions = [
    { name: 'Hartbeesfontein', code: 'HBF', sector: 'Hartbeesfontein Sentraal', description: 'Hartbeesfontein dorpsgebied, sentrale sakekern & kleinhoewes' },
    { name: 'Schoemansfontein', code: 'SCHO', sector: 'Sektor 1 - Suid', description: 'Schoemansfontein sektor, Doornhoek grens & suidelike plase' },
    { name: 'Brakspruit', code: 'BRAK', sector: 'Sektor 3 - Oos', description: 'Brakspruit landboukorridor, riviervallei plase & kleinhoewes' },
    { name: 'Geduld', code: 'GED', sector: 'Sektor 2 - Noord', description: 'Geduld landbousektor & omliggende plase' },
    { name: 'Buisfontein', code: 'BUIS', sector: 'Sektor 1 - Suid', description: 'Buisfontein landbou-area & veeplase' },
    { name: 'Palmietfontein', code: 'PALM', sector: 'Sektor 2 - Noord', description: 'Palmietfontein boerderysektor & Rooipoort korridor' },
    { name: 'Rietkuil', code: 'RIETK', sector: 'Sektor 3 - Oos', description: 'Rietkuil landboustreek & saailande' },
    { name: 'Leeuwfontein', code: 'LEEU', sector: 'Sektor 2 - Noord', description: 'Leeuwfontein boerderygebied & rante' },
    { name: 'Bultfontein', code: 'BULT', sector: 'Sektor 2 - Noord', description: 'Bultfontein rante & saaiplase' },
    { name: 'Wolverand', code: 'WOLV', sector: 'Sektor 1 - Suid', description: 'Wolverand boerderygebied & suidrand' },
  ];

  // Open Form for Adding New Area
  const handleOpenAdd = () => {
    setEditingArea(null);
    setName('');
    setCode('');
    setDescription('');
    setSector('Sektor 1 - Suid');
    setIsActive(true);
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Area
  const handleOpenEdit = (area: LocationArea) => {
    setEditingArea(area);
    setName(area.name);
    setCode(area.code || '');
    setDescription(area.description || '');
    setSector(area.sector || 'Sektor 1 - Suid');
    setIsActive(area.isActive);
    setIsFormOpen(true);
  };

  // Quick Preset Add
  const handleAddPreset = async (preset: (typeof presetSuggestions)[0]) => {
    const existing = locationAreas.find(
      (a) => a.name.toLowerCase() === preset.name.toLowerCase()
    );
    if (existing) {
      setStatusMessage(`Area "${preset.name}" is already registered.`);
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    await createLocationArea({
      name: preset.name,
      code: preset.code,
      sector: preset.sector,
      description: preset.description,
      isActive: true,
      displayOrder: locationAreas.length + 1,
    });

    setStatusMessage(`Added location area "${preset.name}" successfully.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingArea) {
      await updateLocationArea(editingArea.id, {
        name: name.trim(),
        code: code.trim().toUpperCase() || name.substring(0, 4).toUpperCase(),
        description: description.trim(),
        sector: sector.trim(),
        isActive,
      });
      setStatusMessage(`Updated location area "${name.trim()}".`);
    } else {
      await createLocationArea({
        name: name.trim(),
        code: code.trim().toUpperCase() || name.substring(0, 4).toUpperCase(),
        description: description.trim(),
        sector: sector.trim(),
        isActive,
        displayOrder: locationAreas.length + 1,
      });
      setStatusMessage(`Created new location area "${name.trim()}".`);
    }

    setIsFormOpen(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Delete Area Handler
  const handleDelete = async (id: string, areaName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete location area "${areaName}"? Clients linked to this area will retain their historical records.`
      )
    ) {
      await deleteLocationArea(id);
      setStatusMessage(`Deleted location area "${areaName}".`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Toggle Client Link to Area
  const handleToggleClientLink = (client: UserProfile, targetArea: LocationArea) => {
    const isCurrentlyLinked =
      client.locationArea === targetArea.name || client.locationAreaId === targetArea.id;

    if (isCurrentlyLinked) {
      // Unlink
      updateUser(client.uid, {
        locationArea: undefined,
        locationAreaId: undefined,
      });
    } else {
      // Link
      updateUser(client.uid, {
        locationArea: targetArea.name,
        locationAreaId: targetArea.id,
        sector: targetArea.sector || client.sector,
      });
    }
  };

  // Reset to default standard 57 areas
  const handleRestoreDefaults = async () => {
    if (
      window.confirm(
        'Herstel / laai alle 57 standaard distrik-gebiede (Hartbeesfontein, Schoemansfontein, Brakspruit, Buisfontein, Renosterhoek, ens.)?'
      )
    ) {
      for (const def of DEFAULT_LOCATION_AREAS) {
        const exists = locationAreas.find(
          (a) => a.name.toLowerCase() === def.name.toLowerCase()
        );
        if (!exists) {
          await createLocationArea(def);
        }
      }
      setStatusMessage('Alle 57 standaard gebiede is gelaai en geregistreer.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Filtered list of areas
  const filteredAreas = locationAreas.filter((a) => {
    const matchSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sector?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSector =
      selectedSector === 'ALL' || a.sector === selectedSector;

    return matchSearch && matchSector;
  });

  const availableSectors = Array.from(
    new Set([
      'Sektor 1 - Suid',
      'Sektor 2 - Noord',
      'Sektor 3 - Oos',
      'Hartbeesfontein Sentraal',
      ...locationAreas.map((a) => a.sector).filter(Boolean),
    ])
  );

  return (
    <div className="space-y-4">
      {/* Top Banner / Notification */}
      {statusMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header & Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Location Areas &amp; Wyke Settings
                </h3>
                <span className="text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full">
                  {locationAreas.length} Areas
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Bestuur en koppel geografiese plaasgebiede (Hartbeesfontein, Schoemansfontein, Brakspruit, Geduld, Buisfontein, en 52 ander gebiede) aan lede en kliënte in die Telefoonboek.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRestoreDefaults}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="Herstel alle 57 distrik-gebiede"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Herstel 57 Gebiede</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span className="text-slate-950">Add Location Area</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Fast Preset Areas:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {presetSuggestions.map((preset) => {
              const isAlreadyAdded = locationAreas.some(
                (a) => a.name.toLowerCase() === preset.name.toLowerCase()
              );
              return (
                <button
                  key={preset.name}
                  onClick={() => !isAlreadyAdded && handleAddPreset(preset)}
                  disabled={isAlreadyAdded}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isAlreadyAdded
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700 cursor-default'
                      : 'bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-200 border border-slate-700 hover:border-amber-500/60'
                  }`}
                  title={preset.description}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{preset.name}</span>
                  {isAlreadyAdded ? (
                    <Check className="w-3 h-3 text-emerald-300" />
                  ) : (
                    <span className="text-[10px] text-amber-300 font-mono font-bold">+Add</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Sector Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
          <div className="sm:col-span-8 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location area name, code, sector or description..."
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-400 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-4 relative">
            <Filter className="w-3 h-3 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="ALL">All Sectors ({locationAreas.length} Areas)</option>
              {availableSectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Location Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAreas.map((area) => {
          const linkedClients = clientUsers.filter(
            (u) => u.locationArea === area.name || u.locationAreaId === area.id
          );

          return (
            <div
              key={area.id}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between ${
                area.isActive
                  ? 'border-slate-800 hover:border-amber-500/50'
                  : 'border-slate-800/50 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-black uppercase">
                        {area.code || 'AREA'}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                        {area.sector || 'Sektor 1'}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white mt-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{area.name}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(area)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Area Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(area.id, area.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition"
                      title="Delete Area"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {area.description && (
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {area.description}
                  </p>
                )}

                {/* Linked Client Summary Box */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-300 uppercase font-bold flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>Linked Clients:</span>
                    </span>
                    <strong className="text-emerald-300 font-mono font-bold">
                      {linkedClients.length} Farmers / Plots
                    </strong>
                  </div>

                  {linkedClients.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1">
                      {linkedClients.map((c) => (
                        <span
                          key={c.uid}
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-200 font-mono truncate max-w-[140px]"
                          title={`${c.name} ${c.surname} - ${c.farmName}`}
                        >
                          {c.name} {c.surname}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">
                      No Phone Book clients linked yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => setViewingAreaForAssignment(area)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Link / Assign Clients</span>
                </button>

                {onSelectArea && (
                  <button
                    onClick={() => onSelectArea(area.name)}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
                    title="Filter Phone Book by this Area"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAreas.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <MapPin className="w-10 h-10 text-amber-400 mx-auto" />
          <h4 className="text-base font-bold text-white">Geen Gebiede Gevind Nie</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Geen gebiede pas by die soekterm nie. Klik &quot;Herstel 57 Gebiede&quot; om al 57 amptelike Hartbeesfontein distrik-gebiede te herstel.
          </p>
          <button
            onClick={handleRestoreDefaults}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Herstel 57 Gebiede
          </button>
        </div>
      )}

      {/* MODAL: ADD / EDIT LOCATION AREA */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">
                    {editingArea ? 'Edit Location Area' : 'Add New Location Area'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define geographic area name (e.g. Brakspruit, Palmietfontein) and operational sector
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Area Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Brakspruit, Palmietfontein"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Short Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BRAK"
                    maxLength={6}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Operational Sector Link
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Sektor 1 - Suid">Sektor 1 - Suid</option>
                  <option value="Sektor 2 - Noord">Sektor 2 - Noord</option>
                  <option value="Sektor 3 - Oos">Sektor 3 - Oos</option>
                  <option value="Hartbeesfontein Sentraal">Hartbeesfontein Sentraal</option>
                  <option value="Klerksdorp Korridor">Klerksdorp Korridor</option>
                  <option value="General Community">General Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Area Description &amp; Landmarks
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Agricultural corridor, river valley farms, smallholdings and arterial roads"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="areaActiveCheckbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-800"
                />
                <label htmlFor="areaActiveCheckbox" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Area is active and selectable in Phone Book
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md"
                >
                  {editingArea ? 'Save Changes' : 'Create Location Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLIENT LINKING / ASSIGNMENT DRAWER */}
      {viewingAreaForAssignment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white uppercase">
                      Link Clients to {viewingAreaForAssignment.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full">
                      {viewingAreaForAssignment.code || 'AREA'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Click to link or unlink Phone Book clients and farmers directly to this location area.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingAreaForAssignment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input for Clients */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Search clients by name, farm name, telephone or portion..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-none"
              />
            </div>

            {/* List of Clients with Quick Checkboxes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-96">
              {clientUsers
                .filter((c) => {
                  if (!clientSearchQuery) return true;
                  const q = clientSearchQuery.toLowerCase();
                  return (
                    c.name?.toLowerCase().includes(q) ||
                    c.surname?.toLowerCase().includes(q) ||
                    c.farmName?.toLowerCase().includes(q) ||
                    c.primaryPhone?.toLowerCase().includes(q) ||
                    c.locationArea?.toLowerCase().includes(q)
                  );
                })
                .map((client) => {
                  const isLinked =
                    client.locationArea === viewingAreaForAssignment.name ||
                    client.locationAreaId === viewingAreaForAssignment.id;

                  return (
                    <div
                      key={client.uid}
                      onClick={() => handleToggleClientLink(client, viewingAreaForAssignment)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
                        isLinked
                          ? 'bg-amber-950/40 border-amber-600/70 text-white'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-800 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-white block">
                            {client.name} {client.surname}
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {client.farmName} {client.portionNumber ? `(${client.portionNumber})` : ''} • {client.primaryPhone}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {client.locationArea ? (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              isLinked
                                ? 'bg-amber-900 text-amber-200 border border-amber-500'
                                : 'bg-slate-800 text-slate-200 border border-slate-700'
                            }`}
                          >
                            📍 {client.locationArea}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-300">
                {
                  clientUsers.filter(
                    (u) =>
                      u.locationArea === viewingAreaForAssignment.name ||
                      u.locationAreaId === viewingAreaForAssignment.id
                  ).length
                }{' '}
                Clients currently linked to {viewingAreaForAssignment.name}
              </span>

              <button
                onClick={() => setViewingAreaForAssignment(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
