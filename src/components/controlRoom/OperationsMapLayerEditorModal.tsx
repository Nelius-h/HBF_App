import React, { useState, useEffect } from 'react';
import {
  Layers,
  X,
  Save,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Droplet,
  Radio,
  Camera,
  Shield,
  Eye,
  Sliders,
  MapPin,
  Sparkles,
  Flame,
  Car,
  ChevronDown,
  ChevronUp,
  Navigation,
} from 'lucide-react';
import { KmlMapLayer, KmlLayerCategory, UserRole, KmlMapFeature } from '../../types';
import { parseKmlString } from '../../data/kmlLayersSeedData';

interface OperationsMapLayerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  layer?: KmlMapLayer | null;
  initialLayer?: KmlMapLayer | null;
  onSave: (layerData: Omit<KmlMapLayer, 'id' | 'uploadedAt' | 'uploadedByUid' | 'uploadedByName'> & { id?: string }) => void;
  onDelete?: (layerId: string) => void;
}

const CATEGORY_OPTIONS: { value: KmlLayerCategory; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: 'SECTOR_BOUNDARIES', label: 'Sector Boundaries (Sektorgrense)', icon: Compass, color: '#3b82f6' },
  { value: 'FARM_BOUNDARIES', label: 'Farm Boundaries & Portions', icon: Compass, color: '#10b981' },
  { value: 'WATER_POINTS', label: 'Water Points & Dams (Waterpunte)', icon: Droplet, color: '#06b6d4' },
  { value: 'RADIO_REPEATERS', label: 'Radio Repeaters & High Sites', icon: Radio, color: '#8b5cf6' },
  { value: 'FIREBREAKS', label: 'Fire Breaks & Burn Zones', icon: Flame, color: '#ef4444' },
  { value: 'STAGING_POINTS', label: 'Staging & Roadblocks', icon: Shield, color: '#ec4899' },
  { value: 'GRAVEL_ROADS', label: 'Gravel Roads & Tracks', icon: Car, color: '#94a3b8' },
  { value: 'HIGH_RISK_ZONES', label: 'Crime Hotspots & Escape Routes', icon: AlertTriangle, color: '#dc2626' },
  { value: 'GATES', label: 'Farm Gates & Access Points', icon: Shield, color: '#f59e0b' },
  { value: 'SECTOR_PATROLS', label: 'Sector Patrol Routes', icon: Navigation, color: '#6366f1' },
  { value: 'CUSTOM', label: 'Custom Tactical Overlay', icon: Layers, color: '#14b8a6' },
];

const COLOR_PRESETS = [
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#8b5cf6', label: 'Violet' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#ef4444', label: 'Red' },
  { hex: '#14b8a6', label: 'Teal' },
  { hex: '#84cc16', label: 'Lime' },
  { hex: '#f97316', label: 'Orange' },
  { hex: '#64748b', label: 'Slate' },
  { hex: '#ffffff', label: 'White' },
];

