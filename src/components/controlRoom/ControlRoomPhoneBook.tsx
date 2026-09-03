import React, { useState, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  MessageSquare,
  Search,
  Plus,
  Users,
  Shield,
  HeartPulse,
  Flame,
  Wrench,
  Truck,
  Building,
  UserCheck,
  User,
  Radio,
  MapPin,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  AlertOctagon,
  Car,
  FileText,
  Filter,
  Send,
  Eye,
  Key,
  Volume2,
  Tag,
  Award,
  FileCheck,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  EmergencyContact,
  ContactCategory,
  UserProfile,
  AreaGroup,
  GroupType,
  LocationArea,
  FamilyMember,
} from '../../types';
import { generateManualWhatsAppUrl } from '../../services/whatsappService';
import { LocationAreasManager } from './LocationAreasSettingsModal';

type PhoneBookTab = 'ALL' | 'CLIENTS' | 'NON_CLIENTS' | 'REACTION_FORCE' | 'MANAGEMENT' | 'GROUPS';

export interface PhoneEditState {
  targetType: 'CLIENT' | 'REACTION_FORCE_USER' | 'MANAGEMENT_USER' | 'EMERGENCY_CONTACT' | 'GROUP_LEADER' | 'FAMILY_MEMBER' | 'NON_CLIENT_CONTACT' | 'REACTION_FORCE_CONTACT' | 'MANAGEMENT_CONTACT';
  id: string;
  parentUserId?: string;
  name: string;
  targetName?: string;
  roleLabel: string;
  targetRole?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  callsign?: string;
  farmOrOrg?: string;
  sector?: string;
  relationship?: string;
  notes?: string;
}

