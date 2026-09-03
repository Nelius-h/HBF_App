import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomRoleDefinition, UserProfile, UserRole } from '../types';
import { ACTUAL_CLIENT_PROFILES } from '../data/actualClientProfilesData';
import {
  subscribeToUsers,
  syncUserToFirestore,
} from '../services/firebase';
import { findUserByLoginIdentifier } from '../utils/memberLookup';
import {
  safeGetJSON,
  safeSetJSON,
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
} from '../utils/safeStorage';

export const INITIAL_CUSTOM_ROLES: CustomRoleDefinition[] = [
  {
    id: 'ROLE-RF-CMD',
    name: 'Reaction Force Commander',
    code: 'RF_COMMANDER',
    category: 'REACTION',
    description: 'Leads and dispatches tactical reaction teams during active farm attacks and intrusions.',
    colorHex: '#ef4444',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ROLE-RF-TACTICAL',
    name: 'Reaction Force Tactical Unit',
    code: 'REACTION_FORCE',
    category: 'REACTION',
    description: 'Armed tactical armed response personnel deployed to active scenes.',
    colorHex: '#dc2626',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ROLE-FIRE-DRIVER',
    name: 'Firetruck / Bakkie Sakkie Driver',
    code: 'FIRETRUCK_DRIVER',
    category: 'FIRE',
    description: 'Certified driver and operator of mobile firefighting bakkies and water tankers.',
    colorHex: '#f97316',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ROLE-FIRE-RESPONDER',
    name: 'Veld Fire Responder',
    code: 'FIRE_RESPONDER',
    category: 'FIRE',
    description: 'FPA registered member assisting with beaters, drip torches, and water lines.',
    colorHex: '#ea580c',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ROLE-MGMT-EXEC',
    name: 'Management Executive',
    code: 'MANAGEMENT_EXECUTIVE',
    category: 'MANAGEMENT',
    description: 'Executive committee member with legal oversight, financial approvals and POPIA authority.',
    colorHex: '#f59e0b',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ROLE-CTRL-OPERATOR',
    name: 'Control Room Operator',
    code: 'CONTROL_ROOM_OPERATOR',
    category: 'OPERATIONS',
    description: 'Primary dispatcher monitoring alarms, radio channels, CCTV, and CAD queues.',
    colorHex: '#3b82f6',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ROLE-MED-RESPONDER',
    name: 'Medical First Responder',
    code: 'MEDICAL_FIRST_RESPONDER',
    category: 'MEDICAL',
    description: 'Trained first aid / paramedic certified responder for trauma and farm injuries.',
    colorHex: '#10b981',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ROLE-SECTOR-LEADER',
    name: 'Sector / Wyk Leader',
    code: 'SECTOR_LEADER',
    category: 'COMMUNITY',
    description: 'Coordinates radio check-ins, roadblocks and local farm watch patrols in their sector.',
    colorHex: '#8b5cf6',
    isSystemRole: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export interface ClientRegistrationData {
  name: string;
  surname: string;
  primaryPhone: string;
  email?: string;
  farmName: string;
  portionNumber?: string;
  sector?: string;
  locationArea?: string;
  locationAreaId?: string;
  gateCode?: string;
  emergencyNotes?: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  activeRole: UserRole;
  isManagementMode: boolean;
  isMasterAdmin: boolean;
  isAuthenticated: boolean;
  isForcePinChangeRequired: boolean;
  login: (identifier: string, pin: string) => Promise<{ success: boolean; error?: string; requirePinChange?: boolean; user?: UserProfile }>;
  registerClient: (data: ClientRegistrationData) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  changePin: (userUid: string, currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
  setUserPinDirectly: (userUid: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
  dismissForcePinChange: () => void;
  logout: () => void;
  switchToManagement: () => void;
  switchToClient: () => void;
  switchToControlRoom: () => void;
  setOverrideRole: (role: UserRole | null) => void;
  updateCurrentUser: (updated: Partial<UserProfile>) => void;
  switchUserAccount: (userUid: string) => void;
  availableUsers: UserProfile[];
  allUsers: UserProfile[];
  createUser: (userData: Partial<UserProfile> & { name: string; surname: string; primaryPhone: string; role: UserRole }) => Promise<UserProfile>;
  updateUser: (userUid: string, updates: Partial<UserProfile>) => void;
  deleteUser: (userUid: string) => Promise<boolean>;
  updateUserRole: (userUid: string, newRole: UserRole) => void;
  assignRolesToUser: (userUid: string, assignedRoles: string[], operationalRole?: string, roleTitle?: string) => void;
  customRoles: CustomRoleDefinition[];
  createCustomRole: (role: Omit<CustomRoleDefinition, 'id' | 'createdAt'>) => Promise<CustomRoleDefinition>;
  updateCustomRole: (roleId: string, updates: Partial<CustomRoleDefinition>) => Promise<void>;
  deleteCustomRole: (roleId: string) => Promise<boolean>;
  resetToCleanTestLaunch: () => void;
}

// Master Admin Cornelius Hattingh profile (Authorized for Management & System Configuration)
export const MASTER_ADMIN_USER: UserProfile = {
  uid: 'USR-MGMT-ADMIN',
  email: 'Hattinghcornelius@gmail.com',
  name: 'Cornelius',
  surname: 'Hattingh',
  primaryPhone: '+27 82 306 5808',
  farmName: 'Tierfontein Hoewe 8',
  portionNumber: 'Ged 8',
  sector: 'Bestuur / Komitee',
  areaGroupIds: ['GRP-ALL', 'GRP-MANAGEMENT', 'GRP-SEC2'],
  preferredLanguage: 'af',
  role: 'MANAGEMENT',
  isActive: true,
  farmGpsLocation: {
    latitude: -26.7810,
    longitude: 26.4180,
    accuracy: 5,
    source: 'GPS',
    verifiedTimestamp: '2026-08-20T00:00:00Z',
  },
  communityResponseSettings: {
    participateNearbyEmergencies: true,
    receiveSecurityAlerts: true,
    receiveFireAlerts: true,
    receiveTrafficAlerts: true,
    receiveBoloAlerts: true,
    receiveCommunityNotices: true,
    receiveAssistanceRequests: true,
    availableToAssistNow: true,
    preferredGroupIds: ['GRP-MANAGEMENT', 'GRP-SEC2'],
    maxResponseDistanceKm: 50,
    responseNotes: 'System Administrator & Incident Commander',
  },
  familyMembers: [],
  vehicles: [
    {
      id: 'VEH-MGMT-01',
      year: 2023,
      make: 'Toyota',
      model: 'Prado 3.0 D-4D',
      color: 'Silwer / Silver',
      licensePlate: 'HBF 777 NW',
    },
  ],
  medicalAid: {
    schemeName: 'Momentum Health',
    membershipNumber: '88200192',
    principalMember: 'C. Hattingh',
    emergencyContactNumber: '+27 82 911',
  },
  emergencyPropertyInfo: {
    mainGateCode: '*8821#',
    dangerousAnimals: '1x Duitse Herdershond (mak bedags, op patrollie snags)',
    firefightingEquipment: 'Brandspuitpomp by dam',
  },
  cattleIdentificationMarks: [
    {
      id: 'CBM-001',
      brandCode: 'CH 8',
      registeredOwner: 'Cornelius Hattingh Boerdery BK',
      certificateNumber: 'DALRRD-BM-2023-7419',
      certificateDate: '2023-04-12',
      certificateFileName: 'DALRRD_Brandmerksertifikaat_CH8.pdf',
      certificateFileType: 'application/pdf',
      brandLocation: 'Regter Dy (Right Thigh)',
      brandMethod: 'HOT_IRON',
      animalType: 'CATTLE',
      earMarkDescription: 'Halfmaan voor regteroor, stomp linkeroor',
      microchipOrRfid: 'RFID Batch: 982 000182 4491 to 4850',
      stockTheftNotes: 'Geregistreer by Hartbeesfontein SAPD Veediefstaleenheid (Sektor 2)',
      isPrimary: true,
    },
  ],
  cattleBrandCode: 'CH 8',
  cattleBrandLocation: 'Regter Dy (Right Thigh)',
  createdAt: '2026-01-01T08:00:00Z',
  updatedAt: '2026-08-22T00:00:00Z',
};

export const INITIAL_USERS: UserProfile[] = ACTUAL_CLIENT_PROFILES;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const parsed = safeGetJSON<UserProfile[]>('hv_users_actual_v2', []);
    const userMap = new Map<string, UserProfile>();
    // 1. Load all base profiles (171 members + Andre Roux + Master Admin)
    ACTUAL_CLIENT_PROFILES.forEach((u) => userMap.set(u.uid, u));
    // 2. Overlay any cached updates from local storage
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed.forEach((u) => {
        const existing = userMap.get(u.uid);
        if (existing) {
          userMap.set(u.uid, { ...existing, ...u });
        } else {
          userMap.set(u.uid, u);
        }
      });
    }
    // 3. Ensure Master Admin is present
    if (!userMap.has(MASTER_ADMIN_USER.uid)) {
      userMap.set(MASTER_ADMIN_USER.uid, MASTER_ADMIN_USER);
    }
    return Array.from(userMap.values());
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const savedUid = safeGetItem('hv_auth_user_uid');
    return savedUid || MASTER_ADMIN_USER.uid;
  });

  // Persistent session: Active by default with Master Admin Cornelius Hattingh (or saved user) unless explicitly logged out
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const sessionActive = safeGetItem('hv_auth_session_active');
    if (sessionActive === 'false') {
      return false;
    }
    // Default to true so app loads immediately and smoothly
    return true;
  });

  const [isForcePinChangeRequired, setIsForcePinChangeRequired] = useState<boolean>(() => {
    return false;
  });

  const [customRoles, setCustomRoles] = useState<CustomRoleDefinition[]>(() => {
    return safeGetJSON<CustomRoleDefinition[]>('hv_custom_roles_v1', INITIAL_CUSTOM_ROLES);
  });

  useEffect(() => {
    safeSetJSON('hv_custom_roles_v1', customRoles);
  }, [customRoles]);

  // Subscribe to real-time updates from Firestore for all registered members
  useEffect(() => {
    const unsubscribe = subscribeToUsers((remoteUsers) => {
      if (!remoteUsers || remoteUsers.length === 0) {
        return;
      }

      setUsers((prevUsers) => {
        const userMap = new Map<string, UserProfile>();

        // 1. Base client profiles (official 171 roster)
        ACTUAL_CLIENT_PROFILES.forEach((u) => userMap.set(u.uid, u));

        // 2. Current local state
        prevUsers.forEach((u) => userMap.set(u.uid, u));

        // 3. Remote users from Firestore (synced across all phones/devices)
        remoteUsers.forEach((remoteUser) => {
          const existing = userMap.get(remoteUser.uid);
          if (existing) {
            userMap.set(remoteUser.uid, {
              ...existing,
              ...remoteUser,
            });
          } else {
            userMap.set(remoteUser.uid, remoteUser);
          }
        });

        // Ensure Master Admin is always available
        if (!userMap.has(MASTER_ADMIN_USER.uid)) {
          userMap.set(MASTER_ADMIN_USER.uid, MASTER_ADMIN_USER);
        }

        const merged = Array.from(userMap.values());
        safeSetJSON('hv_users_actual_v2', merged);
        return merged;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [adminViewMode, setAdminViewMode] = useState<UserRole>('CLIENT');

  useEffect(() => {
    safeSetJSON('hv_users_actual_v2', users);
  }, [users]);

  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      safeSetItem('hv_auth_user_uid', currentUserId);
    }
  }, [currentUserId, isAuthenticated]);

  const currentUser = users.find((u) => u.uid === currentUserId) || MASTER_ADMIN_USER;

  // Never preserve an authenticated session for a UID that is not present in the loaded user registry.
  useEffect(() => {
    if (isAuthenticated && currentUserId && !users.some((u) => u.uid === currentUserId)) {
      setIsAuthenticated(false);
      setIsForcePinChangeRequired(false);
      localStorage.removeItem('hv_auth_session_active');
      localStorage.removeItem('hv_auth_user_uid');
    }
  }, [isAuthenticated, currentUserId, users]);

  // Master Admin verification (Cornelius Hattingh only)
  const isMasterAdmin =
    isAuthenticated && (
    currentUser.email.toLowerCase() === 'hattinghcornelius@gmail.com' ||
    currentUser.email.toLowerCase() === 'cornelius.hattingh@hbfveiligheid.co.za' ||
    currentUser.uid === 'USR-MGMT-ADMIN' ||
    (currentUser.name.toLowerCase().includes('cornelius') && currentUser.surname.toLowerCase().includes('hattingh'))
    );

  // Active role is strictly computed:
  // Clients and Control Room operators can NOT switch between user views and profiles.
  // Master Admin (Cornelius Hattingh) can toggle views for system administration.
  const activeRole: UserRole = isMasterAdmin
    ? (adminViewMode || currentUser.role || 'CLIENT')
    : currentUser.role;

  const isManagementMode = activeRole === 'MANAGEMENT';

  const switchToManagement = () => {
    if (isMasterAdmin || currentUser.role === 'MANAGEMENT') {
      setAdminViewMode('MANAGEMENT');
    }
  };

  const switchToControlRoom = () => {
    if (isMasterAdmin) {
      setAdminViewMode('CONTROL_ROOM');
    }
  };

  const switchToClient = () => {
    if (isMasterAdmin) {
      setAdminViewMode('CLIENT');
    }
  };

  const setOverrideRole = (role: UserRole | null) => {
    if (isMasterAdmin && role) {
      setAdminViewMode(role);
    }
  };

  // Login using Name, Cell / Phone number, Farm name, or Email with 4-digit PIN (default 1234)
  const login = async (
    identifier: string,
    enteredPin: string
  ): Promise<{ success: boolean; error?: string; requirePinChange?: boolean; user?: UserProfile }> => {
    const rawId = (identifier || '').trim();
    const pin = (enteredPin || '').trim();

    if (!rawId) {
      return { success: false, error: 'Voer asseblief u Naam of Selfoonnommer in.' };
    }
    if (!pin) {
      return { success: false, error: 'Voer asseblief u 4-syfer PIN in (verstek is 1234).' };
    }

    // Find matching user profile using comprehensive member lookup
    const matched = findUserByLoginIdentifier(users, rawId);

    if (!matched) {
      return {
        success: false,
        error: `Geen rekening gevind vir "${rawId}" nie. Kontroleer asseblief u Naam of Selfoonnommer, of soek in die Ledelys.`,
      };
    }

    if (matched.isActive === false) {
      return { success: false, error: 'Hierdie rekening is gedeaktiveer. Kontak asseblief die beheer-/bestuurspan.' };
    }

    // Legacy roster accounts may use the one-time bootstrap PIN until the first successful login.
    // A changed PIN is never allowed to fall back to 1234.
    const expectedPin = matched.pin || '1234';
    if (pin !== expectedPin) {
      return {
        success: false,
        error: 'Verkeerde PIN. Verstek PIN is 1234 tensy u dit reeds verander het.',
      };
    }

    // Success: Activate session & persist
    setCurrentUserId(matched.uid);
    setIsAuthenticated(true);
    safeSetItem('hv_auth_user_uid', matched.uid);
    safeSetItem('hv_auth_session_active', 'true');
    safeSetItem('hv_onboarding_completed', 'true');

    // Force PIN change if flagged
    const needChange = matched.mustChangePin === true || !matched.pin || matched.pin === '1234' || matched.hasChangedPin !== true;
    setIsForcePinChangeRequired(needChange);

    // Record login timestamp
    updateUser(matched.uid, { lastLoginAt: new Date().toISOString() });

    return {
      success: true,
      requirePinChange: needChange,
      user: matched,
    };
  };

  // Register new client / farmer
  const registerClient = async (
    data: ClientRegistrationData
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    if (!data.name.trim()) {
      return { success: false, error: 'Voer asseblief u Naam in.' };
    }
    if (!data.surname.trim()) {
      return { success: false, error: 'Voer asseblief u Van in.' };
    }
    if (!data.primaryPhone.trim()) {
      return { success: false, error: 'Voer asseblief u Selfoonnommer in.' };
    }
    if (!data.farmName.trim()) {
      return { success: false, error: 'Voer asseblief u Plaasnaam / Hoewe in.' };
    }

    const normalizedPhone = data.primaryPhone.replace(/\D/g, '');
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    const duplicate = users.find((u) =>
      u.primaryPhone.replace(/\D/g, '') === normalizedPhone ||
      (normalizedEmail && u.email.trim().toLowerCase() === normalizedEmail)
    );
    if (duplicate) {
      return { success: false, error: 'Daar bestaan reeds ’n rekening met hierdie selfoonnommer of e-posadres.' };
    }

    const newUid = `USR-CLIENT-${crypto.randomUUID()}`;
    const newUser: UserProfile = {
      uid: newUid,
      email:
        data.email?.trim() ||
        `${data.name.trim().toLowerCase()}.${data.surname.trim().toLowerCase()}@hbfboere.co.za`,
      name: data.name.trim(),
      surname: data.surname.trim(),
      primaryPhone: data.primaryPhone.trim(),
      farmName: data.farmName.trim(),
      portionNumber: data.portionNumber?.trim() || '',
      sector: data.sector || 'Sektor 2 - Noord',
      locationArea: data.locationArea || 'Hartbeesfontein',
      locationAreaId: data.locationAreaId,
      areaGroupIds: ['GRP-ALL'],
      preferredLanguage: 'af',
      role: 'CLIENT',
      isActive: true,
      pin: '1234', // Default PIN is 1234
      mustChangePin: true, // After registration client has to change PIN
      hasChangedPin: false,
      emergencyPropertyInfo: data.gateCode ? { mainGateCode: data.gateCode } : undefined,
      emergencyNotes: data.emergencyNotes || '',
      familyMembers: [],
      vehicles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUid);
    setIsAuthenticated(true);
    setIsForcePinChangeRequired(true); // Must change PIN immediately
    safeSetItem('hv_auth_user_uid', newUid);
    safeSetItem('hv_auth_session_active', 'true');
    safeSetItem('hv_onboarding_completed', 'true');

    // Sync to Firestore cloud database so new registration shows on all devices and in control room
    syncUserToFirestore(newUser);

    return { success: true, user: newUser };
  };

  // Change PIN with validation
  const changePin = async (
    userUid: string,
    currentPin: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetUser = users.find((u) => u.uid === userUid) || currentUser;
    if (!targetUser) {
      return { success: false, error: 'Gebruiker nie gevind nie.' };
    }

    const cleanNewPin = newPin.trim();
    if (!cleanNewPin || cleanNewPin.length < 4) {
      return { success: false, error: 'U nuwe PIN moet ten minste 4 syfers wees.' };
    }
    if (!/^\d+$/.test(cleanNewPin)) {
      return { success: false, error: 'PIN mag slegs syfers (0-9) bevat.' };
    }
    if (cleanNewPin === '1234') {
      return {
        success: false,
        error: 'U nuwe PIN mag nie die verstek PIN (1234) wees nie. Kies asseblief u eie geheime kode.',
      };
    }

    // Verify current PIN if not in forced initial registration setup
    if (targetUser.pin && !targetUser.mustChangePin) {
      if (currentPin.trim() !== targetUser.pin) {
        return { success: false, error: 'Bestaande PIN is verkeerd.' };
      }
    }

    updateUser(targetUser.uid, {
      pin: cleanNewPin,
      mustChangePin: false,
      hasChangedPin: true,
      updatedAt: new Date().toISOString(),
    });

    setIsForcePinChangeRequired(false);
    return { success: true };
  };

  // Direct PIN set (used during forced post-registration step)
  const setUserPinDirectly = async (
    userUid: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanNewPin = newPin.trim();
    if (!cleanNewPin || cleanNewPin.length < 4) {
      return { success: false, error: 'U nuwe PIN moet ten minste 4 syfers wees.' };
    }
    if (!/^\d+$/.test(cleanNewPin)) {
      return { success: false, error: 'PIN mag slegs syfers (0-9) bevat.' };
    }
    if (cleanNewPin === '1234') {
      return {
        success: false,
        error: 'U nuwe PIN mag nie 1234 wees nie. Kies asseblief u eie unieke 4-syfer kode.',
      };
    }

    updateUser(userUid, {
      pin: cleanNewPin,
      mustChangePin: false,
      hasChangedPin: true,
      updatedAt: new Date().toISOString(),
    });

    setIsForcePinChangeRequired(false);
    return { success: true };
  };

  const dismissForcePinChange = () => {
    setIsForcePinChangeRequired(false);
  };

  // Logout session
  const logout = () => {
    safeSetItem('hv_auth_session_active', 'false');
    safeRemoveItem('hv_auth_user_uid');
    safeRemoveItem('hv_session_active');
    safeRemoveItem('hv_current_uid');
    setIsAuthenticated(false);
    setIsForcePinChangeRequired(false);
  };

  const resetToCleanTestLaunch = () => {
    safeRemoveItem('hv_emergencies_v2');
    safeRemoveItem('hv_cases_actual_v2');
    safeRemoveItem('hv_incident_notifications_v2');
    safeRemoveItem('hv_test_users');
    safeSetItem('hv_auth_session_active', 'false');
    safeRemoveItem('hv_auth_user_uid');
    safeRemoveItem('hv_session_active');
    safeRemoveItem('hv_current_uid');
    safeSetJSON('hv_users_actual_v2', ACTUAL_CLIENT_PROFILES);
    setUsers(ACTUAL_CLIENT_PROFILES);
    setCurrentUserId(MASTER_ADMIN_USER.uid);
    setIsAuthenticated(false);
    setAdminViewMode('CLIENT');
  };

  const updateCurrentUser = (updated: Partial<UserProfile>) => {
    setUsers((prev) => {
      let targetUser: UserProfile | null = null;
      const newUsers = prev.map((u) => {
        if (u.uid === currentUser.uid) {
          targetUser = {
            ...u,
            ...updated,
            updatedAt: new Date().toISOString(),
          };
          return targetUser;
        }
        return u;
      });
      if (targetUser) {
        syncUserToFirestore(targetUser);
      }
      safeSetJSON('hv_users_actual_v2', newUsers);
      if (isAuthenticated) {
        safeSetItem('hv_auth_user_uid', currentUser.uid);
      }
      safeSetItem('hv_onboarding_completed', 'true');
      return newUsers;
    });
  };

  const switchUserAccount = (userUid: string) => {
    // Account impersonation is restricted to the authenticated master administrator.
    if (!isMasterAdmin) return;
    const found = users.find((u) => u.uid === userUid);
    if (found && found.isActive !== false) {
      setCurrentUserId(userUid);
      if (isAuthenticated) {
        safeSetItem('hv_auth_user_uid', userUid);
      }
      safeSetItem('hv_onboarding_completed', 'true');
      setAdminViewMode('CLIENT'); // Default to client view on account switch
    }
  };

  const updateUser = (userUid: string, updates: Partial<UserProfile>) => {
    setUsers((prev) => {
      let targetUser: UserProfile | null = null;
      const newUsers = prev.map((u) => {
        if (u.uid === userUid) {
          targetUser = {
            ...u,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return targetUser;
        }
        return u;
      });
      if (targetUser) {
        syncUserToFirestore(targetUser);
      }
      safeSetJSON('hv_users_actual_v2', newUsers);
      return newUsers;
    });
  };

  const updateUserRole = (userUid: string, newRole: UserRole) => {
    setUsers((prev) => {
      let targetUser: UserProfile | null = null;
      const newUsers = prev.map((u) => {
        if (u.uid === userUid) {
          targetUser = {
            ...u,
            role: newRole,
            updatedAt: new Date().toISOString(),
          };
          return targetUser;
        }
        return u;
      });
      if (targetUser) {
        syncUserToFirestore(targetUser);
      }
      return newUsers;
    });
  };

  const createUser = async (userData: Partial<UserProfile> & { name: string; surname: string; primaryPhone: string; role: UserRole }): Promise<UserProfile> => {
    const newUid = `USR-${userData.role}-${Date.now().toString().slice(-6)}`;
    const newUser: UserProfile = {
      uid: newUid,
      email: userData.email || `${userData.name.toLowerCase()}.${userData.surname.toLowerCase()}@hbfboere.co.za`,
      name: userData.name,
      surname: userData.surname,
      primaryPhone: userData.primaryPhone,
      secondaryPhone: userData.secondaryPhone,
      farmName: userData.farmName || 'Hartbeesfontein Plaaswag Gebied',
      portionNumber: userData.portionNumber,
      sector: userData.sector || 'Sektor 2 - Noord',
      locationArea: userData.locationArea || 'Palmietfontein',
      locationAreaId: userData.locationAreaId,
      areaGroupIds: userData.areaGroupIds || ['GRP-ALL'],
      preferredLanguage: userData.preferredLanguage || 'af',
      role: userData.role,
      operationalRole: userData.operationalRole,
      assignedRoles: userData.assignedRoles || [],
      roleTitle: userData.roleTitle,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      callsign: userData.callsign || (userData.role === 'REACTION_FORCE' ? `RF-${userData.name.slice(0, 4).toUpperCase()}` : undefined),
      organizationTeam: userData.organizationTeam,
      vehicleDetails: userData.vehicleDetails,
      emergencyNotes: userData.emergencyNotes,
      familyMembers: userData.familyMembers || [],
      vehicles: userData.vehicles || [],
      medicalAid: userData.medicalAid,
      emergencyPropertyInfo: userData.emergencyPropertyInfo,
      farmGpsLocation: userData.farmGpsLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    syncUserToFirestore(newUser);
    return newUser;
  };

  const deleteUser = async (userUid: string): Promise<boolean> => {
    if (userUid === currentUser.uid) {
      // Cannot delete currently logged in account
      return false;
    }
    setUsers((prev) => prev.filter((u) => u.uid !== userUid));
    return true;
  };

  const assignRolesToUser = (userUid: string, assignedRoles: string[], operationalRole?: string, roleTitle?: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === userUid) {
          return {
            ...u,
            assignedRoles,
            operationalRole: operationalRole !== undefined ? operationalRole : u.operationalRole,
            roleTitle: roleTitle !== undefined ? roleTitle : u.roleTitle,
            updatedAt: new Date().toISOString(),
          };
        }
        return u;
      })
    );
  };

  const createCustomRole = async (roleData: Omit<CustomRoleDefinition, 'id' | 'createdAt'>): Promise<CustomRoleDefinition> => {
    const newRole: CustomRoleDefinition = {
      ...roleData,
      id: `ROLE-CUST-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    setCustomRoles((prev) => [...prev, newRole]);
    return newRole;
  };

  const updateCustomRole = async (roleId: string, updates: Partial<CustomRoleDefinition>): Promise<void> => {
    setCustomRoles((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
          return { ...r, ...updates };
        }
        return r;
      })
    );
  };

  const deleteCustomRole = async (roleId: string): Promise<boolean> => {
    const roleToDelete = customRoles.find((r) => r.id === roleId);
    if (roleToDelete?.isSystemRole) {
      // Prevent deleting built-in base system roles
      return false;
    }
    setCustomRoles((prev) => prev.filter((r) => r.id !== roleId));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        isManagementMode,
        isMasterAdmin,
        isAuthenticated,
        isForcePinChangeRequired,
        login,
        registerClient,
        changePin,
        setUserPinDirectly,
        dismissForcePinChange,
        logout,
        switchToManagement,
        switchToClient,
        switchToControlRoom,
        setOverrideRole,
        updateCurrentUser,
        switchUserAccount,
        availableUsers: users,
        allUsers: users,
        createUser,
        updateUser,
        deleteUser,
        updateUserRole,
        assignRolesToUser,
        customRoles,
        createCustomRole,
        updateCustomRole,
        deleteCustomRole,
        resetToCleanTestLaunch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
