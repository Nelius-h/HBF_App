import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Car,
  HeartPulse,
  Home,
  Plus,
  Trash2,
  Save,
  Check,
  ShieldCheck,
  Lock,
  Phone,
  AlertTriangle,
  Flame,
  Droplets,
  Key,
  Radio,
  MapPin,
  Crosshair,
  Sliders,
  Sun,
  Moon,
  Monitor,
  Camera,
  Upload,
  Image,
  Star,
  Compass,
  Tag,
  Award,
  FileText,
  FileCheck,
  Eye,
  Download,
  ExternalLink,
  X,
  BadgeCheck,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FamilyMember,
  ClientVehicle,
  MedicalAidInfo,
  EmergencyPropertyInfo,
  CommunityResponseSettings,
  FarmGpsLocation,
  ClientProperty,
  CattleBrandMark,
  BrandMethodType,
  AnimalType,
} from '../../types';
import { NotificationSettingsModal } from '../common/NotificationSettingsModal';
import { useBackButton } from '../../hooks/useBackButton';

export const ClientProfile: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const { currentUser, updateCurrentUser } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'FAMILY' | 'PROPERTIES' | 'CATTLE' | 'VEHICLES' | 'MEDICAL' | 'PROPERTY'>('PERSONAL');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(isNotificationModalOpen, () => setIsNotificationModalOpen(false), 'profile-notifications-modal', 20);
  useBackButton(activeTab !== 'PERSONAL', () => setActiveTab('PERSONAL'), `profile-tab-${activeTab}`, 5);

  // Form states
  const [personal, setPersonal] = useState({
    name: currentUser.name || '',
    surname: currentUser.surname || '',
    primaryPhone: currentUser.primaryPhone || '',
    secondaryPhone: currentUser.secondaryPhone || '',
    farmName: currentUser.farmName || '',
    portionNumber: currentUser.portionNumber || '',
    sector: currentUser.sector || 'Sektor 2 - Noord',
    emergencyNotes: currentUser.emergencyNotes || '',
  });

  const [communitySettings, setCommunitySettings] = useState<CommunityResponseSettings>(
    currentUser.communityResponseSettings || {
      participateNearbyEmergencies: false,
      availableToAssistNow: true,
      maxResponseDistanceKm: 15,
      receiveSecurityAlerts: true,
      receiveFireAlerts: true,
      receiveTrafficAlerts: true,
      receiveBoloAlerts: true,
      receiveCommunityNotices: true,
      receiveAssistanceRequests: true,
      responseNotes: '',
    }
  );

  const [farmGps, setFarmGps] = useState<FarmGpsLocation>(
    currentUser.farmGpsLocation || {
      latitude: -26.763,
      longitude: 26.402,
      source: 'MANUAL_PIN',
      verifiedTimestamp: new Date().toISOString(),
    }
  );

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(currentUser.familyMembers || []);

  // Multi-property state
  const [properties, setProperties] = useState<ClientProperty[]>(() => {
    if (currentUser.properties && currentUser.properties.length > 0) {
      return currentUser.properties;
    }
    return [
      {
        id: `PROP-MAIN-${currentUser.uid || '1'}`,
        name: currentUser.farmName || 'Hoofplaas (Primary Farm)',
        portionNumber: currentUser.portionNumber || 'Gedeelte 1',
        sector: currentUser.sector || 'Sektor 2 - Noord',
        isPrimary: true,
        gpsLocation: currentUser.farmGpsLocation || {
          latitude: -26.763,
          longitude: 26.402,
          source: 'MANUAL_PIN',
          verifiedTimestamp: new Date().toISOString(),
        },
        gateCode: currentUser.emergencyPropertyInfo?.mainGateCode || '',
        secondaryGateCode: currentUser.emergencyPropertyInfo?.secondaryGateInfo || '',
        accessDirections: currentUser.emergencyPropertyInfo?.alternativeEntrance || '',
        dangerousAnimals: currentUser.emergencyPropertyInfo?.dangerousAnimals || '',
        waterPoints: currentUser.emergencyPropertyInfo?.waterPoints || '',
        firefightingEquipment: currentUser.emergencyPropertyInfo?.firefightingEquipment || '',
        notes: currentUser.emergencyNotes || '',
      },
    ];
  });

  const [vehicles, setVehicles] = useState<ClientVehicle[]>(currentUser.vehicles || []);
  const [medicalAid, setMedicalAid] = useState<MedicalAidInfo>(
    currentUser.medicalAid || {
      schemeName: '',
      membershipNumber: '',
      principalMember: '',
      emergencyContactNumber: '',
      additionalInfo: '',
    }
  );
  const [propertyInfo, setPropertyInfo] = useState<EmergencyPropertyInfo>(
    currentUser.emergencyPropertyInfo || {
      mainGateCode: '',
      secondaryGateInfo: '',
      dangerousAnimals: '',
      electricFenceInfo: '',
      alternativeEntrance: '',
      firefightingEquipment: '',
      waterPoints: '',
      hazardousMaterials: '',
      accessDifficulties: '',
      additionalResponderInfo: '',
    }
  );

  // Livestock & Cattle Identification Marks (Brandmerke & DALRRD Sertifikate)
  const [cattleMarks, setCattleMarks] = useState<CattleBrandMark[]>(() => {
    if (currentUser.cattleIdentificationMarks && currentUser.cattleIdentificationMarks.length > 0) {
      return currentUser.cattleIdentificationMarks;
    }
    if (currentUser.cattleBrandCode) {
      return [
        {
          id: `CBM-${Date.now()}`,
          brandCode: currentUser.cattleBrandCode,
          registeredOwner: `${currentUser.name || ''} ${currentUser.surname || ''}`.trim() || 'Boerdery',
          certificateNumber: '',
          certificateDate: new Date().toISOString().split('T')[0],
          certificateFileUrl: currentUser.cattleBrandCertificateUrl || '',
          certificateFileName: currentUser.cattleBrandCertificateUrl ? 'DALRRD_Brandmerksertifikaat.pdf' : '',
          brandLocation: currentUser.cattleBrandLocation || 'Regter Dy (Right Thigh)',
          brandMethod: 'HOT_IRON',
          animalType: 'CATTLE',
          isPrimary: true,
        },
      ];
    }
    return [];
  });

  // Certificate Modal Lightbox / Viewer
  const [viewingCertificate, setViewingCertificate] = useState<{
    brandCode: string;
    registeredOwner?: string;
    certificateNumber?: string;
    certificateDate?: string;
    fileUrl: string;
    fileName?: string;
    fileType?: string;
  } | null>(null);

  // Synchronize state when switching accounts or when currentUser changes
  useEffect(() => {
    setPersonal({
      name: currentUser.name || '',
      surname: currentUser.surname || '',
      primaryPhone: currentUser.primaryPhone || '',
      secondaryPhone: currentUser.secondaryPhone || '',
      farmName: currentUser.farmName || '',
      portionNumber: currentUser.portionNumber || '',
      sector: currentUser.sector || 'Sektor 2 - Noord',
      emergencyNotes: currentUser.emergencyNotes || '',
    });
    setFamilyMembers(currentUser.familyMembers || []);
    setVehicles(currentUser.vehicles || []);
    if (currentUser.properties && currentUser.properties.length > 0) {
      setProperties(currentUser.properties);
    } else {
      setProperties([
        {
          id: `PROP-MAIN-${currentUser.uid || '1'}`,
          name: currentUser.farmName || 'Hoofplaas',
          portionNumber: currentUser.portionNumber || 'Gedeelte 1',
          sector: currentUser.sector || 'Sektor 2 - Noord',
          isPrimary: true,
          gpsLocation: currentUser.farmGpsLocation || {
            latitude: -26.763,
            longitude: 26.402,
            source: 'MANUAL_PIN',
            verifiedTimestamp: new Date().toISOString(),
          },
          gateCode: currentUser.emergencyPropertyInfo?.mainGateCode || '',
          secondaryGateCode: currentUser.emergencyPropertyInfo?.secondaryGateInfo || '',
          accessDirections: currentUser.emergencyPropertyInfo?.alternativeEntrance || '',
          dangerousAnimals: currentUser.emergencyPropertyInfo?.dangerousAnimals || '',
          waterPoints: currentUser.emergencyPropertyInfo?.waterPoints || '',
          firefightingEquipment: currentUser.emergencyPropertyInfo?.firefightingEquipment || '',
          notes: currentUser.emergencyNotes || '',
        },
      ]);
    }
    if (currentUser.medicalAid) {
      setMedicalAid(currentUser.medicalAid);
    }
    if (currentUser.emergencyPropertyInfo) {
      setPropertyInfo(currentUser.emergencyPropertyInfo);
    }
    if (currentUser.farmGpsLocation) {
      setFarmGps(currentUser.farmGpsLocation);
    }
    if (currentUser.cattleIdentificationMarks && currentUser.cattleIdentificationMarks.length > 0) {
      setCattleMarks(currentUser.cattleIdentificationMarks);
    }
    if (currentUser.communityResponseSettings) {
      setCommunitySettings(currentUser.communityResponseSettings);
    }
  }, [currentUser.uid]);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    setGpsError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFarmGps({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy),
            source: 'GPS',
            verifiedTimestamp: new Date().toISOString(),
          });
          setIsCapturingGps(false);
        },
        (error) => {
          setGpsError(error.message || 'GPS capture failed, please enter manually.');
          setIsCapturingGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsError('Geolocation is not supported by your browser.');
      setIsCapturingGps(false);
    }
  };

  const handleSaveAll = () => {
    const updatedProperties: ClientProperty[] = properties.length > 0
      ? properties.map((p, idx) => {
          if (p.isPrimary || idx === 0) {
            return {
              ...p,
              name: personal.farmName.trim() || p.name,
              portionNumber: personal.portionNumber.trim() || p.portionNumber,
              sector: personal.sector || p.sector,
              gpsLocation: farmGps || p.gpsLocation,
            };
          }
          return p;
        })
      : [
          {
            id: `PROP-MAIN-${currentUser.uid || '1'}`,
            name: personal.farmName.trim() || 'Hoofplaas',
            portionNumber: personal.portionNumber.trim() || 'Gedeelte 1',
            sector: personal.sector || 'Sektor 2 - Noord',
            isPrimary: true,
            gpsLocation: farmGps,
            gateCode: propertyInfo.mainGateCode || '',
            secondaryGateCode: propertyInfo.secondaryGateInfo || '',
            accessDirections: propertyInfo.alternativeEntrance || '',
            dangerousAnimals: propertyInfo.dangerousAnimals || '',
            waterPoints: propertyInfo.waterPoints || '',
            firefightingEquipment: propertyInfo.firefightingEquipment || '',
            notes: personal.emergencyNotes || '',
          },
        ];

    const primaryCattle = cattleMarks.find((m) => m.isPrimary) || cattleMarks[0];

    updateCurrentUser({
      name: personal.name.trim(),
      surname: personal.surname.trim(),
      primaryPhone: personal.primaryPhone.trim(),
      secondaryPhone: personal.secondaryPhone.trim(),
      farmName: personal.farmName.trim(),
      portionNumber: personal.portionNumber.trim(),
      sector: personal.sector,
      emergencyNotes: personal.emergencyNotes.trim(),
      familyMembers,
      properties: updatedProperties,
      vehicles,
      medicalAid,
      cattleIdentificationMarks: cattleMarks,
      cattleBrandCode: primaryCattle?.brandCode || '',
      cattleBrandCertificateUrl: primaryCattle?.certificateFileUrl || '',
      cattleBrandLocation: primaryCattle?.brandLocation || '',
      emergencyPropertyInfo: {
        ...propertyInfo,
        mainGateCode: propertyInfo.mainGateCode || updatedProperties[0]?.gateCode || '',
        secondaryGateInfo: propertyInfo.secondaryGateInfo || updatedProperties[0]?.secondaryGateCode || '',
        dangerousAnimals: propertyInfo.dangerousAnimals || updatedProperties[0]?.dangerousAnimals || '',
        waterPoints: propertyInfo.waterPoints || updatedProperties[0]?.waterPoints || '',
        firefightingEquipment: propertyInfo.firefightingEquipment || updatedProperties[0]?.firefightingEquipment || '',
        alternativeEntrance: propertyInfo.alternativeEntrance || updatedProperties[0]?.accessDirections || '',
      },
      farmGpsLocation: farmGps,
    });

    try {
      localStorage.setItem('hv_onboarding_completed', 'true');
      localStorage.setItem('hv_auth_user_uid', currentUser.uid);
    } catch (e) {
      console.warn('Storage sync error:', e);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Cattle Mark Helpers
  const handleAddCattleMark = () => {
    const newMark: CattleBrandMark = {
      id: `CBM-${Date.now()}`,
      brandCode: '',
      registeredOwner: `${personal.name} ${personal.surname}`.trim() || 'Boerdery',
      certificateNumber: '',
      certificateDate: new Date().toISOString().split('T')[0],
      certificateFileUrl: '',
      certificateFileName: '',
      certificateFileType: '',
      certificateUploadedAt: '',
      brandLocation: 'Regter Dy (Right Thigh)',
      brandMethod: 'HOT_IRON',
      animalType: 'CATTLE',
      earMarkDescription: '',
      microchipOrRfid: '',
      stockTheftNotes: '',
      isPrimary: cattleMarks.length === 0,
    };
    setCattleMarks([...cattleMarks, newMark]);
  };

  const handleRemoveCattleMark = (idx: number) => {
    const updated = cattleMarks.filter((_, i) => i !== idx);
    if (updated.length > 0 && !updated.some((m) => m.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setCattleMarks(updated);
  };

  const handleSetPrimaryCattleMark = (id: string) => {
    const updated = cattleMarks.map((m) => ({
      ...m,
      isPrimary: m.id === id,
    }));
    setCattleMarks(updated);
  };

  // Certificate Upload & File Reader (Supports PDF, JPG, PNG, WEBP)
  const handleCertificateUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        const updated = [...cattleMarks];
        updated[idx] = {
          ...updated[idx],
          certificateFileUrl: result,
          certificateFileName: file.name,
          certificateFileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          certificateUploadedAt: new Date().toISOString(),
        };
        setCattleMarks(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCertificate = (idx: number) => {
    const updated = [...cattleMarks];
    updated[idx] = {
      ...updated[idx],
      certificateFileUrl: '',
      certificateFileName: '',
      certificateFileType: '',
      certificateUploadedAt: '',
    };
    setCattleMarks(updated);
  };

  // Brand Mark Photo / Hide Photo Upload
  const handleBrandPhotoUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        const updated = [...cattleMarks];
        updated[idx] = {
          ...updated[idx],
          brandMarkPhotoUrl: result,
        };
        setCattleMarks(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBrandPhoto = (idx: number) => {
    const updated = [...cattleMarks];
    updated[idx] = {
      ...updated[idx],
      brandMarkPhotoUrl: '',
    };
    setCattleMarks(updated);
  };

  // Add Family Member Helper
  const handleAddFamilyMember = () => {
    const newMember: FamilyMember = {
      id: `FAM-${Date.now()}`,
      name: '',
      surname: personal.surname || '',
      relationship: 'Gesinslid / Family',
      phone: '',
      bloodType: '',
      healthInfo: '',
      emergencyNotes: '',
      photoUrl: '',
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  // Handle Photo upload / file picker for family member
  const handleFamilyPhotoUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        const updated = [...familyMembers];
        updated[idx].photoUrl = result;
        setFamilyMembers(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Property Helper
  const handleAddProperty = () => {
    const newProp: ClientProperty = {
      id: `PROP-${Date.now()}`,
      name: `Plaas / Perseel #${properties.length + 1}`,
      portionNumber: 'Gedeelte 1',
      sector: personal.sector || 'Sektor 2 - Noord',
      isPrimary: properties.length === 0,
      gpsLocation: {
        latitude: currentUser.farmGpsLocation?.latitude || -26.7635,
        longitude: currentUser.farmGpsLocation?.longitude || 26.4168,
        source: 'MANUAL_PIN',
        verifiedTimestamp: new Date().toISOString(),
      },
      gateCode: '',
      secondaryGateCode: '',
      accessDirections: '',
      dangerousAnimals: '',
      waterPoints: '',
      firefightingEquipment: '',
      notes: '',
    };
    setProperties([...properties, newProp]);
  };

  const handleSetPrimaryProperty = (id: string) => {
    const updated = properties.map((p) => ({
      ...p,
      isPrimary: p.id === id,
    }));
    setProperties(updated);
  };

  const handleCapturePropertyGps = (idx: number) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const updated = [...properties];
          updated[idx].gpsLocation = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy),
            source: 'GPS',
            verifiedTimestamp: new Date().toISOString(),
          };
          setProperties(updated);
        },
        () => {
          alert('GPS capture failed. Please enter coordinates manually.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // Add Vehicle Helper
  const handleAddVehicle = () => {
    const newVehicle: ClientVehicle = {
      id: `VEH-${Date.now()}`,
      year: new Date().getFullYear(),
      make: '',
      model: '',
      bodyType: 'Bakkie',
      color: '',
      licensePlate: '',
      vin: '',
      distinguishingFeatures: '',
    };
    setVehicles([...vehicles, newVehicle]);
  };

  return (
    <div className="max-w-3xl mx-auto px-3.5 py-4 space-y-4">
      {/* Title & Save Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>{t.profile.title}</span>
          </h2>
          <p className="text-xs text-slate-400">{currentUser.farmName || 'Hartbeesfontein'}</p>
        </div>

        <button
          onClick={handleSaveAll}
          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? t.profile.saveSuccess : t.common.save}</span>
        </button>
      </div>

      {/* Tabs Navigation - Grid / Flex wrap to display all tabs without swiping */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-900 rounded-2xl p-1.5 border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PERSONAL')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl transition text-center sm:text-left ${
            activeTab === 'PERSONAL'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">{t.profile.personalTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('FAMILY')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl transition text-center sm:text-left ${
            activeTab === 'FAMILY'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">{t.profile.familyTab} ({familyMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROPERTIES')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl transition text-center sm:text-left ${
            activeTab === 'PROPERTIES'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Home className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">{t.profile.propertiesTab || 'Plaas & Eiendom'} ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CATTLE')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl transition text-center sm:text-left ${
            activeTab === 'CATTLE'
              ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Tag className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="truncate">{t.profile.cattleTab || 'Vee- & Brandmerke'} ({cattleMarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('VEHICLES')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl transition text-center sm:text-left ${
            activeTab === 'VEHICLES'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Car className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">{t.profile.vehiclesTab} ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROPERTY')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl transition text-center sm:text-left ${
            activeTab === 'PROPERTY'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Key className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">{t.profile.propertyTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('MEDICAL')}
          className={`flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl transition text-center sm:text-left ${
            activeTab === 'MEDICAL'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
          <span className="truncate">{t.profile.medicalTab}</span>
        </button>
      </div>

      {/* Sensitive Data Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p>{t.profile.privateNotice}</p>
      </div>

      {/* TAB 1: MEMBER DETAILS */}
      {activeTab === 'PERSONAL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.name} *</label>
              <input
                type="text"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.surname} *</label>
              <input
                type="text"
                value={personal.surname}
                onChange={(e) => setPersonal({ ...personal, surname: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.primaryPhone} *</label>
              <input
                type="tel"
                value={personal.primaryPhone}
                onChange={(e) => setPersonal({ ...personal, primaryPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.secondaryPhone}</label>
              <input
                type="tel"
                value={personal.secondaryPhone}
                onChange={(e) => setPersonal({ ...personal, secondaryPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.farmName} *</label>
              <input
                type="text"
                value={personal.farmName}
                onChange={(e) => setPersonal({ ...personal, farmName: e.target.value })}
                placeholder="e.g. Rooipoort, Tierfontein"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.portionNumber}</label>
              <input
                type="text"
                value={personal.portionNumber}
                onChange={(e) => setPersonal({ ...personal, portionNumber: e.target.value })}
                placeholder="e.g. Ged 14 / Plot 4"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t.profile.sector}</label>
            <select
              value={personal.sector}
              onChange={(e) => setPersonal({ ...personal, sector: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="Sektor 1 - Suid (R30 Ottosdal)">Sektor 1 - Suid (R30 Ottosdal)</option>
              <option value="Sektor 2 - Noord (Rooipoort & Driefontein)">Sektor 2 - Noord (Rooipoort & Driefontein)</option>
              <option value="Sektor 3 - Oos (R503 Klerksdorp/Silos)">Sektor 3 - Oos (R503 Klerksdorp/Silos)</option>
              <option value="Hartbeesfontein Dorp">Hartbeesfontein Dorp</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t.profile.emergencyNotes}</label>
            <textarea
              rows={3}
              value={personal.emergencyNotes}
              onChange={(e) => setPersonal({ ...personal, emergencyNotes: e.target.value })}
              placeholder="Any critical general notes for first responders..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Theme & Appearance Preference Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-slate-300 font-bold text-xs">{t.common.theme}</label>
                <p className="text-[11px] text-slate-400">
                  {language === 'af'
                    ? 'Wissel tussen donkermodus vir nagtelike patrollies of helder ligtemodus vir daglig.'
                    : 'Switch between dark mode for night patrols or light mode for daylight.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  themeMode === 'dark'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-xs">{t.common.darkMode}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Nag / Night</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  themeMode === 'light'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xs">{t.common.lightMode}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Dag / Daylight</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  themeMode === 'system'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-xs">{t.common.systemMode}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Auto Stelsel</span>
              </button>
            </div>
          </div>

          {/* Customizable Notifications & Sound Alerts Card */}
          <div className="pt-3 border-t border-slate-800">
            <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs sm:text-sm">
                    Kennisgewings & Waarskuwings-Klanke
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Stel pasgemaakte toonsoorte en volumes in vir Verkeer-, Noodsein- (SOS), Brand- en Sekuriteitswaarskuwings.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(true)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Pasmaak Klanke & Stootboodskappe</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FAMILY MEMBERS */}
      {activeTab === 'FAMILY' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 font-medium">List residents and family on property with photo identification:</p>
            <button
              onClick={handleAddFamilyMember}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.profile.addFamilyMember}</span>
            </button>
          </div>

          {familyMembers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              {t.profile.noFamilyMembers}
            </div>
          ) : (
            familyMembers.map((fam, idx) => (
              <div key={fam.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative">
                <button
                  onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))}
                  className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1"
                  title="Remove family member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Family Member #{idx + 1}</span>
                </div>

                {/* Photo Upload & Preview Section */}
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                    {fam.photoUrl ? (
                      <img
                        src={fam.photoUrl}
                        alt={`${fam.name} ${fam.surname}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 p-1 text-center">
                        <Users className="w-7 h-7 text-slate-600 mb-0.5" />
                        <span className="text-[9px] leading-tight">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-center gap-1.5">
                    <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.profile.memberPhoto || 'Member Photo / ID'}</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload a photo to aid response teams and control room in immediate field identification.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-sm transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{fam.photoUrl ? (t.profile.changePhoto || 'Change Photo') : (t.profile.uploadPhoto || 'Upload Photo')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFamilyPhotoUpload(idx, e)}
                        />
                      </label>
                      {fam.photoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...familyMembers];
                            updated[idx].photoUrl = '';
                            setFamilyMembers(updated);
                          }}
                          className="text-red-400 hover:text-red-300 bg-red-950/40 border border-red-800/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.profile.removePhoto || 'Remove'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.name}</label>
                    <input
                      type="text"
                      value={fam.name}
                      onChange={(e) => {
                        const updated = [...familyMembers];
                        updated[idx].name = e.target.value;
                        setFamilyMembers(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.surname}</label>
                    <input
                      type="text"
                      value={fam.surname}
                      onChange={(e) => {
                        const updated = [...familyMembers];
                        updated[idx].surname = e.target.value;
                        setFamilyMembers(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.relationship}</label>
                    <input
                      type="text"
                      value={fam.relationship}
                      onChange={(e) => {
                        const updated = [...familyMembers];
                        updated[idx].relationship = e.target.value;
                        setFamilyMembers(updated);
                      }}
                      placeholder="e.g. Spouse, Son, Daughter"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={fam.phone || ''}
                      onChange={(e) => {
                        const updated = [...familyMembers];
                        updated[idx].phone = e.target.value;
                        setFamilyMembers(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.bloodType}</label>
                    <input
                      type="text"
                      value={fam.bloodType || ''}
                      onChange={(e) => {
                        const updated = [...familyMembers];
                        updated[idx].bloodType = e.target.value;
                        setFamilyMembers(updated);
                      }}
                      placeholder="e.g. O+, A-, B+"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.profile.healthInfo}</label>
                  <input
                    type="text"
                    value={fam.healthInfo || ''}
                    onChange={(e) => {
                      const updated = [...familyMembers];
                      updated[idx].healthInfo = e.target.value;
                      setFamilyMembers(updated);
                    }}
                    placeholder="Allergies, chronic conditions, medication needs..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: PROPERTIES / FARMS WITH LOCATIONS */}
      {activeTab === 'PROPERTIES' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-200 font-bold text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Registered Properties & Locations</span>
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Manage multiple farm plots, homesteads, outposts, and exact GPS coordinates:
              </p>
            </div>
            <button
              onClick={handleAddProperty}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-xs shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.profile.addProperty || 'Add Property / Farm'}</span>
            </button>
          </div>

          {properties.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              {t.profile.noProperties || 'No registered properties found.'}
            </div>
          ) : (
            properties.map((prop, idx) => (
              <div
                key={prop.id}
                className={`bg-slate-900 border rounded-2xl p-4 space-y-3.5 relative transition ${
                  prop.isPrimary ? 'border-emerald-500/60 ring-1 ring-emerald-500/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{prop.name || 'Unnamed Property'}</span>
                    {prop.isPrimary ? (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-400" />
                        {t.profile.primaryProperty || 'Primary'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryProperty(prop.id)}
                        className="text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 px-2 py-0.5 rounded text-[10px] transition"
                      >
                        {t.profile.setAsPrimary || 'Set as Primary'}
                      </button>
                    )}
                  </div>

                  {properties.length > 1 && (
                    <button
                      onClick={() => setProperties(properties.filter((_, i) => i !== idx))}
                      className="absolute top-3.5 right-3 text-slate-500 hover:text-red-400 p-1"
                      title="Remove property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.farmName || 'Farm / Property Name'} *
                    </label>
                    <input
                      type="text"
                      value={prop.name}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].name = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      placeholder="e.g. Rietfontein Hoofplaas"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.portionNumber || 'Portion / Lot'}
                    </label>
                    <input
                      type="text"
                      value={prop.portionNumber || ''}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].portionNumber = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      placeholder="e.g. Gedeelte 4 / Hoewe 12"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.sector || 'Sector / Zone'}
                    </label>
                    <select
                      value={prop.sector || 'Sektor 2 - Noord'}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].sector = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="Sektor 1 - Suid">Sektor 1 - Suid</option>
                      <option value="Sektor 2 - Noord">Sektor 2 - Noord</option>
                      <option value="Sektor 3 - Oos">Sektor 3 - Oos</option>
                      <option value="Sektor 4 - Wes">Sektor 4 - Wes</option>
                      <option value="Hartbeesfontein Dorp">Hartbeesfontein Dorp</option>
                    </select>
                  </div>
                </div>

                {/* GPS Location Component per Property */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.profile.propertyLocation || 'GPS Location & Coordinates'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCapturePropertyGps(idx)}
                      className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold shadow-sm"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Live GPS Tag</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Latitude (°S)</label>
                      <input
                        type="number"
                        step="any"
                        value={prop.gpsLocation.latitude}
                        onChange={(e) => {
                          const updated = [...properties];
                          updated[idx].gpsLocation = {
                            ...updated[idx].gpsLocation,
                            latitude: parseFloat(e.target.value) || 0,
                            source: 'MANUAL_PIN',
                          };
                          setProperties(updated);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Longitude (°E)</label>
                      <input
                        type="number"
                        step="any"
                        value={prop.gpsLocation.longitude}
                        onChange={(e) => {
                          const updated = [...properties];
                          updated[idx].gpsLocation = {
                            ...updated[idx].gpsLocation,
                            longitude: parseFloat(e.target.value) || 0,
                            source: 'MANUAL_PIN',
                          };
                          setProperties(updated);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>
                      Map link:{' '}
                      {prop.gpsLocation && prop.gpsLocation.latitude != null && prop.gpsLocation.longitude != null ? (
                        <a
                          href={`https://maps.google.com/?q=${prop.gpsLocation.latitude},${prop.gpsLocation.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          {Number(prop.gpsLocation.latitude).toFixed(5)}, {Number(prop.gpsLocation.longitude).toFixed(5)}
                        </a>
                      ) : (
                        <span className="text-slate-500">Unspecified</span>
                      )}
                    </span>
                    <span className="text-slate-500 font-mono">Source: {prop.gpsLocation?.source || 'GPS'}</span>
                  </div>
                </div>

                {/* Gate Codes & Critical Access Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.mainGateCode || 'Main Gate Code / Lock Combination'}
                    </label>
                    <input
                      type="text"
                      value={prop.gateCode || ''}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].gateCode = e.target.value;
                        setProperties(updated);
                      }}
                      placeholder="e.g. #4829 or Master Key in safe"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.secondaryGateInfo || 'Secondary Gate / Homestead Padlock'}
                    </label>
                    <input
                      type="text"
                      value={prop.secondaryGateCode || ''}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].secondaryGateCode = e.target.value;
                        setProperties(updated);
                      }}
                      placeholder="e.g. Back gate padlock: 1984"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.dangerousAnimals || 'Dangerous Animals / Dogs'}
                    </label>
                    <input
                      type="text"
                      value={prop.dangerousAnimals || ''}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].dangerousAnimals = e.target.value;
                        setProperties(updated);
                      }}
                      placeholder="e.g. 2 Boerboele at main house"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.waterPoints || 'Water Points / Borehole'}
                    </label>
                    <input
                      type="text"
                      value={prop.waterPoints || ''}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].waterPoints = e.target.value;
                        setProperties(updated);
                      }}
                      placeholder="e.g. 10,000L Jojo tank & pump"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.firefightingEquipment || 'Fire Fighting Equipment'}
                    </label>
                    <input
                      type="text"
                      value={prop.firefightingEquipment || ''}
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[idx].firefightingEquipment = e.target.value;
                        setProperties(updated);
                      }}
                      placeholder="e.g. Bakkie sakkie unit + beaters"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {t.profile.accessDirections || 'Access Directions / Road Condition'}
                  </label>
                  <input
                    type="text"
                    value={prop.accessDirections || ''}
                    onChange={(e) => {
                      const updated = [...properties];
                      updated[idx].accessDirections = e.target.value;
                      setProperties(updated);
                    }}
                    placeholder="Turn off R507 at white windmill, follow gravel road 1.2km..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: CATTLE & LIVESTOCK IDENTIFICATION MARKS */}
      {activeTab === 'CATTLE' && (
        <div className="space-y-4 text-xs">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{t.profile.cattleMarksTitle}</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {t.profile.cattleMarksSubtitle}
              </p>
            </div>
            <button
              onClick={handleAddCattleMark}
              className="self-start sm:self-auto bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.profile.addCattleMark}</span>
            </button>
          </div>

          {/* Legal Compliance & SAPS Stock Theft Notice */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3.5 text-[11px] text-amber-200/90 flex items-start gap-3 shadow-inner">
            <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300">
                Wet op Identifikasie van Diere (Wet 6 van 2002) / Animal Identification Act 6 of 2002
              </p>
              <p className="text-slate-300 leading-relaxed">
                {t.profile.dalrrdComplianceNote}
              </p>
            </div>
          </div>

          {/* Cattle Marks List */}
          {cattleMarks.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
                <Tag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-300 text-sm">{t.profile.noCattleMarks}</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Voeg u geregistreerde veebrandmerk, oorkepe, mikroskyfie-reeks en amptelike Landbou brandmerksertifikaat hier by.
                </p>
              </div>
              <button
                onClick={handleAddCattleMark}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t.profile.addCattleMark}</span>
              </button>
            </div>
          ) : (
            cattleMarks.map((mark, idx) => (
              <div
                key={mark.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 relative shadow-sm"
              >
                {/* Top Bar of Card */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-200 text-xs">
                      {mark.brandCode ? `Brandmerk: ${mark.brandCode}` : `Brandmerk #${idx + 1}`}
                    </span>
                    {mark.isPrimary ? (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{t.profile.primaryBrandBadge}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetPrimaryCattleMark(mark.id)}
                        className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                      >
                        {t.profile.setAsPrimaryBrand}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveCattleMark(idx)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title={t.common.delete || 'Verwyder'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Visual Stamp & Brand Preview Emblem */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-amber-950/40 border-2 border-amber-700/60 flex flex-col items-center justify-center shadow-inner text-center p-1">
                      <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">BRAND</span>
                      <span className="text-base font-black font-mono text-amber-300 tracking-widest uppercase">
                        {mark.brandCode || '---'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">
                        {mark.registeredOwner || personal.farmName || 'Geregistreerde Eienaar'}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="text-amber-400 font-semibold">{mark.brandLocation || 'Regter Dy (Right Thigh)'}</span>
                        <span>•</span>
                        <span>{mark.brandMethod || 'Warmyster (Hot Iron)'}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {mark.certificateNumber ? `Sertifikaat: ${mark.certificateNumber}` : 'Geen sertifikaatnommer ingevoer'}
                      </p>
                    </div>
                  </div>

                  {mark.certificateFileUrl ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setViewingCertificate({
                            brandCode: mark.brandCode,
                            registeredOwner: mark.registeredOwner,
                            certificateNumber: mark.certificateNumber,
                            certificateDate: mark.certificateDate,
                            fileUrl: mark.certificateFileUrl || '',
                            fileName: mark.certificateFileName || 'Brandmerksertifikaat',
                            fileType: mark.certificateFileType,
                          })
                        }
                        className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.profile.viewCertificate}</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      Sertifikaat benodig
                    </span>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.brandCode} *
                    </label>
                    <input
                      type="text"
                      value={mark.brandCode}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].brandCode = e.target.value.toUpperCase();
                        setCattleMarks(updated);
                      }}
                      placeholder="bv. CH 8 of JH 2"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm tracking-wider uppercase focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.registeredOwner} *
                    </label>
                    <input
                      type="text"
                      value={mark.registeredOwner}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].registeredOwner = e.target.value;
                        setCattleMarks(updated);
                      }}
                      placeholder="bv. Cornelius Hattingh Boerdery BK / Trust"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.certificateNumber}
                    </label>
                    <input
                      type="text"
                      value={mark.certificateNumber || ''}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].certificateNumber = e.target.value.toUpperCase();
                        setCattleMarks(updated);
                      }}
                      placeholder="bv. DALRRD-BM-2023-7419"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.certificateDate}
                    </label>
                    <input
                      type="date"
                      value={mark.certificateDate || ''}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].certificateDate = e.target.value;
                        setCattleMarks(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.animalCategory}
                    </label>
                    <select
                      value={mark.animalType || 'CATTLE'}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].animalType = e.target.value as AnimalType;
                        setCattleMarks(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="CATTLE">Beeste / Cattle</option>
                      <option value="SHEEP">Skape / Sheep</option>
                      <option value="GOATS">Bokke / Goats</option>
                      <option value="HORSES">Perde / Horses</option>
                      <option value="PIGS">Varke / Pigs</option>
                      <option value="GENERAL">Algemene Vee / General Livestock</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.brandMethod}
                    </label>
                    <select
                      value={mark.brandMethod || 'HOT_IRON'}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].brandMethod = e.target.value as BrandMethodType;
                        setCattleMarks(updated);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="HOT_IRON">Warmyster Brandmerk / Hot Iron Brand</option>
                      <option value="FREEZE_BRAND">Vriesbrand / Freeze Brand</option>
                      <option value="EAR_NOTCH">Oorkeep / Ear Notch</option>
                      <option value="TATTOO">Tatoeëermerk / Tattoo</option>
                      <option value="RFID_MICROCHIP">RFID Mikroskyfie / Electronic Ear Tag</option>
                      <option value="COLLAR_TAG">Halsband / Collar Tag</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.brandPlacement} *
                    </label>
                    <input
                      type="text"
                      value={mark.brandLocation || ''}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].brandLocation = e.target.value;
                        setCattleMarks(updated);
                      }}
                      placeholder="bv. Regter Dy / Linker Blad / Regteroor"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.earMarkNotes}
                    </label>
                    <input
                      type="text"
                      value={mark.earMarkDescription || ''}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].earMarkDescription = e.target.value;
                        setCattleMarks(updated);
                      }}
                      placeholder="bv. Swaelstert regs, stomp links, winkelhaak"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {t.profile.rfidNotes}
                    </label>
                    <input
                      type="text"
                      value={mark.microchipOrRfid || ''}
                      onChange={(e) => {
                        const updated = [...cattleMarks];
                        updated[idx].microchipOrRfid = e.target.value;
                        setCattleMarks(updated);
                      }}
                      placeholder="bv. RFID Reeks: 982 000182 4491 tot 4850"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {t.profile.stockTheftUnitNotes}
                  </label>
                  <input
                    type="text"
                    value={mark.stockTheftNotes || ''}
                    onChange={(e) => {
                      const updated = [...cattleMarks];
                      updated[idx].stockTheftNotes = e.target.value;
                      setCattleMarks(updated);
                    }}
                    placeholder="bv. Geregistreer by Hartbeesfontein SAPD Veediefstaleenheid; Kontak Sersant Van Zyl"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                {/* Official Certificate Document Upload Section */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs">
                        {t.profile.certificateUpload}
                      </span>
                    </div>
                    {mark.certificateFileUrl && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" />
                        <span>Sertifikaat Aangeheg</span>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {t.profile.certificateUploadDesc}
                  </p>

                  {mark.certificateFileUrl ? (
                    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">
                            {mark.certificateFileName || 'Brandmerksertifikaat Document'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {mark.certificateFileType || 'Amptelike DALRRD Dokument'} {mark.certificateUploadedAt ? `• ${new Date(mark.certificateUploadedAt).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setViewingCertificate({
                              brandCode: mark.brandCode,
                              registeredOwner: mark.registeredOwner,
                              certificateNumber: mark.certificateNumber,
                              certificateDate: mark.certificateDate,
                              fileUrl: mark.certificateFileUrl || '',
                              fileName: mark.certificateFileName || 'Brandmerksertifikaat',
                              fileType: mark.certificateFileType,
                            })
                          }
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t.profile.viewCertificate}</span>
                        </button>

                        <a
                          href={mark.certificateFileUrl}
                          download={mark.certificateFileName || `Brandmerksertifikaat_${mark.brandCode || 'DALRRD'}`}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>{t.profile.downloadCertificate}</span>
                        </a>

                        <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.profile.changeCertificate}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf,application/pdf"
                            onChange={(e) => handleCertificateUpload(idx, e)}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveCertificate(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                          title={t.profile.removeCertificate}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-900/40 hover:bg-slate-900/80">
                      <Upload className="w-6 h-6 text-amber-400" />
                      <div className="text-center">
                        <span className="font-bold text-slate-200 text-xs block">
                          {t.profile.uploadCertificate}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Amptelike Registrasiesertifikaat van Registrateur van Diere-identifikasie (DALRRD)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        onChange={(e) => handleCertificateUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Brand Iron Tool Photo / Hide Mark Photo (Optional) */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-300 text-xs block">
                        {t.profile.brandMarkPhoto}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {t.profile.brandMarkPhotoDesc}
                      </span>
                    </div>
                  </div>

                  {mark.brandMarkPhotoUrl ? (
                    <div className="flex items-center gap-2.5">
                      <img
                        src={mark.brandMarkPhotoUrl}
                        alt="Brand Mark"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBrandPhoto(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.profile.uploadPhoto}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBrandPhotoUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: VEHICLES */}
      {activeTab === 'VEHICLES' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 font-medium">Authorized farm and household vehicles:</p>
            <button
              onClick={handleAddVehicle}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.profile.addVehicle}</span>
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              {t.profile.noVehicles}
            </div>
          ) : (
            vehicles.map((veh, idx) => (
              <div key={veh.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative">
                <button
                  onClick={() => setVehicles(vehicles.filter((_, i) => i !== idx))}
                  className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span>Vehicle #{idx + 1} — {veh.licensePlate || 'Unregistered'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.plate} *</label>
                    <input
                      type="text"
                      value={veh.licensePlate}
                      onChange={(e) => {
                        const updated = [...vehicles];
                        updated[idx].licensePlate = e.target.value.toUpperCase();
                        setVehicles(updated);
                      }}
                      placeholder="e.g. HBF 492 NW"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.make} *</label>
                    <input
                      type="text"
                      value={veh.make}
                      onChange={(e) => {
                        const updated = [...vehicles];
                        updated[idx].make = e.target.value;
                        setVehicles(updated);
                      }}
                      placeholder="e.g. Toyota"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.model} *</label>
                    <input
                      type="text"
                      value={veh.model}
                      onChange={(e) => {
                        const updated = [...vehicles];
                        updated[idx].model = e.target.value;
                        setVehicles(updated);
                      }}
                      placeholder="e.g. Hilux 2.8 GD-6"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.color} *</label>
                    <input
                      type="text"
                      value={veh.color}
                      onChange={(e) => {
                        const updated = [...vehicles];
                        updated[idx].color = e.target.value;
                        setVehicles(updated);
                      }}
                      placeholder="e.g. White"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.vin}</label>
                    <input
                      type="text"
                      value={veh.vin || ''}
                      onChange={(e) => {
                        const updated = [...vehicles];
                        updated[idx].vin = e.target.value.toUpperCase();
                        setVehicles(updated);
                      }}
                      placeholder="VIN / Chassis Number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.profile.distinguishingFeatures}</label>
                    <input
                      type="text"
                      value={veh.distinguishingFeatures || ''}
                      onChange={(e) => {
                        const updated = [...vehicles];
                        updated[idx].distinguishingFeatures = e.target.value;
                        setVehicles(updated);
                      }}
                      placeholder="e.g. Cattle rails, roof rack, LED bar, farm logo"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: EMERGENCY PROPERTY INFORMATION */}
      {activeTab === 'PROPERTY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-xs">
          <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3 text-[11px] text-amber-200 flex items-start gap-2">
            <Key className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Confidentiality Guarantee:</strong> Gate codes and emergency property details are accessible only by authorized Control Room operators during active emergency dispatches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.mainGateCode} *</label>
              <input
                type="text"
                value={propertyInfo.mainGateCode}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, mainGateCode: e.target.value })}
                placeholder="e.g. #4910* or Padlock combination"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.secondaryGateInfo}</label>
              <input
                type="text"
                value={propertyInfo.secondaryGateInfo || ''}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, secondaryGateInfo: e.target.value })}
                placeholder="Key location or padlocks on boundary gates"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.profile.dangerousAnimals} *</span>
            </label>
            <input
              type="text"
              value={propertyInfo.dangerousAnimals || ''}
              onChange={(e) => setPropertyInfo({ ...propertyInfo, dangerousAnimals: e.target.value })}
              placeholder="e.g. 2 large Boerboels in yard (aggressive at night); Bull in paddock 3"
              className="w-full bg-slate-800 border border-amber-900/60 rounded-xl px-3 py-2 text-amber-200 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.electricFenceInfo}</label>
              <input
                type="text"
                value={propertyInfo.electricFenceInfo || ''}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, electricFenceInfo: e.target.value })}
                placeholder="Energizer location, zones, siren alerts"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.alternativeEntrance}</label>
              <input
                type="text"
                value={propertyInfo.alternativeEntrance || ''}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, alternativeEntrance: e.target.value })}
                placeholder="Access road from east side / firebreak trail"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.profile.firefightingEquipment}</span>
              </label>
              <input
                type="text"
                value={propertyInfo.firefightingEquipment || ''}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, firefightingEquipment: e.target.value })}
                placeholder="e.g. 600L Bakkie Sakkie on Cruiser, 3x fire extinguishers"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.profile.waterPoints}</span>
              </label>
              <input
                type="text"
                value={propertyInfo.waterPoints || ''}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, waterPoints: e.target.value })}
                placeholder="Cement dam, boreholes, hydrant fittings"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.hazardousMaterials}</label>
              <input
                type="text"
                value={propertyInfo.hazardousMaterials || ''}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, hazardousMaterials: e.target.value })}
                placeholder="Diesel tanks, fertilizer, agrochemicals store"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.accessDifficulties}</label>
              <input
                type="text"
                value={propertyInfo.accessDifficulties || ''}
                onChange={(e) => setPropertyInfo({ ...propertyInfo, accessDifficulties: e.target.value })}
                placeholder="Low water bridge flooded during rains, sandy patches"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MEDICAL AID */}
      {activeTab === 'MEDICAL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.schemeName}</label>
              <input
                type="text"
                value={medicalAid.schemeName}
                onChange={(e) => setMedicalAid({ ...medicalAid, schemeName: e.target.value })}
                placeholder="e.g. Discovery Health, Momentum, Bonitas"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.membershipNumber}</label>
              <input
                type="text"
                value={medicalAid.membershipNumber}
                onChange={(e) => setMedicalAid({ ...medicalAid, membershipNumber: e.target.value })}
                placeholder="Membership number"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.principalMember}</label>
              <input
                type="text"
                value={medicalAid.principalMember}
                onChange={(e) => setMedicalAid({ ...medicalAid, principalMember: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t.profile.medicalEmergencyNumber}</label>
              <input
                type="tel"
                value={medicalAid.emergencyContactNumber}
                onChange={(e) => setMedicalAid({ ...medicalAid, emergencyContactNumber: e.target.value })}
                placeholder="e.g. Netcare 911 (082 911)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Preferred Hospital / Additional Info</label>
            <textarea
              rows={2}
              value={medicalAid.additionalInfo || ''}
              onChange={(e) => setMedicalAid({ ...medicalAid, additionalInfo: e.target.value })}
              placeholder="Nearest private hospital, doctor notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none"
            />
          </div>
        </div>
      )}

      {/* CERTIFICATE LIGHTBOX / DOCUMENT VIEWER MODAL */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/50 border border-amber-600/40 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{t.profile.certificateUpload}</span>
                    <span className="font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-xs">
                      {viewingCertificate.brandCode}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {viewingCertificate.registeredOwner ? `Eienaar: ${viewingCertificate.registeredOwner}` : 'Geregistreerde Dierebrandmerk'} {viewingCertificate.certificateNumber ? `• Reg: ${viewingCertificate.certificateNumber}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingCertificate(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Document Viewer */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 flex flex-col items-center justify-center min-h-[350px]">
              {viewingCertificate.fileUrl.startsWith('data:image/') || viewingCertificate.fileUrl.match(/\.(jpeg|jpg|png|webp)(\?.*)?$/i) ? (
                <div className="max-w-full max-h-[60vh] overflow-hidden rounded-xl border border-slate-800 shadow-lg">
                  <img
                    src={viewingCertificate.fileUrl}
                    alt={`Brandmerksertifikaat ${viewingCertificate.brandCode}`}
                    className="max-h-[60vh] w-auto object-contain mx-auto"
                  />
                </div>
              ) : viewingCertificate.fileUrl.startsWith('data:application/pdf') || viewingCertificate.fileUrl.endsWith('.pdf') ? (
                <div className="w-full h-[60vh] flex flex-col rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    src={viewingCertificate.fileUrl}
                    title="Brandmerksertifikaat PDF"
                    className="w-full flex-1 border-0 bg-slate-900"
                  />
                </div>
              ) : (
                <div className="text-center space-y-4 p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-base">
                      {viewingCertificate.fileName || 'Brandmerksertifikaat Dokument'}
                    </p>
                    <p className="text-slate-400 text-xs">
                      Amptelike sertifikaat is veilig gestoor en gekoppel aan u boerderyprofiel.
                    </p>
                  </div>
                  <a
                    href={viewingCertificate.fileUrl}
                    download={viewingCertificate.fileName || `Brandmerksertifikaat_${viewingCertificate.brandCode}`}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.profile.downloadCertificate || 'Laai Sertifikaat Af'}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Gesertifiseer onder Wet 6 van 2002 • Hartbeesfontein Veiligheid</span>
              </div>

              <div className="flex items-center gap-2">
                {viewingCertificate.fileUrl && (
                  <a
                    href={viewingCertificate.fileUrl}
                    download={viewingCertificate.fileName || `Brandmerksertifikaat_${viewingCertificate.brandCode}`}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.profile.downloadCertificate || 'Laai Af'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewingCertificate(null)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl transition"
                >
                  {t.common.close || 'Sluit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Customizable Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
};
