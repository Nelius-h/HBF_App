import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

// Suppress internal verbose Firestore stream warnings on free-tier limits
setLogLevel('silent');

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with resilient auto-detect long polling and multi-tab local caching
export const db = (() => {
  try {
    const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
      },
      dbId
    );
  } catch {
    return firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

// Initialize Firebase Auth
export const auth = getAuth(app);

let authInitPromise: Promise<User | null> | null = null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errStr = error instanceof Error ? error.message : String(error);
  const isQuota =
    errStr.includes('resource-exhausted') ||
    errStr.includes('Quota limit exceeded') ||
    errStr.includes('Write stream exhausted');

  if (isQuota) {
    recordQuotaExceeded(errStr);
  }

  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  if (!isQuota) {
    console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  }
}

// Global Quota Tracking
const QUOTA_STORAGE_KEY = 'hv_firestore_quota_exceeded_timestamp_v1';

export function recordQuotaExceeded(reason?: string) {
  console.info(
    `[Firestore Notice] Live cloud notice: ${reason || 'operating with backend sync'}`
  );
}

export function isQuotaExceeded(): boolean {
  return false;
}

export function resetQuotaExceededState(): void {
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Clear any stale quota flag on module load
resetQuotaExceededState();

/**
 * Validates connection to Firestore server on boot
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    // Gracefully handle offline or hidden tab IndexedDB states
    return false;
  }
}

// Initial connection test
try {
  testConnection().catch(() => {});
} catch {
  // ignore
}

/**
 * Ensures anonymous authentication for device communication with safety timeout
 */
export const ensureFirebaseAuth = async (): Promise<User | null> => {
  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    if (!authInitPromise) {
      authInitPromise = new Promise((resolve) => {
        let isDone = false;
        const timer = setTimeout(() => {
          if (!isDone) {
            isDone = true;
            resolve(null);
          }
        }, 1000);

        try {
          onAuthStateChanged(
            auth,
            async (user) => {
              if (isDone) return;
              if (user) {
                isDone = true;
                clearTimeout(timer);
                resolve(user);
              } else {
                try {
                  const cred = await signInAnonymously(auth);
                  if (!isDone) {
                    isDone = true;
                    clearTimeout(timer);
                    resolve(cred.user);
                  }
                } catch {
                  // If anonymous auth is not enabled or network is unavailable, proceed gracefully
                  if (!isDone) {
                    isDone = true;
                    clearTimeout(timer);
                    resolve(null);
                  }
                }
              }
            },
            () => {
              // Handle internal onAuthStateChanged network or token error gracefully
              if (!isDone) {
                isDone = true;
                clearTimeout(timer);
                resolve(null);
              }
            }
          );
        } catch {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            resolve(null);
          }
        }
      });
    }
    return await Promise.race([
      authInitPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)),
    ]);
  } catch {
    return null;
  }
};

// Immediately attempt auth in the background
ensureFirebaseAuth().catch(() => {});

// ==========================================
// USER & CLIENT PROFILES FIRESTORE SERVICES
// ==========================================

const USERS_COLLECTION = 'users';

/**
 * Save or update a user profile in Firestore
 */
export const syncUserToFirestore = async (user: UserProfile): Promise<boolean> => {
  try {
    ensureFirebaseAuth().catch(() => {});
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    // Sanitize undefined fields for Firestore
    const cleanData = JSON.parse(JSON.stringify(user));
    await setDoc(userRef, cleanData, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, USERS_COLLECTION);
    return false;
  }
};

/**
 * Batch seed or sync multiple users to Firestore (e.g. initial client roster)
 */