export const ControlRoomPhoneBook: React.FC = () => {
  const { t, language } = useI18n();
  const { allUsers, currentUser, updateUser } = useAuth();
  const {
    emergencyContacts,
    createEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    areaGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    assignUsersToGroup,
    removeUsersFromGroup,
    locationAreas,
    createLocationArea,
    logAuditEvent,
  } = useData();

  // Active Tab & Search Filters
  const [activeTab, setActiveTab] = useState<PhoneBookTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('ALL');
  const [selectedLocationAreaFilter, setSelectedLocationAreaFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isAddNonClientOpen, setIsAddNonClientOpen] = useState(false);
  const [editingNonClient, setEditingNonClient] = useState<EmergencyContact | null>(null);

  // Dedicated Phone Number Editor Modal State
  const [editingPhone, setEditingPhone] = useState<PhoneEditState | null>(null);
  const [phoneEditBanner, setPhoneEditBanner] = useState<string | null>(null);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AreaGroup | null>(null);
  const [isLocationAreasModalOpen, setIsLocationAreasModalOpen] = useState(false);

  const [selectedClientDossier, setSelectedClientDossier] = useState<UserProfile | null>(null);
  const [callingContact, setCallingContact] = useState<{
    name: string;
    phone: string;
    roleOrOrg: string;
    sector?: string;
  } | null>(null);

  const [groupBroadcastModal, setGroupBroadcastModal] = useState<AreaGroup | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Form State for Non-Client
  const [ncCategory, setNcCategory] = useState<ContactCategory>('OTHER');
  const [ncName, setNcName] = useState('');
  const [ncOrganisation, setNcOrganisation] = useState('');
  const [ncPhone, setNcPhone] = useState('');
  const [ncWhatsapp, setNcWhatsapp] = useState('');
  const [ncSector, setNcSector] = useState('Alle Sektore');
  const [ncIsActive, setNcIsActive] = useState(true);
  const [ncNotes, setNcNotes] = useState('');

  // Form State for Group Creation / Editing
  const [grpName, setGrpName] = useState('');
  const [grpCode, setGrpCode] = useState('');
  const [grpType, setGrpType] = useState<GroupType>('GENERAL');
  const [grpDescription, setGrpDescription] = useState('');
  const [grpGeoDescription, setGrpGeoDescription] = useState('');
  const [grpLeaderName, setGrpLeaderName] = useState('');
  const [grpLeaderPhone, setGrpLeaderPhone] = useState('');
  const [grpSelectedMemberIds, setGrpSelectedMemberIds] = useState<string[]>([]);
  const [grpMemberSearch, setGrpMemberSearch] = useState('');

  // Extract client users, reaction force users, management users
  const clientUsers = useMemo(() => {
    return allUsers.filter((u) => u.role === 'CLIENT' || (!u.role && u.farmName));
  }, [allUsers]);

  const reactionForceUsers = useMemo(() => {
    return allUsers.filter((u) => u.role === 'REACTION_FORCE');
  }, [allUsers]);

  const managementUsers = useMemo(() => {
    return allUsers.filter((u) => u.role === 'MANAGEMENT');
  }, [allUsers]);

  // Non-client emergency contacts
  const nonClientContacts = useMemo(() => {
    return emergencyContacts.filter((c) => c.category !== 'REACTION_FORCE' && c.category !== 'MANAGEMENT');
  }, [emergencyContacts]);

  // Reaction force contacts from registry
  const rfEmergencyContacts = useMemo(() => {
    return emergencyContacts.filter((c) => c.category === 'REACTION_FORCE');
  }, [emergencyContacts]);

  // Management contacts from registry
  const mgmtEmergencyContacts = useMemo(() => {
    return emergencyContacts.filter((c) => c.category === 'MANAGEMENT');
  }, [emergencyContacts]);

  // All available sectors across all records
  const allSectors = useMemo(() => {
    const sectors = new Set<string>();
    allUsers.forEach((u) => {
      if (u.sector) sectors.add(u.sector);
    });
    emergencyContacts.forEach((c) => {
      if (c.areaSector && c.areaSector !== 'Alle Sektore') sectors.add(c.areaSector);
    });
    return Array.from(sectors);
  }, [allUsers, emergencyContacts]);

  // Copy number helper
  const handleCopyNumber = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Call Action
  const handleInitiateCall = (name: string, phone: string, roleOrOrg: string, sector?: string) => {
    setCallingContact({ name, phone, roleOrOrg, sector });
    logAuditEvent({
      recordType: 'COMMUNICATION',
      recordId: `CALL-${Date.now()}`,
      action: 'DIRECT_CALL_DIALED',
      description: `Control room initiated direct phone call to ${name} (${phone}) [${roleOrOrg}]`,
    });
  };

  // Open Direct WhatsApp Action
  const handleOpenWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const greeting = language === 'af'
      ? `Goeiedag ${name}, dit is die Hartbeesfontein Beheerkamer rakende plaaswag operasies.`
      : `Hello ${name}, this is the Hartbeesfontein Security Control Room regarding farmwatch operations.`;
    const url = generateManualWhatsAppUrl(cleanPhone, greeting);
    window.open(url, '_blank', 'noopener,noreferrer');

    logAuditEvent({
      recordType: 'COMMUNICATION',
      recordId: `WA-${Date.now()}`,
      action: 'WHATSAPP_CHAT_OPENED',
      description: `Control room opened direct WhatsApp conversation with ${name} (${phone})`,
    });
  };

  // Non-Client Modal Handlers
  const handleOpenAddNonClient = () => {
    setEditingNonClient(null);
    setNcCategory('OTHER');
    setNcName('');
    setNcOrganisation('');
    setNcPhone('');
    setNcWhatsapp('');
    setNcSector('Alle Sektore');
    setNcIsActive(true);
    setNcNotes('');
    setIsAddNonClientOpen(true);
  };

  const handleOpenEditNonClient = (contact: EmergencyContact) => {
    setEditingNonClient(contact);
    setNcCategory(contact.category);
    setNcName(contact.name);
    setNcOrganisation(contact.organisation);
    setNcPhone(contact.phone);
    setNcWhatsapp(contact.whatsappNumber || '');
    setNcSector(contact.areaSector || 'Alle Sektore');
    setNcIsActive(contact.isActive);
    setNcNotes(contact.notes || '');
    setIsAddNonClientOpen(true);
  };

  const handleSaveNonClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncName.trim() || !ncPhone.trim()) return;

    if (editingNonClient) {
      updateEmergencyContact(editingNonClient.id, {
        category: ncCategory,
        name: ncName.trim(),
        organisation: ncOrganisation.trim(),
        phone: ncPhone.trim(),
        whatsappNumber: ncWhatsapp.trim() || undefined,
        areaSector: ncSector.trim(),
        isActive: ncIsActive,
        notes: ncNotes.trim() || undefined,
      });
    } else {
      createEmergencyContact({
        category: ncCategory,
        name: ncName.trim(),
        organisation: ncOrganisation.trim(),
        phone: ncPhone.trim(),
        whatsappNumber: ncWhatsapp.trim() || undefined,
        areaSector: ncSector.trim(),
        isActive: ncIsActive,
        notes: ncNotes.trim() || undefined,
      });
    }
    setIsAddNonClientOpen(false);
  };

  const handleDeleteNonClient = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete contact "${name}"?`)) {
      deleteEmergencyContact(id);
    }
  };

  // Dedicated Phone Number Editing Openers
  const handleOpenEditClientPhone = (client: UserProfile) => {
    setEditingPhone({
      targetType: 'CLIENT',
      id: client.uid,
      name: `${client.name} ${client.surname}`,
      roleLabel: 'Client / Farm Member',
      primaryPhone: client.primaryPhone || '',
      secondaryPhone: client.secondaryPhone || '',
      whatsappNumber: client.primaryPhone || '',
      callsign: client.callsign || '',
      farmOrOrg: client.farmName || '',
      sector: client.sector || '',
      notes: client.emergencyNotes || '',
    });
  };

  const handleOpenEditReactionForcePhone = (rf: UserProfile) => {
    setEditingPhone({
      targetType: 'REACTION_FORCE_USER',
      id: rf.uid,
      name: `${rf.name} ${rf.surname}`,
      roleLabel: 'Reaction Force Unit / Responder',
      primaryPhone: rf.primaryPhone || '',
      secondaryPhone: rf.secondaryPhone || '',
      whatsappNumber: rf.primaryPhone || '',
      callsign: rf.callsign || '',
      farmOrOrg: rf.organizationTeam || 'Hartbeesfontein Plaaswag Reaksie',
      sector: rf.sector || '',
      notes: rf.rfNotes || '',
    });
  };

  const handleOpenEditManagementPhone = (mgmt: UserProfile) => {
    setEditingPhone({
      targetType: 'MANAGEMENT_USER',
      id: mgmt.uid,
      name: `${mgmt.name} ${mgmt.surname}`,
      roleLabel: 'Executive Committee / Management',
      primaryPhone: mgmt.primaryPhone || '',
      secondaryPhone: mgmt.secondaryPhone || '',
      whatsappNumber: mgmt.primaryPhone || '',
      callsign: mgmt.callsign || '',
      farmOrOrg: mgmt.farmName || 'Hartbeesfontein Bestuur',
      sector: mgmt.sector || '',
    });
  };

  const handleOpenEditContactPhone = (contact: EmergencyContact) => {
    setEditingPhone({
      targetType: 'EMERGENCY_CONTACT',
      id: contact.id,
      name: contact.name,
      roleLabel: contact.organisation ? `${contact.organisation} (${contact.category})` : contact.category,
      primaryPhone: contact.phone || '',
      whatsappNumber: contact.whatsappNumber || '',
      farmOrOrg: contact.organisation || '',
      sector: contact.areaSector || '',
      notes: contact.notes || '',
    });
  };

  const handleOpenEditGroupLeaderPhone = (group: AreaGroup) => {
    setEditingPhone({
      targetType: 'GROUP_LEADER',
      id: group.id,
      name: group.leaderName || group.name,
      roleLabel: `Group Leader • ${group.name} (${group.code})`,
      primaryPhone: group.leaderPhone || '',
      whatsappNumber: group.leaderPhone || '',
      farmOrOrg: group.name,
    });
  };

  const handleOpenEditFamilyPhone = (client: UserProfile, fam: FamilyMember) => {
    setEditingPhone({
      targetType: 'FAMILY_MEMBER',
      id: fam.id,
      parentUserId: client.uid,
      name: `${fam.name} ${fam.surname}`,
      roleLabel: `Family Member (${fam.relationship}) of ${client.name} ${client.surname}`,
      primaryPhone: fam.phone || '',
      relationship: fam.relationship || '',
      notes: fam.emergencyNotes || '',
      farmOrOrg: client.farmName || '',
    });
  };

  const handleSavePhoneEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhone || !editingPhone.primaryPhone.trim()) return;

    const cleanPrimary = editingPhone.primaryPhone.trim();
    const cleanSecondary = editingPhone.secondaryPhone?.trim() || undefined;
    const cleanWhatsapp = editingPhone.whatsappNumber?.trim() || undefined;
    const cleanCallsign = editingPhone.callsign?.trim() || undefined;
    const cleanNotes = editingPhone.notes?.trim() || undefined;

    if (
      editingPhone.targetType === 'CLIENT' ||
      editingPhone.targetType === 'REACTION_FORCE_USER' ||
      editingPhone.targetType === 'MANAGEMENT_USER'
    ) {
      updateUser(editingPhone.id, {
        primaryPhone: cleanPrimary,
        secondaryPhone: cleanSecondary,
        callsign: cleanCallsign,
      });

      if (selectedClientDossier && selectedClientDossier.uid === editingPhone.id) {
        setSelectedClientDossier({
          ...selectedClientDossier,
          primaryPhone: cleanPrimary,
          secondaryPhone: cleanSecondary,
          callsign: cleanCallsign,
        });
      }

      logAuditEvent({
        recordType: 'USER',
        recordId: editingPhone.id,
        action: 'PHONE_NUMBER_UPDATED',
        description: `Control room updated phone numbers for ${editingPhone.name} to ${cleanPrimary}${cleanSecondary ? ` / ${cleanSecondary}` : ''}`,
      });
    } else if (editingPhone.targetType === 'EMERGENCY_CONTACT') {
      updateEmergencyContact(editingPhone.id, {
        phone: cleanPrimary,
        whatsappNumber: cleanWhatsapp,
      });

      logAuditEvent({
        recordType: 'SETTINGS',
        recordId: editingPhone.id,
        action: 'PHONE_NUMBER_UPDATED',
        description: `Control room updated phone for contact ${editingPhone.name} to ${cleanPrimary}`,
      });
    } else if (editingPhone.targetType === 'GROUP_LEADER') {
      updateGroup(editingPhone.id, {
        leaderPhone: cleanPrimary,
        leaderName: editingPhone.name.trim() || undefined,
      });

      logAuditEvent({
        recordType: 'GROUP',
        recordId: editingPhone.id,
        action: 'GROUP_LEADER_PHONE_UPDATED',
        description: `Control room updated group leader phone for ${editingPhone.name} to ${cleanPrimary}`,
      });
    } else if (editingPhone.targetType === 'FAMILY_MEMBER' && editingPhone.parentUserId) {
      const parentUser = allUsers.find((u) => u.uid === editingPhone.parentUserId);
      if (parentUser && parentUser.familyMembers) {
        const updatedFamily = parentUser.familyMembers.map((fam) => {
          if (fam.id === editingPhone.id) {
            return {
              ...fam,
              phone: cleanPrimary,
              relationship: editingPhone.relationship?.trim() || fam.relationship,
              emergencyNotes: cleanNotes || fam.emergencyNotes,
            };
          }
          return fam;
        });

        updateUser(editingPhone.parentUserId, {
          familyMembers: updatedFamily,
        });

        if (selectedClientDossier && selectedClientDossier.uid === editingPhone.parentUserId) {
          setSelectedClientDossier({
            ...selectedClientDossier,
            familyMembers: updatedFamily,
          });
        }

        logAuditEvent({
          recordType: 'USER',
          recordId: editingPhone.parentUserId,
          action: 'FAMILY_PHONE_UPDATED',
          description: `Control room updated family member phone for ${editingPhone.name} to ${cleanPrimary}`,
        });
      }
    }

    setPhoneEditBanner(`Phone details for ${editingPhone.name} updated and synced successfully.`);
    setTimeout(() => setPhoneEditBanner(null), 4000);
    setEditingPhone(null);
  };

  // Group Modal Handlers
  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGrpName('');
    setGrpCode('');
    setGrpType('SECURITY');
    setGrpDescription('');
    setGrpGeoDescription('');
    setGrpLeaderName('');
    setGrpLeaderPhone('');
    setGrpSelectedMemberIds([]);
    setGrpMemberSearch('');
    setIsCreateGroupOpen(true);
  };

  const handleOpenEditGroup = (group: AreaGroup) => {
    setEditingGroup(group);
    setGrpName(group.name);
    setGrpCode(group.code);
    setGrpType(group.groupType);
    setGrpDescription(group.description);
    setGrpGeoDescription(group.geographicDescription || '');
    setGrpLeaderName(group.leaderName || '');
    setGrpLeaderPhone(group.leaderPhone || '');
    setGrpSelectedMemberIds(group.memberUserIds || []);
    setGrpMemberSearch('');
    setIsCreateGroupOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grpName.trim()) return;

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: grpName.trim(),
        code: grpCode.trim() || undefined,
        groupType: grpType,
        description: grpDescription.trim(),
        geographicDescription: grpGeoDescription.trim() || undefined,
        leaderName: grpLeaderName.trim() || undefined,
        leaderPhone: grpLeaderPhone.trim() || undefined,
        memberUserIds: grpSelectedMemberIds,
        activeMemberCount: grpSelectedMemberIds.length,
      });
    } else {
      createGroup({
        name: grpName.trim(),
        code: grpCode.trim() || undefined,
        groupType: grpType,
        description: grpDescription.trim(),
        geographicDescription: grpGeoDescription.trim() || undefined,
        leaderName: grpLeaderName.trim() || undefined,
        leaderPhone: grpLeaderPhone.trim() || undefined,
        memberUserIds: grpSelectedMemberIds,
      });
    }
    setIsCreateGroupOpen(false);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete group "${groupName}"?`)) {
      deleteGroup(groupId);
    }
  };

  // Toggle user inside group
  const handleToggleMember = (uid: string) => {
    setGrpSelectedMemberIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  // Category Icon helper
  const getCategoryBadge = (cat: ContactCategory | 'CLIENT' | 'REACTION_FORCE' | 'MANAGEMENT') => {
    switch (cat) {
      case 'POLICE':
        return {
          icon: <Shield className="w-3.5 h-3.5" />,
          label: 'SAPS / Police',
          bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
        };
      case 'AMBULANCE':
        return {
          icon: <HeartPulse className="w-3.5 h-3.5" />,
          label: 'EMS / Ambulance',
          bg: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
        };
      case 'FIRE':
        return {
          icon: <Flame className="w-3.5 h-3.5" />,
          label: 'Fire Protection (FPA)',
          bg: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
        };
      case 'TOWING':
        return {
          icon: <Truck className="w-3.5 h-3.5" />,
          label: 'Towing / Breakdown',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        };
      case 'VET':
        return {
          icon: <HeartPulse className="w-3.5 h-3.5" />,
          label: 'Veterinarian / Veearts',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        };
      case 'NEIGHBOR_NON_CLIENT':
        return {
          icon: <Building className="w-3.5 h-3.5" />,
          label: 'Non-Client Neighbor',
          bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
        };
      case 'CONTRACTOR':
        return {
          icon: <Wrench className="w-3.5 h-3.5" />,
          label: 'Contractor / Fencing',
          bg: 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60',
        };
      case 'REACTION_FORCE':
        return {
          icon: <Radio className="w-3.5 h-3.5" />,
          label: 'Reaction Force Unit',
          bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
        };
      case 'MANAGEMENT':
        return {
          icon: <UserCheck className="w-3.5 h-3.5" />,
          label: 'Management Executive',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        };
      case 'CLIENT':
        return {
          icon: <User className="w-3.5 h-3.5" />,
          label: 'Registered Client',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        };
      default:
        return {
          icon: <Phone className="w-3.5 h-3.5" />,
          label: 'Essential Service',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  // Group Type Badge helper
  const getGroupTypeBadge = (type: GroupType) => {
    switch (type) {
      case 'SECURITY':
        return 'bg-blue-950 text-blue-300 border-blue-700';
      case 'FIRE':
        return 'bg-orange-950 text-orange-300 border-orange-700';
      case 'PATROL':
        return 'bg-purple-950 text-purple-300 border-purple-700';
      case 'GENERAL':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Filtered Clients
  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return clientUsers.filter((u) => {
      const matchSector =
        selectedSectorFilter === 'ALL' || u.sector === selectedSectorFilter;
      if (!matchSector) return false;

      const matchLocationArea =
        selectedLocationAreaFilter === 'ALL' ||
        u.locationArea === selectedLocationAreaFilter ||
        u.locationAreaId === selectedLocationAreaFilter;
      if (!matchLocationArea) return false;

      if (!q) return true;

      return (
        u.name?.toLowerCase().includes(q) ||
        u.surname?.toLowerCase().includes(q) ||
        u.farmName?.toLowerCase().includes(q) ||
        u.locationArea?.toLowerCase().includes(q) ||
        u.portionNumber?.toLowerCase().includes(q) ||
        u.primaryPhone?.toLowerCase().includes(q) ||
        u.secondaryPhone?.toLowerCase().includes(q) ||
        u.sector?.toLowerCase().includes(q) ||
        u.emergencyNotes?.toLowerCase().includes(q) ||
        u.emergencyPropertyInfo?.mainGateCode?.toLowerCase().includes(q) ||
        u.vehicles?.some((v) =>
          `${v.make} ${v.model} ${v.licensePlate}`.toLowerCase().includes(q)
        ) ||
        u.familyMembers?.some((f) =>
          `${f.name} ${f.surname} ${f.phone}`.toLowerCase().includes(q)
        )
      );
    });
  }, [clientUsers, searchQuery, selectedSectorFilter, selectedLocationAreaFilter]);

  // Filtered Non-Clients
  const filteredNonClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return nonClientContacts.filter((c) => {
      const matchSector =
        selectedSectorFilter === 'ALL' ||
        c.areaSector === selectedSectorFilter ||
        c.areaSector === 'Alle Sektore';
      if (!matchSector) return false;
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.organisation.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.whatsappNumber?.toLowerCase().includes(q) ||
        c.areaSector?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [nonClientContacts, searchQuery, selectedSectorFilter]);

  // Filtered Reaction Force
  const filteredReactionForce = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    // Combine UserProfile RF and EmergencyContact RF
    const usersRF = reactionForceUsers.filter((u) => {
      const matchSector =
        selectedSectorFilter === 'ALL' ||
        u.sector === selectedSectorFilter ||
        u.assignedAreaGroup === selectedSectorFilter;
      if (!matchSector) return false;
      if (!q) return true;

      return (
        u.name?.toLowerCase().includes(q) ||
        u.surname?.toLowerCase().includes(q) ||
        u.callsign?.toLowerCase().includes(q) ||
        u.organizationTeam?.toLowerCase().includes(q) ||
        u.primaryPhone?.toLowerCase().includes(q) ||
        u.secondaryPhone?.toLowerCase().includes(q) ||
        u.vehicleRegistration?.toLowerCase().includes(q) ||
        u.rfNotes?.toLowerCase().includes(q)
      );
    });

    const contactRF = rfEmergencyContacts.filter((c) => {
      const matchSector =
        selectedSectorFilter === 'ALL' ||
        c.areaSector === selectedSectorFilter ||
        c.areaSector === 'Alle Sektore';
      if (!matchSector) return false;
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.organisation.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.whatsappNumber?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
      );
    });

    return { usersRF, contactRF };
  }, [reactionForceUsers, rfEmergencyContacts, searchQuery, selectedSectorFilter]);

  // Filtered Management
  const filteredManagement = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const usersMgmt = managementUsers.filter((u) => {
      const matchSector =
        selectedSectorFilter === 'ALL' || u.sector === selectedSectorFilter;
      if (!matchSector) return false;
      if (!q) return true;

      return (
        u.name?.toLowerCase().includes(q) ||
        u.surname?.toLowerCase().includes(q) ||
        u.primaryPhone?.toLowerCase().includes(q) ||
        u.farmName?.toLowerCase().includes(q) ||
        u.sector?.toLowerCase().includes(q)
      );
    });

    const contactMgmt = mgmtEmergencyContacts.filter((c) => {
      const matchSector =
        selectedSectorFilter === 'ALL' ||
        c.areaSector === selectedSectorFilter ||
        c.areaSector === 'Alle Sektore';
      if (!matchSector) return false;
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.organisation.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.whatsappNumber?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
      );
    });

    return { usersMgmt, contactMgmt };
  }, [managementUsers, mgmtEmergencyContacts, searchQuery, selectedSectorFilter]);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return areaGroups.filter((g) => {
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.geographicDescription?.toLowerCase().includes(q) ||
        g.leaderName?.toLowerCase().includes(q) ||
        g.leaderPhone?.toLowerCase().includes(q)
      );
    });
  }, [areaGroups, searchQuery]);

  // Total Counts
  const totalClientsCount = clientUsers.length;
  const totalNonClientsCount = nonClientContacts.length;
  const totalRFCount = reactionForceUsers.length + rfEmergencyContacts.length;
  const totalMgmtCount = managementUsers.length + mgmtEmergencyContacts.length;
  const totalGroupsCount = areaGroups.length;
  const totalAllCount =
    totalClientsCount + totalNonClientsCount + totalRFCount + totalMgmtCount;

  return (
    <div className="max-w-7xl mx-auto px-3.5 py-4 space-y-4">
      {/* Phone Number Update Success Alert */}
      {phoneEditBanner && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-2xl p-3 sm:p-4 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{phoneEditBanner}</span>
          </div>
          <button
            onClick={() => setPhoneEditBanner(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER & SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-inner">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Control Room Phone Book
                </h2>
                <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full">
                  {totalAllCount} Contacts
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Direct phone directory: Clients, Non-Clients, Armed Reaction, Management & Sector Groups
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLocationAreasModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
              title="Manage Location Areas & Wyke (Brakspruit, Palmietfontein, etc.)"
            >
              <MapPin className="w-4 h-4" />
              <span>Location Areas &amp; Wyke</span>
            </button>

            <button
              onClick={handleOpenAddNonClient}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Non-Client Number</span>
            </button>

            <button
              onClick={handleOpenCreateGroup}
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Users className="w-4 h-4" />
              <span>Create New Group</span>
            </button>
          </div>
        </div>

        {/* Search & Sector Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, farm name, location area (Brakspruit, Palmietfontein...), telephone, gate code, callsign..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-4 relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-none cursor-pointer transition appearance-none"
            >
              <option value="ALL">All Sectors &amp; Areas ({totalAllCount})</option>
              {allSectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Location Areas Filter Pills Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 pb-1.5">
            <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Filter by Location Area (Ligging Wyk):</span>
            </span>

            <button
              onClick={() => setIsLocationAreasModalOpen(true)}
              className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>+ Add / Edit Areas</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedLocationAreaFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedLocationAreaFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span>All Location Areas</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/60">
                {clientUsers.length}
              </span>
            </button>

            {locationAreas.map((area) => {
              const count = clientUsers.filter(
                (u) => u.locationArea === area.name || u.locationAreaId === area.id
              ).length;
              const isSelected = selectedLocationAreaFilter === area.name;

              return (
                <button
                  key={area.id}
                  onClick={() => setSelectedLocationAreaFilter(area.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{area.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-900 text-amber-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. DIRECTORY TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>All Numbers ({totalAllCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('CLIENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === 'CLIENTS'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Clients & Farmers ({totalClientsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('NON_CLIENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === 'NON_CLIENTS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Non-Clients & Services ({totalNonClientsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('REACTION_FORCE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === 'REACTION_FORCE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Reaction Force ({totalRFCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGEMENT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === 'MANAGEMENT'
                ? 'bg-amber-600 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Management ({totalMgmtCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('GROUPS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
              activeTab === 'GROUPS'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Groups & Sectors ({totalGroupsCount})</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT DISPLAY ACCORDING TO ACTIVE TAB */}

      {/* A. CLIENTS VIEW (OR IN ALL VIEW) */}
      {(activeTab === 'ALL' || activeTab === 'CLIENTS') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Registered Clients & Farmers ({filteredClients.length})</span>
            </h3>
            {activeTab === 'ALL' && (
              <button
                onClick={() => setActiveTab('CLIENTS')}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <span>View all clients</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {filteredClients.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              No clients found matching search filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredClients.map((client) => {
                const gateCode = client.emergencyPropertyInfo?.mainGateCode;
                const hasBakkieSakkie =
                  client.emergencyPropertyInfo?.firefightingEquipment?.toLowerCase().includes('bakkie') ||
                  client.vehicles?.some((v) => v.distinguishingFeatures?.toLowerCase().includes('bakkie sakkie'));

                return (
                  <div
                    key={client.uid}
                    className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold uppercase">
                              Client • {client.sector || 'Hartbeesfontein'}
                            </span>
                            {client.locationArea && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/70 font-black uppercase flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                                <span>{client.locationArea}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-black text-white mt-1">
                            {client.name} {client.surname}
                          </h4>
                          <p className="text-xs text-amber-400 font-semibold">
                            {client.farmName} {client.portionNumber ? `(${client.portionNumber})` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditClientPhone(client)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                            title="Edit Client Phone Numbers"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedClientDossier(client)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Emergency Dossier & Farm Info"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Phone Numbers with 1-click dials */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-sans">Primary Cell:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-white">{client.primaryPhone}</strong>
                            <button
                              onClick={() => handleCopyNumber(client.primaryPhone, `cell-${client.uid}`)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Copy number"
                            >
                              {copiedId === `cell-${client.uid}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEditClientPhone(client)}
                              className="text-slate-400 hover:text-amber-400 p-0.5"
                              title="Edit phone numbers"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {client.secondaryPhone && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                            <span className="text-[10px] text-slate-400 uppercase font-sans">Alt Phone:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-300">{client.secondaryPhone}</span>
                              <button
                                onClick={() => handleCopyNumber(client.secondaryPhone!, `alt-${client.uid}`)}
                                className="text-slate-400 hover:text-white p-0.5"
                                title="Copy number"
                              >
                                {copiedId === `alt-${client.uid}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleOpenEditClientPhone(client)}
                                className="text-slate-400 hover:text-amber-400 p-0.5"
                                title="Edit phone numbers"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location Area Quick Linker */}
                      <div className="flex items-center justify-between gap-1.5 text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-900">
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span>Location Area:</span>
                        </span>
                        <select
                          value={client.locationArea || ''}
                          onChange={(e) => {
                            const newAreaName = e.target.value;
                            const matchedArea = locationAreas.find((a) => a.name === newAreaName);
                            updateUser(client.uid, {
                              locationArea: newAreaName || undefined,
                              locationAreaId: matchedArea?.id || undefined,
                              sector: matchedArea?.sector || client.sector,
                            });
                          }}
                          className="bg-slate-900 border border-slate-700 text-amber-300 font-bold text-[10px] rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-amber-500 max-w-[170px] truncate"
                        >
                          <option value="">-- Select Area --</option>
                          {locationAreas.map((area) => (
                            <option key={area.id} value={area.name}>
                              {area.name} ({area.code || 'AREA'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quick Snapshot Details */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                        {gateCode && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] flex items-center gap-1">
                            <Key className="w-2.5 h-2.5 text-amber-400" />
                            <span>Gate: {gateCode}</span>
                          </span>
                        )}
                        {hasBakkieSakkie && (
                          <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 text-[10px] flex items-center gap-1 font-semibold">
                            <Flame className="w-2.5 h-2.5 text-orange-400" />
                            <span>Bakkie Sakkie</span>
                          </span>
                        )}
                        {client.familyMembers && client.familyMembers.length > 0 && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            <span>{client.familyMembers.length} Family Cont.</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: 1-Click Call & WhatsApp */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <a
                        href={`tel:${client.primaryPhone}`}
                        onClick={() =>
                          handleInitiateCall(
                            `${client.name} ${client.surname}`,
                            client.primaryPhone,
                            `Client (${client.farmName})`,
                            client.sector
                          )
                        }
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>

                      <button
                        onClick={() =>
                          handleOpenWhatsApp(client.primaryPhone, `${client.name} ${client.surname}`)
                        }
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* B. NON-CLIENTS & ESSENTIAL SERVICES (OR IN ALL VIEW) */}
      {(activeTab === 'ALL' || activeTab === 'NON_CLIENTS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>Non-Clients, Emergency Services & External Contacts ({filteredNonClients.length})</span>
            </h3>
            <button
              onClick={handleOpenAddNonClient}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Non-Client</span>
            </button>
          </div>

          {filteredNonClients.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              No non-client contacts found matching search filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNonClients.map((contact) => {
                const badge = getCategoryBadge(contact.category);
                return (
                  <div
                    key={contact.id}
                    className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase flex items-center gap-1 w-fit ${badge.bg}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                          <h4 className="text-base font-black text-white mt-1.5 line-clamp-1">
                            {contact.name}
                          </h4>
                          <p className="text-xs text-slate-300 font-medium line-clamp-1">
                            {contact.organisation}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditNonClient(contact)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNonClient(contact.id, contact.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Phone & WhatsApp Display */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-sans">Telephone:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-white">{contact.phone}</strong>
                            <button
                              onClick={() => handleCopyNumber(contact.phone, `nc-${contact.id}`)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Copy number"
                            >
                              {copiedId === `nc-${contact.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEditContactPhone(contact)}
                              className="text-slate-400 hover:text-purple-400 p-0.5"
                              title="Edit contact phone / whatsapp"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {contact.whatsappNumber && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                            <span className="text-[10px] text-slate-400 uppercase font-sans">WhatsApp:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400">{contact.whatsappNumber}</span>
                              <button
                                onClick={() => handleOpenEditContactPhone(contact)}
                                className="text-slate-400 hover:text-emerald-400 p-0.5"
                                title="Edit WhatsApp number"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sector & Notes */}
                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{contact.areaSector || 'Alle Sektore'}</span>
                        </div>
                        {contact.notes && (
                          <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg line-clamp-2 border border-slate-900">
                            {contact.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={() =>
                          handleInitiateCall(
                            contact.name,
                            contact.phone,
                            `${contact.organisation} (${contact.category})`,
                            contact.areaSector
                          )
                        }
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>

                      <button
                        onClick={() =>
                          handleOpenWhatsApp(
                            contact.whatsappNumber || contact.phone,
                            contact.name
                          )
                        }
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* C. REACTION FORCE LIST (OR IN ALL VIEW) */}
      {(activeTab === 'ALL' || activeTab === 'REACTION_FORCE') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span>Armed Reaction Force & Farmwatch Units ({filteredReactionForce.usersRF.length + filteredReactionForce.contactRF.length})</span>
            </h3>
            {activeTab === 'ALL' && (
              <button
                onClick={() => setActiveTab('REACTION_FORCE')}
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>View all reaction units</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* UserProfile RF Responders */}
            {filteredReactionForce.usersRF.map((rf) => (
              <div
                key={rf.uid}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-black uppercase">
                          {rf.callsign || 'REACTION UNIT'}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            rf.isAvailableForDuty
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {rf.isAvailableForDuty ? 'ON DUTY / STANDBY' : 'OFF DUTY'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white mt-1.5">
                        {rf.name} {rf.surname}
                      </h4>
                      <p className="text-xs text-indigo-300 font-semibold">
                        {rf.organizationTeam || 'Hartbeesfontein Plaaswag Reaksie'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditReactionForcePhone(rf)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 transition"
                        title="Edit Radio / Phone Numbers"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                        <Radio className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Callsign Specs */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-sans">Radio / Cell:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white">{rf.primaryPhone}</strong>
                        <button
                          onClick={() => handleCopyNumber(rf.primaryPhone, `rf-${rf.uid}`)}
                          className="text-slate-400 hover:text-white p-0.5"
                          title="Copy number"
                        >
                          {copiedId === `rf-${rf.uid}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditReactionForcePhone(rf)}
                          className="text-slate-400 hover:text-indigo-400 p-0.5"
                          title="Edit Phone / Radio"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {rf.secondaryPhone && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                        <span className="text-[10px] text-slate-400 uppercase font-sans">Alt Line:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300">{rf.secondaryPhone}</span>
                          <button
                            onClick={() => handleOpenEditReactionForcePhone(rf)}
                            className="text-slate-400 hover:text-indigo-400 p-0.5"
                            title="Edit Alt Line"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vehicle & Sector info */}
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Car className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{rf.vehicleDetails || '4x4 Patrol Unit'} {rf.vehicleRegistration ? `(${rf.vehicleRegistration})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{rf.assignedAreaGroup || rf.sector || 'Alle Sektore'}</span>
                    </div>
                    {rf.rfNotes && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg line-clamp-2 border border-slate-900">
                        {rf.rfNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={`tel:${rf.primaryPhone}`}
                    onClick={() =>
                      handleInitiateCall(
                        `${rf.callsign || ''} ${rf.name} ${rf.surname}`,
                        rf.primaryPhone,
                        `Reaction Force (${rf.organizationTeam})`,
                        rf.sector
                      )
                    }
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() =>
                      handleOpenWhatsApp(rf.primaryPhone, `${rf.name} (${rf.callsign || 'Reaction Unit'})`)
                    }
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Emergency Contacts RF */}
            {filteredReactionForce.contactRF.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold uppercase">
                        REACTION COMMAND
                      </span>
                      <h4 className="text-base font-black text-white mt-1.5">
                        {c.name}
                      </h4>
                      <p className="text-xs text-indigo-300 font-semibold">
                        {c.organisation}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-sans">Telephone:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white">{c.phone}</strong>
                        <button
                          onClick={() => handleCopyNumber(c.phone, `rfc-${c.id}`)}
                          className="text-slate-400 hover:text-white p-0.5"
                          title="Copy number"
                        >
                          {copiedId === `rfc-${c.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditContactPhone(c)}
                          className="text-slate-400 hover:text-indigo-400 p-0.5"
                          title="Edit Phone / Radio"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{c.areaSector || 'Alle Sektore'}</span>
                    </div>
                    {c.notes && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg line-clamp-2 border border-slate-900">
                        {c.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={`tel:${c.phone}`}
                    onClick={() =>
                      handleInitiateCall(c.name, c.phone, c.organisation, c.areaSector)
                    }
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() =>
                      handleOpenWhatsApp(c.whatsappNumber || c.phone, c.name)
                    }
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D. MANAGEMENT LIST (OR IN ALL VIEW) */}
      {(activeTab === 'ALL' || activeTab === 'MANAGEMENT') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Security Committee & Management Team ({filteredManagement.usersMgmt.length + filteredManagement.contactMgmt.length})</span>
            </h3>
            {activeTab === 'ALL' && (
              <button
                onClick={() => setActiveTab('MANAGEMENT')}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5"
              >
                <span>View all management</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* UserProfile Management */}
            {filteredManagement.usersMgmt.map((mgmt) => (
              <div
                key={mgmt.uid}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-black uppercase">
                        EXECUTIVE COMMITTEE
                      </span>
                      <h4 className="text-base font-black text-white mt-1.5">
                        {mgmt.name} {mgmt.surname}
                      </h4>
                      <p className="text-xs text-amber-300 font-semibold">
                        {mgmt.farmName} ({mgmt.sector || 'Hoofbestuur'})
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditManagementPhone(mgmt)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                        title="Edit Management Phone Numbers"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-sans">Primary Cell:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white">{mgmt.primaryPhone}</strong>
                        <button
                          onClick={() => handleCopyNumber(mgmt.primaryPhone, `mgmt-${mgmt.uid}`)}
                          className="text-slate-400 hover:text-white p-0.5"
                          title="Copy number"
                        >
                          {copiedId === `mgmt-${mgmt.uid}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditManagementPhone(mgmt)}
                          className="text-slate-400 hover:text-amber-400 p-0.5"
                          title="Edit Phone Number"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{mgmt.sector || 'Hartbeesfontein Bestuur'}</span>
                    </div>
                    {mgmt.emergencyNotes && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg line-clamp-2 border border-slate-900">
                        {mgmt.emergencyNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={`tel:${mgmt.primaryPhone}`}
                    onClick={() =>
                      handleInitiateCall(
                        `${mgmt.name} ${mgmt.surname}`,
                        mgmt.primaryPhone,
                        `Management Executive (${mgmt.sector || 'Bestuur'})`,
                        mgmt.sector
                      )
                    }
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() =>
                      handleOpenWhatsApp(mgmt.primaryPhone, `${mgmt.name} ${mgmt.surname}`)
                    }
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Emergency Contacts Management */}
            {filteredManagement.contactMgmt.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-bold uppercase">
                        MANAGEMENT LIAISON
                      </span>
                      <h4 className="text-base font-black text-white mt-1.5">
                        {c.name}
                      </h4>
                      <p className="text-xs text-amber-300 font-semibold">
                        {c.organisation}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-sans">Telephone:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white">{c.phone}</strong>
                        <button
                          onClick={() => handleCopyNumber(c.phone, `mgmtc-${c.id}`)}
                          className="text-slate-400 hover:text-white p-0.5"
                          title="Copy number"
                        >
                          {copiedId === `mgmtc-${c.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditContactPhone(c)}
                          className="text-slate-400 hover:text-amber-400 p-0.5"
                          title="Edit Telephone Number"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{c.areaSector || 'Alle Sektore'}</span>
                    </div>
                    {c.notes && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg line-clamp-2 border border-slate-900">
                        {c.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={`tel:${c.phone}`}
                    onClick={() =>
                      handleInitiateCall(c.name, c.phone, c.organisation, c.areaSector)
                    }
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() =>
                      handleOpenWhatsApp(c.whatsappNumber || c.phone, c.name)
                    }
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E. GROUPS & SECTORS VIEW */}
      {(activeTab === 'ALL' || activeTab === 'GROUPS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Groups & Sector Broadcast Channels ({filteredGroups.length})</span>
            </h3>
            <button
              onClick={handleOpenCreateGroup}
              className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Group</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGroups.map((group) => {
              const isExpanded = expandedGroupId === group.id;
              const groupMembers = allUsers.filter(
                (u) =>
                  group.memberUserIds?.includes(u.uid) ||
                  u.areaGroupIds?.includes(group.id)
              );

              return (
                <div
                  key={group.id}
                  className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 shadow-sm space-y-3 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-black uppercase ${getGroupTypeBadge(
                              group.groupType
                            )}`}
                          >
                            {group.code} • {group.groupType}
                          </span>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                            {groupMembers.length || group.activeMemberCount || 0} Members
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white mt-1.5 line-clamp-1">
                          {group.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {group.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditGroup(group)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Edit Group"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition"
                          title="Delete Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Leader Phone if available */}
                    {group.leaderName && (
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-sans">Group Leader:</span>
                          <strong className="text-white">{group.leaderName}</strong>
                        </div>
                        {group.leaderPhone && (
                          <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-900">
                            <span className="text-[10px] text-slate-400 uppercase font-sans">Leader Phone:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-bold">{group.leaderPhone}</span>
                              <a
                                href={`tel:${group.leaderPhone}`}
                                className="text-blue-400 hover:text-blue-300 p-0.5"
                                title="Call Leader"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <button
                                onClick={() => handleOpenEditGroupLeaderPhone(group)}
                                className="text-slate-400 hover:text-teal-400 p-0.5"
                                title="Edit Leader Phone"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Member Preview Strip */}
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                        className="w-full text-left text-[11px] text-teal-400 hover:text-teal-300 font-bold flex items-center justify-between py-1"
                      >
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>View {groupMembers.length} Assigned Members</span>
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                          {groupMembers.length === 0 ? (
                            <p className="text-[11px] text-slate-500 text-center py-2">
                              No members currently assigned to this group.
                            </p>
                          ) : (
                            groupMembers.map((m) => (
                              <div
                                key={m.uid}
                                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/60 text-[11px]"
                              >
                                <div>
                                  <span className="font-bold text-white block">
                                    {m.name} {m.surname}
                                  </span>
                                  <span className="text-[10px] text-amber-400 font-mono">
                                    {m.farmName} • {m.primaryPhone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`tel:${m.primaryPhone}`}
                                    className="p-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white transition"
                                    title="Call"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </a>
                                  <button
                                    onClick={() => handleOpenWhatsApp(m.primaryPhone, m.name)}
                                    className="p-1 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
                                    title="WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group Action Buttons: WhatsApp Broadcast */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setGroupBroadcastModal(group);
                        setBroadcastMessage(
                          language === 'af'
                            ? `[HBF BEHEERKAMER WAARSKUWING / GROEP: ${group.name}]\n`
                            : `[HBF CONTROL ROOM BROADCAST / GROUP: ${group.name}]\n`
                        );
                      }}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast to Group</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODAL: ADD / EDIT NON-CLIENT CONTACT */}
      {isAddNonClientOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">
                    {editingNonClient ? 'Edit Non-Client Contact' : 'Add Non-Client / Service Number'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add external SAPS, EMS, Fire, Towing, Vet, Non-client Neighbors or Contractors
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddNonClientOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNonClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Contact Category / Service Type *
                </label>
                <select
                  value={ncCategory}
                  onChange={(e) => setNcCategory(e.target.value as ContactCategory)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="POLICE">South African Police Service (SAPS)</option>
                  <option value="AMBULANCE">Emergency Medical Services (EMS / Ambulance)</option>
                  <option value="FIRE">Fire Protection Association (FPA / BBV / Brandweer)</option>
                  <option value="TOWING">Towing & Breakdown Recovery</option>
                  <option value="VET">Veterinarian / Livestock Emergency</option>
                  <option value="NEIGHBOR_NON_CLIENT">Non-Client Neighbor / Adjacent Farm</option>
                  <option value="CONTRACTOR">Contractor / Fencing & Solar Repair</option>
                  <option value="OTHER">Other Essential Support</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ncName}
                    onChange={(e) => setNcName(e.target.value)}
                    placeholder="e.g. Dr. Danie Venter"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Organisation / Business Name
                  </label>
                  <input
                    type="text"
                    value={ncOrganisation}
                    onChange={(e) => setNcOrganisation(e.target.value)}
                    placeholder="e.g. Klerksdorp Veearts Nooddiens"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={ncPhone}
                    onChange={(e) => setNcPhone(e.target.value)}
                    placeholder="+27 18 464 1120"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={ncWhatsapp}
                    onChange={(e) => setNcWhatsapp(e.target.value)}
                    placeholder="+27 82 123 4567"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Area / Sector Covered
                  </label>
                  <input
                    type="text"
                    value={ncSector}
                    onChange={(e) => setNcSector(e.target.value)}
                    placeholder="Alle Sektore / Sektor 2"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="ncIsActive"
                    checked={ncIsActive}
                    onChange={(e) => setNcIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-800 cursor-pointer"
                  />
                  <label htmlFor="ncIsActive" className="text-xs text-white font-semibold cursor-pointer">
                    Active & Available for Dispatch
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Notes / Operating Hours / Radio Channel
                </label>
                <textarea
                  rows={3}
                  value={ncNotes}
                  onChange={(e) => setNcNotes(e.target.value)}
                  placeholder="e.g. 24-hour response bakkie, VHF radio channel 4, emergency gate padlock keys..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddNonClientOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {editingNonClient ? 'Save Changes' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE / EDIT GROUP */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">
                    {editingGroup ? 'Edit Group & Sector Channel' : 'Create New Group / Sector'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define broadcast groups, sector response channels & assign members
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={grpName}
                    onChange={(e) => setGrpName(e.target.value)}
                    placeholder="e.g. Sektor 4 (Wes / Wolmaransstad-pad)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Group Code
                  </label>
                  <input
                    type="text"
                    value={grpCode}
                    onChange={(e) => setGrpCode(e.target.value)}
                    placeholder="e.g. SEC-4"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono uppercase outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Group Type
                  </label>
                  <select
                    value={grpType}
                    onChange={(e) => setGrpType(e.target.value as GroupType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                  >
                    <option value="SECURITY">Security / Plaaswag</option>
                    <option value="FIRE">Fire / Brandbestryding</option>
                    <option value="PATROL">Night Patrol / Patrollie</option>
                    <option value="GENERAL">General / Community</option>
                    <option value="OTHER">Other Channel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Leader Name
                  </label>
                  <input
                    type="text"
                    value={grpLeaderName}
                    onChange={(e) => setGrpLeaderName(e.target.value)}
                    placeholder="e.g. Kobus Eloff"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Leader Phone
                  </label>
                  <input
                    type="tel"
                    value={grpLeaderPhone}
                    onChange={(e) => setGrpLeaderPhone(e.target.value)}
                    placeholder="+27 83 290 8812"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Description & Purpose
                </label>
                <input
                  type="text"
                  value={grpDescription}
                  onChange={(e) => setGrpDescription(e.target.value)}
                  placeholder="e.g. Farms on western boundary towards Wolmaransstad, gravel road intersections"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                />
              </div>

              {/* Multi-Member Selection Checklist */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-400" />
                    <span>Assign Members ({grpSelectedMemberIds.length} Selected)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGrpSelectedMemberIds(allUsers.map((u) => u.uid))}
                      className="text-[10px] text-teal-400 hover:underline font-bold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setGrpSelectedMemberIds([])}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={grpMemberSearch}
                    onChange={(e) => setGrpMemberSearch(e.target.value)}
                    placeholder="Search users to add..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {allUsers
                    .filter((u) => {
                      if (!grpMemberSearch) return true;
                      const q = grpMemberSearch.toLowerCase();
                      return (
                        u.name?.toLowerCase().includes(q) ||
                        u.surname?.toLowerCase().includes(q) ||
                        u.farmName?.toLowerCase().includes(q) ||
                        u.sector?.toLowerCase().includes(q)
                      );
                    })
                    .map((user) => {
                      const isSelected = grpSelectedMemberIds.includes(user.uid);
                      return (
                        <div
                          key={user.uid}
                          onClick={() => handleToggleMember(user.uid)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                            isSelected
                              ? 'bg-teal-950/80 border border-teal-700/80 text-white'
                              : 'bg-slate-900 border border-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-0 bg-slate-950 border-slate-800 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold block">
                                {user.name} {user.surname}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {user.farmName} ({user.role}) • {user.primaryPhone}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-teal-300 font-semibold">
                            {user.sector || 'Hartbeesfontein'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: CLIENT FULL DOSSIER & FARM SPECS */}
      {selectedClientDossier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full uppercase">
                    Client Emergency Profile
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {selectedClientDossier.name} {selectedClientDossier.surname}
                  </h3>
                  <p className="text-xs text-amber-400 font-bold">
                    {selectedClientDossier.farmName} {selectedClientDossier.portionNumber ? `(${selectedClientDossier.portionNumber})` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientDossier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Dial Toolbar */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <a
                href={`tel:${selectedClientDossier.primaryPhone}`}
                onClick={() =>
                  handleInitiateCall(
                    `${selectedClientDossier.name} ${selectedClientDossier.surname}`,
                    selectedClientDossier.primaryPhone,
                    selectedClientDossier.farmName,
                    selectedClientDossier.sector
                  )
                }
                className="flex-1 min-w-[140px] py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call ({selectedClientDossier.primaryPhone})</span>
              </a>

              <button
                onClick={() =>
                  handleOpenWhatsApp(
                    selectedClientDossier.primaryPhone,
                    `${selectedClientDossier.name} ${selectedClientDossier.surname}`
                  )
                }
                className="flex-1 min-w-[140px] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEditClientPhone(selectedClientDossier)}
                className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow transition"
                title="Edit Client Phone Numbers"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Numbers</span>
              </button>
            </div>

            {/* Location Area & Sector Assignment */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-400 uppercase font-black tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Geographic Location Area (Ligging Wyk):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedClientDossier.locationArea ? `Linked: ${selectedClientDossier.locationArea}` : 'No Area Assigned'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <select
                  value={selectedClientDossier.locationArea || ''}
                  onChange={(e) => {
                    const newAreaName = e.target.value;
                    const matchedArea = locationAreas.find((a) => a.name === newAreaName);
                    const updates = {
                      locationArea: newAreaName || undefined,
                      locationAreaId: matchedArea?.id || undefined,
                      sector: matchedArea?.sector || selectedClientDossier.sector,
                    };
                    updateUser(selectedClientDossier.uid, updates);
                    setSelectedClientDossier({
                      ...selectedClientDossier,
                      ...updates,
                    });
                  }}
                  className="flex-1 w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-amber-300 font-bold text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="">-- No Specific Location Area Assigned --</option>
                  {locationAreas.map((area) => (
                    <option key={area.id} value={area.name}>
                      📍 {area.name} ({area.code || 'AREA'}) — {area.sector || 'Hartbeesfontein'}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsLocationAreasModalOpen(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold whitespace-nowrap transition"
                >
                  Manage All Areas
                </button>
              </div>
            </div>

            {/* Farm Access & Gate Codes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Gate Access & Codes</span>
                </span>
                <p className="text-sm font-black text-amber-400 font-mono">
                  {selectedClientDossier.emergencyPropertyInfo?.mainGateCode || 'No Gate Code Registered'}
                </p>
                {selectedClientDossier.emergencyPropertyInfo?.secondaryGateInfo && (
                  <p className="text-xs text-slate-300">
                    {selectedClientDossier.emergencyPropertyInfo.secondaryGateInfo}
                  </p>
                )}
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>GPS Coordinates</span>
                </span>
                {selectedClientDossier.farmGpsLocation && selectedClientDossier.farmGpsLocation.latitude != null && selectedClientDossier.farmGpsLocation.longitude != null ? (
                  <div>
                    <p className="text-xs font-mono font-bold text-white">
                      {Number(selectedClientDossier.farmGpsLocation.latitude).toFixed(6)}, {Number(selectedClientDossier.farmGpsLocation.longitude).toFixed(6)}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${selectedClientDossier.farmGpsLocation.latitude},${selectedClientDossier.farmGpsLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No verified GPS on record</p>
                )}
              </div>
            </div>

            {/* Firefighting & Dangerous Animals */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Tactical Property Hazards & Equipment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Dangerous Dogs / Animals:</span>
                  <span className="text-slate-200">
                    {selectedClientDossier.emergencyPropertyInfo?.dangerousAnimals || 'None reported'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Fire Equipment / Water:</span>
                  <span className="text-slate-200">
                    {selectedClientDossier.emergencyPropertyInfo?.firefightingEquipment || 'None reported'}
                  </span>
                </div>
              </div>
            </div>

            {/* Family Members Contact List */}
            {selectedClientDossier.familyMembers && selectedClientDossier.familyMembers.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black text-white uppercase block">
                  Family & Residence Emergency Contacts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedClientDossier.familyMembers.map((fam) => (
                    <div
                      key={fam.id}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {fam.photoUrl ? (
                          <img
                            src={fam.photoUrl}
                            alt={`${fam.name} ${fam.surname}`}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-xs">
                            {fam.name ? fam.name[0] : 'F'}
                          </div>
                        )}
                        <div className="min-w-0 truncate">
                          <strong className="text-white block truncate">{fam.name} {fam.surname}</strong>
                          <span className="text-[10px] text-slate-400 block truncate">{fam.relationship} {fam.bloodType ? `• (${fam.bloodType})` : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditFamilyPhone(selectedClientDossier, fam)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                          title="Edit Family Member Phone Number"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`tel:${fam.phone}`}
                          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex-shrink-0"
                          title="Call Family Member"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registered Vehicles */}
            {selectedClientDossier.vehicles && selectedClientDossier.vehicles.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black text-white uppercase block">
                  Registered Farm Vehicles & Bakkies
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedClientDossier.vehicles.map((veh) => (
                    <div
                      key={veh.id}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{veh.make} {veh.model}</span>
                        <span className="font-mono text-amber-400">{veh.licensePlate}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{veh.color} {veh.distinguishingFeatures ? `• ${veh.distinguishingFeatures}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registered Cattle & Livestock Marks (DALRRD Registered) */}
            {((selectedClientDossier.cattleIdentificationMarks && selectedClientDossier.cattleIdentificationMarks.length > 0) || selectedClientDossier.cattleBrandCode) && (
              <div className="space-y-2">
                <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Registered Cattle & Livestock Identification Marks</span>
                </span>
                <div className="space-y-2">
                  {selectedClientDossier.cattleIdentificationMarks && selectedClientDossier.cattleIdentificationMarks.length > 0 ? (
                    selectedClientDossier.cattleIdentificationMarks.map((cbm) => (
                      <div
                        key={cbm.id}
                        className="bg-slate-950 p-3 rounded-xl border border-amber-900/40 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40">
                              {cbm.brandCode || 'BRAND'}
                            </span>
                            <span className="font-bold text-white text-xs">{cbm.registeredOwner || selectedClientDossier.farmName}</span>
                            {cbm.isPrimary && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                                PRIMARY
                              </span>
                            )}
                          </div>

                          {cbm.certificateFileUrl && (
                            <a
                              href={cbm.certificateFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-600/40 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>View Certificate</span>
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-300">
                          <div>
                            <span className="text-slate-500 block">Placement:</span>
                            <span className="font-semibold text-slate-200">{cbm.brandLocation || 'Unspecified'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Method / Type:</span>
                            <span className="font-semibold text-slate-200">{cbm.brandMethod || 'Hot Iron'} • {cbm.animalType || 'Cattle'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Reg / Certificate:</span>
                            <span className="font-mono text-slate-200">{cbm.certificateNumber || 'N/A'}</span>
                          </div>
                        </div>

                        {cbm.earMarkDescription && (
                          <p className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                            <strong className="text-amber-400">Ear Notches:</strong> {cbm.earMarkDescription}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40">
                          {selectedClientDossier.cattleBrandCode}
                        </span>
                        <span className="text-slate-300">{selectedClientDossier.cattleBrandLocation || 'Regter Dy (Right Thigh)'}</span>
                      </div>
                      {selectedClientDossier.cattleBrandCertificateUrl && (
                        <a
                          href={selectedClientDossier.cattleBrandCertificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-600/40 px-2 py-1 rounded font-bold flex items-center gap-1"
                        >
                          <FileCheck className="w-3 h-3" />
                          <span>View Certificate</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedClientDossier(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: CALLING ACTIVE LOGGER */}
      {callingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-blue-500 flex items-center justify-center text-blue-400 mx-auto animate-pulse">
              <PhoneCall className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest block mb-1">
                Direct Calling Dispatch Link
              </span>
              <h3 className="text-xl font-black text-white">
                {callingContact.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {callingContact.roleOrOrg} {callingContact.sector ? `• ${callingContact.sector}` : ''}
              </p>
              <p className="text-lg font-mono font-black text-emerald-400 mt-2">
                {callingContact.phone}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`tel:${callingContact.phone}`}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Phone className="w-4 h-4" />
                <span>Launch Phone Dialer / Tel Protocol</span>
              </a>

              <button
                onClick={() =>
                  handleOpenWhatsApp(callingContact.phone, callingContact.name)
                }
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Switch to WhatsApp Message</span>
              </button>

              <button
                onClick={() => setCallingContact(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition"
              >
                Done / Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: GROUP BROADCAST MESSAGE */}
      {groupBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">
                    Broadcast to Group: {groupBroadcastModal.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dispatch broadcast message or open direct group distribution
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGroupBroadcastModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Broadcast Message Content
                </label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type broadcast alert to group members..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-teal-500 resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span>Total Recipients in Group:</span>
                <strong className="text-white font-mono">
                  {groupBroadcastModal.memberUserIds?.length || groupBroadcastModal.activeMemberCount || 0} Members
                </strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGroupBroadcastModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = groupBroadcastModal.leaderPhone?.replace(/[^0-9+]/g, '') || '';
                    const url = generateManualWhatsAppUrl(cleanPhone, broadcastMessage);
                    window.open(url, '_blank', 'noopener,noreferrer');
                    logAuditEvent({
                      recordType: 'COMMUNICATION',
                      recordId: `GRP-BC-${Date.now()}`,
                      action: 'GROUP_BROADCAST_DISPATCHED',
                      description: `Control room dispatched group broadcast to "${groupBroadcastModal.name}"`,
                    });
                    setGroupBroadcastModal(null);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Launch WhatsApp Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: DIRECT PHONE NUMBER EDITOR */}
      {editingPhone && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full uppercase">
                    Phone Directory Editor
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    Edit Phone Numbers
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold truncate max-w-xs sm:max-w-sm">
                    {editingPhone.targetName} • <span className="text-slate-400 font-normal">{editingPhone.targetRole}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPhone(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoneEdit} className="space-y-3.5">
              {/* Primary Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1 flex items-center justify-between">
                  <span>
                    {editingPhone.targetType === 'GROUP_LEADER'
                      ? 'Group Leader Phone / WhatsApp'
                      : editingPhone.targetType === 'REACTION_FORCE_USER'
                      ? 'Primary Mobile / Radio Dispatch Phone'
                      : 'Primary Phone Number'}{' '}
                    <span className="text-red-400">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. 082 123 4567 or +27821234567</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={editingPhone.primaryPhone}
                    onChange={(e) =>
                      setEditingPhone({
                        ...editingPhone,
                        primaryPhone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm font-mono text-white outline-none transition"
                  />
                </div>
              </div>

              {/* Secondary / Alternative Phone (if applicable) */}
              {editingPhone.targetType !== 'GROUP_LEADER' && editingPhone.targetType !== 'FAMILY_MEMBER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>Alternative / Secondary Phone</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional backup number</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={editingPhone.secondaryPhone || ''}
                      onChange={(e) =>
                        setEditingPhone({
                          ...editingPhone,
                          secondaryPhone: e.target.value,
                        })
                      }
                      placeholder="Optional alternative phone..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm font-mono text-white outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* WhatsApp specific line (for Non-Clients & Contacts) */}
              {(editingPhone.targetType === 'NON_CLIENT_CONTACT' ||
                editingPhone.targetType === 'REACTION_FORCE_CONTACT' ||
                editingPhone.targetType === 'MANAGEMENT_CONTACT') && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>Direct WhatsApp Number</span>
                    <span className="text-[10px] text-slate-400 font-normal">If different from primary</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={editingPhone.whatsappNumber || ''}
                      onChange={(e) =>
                        setEditingPhone({
                          ...editingPhone,
                          whatsappNumber: e.target.value,
                        })
                      }
                      placeholder="e.g. 082 123 4567"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm font-mono text-emerald-300 outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Preview Dialer Test */}
              {editingPhone.primaryPhone && (
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Quick Verification Links:
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${editingPhone.primaryPhone}`}
                      className="flex-1 py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Test Call Link</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(editingPhone.primaryPhone, editingPhone.targetName)}
                      className="flex-1 py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Test WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Security & Audit Notice */}
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Updates are saved immediately to live control room directory & emergency dispatch records.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPhone(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Phone Number</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: LOCATION AREAS & WYKE MANAGER */}
      {isLocationAreasModalOpen && (
        <LocationAreasManager
          isModal={true}
          onClose={() => setIsLocationAreasModalOpen(false)}
        />
      )}
    </div>
  );
};
