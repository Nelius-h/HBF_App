// Hartbeesfontein Veiligheid - Emergency Live Location Service
// Battery-conscious, temporary GPS streaming for active emergencies (1-minute intervals).
// Terminated automatically on emergency resolution or cancellation.

import { EmergencyLocationPoint, LocationMode } from '../types';

export interface LocationUpdateCallback {
  (point: EmergencyLocationPoint): void;
}

class EmergencyLocationService {
  private watchId: number | null = null;
  private intervalTimer: NodeJS.Timeout | null = null;
  private currentMode: LocationMode = 'HIGH_PRIORITY';
  private sequenceNumber: number = 0;
  private isActive: boolean = false;
  private lastKnownPoint: EmergencyLocationPoint | null = null;
  private updateIntervalMs: number = 60000; // 1 minute interval (60 seconds)
  private updateCallback: LocationUpdateCallback | null = null;

  startLiveSharing(
    initialCoords: { latitude: number; longitude: number },
    mode: LocationMode = 'HIGH_PRIORITY',
    onPointUpdate: LocationUpdateCallback,
    onError?: (err: string) => void
  ): boolean {
    this.stopLiveSharing();
    this.currentMode = mode;
    this.isActive = true;
    this.sequenceNumber = 1;
    this.updateCallback = onPointUpdate;
    this.updateIntervalMs = 60000; // 1 minute updates as required

    // Send initial point immediately
    const initialPoint: EmergencyLocationPoint = {
      id: `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${this.sequenceNumber}`,
      latitude: initialCoords.latitude,
      longitude: initialCoords.longitude,
      accuracy: 10,
      timestamp: new Date().toISOString(),
      source: 'LIVE_STREAM',
      sequenceNumber: this.sequenceNumber,
    };
    this.lastKnownPoint = initialPoint;
    onPointUpdate(initialPoint);

    // Watch position if supported by browser/device
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (!this.isActive) return;
            this.sequenceNumber += 1;
            const pt: EmergencyLocationPoint = {
              id: `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${this.sequenceNumber}`,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy || 10),
              speed: pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : undefined, // km/h
              heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : undefined,
              timestamp: new Date().toISOString(),
              source: 'HIGH_PRIORITY_GPS',
              sequenceNumber: this.sequenceNumber,
            };
            this.lastKnownPoint = pt;
            onPointUpdate(pt);
          },
          (err) => {
            if (onError) {
              onError(err.message);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      } catch (err: unknown) {
        if (onError) {
          onError(err instanceof Error ? err.message : 'Geolocation watch error');
        }
      }
    }

    // Set 1-minute (60,000ms) interval timer to send continuous location updates
    // until SOS is resolved or canceled
    this.intervalTimer = setInterval(() => {
      if (!this.isActive || !this.updateCallback) return;

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!this.isActive || !this.updateCallback) return;
            this.sequenceNumber += 1;
            const updatedPt: EmergencyLocationPoint = {
              id: `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${this.sequenceNumber}`,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy || 10),
              speed: pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : undefined,
              heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : undefined,
              timestamp: new Date().toISOString(),
              source: 'HIGH_PRIORITY_GPS',
              sequenceNumber: this.sequenceNumber,
            };
            this.lastKnownPoint = updatedPt;
            this.updateCallback(updatedPt);
          },
          () => {
            // If GPS poll times out or is stationary, send periodic 1-min heartbeat with last known fix
            if (!this.isActive || !this.updateCallback || !this.lastKnownPoint) return;
            this.sequenceNumber += 1;
            const updatedPt: EmergencyLocationPoint = {
              ...this.lastKnownPoint,
              id: `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${this.sequenceNumber}`,
              timestamp: new Date().toISOString(),
              sequenceNumber: this.sequenceNumber,
            };
            this.lastKnownPoint = updatedPt;
            this.updateCallback(updatedPt);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
      } else if (this.lastKnownPoint) {
        this.sequenceNumber += 1;
        const updatedPt: EmergencyLocationPoint = {
          ...this.lastKnownPoint,
          id: `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${this.sequenceNumber}`,
          timestamp: new Date().toISOString(),
          sequenceNumber: this.sequenceNumber,
        };
        this.lastKnownPoint = updatedPt;
        this.updateCallback(updatedPt);
      }
    }, this.updateIntervalMs);

    return true;
  }

  setMode(mode: LocationMode, onPointUpdate?: LocationUpdateCallback) {
    this.currentMode = mode;
    if (this.isActive && this.lastKnownPoint && onPointUpdate) {
      this.startLiveSharing(
        { latitude: this.lastKnownPoint.latitude, longitude: this.lastKnownPoint.longitude },
        mode,
        onPointUpdate
      );
    }
  }

  stopLiveSharing() {
    this.isActive = false;
    this.updateCallback = null;
    if (this.watchId !== null) {
      try {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.clearWatch(this.watchId);
        }
      } catch {
        // Ignored
      }
      this.watchId = null;
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCurrentMode(): LocationMode {
    return this.currentMode;
  }

  isPointStale(point: EmergencyLocationPoint, thresholdSeconds: number = 75): boolean {
    const ageSeconds = (Date.now() - new Date(point.timestamp).getTime()) / 1000;
    return ageSeconds > thresholdSeconds;
  }
}

export const emergencyLocationService = new EmergencyLocationService();

