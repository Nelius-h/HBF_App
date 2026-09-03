/**
 * Safe LocalStorage and JSON parsing utilities with fallback guarantees
 * Prevents uncaught syntax errors or QuotaExceededError from crashing the application.
 */

// Known legacy or redundant keys that can be safely evicted if storage is full
const LEGACY_STORAGE_KEYS = [
  'hv_cases',
  'hv_cases_actual_v1',
  'hv_cases_v3',
  'hv_situation_reports',
  'hv_camera_devices_v1',
  'hv_vois',
  'hv_vois_v3',
  'hv_users',
  'hv_emergencies',
  'hv_emergencies_v1',
  'hv_intel_observations_v1',
  'hv_intel_observations_v2',
  'hv_camera_maintenance_tickets_v1',
  'hv_system_error_logs',
  'hv_privacy_access_logs',
  'hv_camera_feed_snapshots',
  'hv_audio_recordings_cache',
  'hv_cached_audio_chunks',
  'hv_legacy_audio_blobs',
];

// Low priority keys that can be pruned if storage quota is constrained
const PRUNABLE_LOG_KEYS = [
  'hv_system_error_logs',
  'hv_privacy_access_logs',
  'hv_audit_logs',
  'hv_intel_audit_logs_v3',
  'hv_backup_records',
  'hv_generated_reports',
];

export function cleanupLegacyStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    for (const key of LEGACY_STORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  } catch {}
}

export function trimStorageQuota(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    cleanupLegacyStorage();
    for (const key of PRUNABLE_LOG_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 20) {
            localStorage.setItem(key, JSON.stringify(parsed.slice(-20)));
          }
        }
      } catch {}
    }
  } catch {}
}

export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null' || raw === '[object Object]') {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[SafeStorage] Error reading or parsing key "${key}", reverting to default:`, err);
    return fallback;
  }
}

export function safeSetJSON(key: string, value: any): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    // Attempt emergency purge of legacy keys and prune low-priority logs, then retry once
    try {
      trimStorageQuota();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch {
      // If still exceeding quota, gracefully return false and maintain in-memory without throwing
    }
    return false;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    try {
      trimStorageQuota();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch {}
    return false;
  }
}

export function safeGetItem(key: string, fallback: string | null = null): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage clear errors
  }
}


