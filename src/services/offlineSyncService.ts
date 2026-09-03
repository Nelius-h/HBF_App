/**
 * Hartbeesfontein Veiligheid - Offline Operation & Outbox Synchronization Service
 *
 * Ensures 100% operational readiness in deep rural farm areas with zero or intermittent cellular coverage.
 * - Caches and persists SOS alerts, GPS breadcrumbs, and reports locally in an Indexed Outbox.
 * - Continuously monitors connectivity status with active DNS/ping probes.
 * - Automatically drains and synchronizes queued data as soon as network coverage is restored.
 * - Generates zero-data SMS and direct cellular GSM fallbacks.
 */

import { cleanupLegacyStorage, safeGetJSON, safeSetJSON } from '../utils/safeStorage';

export type OfflineQueueActionType =
  | 'EMERGENCY_TRIGGER'
  | 'EMERGENCY_LOCATION'
  | 'EMERGENCY_INFO'
  | 'PATROL_BREADCRUMB'
  | 'SITREP_CREATE'
  | 'INCIDENT_REPORT';

export interface OfflineQueueItem {
  id: string;
  type: OfflineQueueActionType;
  timestamp: string;
  payload: any;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  error?: string;
}

export type NetworkStatusListener = (isOnline: boolean, pendingCount: number) => void;
export type SyncHandler = (item: OfflineQueueItem) => Promise<boolean>;

const QUEUE_STORAGE_KEY = 'hv_offline_outbox_queue_v1';
const LAST_SYNC_KEY = 'hv_last_sync_timestamp_v1';
const MAX_QUEUE_ITEMS = 30;

function sanitizePayloadForOfflineStorage(type: OfflineQueueActionType, rawPayload: any): any {
  if (!rawPayload || typeof rawPayload !== 'object') return rawPayload;
  try {
    if (type === 'EMERGENCY_TRIGGER') {
      const copy = { ...rawPayload };
      // Strip oversized location histories and raw audio streams from offline queue payload
      if (Array.isArray(copy.locationHistory) && copy.locationHistory.length > 5) {
        copy.locationHistory = copy.locationHistory.slice(-5);
      }
      if (Array.isArray(copy.timeline) && copy.timeline.length > 10) {
        copy.timeline = copy.timeline.slice(-10);
      }
      if (Array.isArray(copy.messages) && copy.messages.length > 10) {
        copy.messages = copy.messages.slice(-10);
      }
      if (copy.audioSession) {
        copy.audioSession = {
          id: copy.audioSession.id,
          emergencyId: copy.audioSession.emergencyId,
          status: copy.audioSession.status,
          connectionState: copy.audioSession.connectionState,
          channel: copy.audioSession.channel,
          createdAt: copy.audioSession.createdAt,
        };
      }
      return copy;
    }
    if (type === 'EMERGENCY_INFO') {
      const copy = { ...rawPayload };
      if (Array.isArray(copy.photos) && copy.photos.length > 2) {
        copy.photos = copy.photos.slice(0, 2);
      }
      return copy;
    }
  } catch {
    // Return original if clone fails
  }
  return rawPayload;
}

class OfflineSyncService {
  private isOnlineState: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private queue: OfflineQueueItem[] = [];
  private listeners: Set<NetworkStatusListener> = new Set();
  private syncHandlers: Map<OfflineQueueActionType, SyncHandler> = new Map();
  private isSyncing: boolean = false;
  private pingIntervalId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueue();
      this.isOnlineState = navigator.onLine;

      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Active health ping every 25 seconds to verify true internet reachability
      this.pingIntervalId = setInterval(() => {
        this.verifyRealConnectivity();
      }, 25000);

