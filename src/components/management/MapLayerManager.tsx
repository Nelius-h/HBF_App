import React, { useState, useRef } from 'react';
import {
  Layers,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  Shield,
  Radio,
  Droplet,
  Compass,
  Plus,
  RefreshCw,
  Download,
  Info,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { KmlMapLayer, KmlLayerCategory, UserRole, KmlMapFeature } from '../../types';
import { parseKmlString, INITIAL_KML_LAYERS } from '../../data/kmlLayersSeedData';

const CATEGORY_META: Record<
  KmlLayerCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; defaultColor: string; description: string }
> = {
  SECTOR_BOUNDARIES: {
    label: 'Sector Boundaries (Sektorgrense)',
    icon: Compass,
    defaultColor: '#3b82f6',
    description: 'Town, rural, and agricultural district zones',
  },
  FARM_BOUNDARIES: {
    label: 'Farm Portions & Boundaries',
    icon: Compass,
    defaultColor: '#10b981',
    description: 'Cadastral farm portion outlines and borders',
  },
  GRAVEL_ROADS: {
    label: 'Gravel Roads & Farm Tracks',
    icon: Compass,
    defaultColor: '#94a3b8',
    description: 'Internal farm tracks, gravel access and pass routes',
  },
  SECTOR_PATROLS: {
    label: 'Sector Patrol Routes',
    icon: Shield,
    defaultColor: '#3b82f6',
    description: 'Standard patrol loops and observation vantage points',
  },
  WATER_POINTS: {
    label: 'Water Points & Firefighting Dams',
    icon: Droplet,
    defaultColor: '#06b6d4',
    description: 'High-capacity dams, boreholes & couplings for fire response',
  },
  RADIO_REPEATERS: {
    label: 'VHF Towers & Radio Repeaters',
    icon: Radio,
    defaultColor: '#8b5cf6',
    description: 'High-site repeaters and line-of-sight relays',
  },
  GATES: {
    label: 'Perimeter Gates & Access Points',
    icon: Shield,
    defaultColor: '#f59e0b',
    description: 'Main farm gates, solar gates, and secondary access',
  },
  STAGING_POINTS: {
    label: 'Staging & Medical LZ Rendezvous',
    icon: MapPin,
    defaultColor: '#10b981',
    description: 'Helicopter landing zones and responder rendezvous points',
  },
  FIREBREAKS: {
    label: 'Firebreaks & Containment Lines',
    icon: AlertTriangle,
    defaultColor: '#f97316',
    description: 'Ploughed firebreaks and natural back-burn corridors',
  },
  HIGH_RISK_ZONES: {
    label: 'High-Risk Corridors & Escape Routes',
    icon: AlertTriangle,
    defaultColor: '#ef4444',
    description: 'Frequent transit routes, stock-theft hotspots and ambush zones',
  },
  CUSTOM: {
    label: 'Custom Operational Layer',
    icon: Layers,
    defaultColor: '#64748b',
    description: 'User-defined operational KML overlay',
  },
};

const ALL_ROLES: { role: UserRole; label: string }[] = [
  { role: 'CONTROL_ROOM', label: 'Control Room' },
  { role: 'REACTION_FORCE', label: 'Reaction Force' },
  { role: 'MANAGEMENT', label: 'Management' },
  { role: 'MAINTENANCE_CREW', label: 'Maintenance Crew' },
  { role: 'CLIENT', label: 'Community / Clients' },
];

