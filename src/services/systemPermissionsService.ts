/**
 * Tactical System Permissions Management Service
 * Ensures the app requests and verifies all required device permissions:
 * 1. GPS Geolocation (Panic Tracking, Perimeter Map, Responder Dispatch)
 * 2. Push Notifications (Emergency Siren Alerts, BOLO Broadcasts, Chat)
 * 3. Microphone (Live SOS Room Audio Stream, Two-Way Radio)
 * 4. Camera (Incident Photos, Farm Patrol Evidence)
 */

export type PermissionType = 'geolocation' | 'notifications' | 'microphone' | 'camera';

export type PermissionStateValue = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface SystemPermissionStatus {
  geolocation: PermissionStateValue;
  notifications: PermissionStateValue;
  microphone: PermissionStateValue;
  camera: PermissionStateValue;
  lastChecked: number;
}

export interface PermissionDetails {
  id: PermissionType;
  titleAf: string;
  titleEn: string;
  descAf: string;
  descEn: string;
  impactAf: string;
  impactEn: string;
  required: boolean;
  iconName: 'MapPin' | 'Bell' | 'Mic' | 'Camera';
}

export const PERMISSION_METADATA: Record<PermissionType, PermissionDetails> = {
  geolocation: {
    id: 'geolocation',
    titleAf: 'GPS-Ligging & Koördinate',
    titleEn: 'GPS Geolocation & Coordinates',
    descAf: 'Stuur u akkurate GPS-posisie tydens SOS-noodgevalle en bereken afstande na patrollies.',
    descEn: 'Broadcasts exact GPS position during SOS emergencies and calculates distances to responders.',
    impactAf: 'Kritiek vir kitsversending na u plaas of huis.',
    impactEn: 'Critical for instant dispatch to your farm or home.',
    required: true,
    iconName: 'MapPin',
  },
  notifications: {
    id: 'notifications',
    titleAf: 'Kritieke Noodwaarskuwings',
    titleEn: 'Critical Emergency Notifications',
    descAf: 'Ontvang onmiddellike sirene-alarms, BOLO-bulletins en beheerkamer-versendings.',
    descEn: 'Receive instant siren alerts, BOLO bulletins, and control room dispatch notices.',
    impactAf: 'Kritiek om waarskuwings te hoor selfs wanneer die skerm gesluit is.',
    impactEn: 'Critical to receive alerts even when screen is locked.',
    required: true,
    iconName: 'Bell',
  },
  microphone: {
    id: 'microphone',
    titleAf: 'Nood-Mikrofoon (Live Oudio)',
    titleEn: 'Emergency Microphone (Live Audio)',
    descAf: 'Aktiveer die lewendige omgewingsklank na die beheerkamer wanneer u die SOS-knoppie druk.',
    descEn: 'Enables live ambient room audio stream to the control room during active SOS emergencies.',
    impactAf: 'Laat operateurs toe om te hoor wat gebeur as u nie kan praat nie.',
    impactEn: 'Allows operators to hear what is happening if you cannot speak.',
    required: true,
    iconName: 'Mic',
  },
  camera: {
    id: 'camera',
    titleAf: 'Kamera & Bewysstukke',
    titleEn: 'Camera & Evidence Capture',
    descAf: 'Neem foto\'s van verdagte voertuie, spore, hekke en skade vir die Voorvalleboek.',
    descEn: 'Capture photos of suspicious vehicles, tracks, gates, and damage for the incident log.',
    impactAf: 'Noodsaaklik vir saakondersoeke en BOLO-plasings.',
    impactEn: 'Essential for case investigations and BOLO filings.',
    required: false,
    iconName: 'Camera',
  },
};

const STORAGE_KEY_PROMPTED = 'hv_permissions_prompted_v2';
const STORAGE_KEY_STATUS = 'hv_permissions_cache_v2';

type StatusChangeListener = (status: SystemPermissionStatus) => void;

class SystemPermissionsService {
  private currentStatus: SystemPermissionStatus = {
    geolocation: 'prompt',
    notifications: 'prompt',
    microphone: 'prompt',
    camera: 'prompt',
    lastChecked: 0,
  };

  private listeners: Set<StatusChangeListener> = new Set();

  constructor() {
    this.loadCache();
    if (typeof window !== 'undefined') {
      // Defer initial check
      setTimeout(() => {
        this.checkAllStatuses();
      }, 500);
    }
  }