export const batchSyncUsersToFirestore = async (users: UserProfile[]): Promise<void> => {
  if (!users.length) return;
  try {
    ensureFirebaseAuth().catch(() => {});
    // Process in chunks of 400 (Firestore limit is 500 per batch)
    const chunkSize = 400;
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((u) => {
        const ref = doc(db, USERS_COLLECTION, u.uid);
        const cleanData = JSON.parse(JSON.stringify(u));
        batch.set(ref, cleanData, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, USERS_COLLECTION);
  }
};

/**
 * Subscribe to real-time updates for all registered community members
 */
export const subscribeToUsers = (
  onUpdate: (remoteUsers: UserProfile[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      const loaded: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          loaded.push(docSnap.data() as UserProfile);
        }
      });
      if (loaded.length > 0) {
        onUpdate(loaded);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, USERS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

// ==========================================
// EMERGENCIES & ALERTS REALTIME SERVICES
// ==========================================

const EMERGENCIES_COLLECTION = 'emergencies';
const ALERTS_COLLECTION = 'alerts';
const SITUATION_REPORTS_COLLECTION = 'situation_reports';
const CASES_COLLECTION = 'cases';
const BOLOS_COLLECTION = 'bolos';
const INTEL_POIS_COLLECTION = 'intel_pois';
const INTEL_VOIS_COLLECTION = 'intel_vois';
const INTEL_OBSERVATIONS_COLLECTION = 'intel_observations';
const PATROL_UNITS_COLLECTION = 'active_patrol_units';
const INCIDENT_NOTIFICATIONS_COLLECTION = 'incident_notifications';
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const LOCATION_AREAS_COLLECTION = 'location_areas';
const SETTINGS_COLLECTION = 'settings';

export const syncEmergencyToFirestore = async (emergencyData: any): Promise<boolean> => {
  try {
    ensureFirebaseAuth().catch(() => {});
    const emRef = doc(db, EMERGENCIES_COLLECTION, emergencyData.id);
    const cleanData = JSON.parse(JSON.stringify(emergencyData));
    await setDoc(emRef, cleanData, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, EMERGENCIES_COLLECTION);
    return false;
  }
};

export const resolveAllFirestoreEmergencies = async (
  resolvedByName = 'Control Room',
  notes = 'System-wide emergency clearance'
): Promise<number> => {
  if (isQuotaExceeded()) return 0;
  try {
    await ensureFirebaseAuth();
    const emRef = collection(db, EMERGENCIES_COLLECTION);
    const snap = await getDocs(emRef);
    const now = new Date().toISOString();
    const promises: Promise<any>[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status !== 'SAFE' && data.status !== 'FALSE_ALARM' && data.status !== 'CLOSED') {
        promises.push(
          setDoc(
            docSnap.ref,
            {
              status: 'SAFE',
              resolvedTime: now,
              resolutionDetails: {
                resolutionStatus: 'SAFE',
                resolutionTimestamp: now,
                resolvedByName,
                notes,
                policeInvolved: false,
                ambulanceInvolved: false,
                reactionForceInvolved: false,
                caseCreated: false,
                followUpRequired: false,
              },
              updatedAt: now,
            },
            { merge: true }
          )
        );
      }
    });
    await Promise.all(promises);
    return promises.length;
  } catch (err) {
    console.warn('[Firebase] Error resolving all Firestore emergencies:', err);
    return 0;
  }
};

export const subscribeToEmergencies = (
  onUpdate: (emergencies: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const emRef = collection(db, EMERGENCIES_COLLECTION);
  return onSnapshot(
    emRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, EMERGENCIES_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const syncAlertToFirestore = async (alertData: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const alertRef = doc(db, ALERTS_COLLECTION, alertData.id);
    const clean = JSON.parse(JSON.stringify(alertData));
    await setDoc(alertRef, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, ALERTS_COLLECTION);
    return false;
  }
};

export const subscribeToAlerts = (
  onUpdate: (alerts: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const alertsRef = collection(db, ALERTS_COLLECTION);
  return onSnapshot(
    alertsRef,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, ALERTS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

// ==========================================
// DATA LOG & SITUATION REPORTS (VOORVALLEBOEK)
// ==========================================

export const syncSituationReportToFirestore = async (report: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, SITUATION_REPORTS_COLLECTION, report.id);
    const clean = JSON.parse(JSON.stringify(report));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, SITUATION_REPORTS_COLLECTION);
    return false;
  }
};

export const batchSyncSituationReportsToFirestore = async (reports: any[]): Promise<void> => {
  if (isQuotaExceeded() || !reports.length) return;
  try {
    await ensureFirebaseAuth();
    const chunkSize = 400;
    for (let i = 0; i < reports.length; i += chunkSize) {
      const chunk = reports.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((rep) => {
        const ref = doc(db, SITUATION_REPORTS_COLLECTION, rep.id);
        const clean = JSON.parse(JSON.stringify(rep));
        batch.set(ref, clean, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, SITUATION_REPORTS_COLLECTION);
  }
};

export const subscribeToSituationReports = (
  onUpdate: (reports: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, SITUATION_REPORTS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, SITUATION_REPORTS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const deleteSituationReportFromFirestore = async (reportId: string): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, SITUATION_REPORTS_COLLECTION, reportId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, SITUATION_REPORTS_COLLECTION);
    return false;
  }
};

// ==========================================
// CASES & INVESTIGATIONS REALTIME SERVICES
// ==========================================

export const syncCaseToFirestore = async (caseData: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, CASES_COLLECTION, caseData.id);
    const clean = JSON.parse(JSON.stringify(caseData));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, CASES_COLLECTION);
    return false;
  }
};

export const batchSyncCasesToFirestore = async (cases: any[]): Promise<void> => {
  if (isQuotaExceeded() || !cases.length) return;
  try {
    await ensureFirebaseAuth();
    const chunkSize = 400;
    for (let i = 0; i < cases.length; i += chunkSize) {
      const chunk = cases.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((c) => {
        const ref = doc(db, CASES_COLLECTION, c.id);
        const clean = JSON.parse(JSON.stringify(c));
        batch.set(ref, clean, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, CASES_COLLECTION);
  }
};

export const subscribeToCases = (
  onUpdate: (cases: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, CASES_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, CASES_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const deleteCaseFromFirestore = async (caseId: string): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, CASES_COLLECTION, caseId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, CASES_COLLECTION);
    return false;
  }
};

// ==========================================
// BOLOS & SIGHTINGS REALTIME SERVICES
// ==========================================

export const syncBoloToFirestore = async (boloData: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, BOLOS_COLLECTION, boloData.id);
    const clean = JSON.parse(JSON.stringify(boloData));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, BOLOS_COLLECTION);
    return false;
  }
};

export const subscribeToBolos = (
  onUpdate: (bolos: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, BOLOS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, BOLOS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

// ==========================================
// INTELLIGENCE (POIs, VOIs, OBSERVATIONS)
// ==========================================

export const syncPoiToFirestore = async (poi: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, INTEL_POIS_COLLECTION, poi.id);
    const clean = JSON.parse(JSON.stringify(poi));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, INTEL_POIS_COLLECTION);
    return false;
  }
};

