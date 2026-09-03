// Hartbeesfontein Veiligheid - Push & In-App Notification Engine
import {
  AppNotificationPreferences,
  NotificationSoundTone,
  AlertNotification,
  SituationReport,
  EmergencyEvent,
} from '../types';
import {
  playTone,
  playSosAlarmPulse,
  playTrafficAlertSound,
  playFireAlertSound,
  playSecurityAlertSound,
  playBoloAlertSound,
  playGentleChime,
  playTacticalDoubleBeep,
} from './soundEffects';

const STORAGE_KEY_PREFIX = 'hv_notification_prefs_';

export const DEFAULT_NOTIFICATION_PREFERENCES: AppNotificationPreferences = {
  masterPushEnabled: true,
  masterSoundEnabled: true,
  masterVibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '05:00',
  overrideQuietHoursForSos: true,
  sosPanic: {
    enabled: true,
    soundEnabled: true,
    soundTone: 'SOS_SIREN',
    volume: 0.9,
    pushBannerEnabled: true,
    vibrationEnabled: true,
  },
  trafficAlerts: {
    enabled: true,
    soundEnabled: true,
    soundTone: 'TRAFFIC_HORN',
    volume: 0.7,
    pushBannerEnabled: true,
    vibrationEnabled: true,
  },
  fireAlerts: {
    enabled: true,
    soundEnabled: true,
    soundTone: 'FIRE_WARBLE',
    volume: 0.8,
    pushBannerEnabled: true,
    vibrationEnabled: true,
  },
  securityAlerts: {
    enabled: true,
    soundEnabled: true,
    soundTone: 'SECURITY_BEEP',
    volume: 0.7,
    pushBannerEnabled: true,
    vibrationEnabled: true,
  },
  boloAlerts: {
    enabled: true,
    soundEnabled: true,
    soundTone: 'BOLO_RADAR',
    volume: 0.7,
    pushBannerEnabled: true,
    vibrationEnabled: true,
  },
  sitrepUpdates: {
    enabled: true,
    soundEnabled: true,
    soundTone: 'CHIME_GENTLE',
    volume: 0.5,
    pushBannerEnabled: true,
    vibrationEnabled: false,
  },
  reactionForceDispatchSound: true,
  reactionForceDispatchTone: 'TACTICAL_DOUBLE_BEEP',
};

class NotificationService {
  private lastNotifiedIds = new Set<string>();