export const MapLayerManager: React.FC = () => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { mapLayers, addMapLayer, toggleMapLayerActive, updateMapLayer, deleteMapLayer } = useData();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedLayerDetail, setSelectedLayerDetail] = useState<KmlMapLayer | null>(null);
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);
  const [layerToDelete, setLayerToDelete] = useState<KmlMapLayer | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Upload Form State
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<KmlLayerCategory>('SECTOR_BOUNDARIES');
  const [uploadVersion, setUploadVersion] = useState('1.0');
  const [uploadColor, setUploadColor] = useState('#3b82f6');
  const [uploadRoles, setUploadRoles] = useState<UserRole[]>(['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT']);
  const [rawKmlText, setRawKmlText] = useState('');
  const [parsedFeatures, setParsedFeatures] = useState<KmlMapFeature[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLayers = mapLayers.filter((layer) => {
    if (selectedCategoryFilter === 'ALL') return true;
    return layer.category === selectedCategoryFilter;
  });

  const activeCount = mapLayers.filter((l) => l.isActive).length;
  const totalFeaturesCount = mapLayers.reduce((acc, l) => acc + (l.placemarkCount || l.features?.length || 0), 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawKmlText(content);

      // Parse KML in client
      const parsed = parseKmlString(file.name, content, uploadCategory);
      setUploadName(parsed.name || file.name.replace(/\.[^/.]+$/, ''));
      setUploadDescription(parsed.description || `Imported from ${file.name}`);
      setParsedFeatures(parsed.features);
      setUploadStatus(`Successfully parsed ${parsed.placemarkCount} features/placemarks from ${file.name}`);
      setUploadError(null);
    };

    reader.onerror = () => {
      setUploadError('Failed to read selected file.');
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawKmlText(content);
      const parsed = parseKmlString(file.name, content, uploadCategory);
      setUploadName(parsed.name || file.name.replace(/\.[^/.]+$/, ''));
      setUploadDescription(parsed.description || `Imported from ${file.name}`);
      setParsedFeatures(parsed.features);
      setUploadStatus(`Successfully parsed ${parsed.placemarkCount} features from ${file.name}`);
      setUploadError(null);
    };
    reader.readAsText(file);
  };

  const handleRoleToggle = (role: UserRole) => {
    if (uploadRoles.includes(role)) {
      if (uploadRoles.length === 1) return; // keep at least 1
      setUploadRoles(uploadRoles.filter((r) => r !== role));
    } else {
      setUploadRoles([...uploadRoles, role]);
    }
  };

  const handleSaveUploadedLayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) {
      setUploadError('Layer name is required.');
      return;
    }

    try {
      await addMapLayer({
        name: uploadName.trim(),
        description: uploadDescription.trim() || 'Tactical operational overlay layer',
        category: uploadCategory,
        version: uploadVersion || '1.0',
        isActive: true,
        visibilityRoles: uploadRoles,
        colorHex: uploadColor,
        placemarkCount: parsedFeatures.length,
        features: parsedFeatures,
        kmlContent: rawKmlText || undefined,
      });

      // Reset form
      setUploadName('');
      setUploadDescription('');
      setRawKmlText('');
      setParsedFeatures([]);
      setUploadStatus(null);
      setUploadError(null);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to save layer.');
    }
  };

  const handleDownloadKml = (layer: KmlMapLayer) => {
    let kmlContent = layer.kmlContent;
    if (!kmlContent) {
      // Build basic KML
      kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${layer.name}</name>
    <description>${layer.description}</description>
    ${(layer.features || [])
      .map((f) => {
        if (f.featureType === 'Point' && Array.isArray(f.coordinates) && typeof f.coordinates[0] === 'number') {
          const coords = f.coordinates as [number, number];
          return `    <Placemark>
      <name>${f.name}</name>
      <description>${f.description || ''}</description>
      <Point>
        <coordinates>${coords[1]},${coords[0]},0</coordinates>
      </Point>
    </Placemark>`;
        }
        return '';
      })
      .join('\n')}
  </Document>
</kml>`;
    }

    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetDefaults = () => {
    setShowResetConfirmModal(true);
  };

  const confirmResetDefaults = () => {
    INITIAL_KML_LAYERS.forEach((layer) => {
      if (!mapLayers.some((l) => l.name === layer.name)) {
        addMapLayer(layer);
      }
    });
    setShowResetConfirmModal(false);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner / Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Operational KML Map Layers & Sector GIS
                </h2>
                <p className="text-xs text-slate-400">
                  Manage tactical sector boundaries, emergency water points, VHF towers, staging zones, and GIS overlays.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition border border-slate-700"
              title="Ensure Hartbeesfontein default sector and water layers are loaded"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Baseline</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New KML Layer</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Pill Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-medium">Total GIS Layers</span>
            <div className="text-xl font-bold text-white mt-0.5">{mapLayers.length}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-[11px] text-emerald-400 font-medium">Active on Tactical Map</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{activeCount}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-[11px] text-blue-400 font-medium">Features / Placemarks</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{totalFeaturesCount}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-[11px] text-purple-400 font-medium">Access Control</span>
            <div className="text-xs font-bold text-purple-300 mt-1">Role-Gated (POPIA)</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
        <button
          onClick={() => setSelectedCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
            selectedCategoryFilter === 'ALL'
              ? 'bg-slate-100 text-slate-900 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Layers ({mapLayers.length})
        </button>

        {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
          const count = mapLayers.filter((l) => l.category === catKey).length;
          if (count === 0 && selectedCategoryFilter !== catKey) return null;
          const Icon = meta.icon;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategoryFilter(catKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                selectedCategoryFilter === catKey
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{meta.label.split('(')[0].trim()} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Layers List Cards */}
      <div className="space-y-3">
        {filteredLayers.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No KML map layers found for this filter</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload a `.kml` or `.kmz` file or click "Reload Baseline" to load standard Hartbeesfontein sector boundaries and water points.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Layer</span>
            </button>
          </div>
        ) : (
          filteredLayers.map((layer) => {
            const meta = CATEGORY_META[layer.category] || CATEGORY_META.CUSTOM;
            const CategoryIcon = meta.icon;
            const isExpanded = expandedLayerId === layer.id;

            return (
              <div
                key={layer.id}
                className={`bg-slate-900 border transition-all rounded-2xl overflow-hidden ${
                  layer.isActive ? 'border-slate-800 shadow-md' : 'border-slate-800/40 opacity-75'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold border shadow-inner"
                      style={{
                        backgroundColor: `${layer.colorHex || meta.defaultColor}20`,
                        borderColor: `${layer.colorHex || meta.defaultColor}50`,
                        color: layer.colorHex || meta.defaultColor,
                      }}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{layer.name}</h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            backgroundColor: `${layer.colorHex || meta.defaultColor}15`,
                            borderColor: `${layer.colorHex || meta.defaultColor}40`,
                            color: layer.colorHex || meta.defaultColor,
                          }}
                        >
                          {meta.label.split('(')[0].trim()}
                        </span>
                        <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md font-mono">
                          v{layer.version}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">{layer.description}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{layer.placemarkCount || layer.features?.length || 0} features</span>
                        </span>
                        <span>•</span>
                        <span>Uploaded by: <strong className="text-slate-300 font-medium">{layer.uploadedByName}</strong></span>
                        <span>•</span>
                        <span>{new Date(layer.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Toggle */}
                  <div className="flex items-center gap-2 justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* Active/Inactive Map Toggle */}
                    <button
                      onClick={() => toggleMapLayerActive(layer.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        layer.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                      }`}
                      title={layer.isActive ? 'Visible on map' : 'Hidden from map'}
                    >
                      {layer.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{layer.isActive ? 'Active on Map' : 'Inactive'}</span>
                    </button>

                    {/* Download KML */}
                    <button
                      onClick={() => handleDownloadKml(layer)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                      title="Download KML file"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Expand Feature Details */}
                    <button
                      onClick={() => setExpandedLayerId(isExpanded ? null : layer.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                      title="Inspect Placemarks & Geometries"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setLayerToDelete(layer)}
                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition"
                      title="Delete layer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Feature Details Table */}
                {isExpanded && (
                  <div className="bg-slate-950/70 border-t border-slate-800 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span>Placemarks & Geometric Elements ({layer.features?.length || 0})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Visibility:</span>
                        {layer.visibilityRoles?.map((r) => (
                          <span key={r} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(!layer.features || layer.features.length === 0) ? (
                      <p className="text-xs text-slate-500 italic">No structured placemarks extracted.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                        {layer.features.map((feat, idx) => (
                          <div
                            key={feat.id || idx}
                            className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{feat.name}</span>
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                {feat.featureType}
                              </span>
                            </div>
                            {feat.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">{feat.description}</p>
                            )}
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              Coords: {Array.isArray(feat.coordinates) && Array.isArray(feat.coordinates[0])
                                ? `${(feat.coordinates as any[]).length} vertices`
                                : Array.isArray(feat.coordinates) && typeof (feat.coordinates as any)[0] === 'number'
                                ? `${((feat.coordinates as [number, number])[0] ?? 0).toFixed(4)}, ${((feat.coordinates as [number, number])[1] ?? 0).toFixed(4)}`
                                : 'Coordinates stored'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Upload KML Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
            {/* Modal Header */}
            <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Upload Operational KML / GIS Layer</h3>
                  <p className="text-xs text-slate-400">Import Google Earth KML/KMZ or XML files for tactical dispatch.</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUploadedLayer} className="p-6 space-y-5 text-xs">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".kml,.xml,.kmz,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-amber-400 mx-auto transition" />
                <div className="text-sm font-semibold text-slate-200">
                  Click to browse or drop your .kml or .kmz file here
                </div>
                <p className="text-[11px] text-slate-500">
                  Supports Google Earth Placemarks, Polygons, LineStrings, Multigeometries and GPS Waypoints.
                </p>
              </div>

              {uploadStatus && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-slate-300 font-semibold">
                    Layer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. Sektor B Brandpunte & Boorgatdamme"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as KmlLayerCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Version</label>
                  <input
                    type="text"
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    placeholder="e.g. 2026.1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-slate-300 font-semibold">Description & Operational Notes</label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Provide context regarding gate access, hazardous dams, or VHF repeater coverage..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Layer Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={uploadColor}
                      onChange={(e) => setUploadColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                    />
                    <input
                      type="text"
                      value={uploadColor}
                      onChange={(e) => setUploadColor(e.target.value)}
                      className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-slate-300 font-semibold">
                    Authorized Visibility Roles (POPIA Need-To-Know)
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {ALL_ROLES.map(({ role, label }) => {
                      const isSelected = uploadRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleToggle(role)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition border ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save & Activate Layer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {layerToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete KML Layer</h3>
                <p className="text-xs text-slate-400">Irreversible operational action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete the tactical layer <span className="font-bold text-white">"{layerToDelete.name}"</span>? 
              This will remove its geometries and boundaries from all dispatch controllers and field operations maps.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLayerToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMapLayer(layerToDelete.id);
                  setLayerToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Layer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Defaults Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Restore Standard Layers</h3>
                <p className="text-xs text-slate-400">Baseline Hartbeesfontein KML Overlays</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will re-import any missing standard baseline KML layers (Sector Boundaries, Emergency Hydrants & Dams, High-Site Repeater Coverage, and Safe Staging Zones).
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetDefaults}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Restore Baseline Layers</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