  private loadCache() {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY_STATUS);
        if (cached) {
          this.currentStatus = { ...this.currentStatus, ...JSON.parse(cached) };
        }
      }
    } catch {
      // ignore
    }
  }

  private saveCache() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(this.currentStatus));
      }
    } catch {
      // ignore
    }
  }

  public subscribe(listener: StatusChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => {
      try {
        fn(status);
      } catch (e) {
        console.error('Error notifying permission listener:', e);
      }
    });
  }

  public getStatus(): SystemPermissionStatus {
    return { ...this.currentStatus };
  }

  public hasPromptedInitial(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(STORAGE_KEY_PROMPTED) === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  }

  public markPrompted(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PROMPTED, 'true');
      }
    } catch {
      // ignore
    }
  }

  public resetPrompted(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_PROMPTED);
      }
    } catch {
      // ignore
    }
  }

  public async checkAllStatuses(): Promise<SystemPermissionStatus> {
    if (typeof window === 'undefined') return this.currentStatus;

    // 1. Notifications
    if ('Notification' in window) {
      this.currentStatus.notifications = Notification.permission as PermissionStateValue;
    } else {
      this.currentStatus.notifications = 'unsupported';
    }

    // 2. Geolocation Query Check
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const geoPerm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        this.currentStatus.geolocation = geoPerm.state as PermissionStateValue;
        geoPerm.onchange = () => {
          this.currentStatus.geolocation = geoPerm.state as PermissionStateValue;
          this.saveCache();
          this.notify();
        };
      } catch {
        // Fallback: keep existing status
      }
    } else if (!('geolocation' in navigator)) {
      this.currentStatus.geolocation = 'unsupported';
    }

    // 3. Microphone Query Check
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        this.currentStatus.microphone = micPerm.state as PermissionStateValue;
        micPerm.onchange = () => {
          this.currentStatus.microphone = micPerm.state as PermissionStateValue;
          this.saveCache();
          this.notify();
        };
      } catch {
        // Media permissions query not supported on some browsers (Safari)
      }
    }

    // 4. Camera Query Check
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const camPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
        this.currentStatus.camera = camPerm.state as PermissionStateValue;
        camPerm.onchange = () => {
          this.currentStatus.camera = camPerm.state as PermissionStateValue;
          this.saveCache();
          this.notify();
        };
      } catch {
        // Media permissions query not supported
      }
    }

    this.currentStatus.lastChecked = Date.now();
    this.saveCache();
    this.notify();
    return this.getStatus();
  }

  /**
   * Request Geolocation Permission
   */
  public async requestGeolocation(): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      this.currentStatus.geolocation = 'unsupported';
      this.notify();
      return { success: false, error: 'GPS Geolocation is not supported by your device.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentStatus.geolocation = 'granted';
          this.saveCache();
          this.notify();
          resolve({ success: true });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            this.currentStatus.geolocation = 'denied';
          }
          this.saveCache();
          this.notify();
          resolve({ success: false, error: err.message || 'GPS permission was denied.' });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /**
   * Request Push Notifications Permission
   */
  public async requestNotifications(): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.currentStatus.notifications = 'unsupported';
      this.notify();
      return { success: false, error: 'Push notifications are not supported in this browser.' };
    }

    try {
      const permission = await Notification.requestPermission();
      this.currentStatus.notifications = permission as PermissionStateValue;
      this.saveCache();
      this.notify();
      return { success: permission === 'granted' };
    } catch (e: any) {
      this.currentStatus.notifications = 'denied';
      this.saveCache();
      this.notify();
      return { success: false, error: e?.message || 'Notification permission request failed.' };
    }
  }

  /**
   * Request Microphone Permission
   */
  public async requestMicrophone(): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.currentStatus.microphone = 'unsupported';
      this.notify();
      return { success: false, error: 'Microphone is not supported in this browser.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop media tracks immediately after granting
      stream.getTracks().forEach((track) => track.stop());
      this.currentStatus.microphone = 'granted';
      this.saveCache();
      this.notify();
      return { success: true };
    } catch (err: any) {
      this.currentStatus.microphone = 'denied';
      this.saveCache();
      this.notify();
      return { success: false, error: err?.message || 'Microphone access denied.' };
    }
  }

  /**
   * Request Camera Permission
   */
  public async requestCamera(): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.currentStatus.camera = 'unsupported';
      this.notify();
      return { success: false, error: 'Camera is not supported in this browser.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      this.currentStatus.camera = 'granted';
      this.saveCache();
      this.notify();
      return { success: true };
    } catch (err: any) {
      this.currentStatus.camera = 'denied';
      this.saveCache();
      this.notify();
      return { success: false, error: err?.message || 'Camera access denied.' };
    }
  }

  /**
   * Request a specific permission by ID
   */
  public async requestPermission(type: PermissionType): Promise<{ success: boolean; error?: string }> {
    switch (type) {
      case 'geolocation':
        return this.requestGeolocation();
      case 'notifications':
        return this.requestNotifications();
      case 'microphone':
        return this.requestMicrophone();
      case 'camera':
        return this.requestCamera();
      default:
        return { success: false, error: 'Unknown permission type' };
    }
  }

  /**
   * Sequentially request ALL critical permissions in order:
   * 1. Geolocation -> 2. Notifications -> 3. Microphone -> 4. Camera
   */
  public async requestAllPermissionsSequentially(
    onProgress?: (current: PermissionType, index: number, total: number) => void
  ): Promise<SystemPermissionStatus> {
    const list: PermissionType[] = ['geolocation', 'notifications', 'microphone', 'camera'];

    for (let i = 0; i < list.length; i++) {
      const perm = list[i];
      if (onProgress) {
        onProgress(perm, i + 1, list.length);
      }
      try {
        await this.requestPermission(perm);
      } catch (err) {
        console.warn(`Error requesting ${perm} permission:`, err);
      }
    }

    this.markPrompted();
    return this.checkAllStatuses();
  }

  /**
   * Check if any critical permission is not granted yet
   */
  public hasMissingCriticalPermissions(): boolean {
    return (
      this.currentStatus.geolocation !== 'granted' ||
      this.currentStatus.notifications !== 'granted' ||
      this.currentStatus.microphone !== 'granted'
    );
  }

  /**
   * Total granted count
   */
  public getGrantedCount(): number {
    let count = 0;
    if (this.currentStatus.geolocation === 'granted') count++;
    if (this.currentStatus.notifications === 'granted') count++;
    if (this.currentStatus.microphone === 'granted') count++;
    if (this.currentStatus.camera === 'granted') count++;
    return count;
  }
}

export const systemPermissionsService = new SystemPermissionsService();
