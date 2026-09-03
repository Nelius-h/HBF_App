/**
 * Hartbeesfontein Veiligheid - PWA Service & Phone Installation Helper
 *
 * Manages service worker lifecycle, PWA install prompt triggers,
 * platform detection (iOS Safari vs Android Chrome/Samsung), and standalone display state.
 */

export interface PwaInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMac: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isIframe: boolean;
  isStandalone: boolean;
}

type PwaStateListener = (state: PwaInstallState) => void;

class PwaService {
  private deferredPrompt: any = null;
  private listeners: Set<PwaStateListener> = new Set();
  private state: PwaInstallState = {
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isWindows: false,
    isMac: false,
    isSafari: false,
    isChrome: false,
    isEdge: false,
    isIframe: false,
    isStandalone: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectPlatform();
      this.registerServiceWorker();

      // Catch beforeinstallprompt (Android / Chrome / Edge / Windows)
      window.addEventListener('beforeinstallprompt', (e: any) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.state.isInstallable = true;
        this.notifyListeners();
        console.log('[PWA] beforeinstallprompt event captured.');
      });

      // Catch appinstalled
      window.addEventListener('appinstalled', () => {
        console.log('[PWA] Application successfully installed to home screen or desktop.');
        this.deferredPrompt = null;
        this.state.isInstalled = true;
        this.state.isInstallable = false;
        this.notifyListeners();
      });

      // Detect display-mode standalone changes
      if (window.matchMedia) {
        try {
          window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            this.state.isStandalone = e.matches;
            this.state.isInstalled = e.matches;
            this.notifyListeners();
          });
        } catch {
          // older browsers fallback
        }
      }
    }
  }

  private detectPlatform(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/.test(ua);
    const isWindows = /Windows|Win32|Win64|WOW64/i.test(ua);
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua) && !isIOS;
    const isEdge = /Edg\//i.test(ua);
    const isChrome = /Chrome\//i.test(ua) && !isEdge;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    
    let isIframe = false;
    try {
      isIframe = window.self !== window.top;
    } catch {
      isIframe = true;
    }

    const isStandalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    this.state = {
      isInstallable: !!this.deferredPrompt,
      isInstalled: isStandalone,
      isIOS,
      isAndroid,
      isWindows,
      isMac,
      isSafari,
      isChrome,
      isEdge,
      isIframe,
      isStandalone,
    };
  }

  public registerServiceWorker(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }
  }

  public subscribe(listener: PwaStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[PWA] Listener notify error:', err);
      }
    });
  }

  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'manual_ios' | 'manual_windows' | 'manual_android' | 'unsupported'> {
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const choiceResult = await this.deferredPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt.');
          this.state.isInstalled = true;
          this.state.isInstallable = false;
          this.deferredPrompt = null;
          this.notifyListeners();
          return 'accepted';
        } else {
          console.log('[PWA] User dismissed the install prompt.');
          this.deferredPrompt = null;
          this.notifyListeners();
          return 'dismissed';
        }
      } catch (e) {
        console.warn('[PWA] Prompt install error:', e);
      }
    }

    if (this.state.isIOS) {
      return 'manual_ios';
    }
    if (this.state.isWindows) {
      return 'manual_windows';
    }
    if (this.state.isAndroid) {
      return 'manual_android';
    }

    return 'unsupported';
  }

  public getState(): PwaInstallState {
    return { ...this.state };
  }

  public isPromptAvailable(): boolean {
    return !!this.deferredPrompt;
  }

  public getDirectAppUrl(): string {
    if (typeof window === 'undefined') return '';
    return window.location.origin || window.location.href;
  }
}

export const pwaService = new PwaService();