  public getPreferences(userUid?: string): AppNotificationPreferences {
    try {
      const key = userUid ? `${STORAGE_KEY_PREFIX}${userUid}` : `${STORAGE_KEY_PREFIX}default`;
      const raw = localStorage.getItem(key) || localStorage.getItem(`${STORAGE_KEY_PREFIX}default`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...parsed,
          sosPanic: { ...DEFAULT_NOTIFICATION_PREFERENCES.sosPanic, ...(parsed.sosPanic || {}) },
          trafficAlerts: { ...DEFAULT_NOTIFICATION_PREFERENCES.trafficAlerts, ...(parsed.trafficAlerts || {}) },
          fireAlerts: { ...DEFAULT_NOTIFICATION_PREFERENCES.fireAlerts, ...(parsed.fireAlerts || {}) },
          securityAlerts: { ...DEFAULT_NOTIFICATION_PREFERENCES.securityAlerts, ...(parsed.securityAlerts || {}) },
          boloAlerts: { ...DEFAULT_NOTIFICATION_PREFERENCES.boloAlerts, ...(parsed.boloAlerts || {}) },
          sitrepUpdates: { ...DEFAULT_NOTIFICATION_PREFERENCES.sitrepUpdates, ...(parsed.sitrepUpdates || {}) },
        };
      }
    } catch (e) {
      console.warn('Error loading notification preferences:', e);
    }
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  public savePreferences(prefs: AppNotificationPreferences, userUid?: string): void {
    try {
      const key = userUid ? `${STORAGE_KEY_PREFIX}${userUid}` : `${STORAGE_KEY_PREFIX}default`;
      localStorage.setItem(key, JSON.stringify(prefs));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}default`, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Error saving notification preferences:', e);
    }
  }

  public getPushPermissionStatus(): 'default' | 'granted' | 'denied' | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Error requesting push permission:', e);
      return false;
    }
  }

  public isInQuietHours(prefs: AppNotificationPreferences): boolean {
    if (!prefs.quietHoursEnabled) return false;
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [sH, sM] = prefs.quietHoursStart.split(':').map(Number);
      const [eH, eM] = prefs.quietHoursEnd.split(':').map(Number);

      const startMinutes不易 = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;

      if (startMinutes不易 <= endMinutes) {
        return currentMinutes >= startMinutes不易 && currentMinutes <= endMinutes;
      } else {
        // Crosses midnight (e.g. 22:00 to 05:00)
        return currentMinutes >= startMinutes不易 || currentMinutes <= endMinutes;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * Play preview audio of any tone
   */
  public testTone(tone: NotificationSoundTone, volume = 0.7): void {
    playTone(tone, volume);
    if ('vibrate' in navigator) {
      navigator.vibrate([150, 80, 150]);
    }
  }

  /**
   * Dispatch a notification for an SOS Emergency
   */
  public notifySosEmergency(
    emergency: EmergencyEvent,
    userUid?: string,
    isReactionForce = false
  ): void {
    if (this.lastNotifiedIds.has(`sos_${emergency.id}`)) return;
    this.lastNotifiedIds.add(`sos_${emergency.id}`);

    const prefs進 = this.getPreferences(userUid);
    const category = prefs進.sosPanic;

    if (!category.enabled) return;

    const inQuietHours = this.isInQuietHours(prefs進);
    const allowSound = (!inQuietHours || prefs進.overrideQuietHoursForSos) && prefs進.masterSoundEnabled && category.soundEnabled;

    if (allowSound) {
      playTone(category.soundTone, category.volume);
    }

    if (prefs進.masterVibrationEnabled && category.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([400, 150, 400, 150, 600]);
    }

    if (prefs進.masterPushEnabled && category.pushBannerEnabled) {
      const title = `🚨 NOODSEIN (SOS) — ${emergency.clientName}`;
      const body = `Plaas/Area: ${emergency.farmName || 'Hartbeesfontein'}\nTipe: ${emergency.emergencyType}\n${isReactionForce ? 'Tik om lewendige GPS en roete te sien' : 'Bly waaksaam en gereed'}`;
      this.sendBrowserNotification(title, body, 'sos-alert', emergency.id);
    }
  }

  /**
   * Dispatch notification for Traffic Alert
   */
  public notifyTrafficAlert(
    title: string,
    message: string,
    alertId: string,
    userUid?: string
  ): void {
    if (this.lastNotifiedIds.has(`traffic_${alertId}`)) return;
    this.lastNotifiedIds.add(`traffic_${alertId}`);

    const prefs = this.getPreferences(userUid);
    const category一眼 = prefs.trafficAlerts;

    if (!category一眼.enabled) return;

    const inQuietHours = this.isInQuietHours(prefs);
    if (!inQuietHours && prefs.masterSoundEnabled && category一眼.soundEnabled) {
      playTone(category一眼.soundTone, category一眼.volume);
    }

    if (!inQuietHours && prefs.masterVibrationEnabled && category一眼.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    if (prefs.masterPushEnabled && category一眼.pushBannerEnabled) {
      this.sendBrowserNotification(`🚗 Verkeerswaarskuwing: ${title}`, message, 'traffic-alert', alertId);
    }
  }

  /**
   * Dispatch notification for Fire Alert
   */
  public notifyFireAlert(
    title: string,
    message: string,
    alertId: string,
    userUid?: string
  ): void {
    if (this.lastNotifiedIds.has(`fire_${alertId}`)) return;
    this.lastNotifiedIds.add(`fire_${alertId}`);

    const prefs = this.getPreferences(userUid);
    const category = prefs.fireAlerts;

    if (!category.enabled) return;

    const inQuietHours = this.isInQuietHours(prefs);
    if (!inQuietHours && prefs.masterSoundEnabled && category.soundEnabled) {
      playTone(category.soundTone, category.volume);
    }

    if (!inQuietHours && prefs.masterVibrationEnabled && category.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([300, 100, 300]);
    }

    if (prefs.masterPushEnabled && category.pushBannerEnabled) {
      this.sendBrowserNotification(`🔥 Brandwaarskuwing: ${title}`, message, 'fire-alert', alertId);
    }
  }

  /**
   * Dispatch notification for Crime / Security Alert
   */
  public notifySecurityAlert(
    title: string,
    message: string,
    alertId: string,
    userUid?: string
  ): void {
    if (this.lastNotifiedIds.has(`sec_${alertId}`)) return;
    this.lastNotifiedIds.add(`sec_${alertId}`);

    const prefs = this.getPreferences(userUid);
    const category = prefs.securityAlerts;

    if (!category.enabled) return;

    const inQuietHours胶 = this.isInQuietHours(prefs);
    if (!inQuietHours胶 && prefs.masterSoundEnabled && category.soundEnabled) {
      playTone(category.soundTone, category.volume);
    }

    if (!inQuietHours胶 && prefs.masterVibrationEnabled && category.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    if (prefs.masterPushEnabled && category.pushBannerEnabled) {
      this.sendBrowserNotification(`🛡️ Sekuriteitswaarskuwing: ${title}`, message, 'security-alert', alertId);
    }
  }

  /**
   * Dispatch notification for BOLO Alert
   */
  public notifyBoloAlert(
    boloNumber: string,
    title: string,
    message: string,
    boloId: string,
    userUid?: string
  ): void {
    if (this.lastNotifiedIds.has(`bolo_${boloId}`)) return;
    this.lastNotifiedIds.add(`bolo_${boloId}`);

    const prefs = this.getPreferences(userUid);
    const category = prefs.boloAlerts;

    if (!category.enabled) return;

    const inQuietHours = this.isInQuietHours(prefs);
    if (!inQuietHours && prefs.masterSoundEnabled && category.soundEnabled) {
      playTone(category.soundTone, category.volume);
    }

    if (!inQuietHours && prefs.masterVibrationEnabled && category.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([250, 100, 250]);
    }

    if (prefs.masterPushEnabled && category.pushBannerEnabled) {
      this.sendBrowserNotification(`📻 BOLO ${boloNumber}: ${title}`, message, 'bolo-alert', boloId);
    }
  }

  /**
   * Dispatch for Reaction Force unit assignment
   */
  public notifyReactionForceDispatch(
    title: string,
    message: string,
    dispatchId: string,
    userUid?: string
  ): void {
    const prefs = this.getPreferences(userUid);
    if (prefs.reactionForceDispatchSound && prefs.masterSoundEnabled) {
      playTone(prefs.reactionForceDispatchTone, 0.8);
    }
    if (prefs.masterVibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([300, 150, 300, 150, 300]);
    }
    this.sendBrowserNotification(`⚡ REAKSIE-EENHEID UITSTUUR: ${title}`, message, 'rf-dispatch', dispatchId);
  }

  private sendBrowserNotification(
    title: string,
    body: string,
    tag: string,
    id: string
  ): void {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body,
          tag,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: tag === 'sos-alert' || tag === 'rf-dispatch',
          silent: true, // We already manage sound with Web Audio for high-fidelity control
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
    } catch (e) {
      console.debug('Browser notification popup skipped:', e);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
