/**
 * Hartbeesfontein Veiligheid - Background Operations & Screen-Locked SOS Keep-Alive Service
 *
 * Implements resilient multi-layer background execution on iOS Safari & Android Chrome:
 * 1. Screen WakeLock API: Prevents device display from sleeping during critical active SOS/Patrol.
 * 2. Silent Audio Keep-Alive Anchor: Keeps browser process active when device is locked or minimized.
 * 3. Web Worker Pulse: Prevents timer throttling in background tabs.
 * 4. High-Accuracy Geolocation Watcher: Streams live GPS breadcrumbs even when screen is turned off.
 * 5. Native Push/Local Notifications & Haptic Feedback.
 */

class BackgroundSosService {
  private wakeLockSentinel: any = null;
  private audioContext: AudioContext | null = null;
  private silentOscillator: OscillatorNode | null = null;
  private silentGainNode: GainNode | null = null;
  private watchPositionId: number | null = null;
  private webWorker: Worker | null = null;
  private isTrackingActive: boolean = false;
  private activeEmergencyId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for visibility changes to re-acquire wake lock if user re-opens phone
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isTrackingActive) {
          this.requestWakeLock();
        }
      });
    }
  }

  /**
   * Request Screen WakeLock (Android / Desktop Chrome / Modern Safari)
   */
  public async requestWakeLock(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        const nav = navigator as any;
        this.wakeLockSentinel = await nav.wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          console.log('[BackgroundSOS] WakeLock was released.');
        });
        console.log('[BackgroundSOS] Screen WakeLock successfully acquired.');
        return true;
      } catch (err) {
        console.warn('[BackgroundSOS] WakeLock request failed (expected on some devices):', err);
        return false;
      }
    }
    return false;
  }

  /**
   * Release Screen WakeLock
   */
  public releaseWakeLock(): void {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch (e) {
        // ignore
      }
      this.wakeLockSentinel = null;
      console.log('[BackgroundSOS] Screen WakeLock released.');
    }
  }

  /**
   * Start Silent Audio Keep-Alive Loop
   * Keeps browser thread and JS timers active on iOS and Android even when locked.
   */
  public startAudioKeepAlive(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create an inaudible tone (frequency 20Hz, gain 0.0001)
      this.silentOscillator = this.audioContext.createOscillator();
      this.silentGainNode = this.audioContext.createGain();

      this.silentOscillator.type = 'sine';
      this.silentOscillator.frequency.setValueAtTime(20, this.audioContext.currentTime);
      this.silentGainNode.gain.setValueAtTime(0.0001, this.audioContext.currentTime);

      this.silentOscillator.connect(this.silentGainNode);
      this.silentGainNode.connect(this.audioContext.destination);
      this.silentOscillator.start();

      console.log('[BackgroundSOS] Silent audio keep-alive active.');
    } catch (err) {
      console.warn('[BackgroundSOS] Silent audio keep-alive failed:', err);
    }
  }

  /**
   * Stop Silent Audio Keep-Alive Loop
   */
  public stopAudioKeepAlive(): void {
    try {
      if (this.silentOscillator) {
        this.silentOscillator.stop();
        this.silentOscillator.disconnect();
        this.silentOscillator = null;
      }
      if (this.silentGainNode) {
        this.silentGainNode.disconnect();
        this.silentGainNode = null;
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
        this.audioContext = null;
      }
      console.log('[BackgroundSOS] Silent audio keep-alive stopped.');
    } catch (err) {
      console.warn('[BackgroundSOS] Error stopping audio keep-alive:', err);
    }
  }

  /**
   * Initialize Web Worker for unthrottled background heartbeat pulse
   */
  private initWorkerPulse(onPulse: () => void): void {
    if (typeof window === 'undefined' || !window.Worker) return;

    try {
      // Inlined worker code via Blob to avoid external file loading hurdles
      const workerCode = `
        let intervalId = null;
        self.onmessage = function(e) {
          if (e.data === 'START') {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(function() {
              self.postMessage('TICK');
            }, 15000); // 15s pulse
          } else if (e.data === 'STOP') {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.webWorker = new Worker(workerUrl);

      this.webWorker.onmessage = (event) => {
        if (event.data === 'TICK' && this.isTrackingActive) {
          onPulse();
        }
      };

      this.webWorker.postMessage('START');
    } catch (err) {
      console.warn('[BackgroundSOS] Worker initialization fallback:', err);
    }
  }

  private stopWorkerPulse(): void {
    if (this.webWorker) {
      this.webWorker.postMessage('STOP');
      this.webWorker.terminate();
      this.webWorker = null;
    }
  }

  /**
   * Trigger Haptic Feedback (SOS Pattern)
   */
  public triggerSosHaptic(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        // SOS in Morse code: ... --- ... (3 short, 3 long, 3 short)
        navigator.vibrate([150, 80, 150, 80, 150, 200, 350, 100, 350, 100, 350, 200, 150, 80, 150, 80, 150]);
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Show Native System Notification
   */
  public async showSosNotification(title: string, body: string): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icons/icon.svg',
          tag: 'hv-sos-active',
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/icons/icon.svg',
            tag: 'hv-sos-active',
          });
        }
      }
    } catch (e) {
      console.warn('[BackgroundSOS] Notification display skipped:', e);
    }
  }

  /**
   * Start comprehensive background emergency tracking & keep-alive
   */
  public startBackgroundSos(
    emergencyId: string,
    onLocationUpdate: (pos: GeolocationPosition) => void
  ): void {
    if (this.isTrackingActive) return;

    this.isTrackingActive = true;
    this.activeEmergencyId = emergencyId;

    console.log(`[BackgroundSOS] Starting background SOS beacon for emergency ${emergencyId}`);

    // 1. Request WakeLock
    this.requestWakeLock();

    // 2. Start Silent Audio keep-alive
    this.startAudioKeepAlive();

    // 3. Trigger haptic vibration
    this.triggerSosHaptic();

    // 4. Show persistent system notification
    this.showSosNotification(
      '⚠️ NOODSEIN AKTIEF - Hartbeesfontein Beheerkamer',
      'U noodsein is geaktiveer. Intydse GPS-koördinate word deurlopend uitgesaai.'
    );

    // 5. Setup Geolocation Watcher with Maximum GPS Accuracy
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      this.watchPositionId = navigator.geolocation.watchPosition(
        (position) => {
          if (this.isTrackingActive) {
            onLocationUpdate(position);
          }
        },
        (error) => {
          console.warn('[BackgroundSOS] Geolocation watch error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );
    }

    // 6. Setup unthrottled Web Worker pulse to guarantee updates if phone screen locks
    this.initWorkerPulse(() => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (this.isTrackingActive) {
              onLocationUpdate(pos);
            }
          },
          (err) => console.warn('[BackgroundSOS] Pulse position error:', err),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
        );
      }
    });
  }

  /**
   * Stop background tracking and release all locks & audio contexts
   */
  public stopBackgroundSos(): void {
    this.isTrackingActive = false;
    this.activeEmergencyId = null;

    if (this.watchPositionId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchPositionId);
      this.watchPositionId = null;
    }

    this.stopWorkerPulse();
    this.stopAudioKeepAlive();
    this.releaseWakeLock();

    console.log('[BackgroundSOS] Background SOS beacon stopped and resources freed.');
  }

  public getIsActive(): boolean {
    return this.isTrackingActive;
  }

  public getActiveEmergencyId(): string | null {
    return this.activeEmergencyId;
  }
}

export const backgroundSosService = new BackgroundSosService();