const QUICK_TEMPLATES: {
  title: string;
  category: KmlLayerCategory;
  color: string;
  description: string;
  features: KmlMapFeature[];
}[] = [
  {
    title: 'Nood Waterpunte & Sementdamme (Water Grid)',
    category: 'WATER_POINTS',
    color: '#06b6d4',
    description: 'Strategiese waterpunte, sementdamme en hoë-druk boorgate vir veldbrand bestryding.',
    features: [
      { id: 'w-1', name: 'Rooipoort Hoof Sementdam (50kL)', description: '50,000L dam met diesel brandspuitpomp', featureType: 'Point', coordinates: [-26.732, 26.415] },
      { id: 'w-2', name: 'Brakspruit Sentraal Vultenk (30kL)', description: '30,000L tenk met vinnige 3-duim vulaansluiting', featureType: 'Point', coordinates: [-26.745, 26.475] },
      { id: 'w-3', name: 'Schoemansfontein Dam Pompstasie', description: 'Groot opgaardam met suigpyp toegang vir tenkwaens', featureType: 'Point', coordinates: [-26.768, 26.458] },
      { id: 'w-4', name: 'Tigane Oos Boorgat & Krip', description: 'Hoë-lewering sonkragpomp en stoortenk', featureType: 'Point', coordinates: [-26.788, 26.395] },
    ],
  },
  {
    title: 'Strategiese Padblokkade & Staging Punte',
    category: 'STAGING_POINTS',
    color: '#ec4899',
    description: 'Vinnige toesluit-punte en voertuig-deursoeking posisies vir reaksie-eenhede.',
    features: [
      { id: 'stg-1', name: 'R503 / Rooipoort T-Aansluiting', description: 'Primêre afsluiting rigting Ottosdal', featureType: 'Point', coordinates: [-26.745, 26.418] },
      { id: 'stg-2', name: 'N12 Wolwerand Aansluiting', description: 'Deursoekingspunt rigting Klerksdorp/Wolmaransstad', featureType: 'Point', coordinates: [-26.862, 26.435] },
      { id: 'stg-3', name: 'Palmietfontein R30 Kruising', description: 'Noordelike afsluitingspunt rigting Ventersdorp', featureType: 'Point', coordinates: [-26.745, 26.485] },
    ],
  },
  {
    title: 'Veldbrand Verdediging & Brandstrook (Firebreak)',
    category: 'FIREBREAKS',
    color: '#ef4444',
    description: 'Hoof skoongebrande bufferstrook langs R503 en spoorlyn korridor.',
    features: [
      {
        id: 'fb-1',
        name: 'Noord-Oos Brandstrook Buffer',
        description: '50m skoongemaakte bufferstrook teen heersende Suid-Westewind',
        featureType: 'LineString',
        coordinates: [
          [-26.715, 26.41],
          [-26.735, 26.435],
          [-26.755, 26.465],
          [-26.775, 26.495],
        ],
      },
    ],
  },
  {
    title: 'Sektor 2 Uitbreiding (Plasing Poligoon)',
    category: 'SECTOR_BOUNDARIES',
    color: '#3b82f6',
    description: 'Poligoon sektor grensgebied vir noordelike landboustreek.',
    features: [
      {
        id: 'sec-poly-1',
        name: 'Sektor 2 - Noord Landbou Gebied',
        description: 'Patrolliesone vir Rooipoort en Palmietfontein',
        featureType: 'Polygon',
        coordinates: [
          [-26.71, 26.39],
          [-26.71, 26.47],
          [-26.77, 26.47],
          [-26.77, 26.39],
          [-26.71, 26.39],
        ],
      },
    ],
  },
];