      // Trigger initial connectivity check
      this.verifyRealConnectivity();
    }
  }

  private loadQueue(): void {
    try {
      const stored = safeGetJSON<OfflineQueueItem[]>(QUEUE_STORAGE_KEY, []);
      if (Array.isArray(stored)) {
        // Drop any already SYNCED items on load and cap queue size
        this.queue = stored
          .filter((item) => item && item.status !== 'SYNCED')
          .slice(-MAX_QUEUE_ITEMS);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      // 1. Filter out synced items and keep only the latest MAX_QUEUE_ITEMS
      this.queue = this.queue.filter((i) => i.status !== 'SYNCED').slice(-MAX_QUEUE_ITEMS);

      // 2. Attempt safe save to localStorage with automatic quota recovery
      const success = safeSetJSON(QUEUE_STORAGE_KEY, this.queue);
      if (!success) {
        // Aggressively prune queue to most critical items
        const pruned = this.queue
          .filter((i) => i.type === 'EMERGENCY_TRIGGER' || i.type === 'SITREP_CREATE' || i.type === 'INCIDENT_REPORT')
          .slice(-5);
        this.queue = pruned.length > 0 ? pruned : this.queue.slice(-3);
        safeSetJSON(QUEUE_STORAGE_KEY, this.queue);
      }
    } catch {
      // Memory state is always maintained cleanly
    }
  }

  public registerSyncHandler(type: OfflineQueueActionType, handler: SyncHandler): void {
    this.syncHandlers.set(type, handler);
  }

  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnlineState, this.getPendingCount());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const pending = this.getPendingCount();
    this.listeners.forEach((listener) => {
      try {
        listener(this.isOnlineState, pending);
      } catch (err) {
        console.error('[OfflineSync] Listener notification error:', err);
      }
    });
  }

  private async verifyRealConnectivity(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.handleNetworkChange(false);
      return false;
    }

    try {
      // Lightweight cache-busted fetch to test real server reachability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('/manifest.webmanifest?_t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const reachable = res.ok || res.status === 304 || res.status === 200;
      this.handleNetworkChange(reachable);
      return reachable;
    } catch {
      // If fetch fails or aborts, consider offline or poor cellular connection
      this.handleNetworkChange(false);
      return false;
    }
  }

  private handleNetworkChange(isOnline: boolean): void {
    const previous = this.isOnlineState;
    this.isOnlineState = isOnline;
    this.notifyListeners();

    // If we just regained connectivity and have pending items, trigger auto-sync
    if (isOnline && !previous && this.getPendingCount() > 0) {
      console.log('[OfflineSync] Network connectivity restored! Auto-triggering outbox sync...');
      this.processQueue();
    }
  }

  /**
   * Enqueue an action when offline or uncertain
   */
  public enqueue(type: OfflineQueueActionType, payload: any): OfflineQueueItem {
    const sanitizedPayload = sanitizePayloadForOfflineStorage(type, payload);

    // If this is a location update, dedup by replacing any existing pending location fix for the same emergency
    if (type === 'EMERGENCY_LOCATION' && sanitizedPayload?.emergencyId) {
      const emgId = sanitizedPayload.emergencyId;
      this.queue = this.queue.filter(
        (item) => !(item.type === 'EMERGENCY_LOCATION' && item.payload?.emergencyId === emgId)
      );
    }

    // If this is a patrol breadcrumb update, dedup by replacing older pending breadcrumbs for the same unit
    if (type === 'PATROL_BREADCRUMB' && sanitizedPayload?.unitId) {
      const unitId = sanitizedPayload.unitId;
      this.queue = this.queue.filter(
        (item) => !(item.type === 'PATROL_BREADCRUMB' && item.payload?.unitId === unitId)
      );
    }

    const item: OfflineQueueItem = {
      id: `OUTBOX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      timestamp: new Date().toISOString(),
      payload: sanitizedPayload,
      retryCount: 0,
      status: 'PENDING',
    };

    this.queue.push(item);
    this.saveQueue();
    this.notifyListeners();

    console.log(`[OfflineSync] Enqueued offline action: ${type} (ID: ${item.id})`);

    // If we happen to be online, attempt immediate sync

    if (this.isOnlineState && !this.isSyncing) {
      this.processQueue();
    }

    return item;
  }

  /**
   * Process all pending items in the outbox queue
   */
  public async processQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (!this.isOnlineState) {
      console.log('[OfflineSync] Cannot sync while offline. Items remain safely stored locally.');
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    const pendingItems = this.queue.filter((i) => i.status === 'PENDING' || i.status === 'FAILED');

    for (const item of pendingItems) {
      item.status = 'SYNCING';
      this.saveQueue();
      this.notifyListeners();

      const handler = this.syncHandlers.get(item.type);
      if (!handler) {
        console.warn(`[OfflineSync] No handler registered for type ${item.type}, marking synced.`);
        item.status = 'SYNCED';
        syncedCount++;
        continue;
      }

      try {
        const success = await handler(item);
        if (success) {
          item.status = 'SYNCED';
          syncedCount++;
        } else {
          item.retryCount++;
          item.status = 'FAILED';
          item.error = 'Handler returned false';
          failedCount++;
        }
      } catch (err: any) {
        item.retryCount++;
        item.status = 'FAILED';
        item.error = err?.message || 'Sync error';
        failedCount++;
      }
    }

    // Retain only un-synced items in the active queue
    this.queue = this.queue.filter((i) => i.status !== 'SYNCED');
    this.saveQueue();

    try {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (e) {
      // ignore
    }

    this.isSyncing = false;
    this.notifyListeners();

    console.log(`[OfflineSync] Outbox sync complete: ${syncedCount} synced, ${failedCount} remaining.`);
    return { synced: syncedCount, failed: failedCount };
  }

  public getPendingCount(): number {
    return this.queue.filter((i) => i.status === 'PENDING' || i.status === 'FAILED' || i.status === 'SYNCING').length;
  }

  public getQueue(): OfflineQueueItem[] {
    return [...this.queue];
  }

  public isOnline(): boolean {
    return this.isOnlineState;
  }

  public getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_KEY);
    } catch (e) {
      return null;
    }
  }

  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Helper to format zero-data SMS Emergency Dispatch with precise GPS Coordinates
   * Compatible with all GSM cellphones and farm radios
   */
  public generateOfflineSosSmsUri(params: {
    clientName: string;
    farmName?: string;
    latitude: number;
    longitude: number;
    emergencyType: string;
    controlRoomPhone: string;
  }): string {
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    
    const latFormatted = params.latitude.toFixed(5);
    const lngFormatted = params.longitude.toFixed(5);
    const mapsLink = `https://maps.google.com/?q=${latFormatted},${lngFormatted}`;

    const bodyText = `⚠️ NOODSEIN (${params.emergencyType.toUpperCase()}):\nNaam: ${params.clientName}\nPlaas: ${params.farmName || 'Hartbeesfontein'}\nGPS: ${latFormatted}, ${lngFormatted}\nKaart: ${mapsLink}\n(Gestuur via HV Noodstelsel Vanlyn Modus)`;

    const cleanNumber = params.controlRoomPhone.replace(/\s+/g, '');
    return `sms:${cleanNumber}${separator}body=${encodeURIComponent(bodyText)}`;
  }
}

export const offlineSyncService = new OfflineSyncService();