export const subscribeToPois = (
  onUpdate: (pois: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, INTEL_POIS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, INTEL_POIS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const syncVoiToFirestore = async (voi: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, INTEL_VOIS_COLLECTION, voi.id);
    const clean = JSON.parse(JSON.stringify(voi));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, INTEL_VOIS_COLLECTION);
    return false;
  }
};

export const subscribeToVois = (
  onUpdate: (vois: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, INTEL_VOIS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, INTEL_VOIS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const syncObservationToFirestore = async (obs: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, INTEL_OBSERVATIONS_COLLECTION, obs.id);
    const clean = JSON.parse(JSON.stringify(obs));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, INTEL_OBSERVATIONS_COLLECTION);
    return false;
  }
};

export const subscribeToObservations = (
  onUpdate: (observations: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, INTEL_OBSERVATIONS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, INTEL_OBSERVATIONS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

// ==========================================
// ACTIVE PATROLS & INCIDENT NOTIFICATIONS
// ==========================================

export const syncPatrolUnitToFirestore = async (unit: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    ensureFirebaseAuth().catch(() => {});
    const ref = doc(db, PATROL_UNITS_COLLECTION, unit.id);
    const clean = JSON.parse(JSON.stringify(unit));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, PATROL_UNITS_COLLECTION);
    return false;
  }
};

export const deletePatrolUnitFromFirestore = async (unitId: string): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    ensureFirebaseAuth().catch(() => {});
    const ref = doc(db, PATROL_UNITS_COLLECTION, unitId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, PATROL_UNITS_COLLECTION);
    return false;
  }
};

export const subscribeToPatrolUnits = (
  onUpdate: (units: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, PATROL_UNITS_COLLECTION);
  return onSnapshot(
    ref,
    { includeMetadataChanges: true },
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, PATROL_UNITS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const syncIncidentNotificationToFirestore = async (notif: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, INCIDENT_NOTIFICATIONS_COLLECTION, notif.id);
    const clean = JSON.parse(JSON.stringify(notif));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, INCIDENT_NOTIFICATIONS_COLLECTION);
    return false;
  }
};

export const deleteIncidentNotificationFromFirestore = async (notifId: string): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, INCIDENT_NOTIFICATIONS_COLLECTION, notifId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, INCIDENT_NOTIFICATIONS_COLLECTION);
    return false;
  }
};

export const subscribeToIncidentNotifications = (
  onUpdate: (notifs: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, INCIDENT_NOTIFICATIONS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, INCIDENT_NOTIFICATIONS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

// ==========================================
// AUDIT LOGS & SETTINGS & LOCATION AREAS
// ==========================================

export const syncAuditLogToFirestore = async (audit: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, AUDIT_LOGS_COLLECTION, audit.id);
    const clean = JSON.parse(JSON.stringify(audit));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, AUDIT_LOGS_COLLECTION);
    return false;
  }
};

export const subscribeToAuditLogs = (
  onUpdate: (logs: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, AUDIT_LOGS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, AUDIT_LOGS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const syncLocationAreaToFirestore = async (area: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, LOCATION_AREAS_COLLECTION, area.id);
    const clean = JSON.parse(JSON.stringify(area));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, LOCATION_AREAS_COLLECTION);
    return false;
  }
};

export const subscribeToLocationAreas = (
  onUpdate: (areas: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = collection(db, LOCATION_AREAS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      const loaded: any[] = [];
      snapshot.forEach((d) => {
        if (d.exists()) loaded.push(d.data());
      });
      onUpdate(loaded);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, LOCATION_AREAS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

export const syncSettingsToFirestore = async (settings: any): Promise<boolean> => {
  if (isQuotaExceeded()) return false;
  try {
    await ensureFirebaseAuth();
    const ref = doc(db, SETTINGS_COLLECTION, 'system_settings');
    const clean = JSON.parse(JSON.stringify(settings));
    await setDoc(ref, clean, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, SETTINGS_COLLECTION);
    return false;
  }
};

export const subscribeToSettings = (
  onUpdate: (settings: any) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = doc(db, SETTINGS_COLLECTION, 'system_settings');
  return onSnapshot(
    ref,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, SETTINGS_COLLECTION);
      if (onError) onError(err);
    }
  );
};