export const OperationsMapLayerEditorModal: React.FC<OperationsMapLayerEditorModalProps> = ({
  isOpen,
  onClose,
  layer,
  initialLayer,
  onSave,
  onDelete,
}) => {
  const targetLayer = layer || initialLayer;
  const isEdit = Boolean(targetLayer?.id);

  // Tab mode in modal: 'details' | 'features' | 'kml_import' | 'templates'
  const [activeTab, setActiveTab] = useState<'details' | 'features' | 'kml_import' | 'templates'>('details');

  // Form State
  const [name, setName] = useState(targetLayer?.name || '');
  const [category, setCategory] = useState<KmlLayerCategory>(targetLayer?.category || 'CUSTOM');
  const [description, setDescription] = useState(targetLayer?.description || '');
  const [color, setColor] = useState(targetLayer?.colorHex || targetLayer?.color || '#06b6d4');
  const [opacity, setOpacity] = useState(targetLayer?.opacity ?? 0.8);
  const [strokeWidth, setStrokeWidth] = useState(targetLayer?.strokeWidth ?? 3);
  const [isActive, setIsActive] = useState(targetLayer?.isActive ?? true);
  const [visibilityRoles, setVisibilityRoles] = useState<UserRole[]>(
    targetLayer?.visibilityRoles || ['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT']
  );
  const [features, setFeatures] = useState<KmlMapFeature[]>(targetLayer?.features || []);

  // Feature add form state
  const [newFeatName, setNewFeatName] = useState('');
  const [newFeatDesc, setNewFeatDesc] = useState('');
  const [newFeatType, setNewFeatType] = useState<'Point' | 'Polygon' | 'LineString'>('Point');
  const [newFeatCoordsText, setNewFeatCoordsText] = useState('-26.7635, 26.4168');

  // KML Import state
  const [rawKmlText, setRawKmlText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Sync target layer when opening
  useEffect(() => {
    if (targetLayer) {
      setName(targetLayer.name || '');
      setCategory(targetLayer.category || 'CUSTOM');
      setDescription(targetLayer.description || '');
      setColor(targetLayer.colorHex || targetLayer.color || '#06b6d4');
      setOpacity(targetLayer.opacity ?? 0.8);
      setStrokeWidth(targetLayer.strokeWidth ?? 3);
      setIsActive(targetLayer.isActive ?? true);
      setVisibilityRoles(targetLayer.visibilityRoles || ['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT']);
      setFeatures(targetLayer.features || []);
    } else {
      setName('');
      setCategory('CUSTOM');
      setDescription('');
      setColor('#06b6d4');
      setOpacity(0.8);
      setStrokeWidth(3);
      setIsActive(true);
      setVisibilityRoles(['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT']);
      setFeatures([]);
    }
    setImportStatus(null);
    setImportError(null);
  }, [targetLayer, isOpen]);

  if (!isOpen) return null;

  const handleRoleToggle = (role: UserRole) => {
    if (visibilityRoles.includes(role)) {
      if (visibilityRoles.length === 1) return; // Keep at least one
      setVisibilityRoles(visibilityRoles.filter((r) => r !== role));
    } else {
      setVisibilityRoles([...visibilityRoles, role]);
    }
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatName.trim()) return;

    try {
      let parsedCoords: [number, number] | [number, number][] = [-26.7635, 26.4168];

      if (newFeatType === 'Point') {
        const parts = newFeatCoordsText.split(',').map((v) => parseFloat(v.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          parsedCoords = [parts[0], parts[1]];
        } else {
          alert('Ongeldige koördinate. Gebruik formaat: Lat, Lng (bv. -26.7635, 26.4168)');
          return;
        }
      } else {
        // LineString or Polygon
        const lines = newFeatCoordsText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
        const coordList: [number, number][] = [];
        lines.forEach((line) => {
          const parts = line.split(',').map((v) => parseFloat(v.trim()));
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            coordList.push([parts[0], parts[1]]);
          }
        });
        if (coordList.length < (newFeatType === 'Polygon' ? 3 : 2)) {
          alert(`Voer asseblief minstens ${newFeatType === 'Polygon' ? '3' : '2'} koördinaatlyne in vir 'n ${newFeatType}.`);
          return;
        }
        parsedCoords = coordList;
      }

      const newFeature: KmlMapFeature = {
        id: `feat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: newFeatName.trim(),
        description: newFeatDesc.trim() || undefined,
        featureType: newFeatType,
        coordinates: parsedCoords,
      };

      setFeatures([...features, newFeature]);
      setNewFeatName('');
      setNewFeatDesc('');
    } catch (err: any) {
      alert('Kon nie kenmerk byvoeg nie: ' + err.message);
    }
  };

  const handleRemoveFeature = (featId: string) => {
    setFeatures(features.filter((f) => f.id !== featId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setRawKmlText(text);
        const parsed = parseKmlString(file.name, text, category);
        if (!name.trim()) {
          setName(parsed.name || file.name.replace(/\.[^/.]+$/, ''));
        }
        if (!description.trim()) {
          setDescription(parsed.description || `Ingevoer vanaf ${file.name}`);
        }
        setFeatures(parsed.features);
        setImportStatus(`Suksesvol ${parsed.placemarkCount} kenmerke / geometrieë ingelees vanaf ${file.name}!`);
        setImportError(null);
      } catch (err: any) {
        setImportError('Kon nie KML lêer korrek verwerk nie: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setName(tmpl.title);
    setCategory(tmpl.category);
    setColor(tmpl.color);
    setDescription(tmpl.description);
    setFeatures(tmpl.features);
    setActiveTab('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Voer asseblief \'n laag naam in.');
      return;
    }

    onSave({
      id: targetLayer?.id,
      name: name.trim(),
      category: category,
      description: description.trim() || 'Operasionele GIS kaartlaag',
      color: color,
      colorHex: color,
      opacity: opacity,
      strokeWidth: strokeWidth,
      isActive: isActive,
      version: targetLayer?.version || '1.0',
      visibilityRoles: visibilityRoles,
      placemarkCount: features.length,
      featureCount: features.length,
      features: features,
      kmlContent: rawKmlText || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isEdit ? 'Wysig Operasionele Kaartlaag' : 'Skep Nuwe Operasionele Kaartlaag'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit ? `Wysig besonderhede, styl & kenmerke vir "${name || 'Laag'}"` : 'Voeg pasgemaakte sones, waterpunte, kameras of KML-lae by'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-900/50 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Algemene Inligting & Styl
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Geometrieë & Punte</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800">
              {features.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kml_import')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition border-b-2 flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'kml_import'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>KML Lêer Invoer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition border-b-2 flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'templates'
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Vinnige Sjablone</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[65vh]">
          
          {/* TAB 1: DETAILS & STYLING */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    Laag Naam (Layer Name) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="bv. Brakspruit Damme & Waterpunte"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    Kategorie (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as KmlLayerCategory;
                      setCategory(newCat);
                      const catMatch = CATEGORY_OPTIONS.find((c) => c.value === newCat);
                      if (catMatch && !initialLayer) {
                        setColor(catMatch.color);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">
                  Beskrywing (Description / Tactical Notes)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operasionele instruksies of inligting oor hierdie kaartlaag..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              {/* Visual Styling: Color, Opacity, Stroke */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Visuele Styl &amp; Kleurskema</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-mono text-[11px] text-slate-400">{color}</span>
                  </div>
                </div>

                {/* Color presets */}
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1.5">Kleur Palet:</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setColor(p.hex)}
                        title={p.label}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition border-2 ${
                          color.toLowerCase() === p.hex.toLowerCase()
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: p.hex }}
                      >
                        {color.toLowerCase() === p.hex.toLowerCase() && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 text-slate-300">
                      <span>Deursigtigheid (Opacity):</span>
                      <span className="font-mono font-bold text-cyan-400">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Stroke width */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 text-slate-300">
                      <span>Lynwydte (Stroke Width):</span>
                      <span className="font-mono font-bold text-cyan-400">{strokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="1"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Visibility Roles */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Laag Aktief op Kaart</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="block text-slate-400 text-[11px] mb-1.5 font-bold">Sigbaar vir Rolle:</span>
                  <div className="flex flex-wrap gap-2">
                    {(['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT', 'CLIENT'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleToggle(r)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          visibilityRoles.includes(r)
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURES & POINTS MANAGEMENT */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              {/* Add New Feature Card */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-cyan-900/60 space-y-3">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Voeg Nuwe Punt / Geometrie by Laag</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newFeatName}
                      onChange={(e) => setNewFeatName(e.target.value)}
                      placeholder="Kenmerk Naam (bv. Sementdam #4)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <select
                      value={newFeatType}
                      onChange={(e) => setNewFeatType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs font-bold"
                    >
                      <option value="Point">Punt (Point Marker)</option>
                      <option value="Polygon">Sone (Polygon Area)</option>
                      <option value="LineString">Lyn (Polyline / Pad)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">
                    {newFeatType === 'Point'
                      ? 'GPS Koördinate (Lat, Lng):'
                      : 'Koördinaatlyne (Een paar per lyn: Lat, Lng):'}
                  </label>
                  <textarea
                    rows={newFeatType === 'Point' ? 1 : 3}
                    value={newFeatCoordsText}
                    onChange={(e) => setNewFeatCoordsText(e.target.value)}
                    placeholder={
                      newFeatType === 'Point'
                        ? '-26.7635, 26.4168'
                        : '-26.732, 26.415\n-26.745, 26.475\n-26.768, 26.458'
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono text-xs"
                  />
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewFeatCoordsText('-26.7635, 26.4168')}
                      className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700"
                    >
                      Ops HQ
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewFeatCoordsText('-26.7320, 26.4680')}
                      className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700"
                    >
                      Brakspruit
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewFeatCoordsText('-26.7620, 26.4620')}
                      className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700"
                    >
                      Schoemansfontein
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    disabled={!newFeatName.trim()}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Voeg Kenmerk By</span>
                  </button>
                </div>
              </div>

              {/* Current Features List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 text-xs">
                  Bestaande Kenmerke in Hierdie Laag ({features.length}):
                </span>

                {features.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 text-center text-slate-400">
                    Geen geometrieë of punte in hierdie laag nie. Voeg punte hierbo by of voer 'n KML lêer in.
                  </div>
                ) : (
                  features.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs">{f.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {f.featureType}
                            </span>
                            {f.description && <span>{f.description}</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(f.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                        title="Verwyder hierdie kenmerk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: KML FILE IMPORT */}
          {activeTab === 'kml_import' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-dashed border-cyan-500/50 text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
                <div>
                  <p className="font-bold text-white text-sm">Laai KML / XML Kaartlêer Op</p>
                  <p className="text-slate-400 text-[11px]">
                    Ondersteun Google Earth KML, Placemarks, Polygons, Roetes en Punte
                  </p>
                </div>
                <input
                  type="file"
                  accept=".kml,.xml"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                />
              </div>

              {importStatus && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

              {importError && (
                <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {rawKmlText && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold text-[10px]">KML Bronteks Voorskou:</span>
                  <textarea
                    readOnly
                    rows={4}
                    value={rawKmlText.slice(0, 1000) + (rawKmlText.length > 1000 ? '...' : '')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono text-[10px] text-slate-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUICK TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                Kies 'n gereed-gemaakte operasionele sjabloon om onmiddellik op die kaart te laai:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {QUICK_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.title}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/60 rounded-2xl cursor-pointer transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tmpl.color }} />
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {tmpl.features.length} punte/lyne
                      </span>
                    </div>
                    <div className="font-bold text-white text-xs group-hover:text-cyan-300 transition">
                      {tmpl.title}
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{tmpl.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              {isEdit && onDelete && initialLayer?.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Is u seker u wil die kaartlaag "${name}" permanent uitvee?`)) {
                      onDelete(initialLayer.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 rounded-xl font-bold flex items-center gap-1.5 transition text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Vee Laag Uit</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Kanselleer
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Stoor Veranderinge' : 'Skep Laag'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
