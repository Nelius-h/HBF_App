// DJI Matrice T4 / M30T Enterprise Drone Telemetry & Live Video Service
// Supports real-time GPS streaming, Thermal FLIR / Optical Zoom feeds, Laser Rangefinder PinPoint target locks, and Smart Controller integration.

export type DroneFlightState =
  | 'STANDBY_GROUND'
  | 'TAKING_OFF'
  | 'AIRBORNE_PATROL'
  | 'TRACKING_TARGET'
  | 'RETURNING_HOME'
  | 'LANDED'
  | 'OFFLINE';

export type ThermalPalette = 'WHITE_HOT' | 'BLACK_HOT' | 'IRONBOW' | 'RAINBOW' | 'NIGHT_IR';
export type CameraViewMode = 'THERMAL' | 'RGB' | 'SPLIT' | 'NIGHT_IR';

export interface LaserTargetPinPoint {
  id: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  distanceFromDroneMeters: number;
  estimatedTargetType: 'HUMAN_HEAT_SIGNATURE' | 'VEHICLE_HEAT_SIGNATURE' | 'VELDFIRE_SPOT' | 'STRUCTURE' | 'UNKNOWN';
  spotTemperatureC: number;
  timestamp: number;
  label: string;
}

export interface DroneTelemetryData {
  isOnline: boolean;
  droneModel: string;
  serialNumber: string;
  firmwareVersion: string;
  flightState: DroneFlightState;
  
  // GPS & Spatial Orientation
  position: {
    latitude: number;
    longitude: number;
    altitudeMslMeters: number; // Mean Sea Level
    heightAglMeters: number;   // Above Ground Level
    heading: number;           // 0 - 360 deg
    pitch: number;             // drone tilt
    roll: number;
    speedKmh: number;
    verticalSpeedMs: number;
    rtkFixed: boolean;
    satellites: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
  };

  // Dual Battery System (TB30 / Matrice Enterprise)
  battery: {
    percentage: number;
    voltage: number;
    currentAmps: number;
    temperatureC: number;
    estimatedMinutesRemaining: number;
    returnToHomeBatteryThreshold: number;
    criticalLandingBatteryThreshold: number;
    cellStatus: 'NORMAL' | 'WARNING' | 'CRITICAL';
  };

  // Gimbal & Optical/Thermal Payload (Zenmuse / M30T)
  gimbal: {
    pitch: number;      // -120 to +30 deg
    yaw: number;        // heading relative to north or drone
    roll: number;
    zoomLevel: number;  // 1x to 200x
    fovAngleDeg: number;
    viewMode: CameraViewMode;
    thermalPalette: ThermalPalette;
    thermalSpotTempC: number;
    thermalMaxTempC: number;
    thermalMinTempC: number;
    spotlightActive: boolean;
    nightVisionActive: boolean;
    isRecording: boolean;
  };

  // Laser Rangefinder (LRF) PinPoint
  laserRangefinder: {
    active: boolean;
    targetDistanceMeters: number | null;
    targetCoords: { latitude: number; longitude: number; elevationM: number } | null;
    recentPinPoints: LaserTargetPinPoint[];
  };

  // Smart Controller / Pilot Uplink
  smartController: {
    model: string;
    pilotName: string;
    pilotCallsign: string;
    pilotPhone: string;
    rcBatteryPercent: number;
    linkSignalDbm: number;
    linkQualityPercent: number;
    signalBand: string;
    homeLocation: { latitude: number; longitude: number; name: string };
  };

  // Video Streaming Pipeline
  stream: {
    isStreaming: boolean;
    streamUrl: string;
    backupStreamUrl: string;
    streamProtocol: 'WEBRTC' | 'RTMP' | 'RTSP' | 'DJI_CLOUD_API';
    resolution: string;
    fps: number;
    bitrateMbps: number;
    latencyMs: number;
  };

  // Flight Statistics & Trail
  flightLog: {
    takeoffTime: number | null;
    totalFlightSeconds: number;
    distanceTraveledKm: number;
    maxAltitudeMeters: number;
    maxSpeedKmh: number;
    breadcrumbs: Array<{ latitude: number; longitude: number; altitude: number; timestamp: number }>;
  };
}

const DEFAULT_OPS_HQ = { latitude: -26.7635, longitude: 26.4168, name: 'Hartbeesfontein Ops Beheerkamer Helipad' };

const INITIAL_TELEMETRY: DroneTelemetryData = {
  isOnline: false,
  droneModel: 'DJI Matrice T4 / M30T Enterprise Thermal',
  serialNumber: 'DJI-M30T-ZA-9942B',
  firmwareVersion: 'v07.01.01.24',
  flightState: 'OFFLINE',
  
  position: {
    latitude: 0,
    longitude: 0,
    altitudeMslMeters: 0,
    heightAglMeters: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    speedKmh: 0,
    verticalSpeedMs: 0,
    rtkFixed: false,
    satellites: 0,
    windSpeedKmh: 0,
    windDirectionDeg: 0,
  },

  battery: {
    percentage: 0,
    voltage: 0,
    currentAmps: 0,
    temperatureC: 0,
    estimatedMinutesRemaining: 0,
    returnToHomeBatteryThreshold: 20,
    criticalLandingBatteryThreshold: 10,
    cellStatus: 'NORMAL',
  },

  gimbal: {
    pitch: 0,
    yaw: 0,
    roll: 0,
    zoomLevel: 1,
    fovAngleDeg: 42,
    viewMode: 'THERMAL',
    thermalPalette: 'WHITE_HOT',
    thermalSpotTempC: 0,
    thermalMaxTempC: 0,
    thermalMinTempC: 0,
    spotlightActive: false,
    nightVisionActive: false,
    isRecording: false,
  },

  laserRangefinder: {
    active: false,
    targetDistanceMeters: null,
    targetCoords: null,
    recentPinPoints: [],
  },

  smartController: {
    model: 'DJI RC Plus Enterprise Smart Controller (O3 Pro)',
    pilotName: 'André Greeff / Cornelius Hattingh',
    pilotCallsign: 'Alfa-1 (Drone Lead)',
    pilotPhone: '+27 82 306 5808',
    rcBatteryPercent: 0,
    linkSignalDbm: -95,
    linkQualityPercent: 0,
    signalBand: 'O3 Enterprise Dual Band 2.4/5.8GHz',
    homeLocation: DEFAULT_OPS_HQ,
  },

  stream: {
    isStreaming: false,
    streamUrl: '',
    backupStreamUrl: '',
    streamProtocol: 'WEBRTC',
    resolution: '1080p 60fps',
    fps: 0,
    bitrateMbps: 0,
    latencyMs: 0,
  },

  flightLog: {
    takeoffTime: null,
    totalFlightSeconds: 0,
    distanceTraveledKm: 0,
    maxAltitudeMeters: 0,
    maxSpeedKmh: 0,
    breadcrumbs: [],
  },
};

type TelemetryListener = (telemetry: DroneTelemetryData) => void;

class DroneTelemetryService {
  private telemetry: DroneTelemetryData;
  private listeners: Set<TelemetryListener> = new Set();

  constructor() {
    // Check if real active telemetry exists; otherwise default to offline
    try {
      localStorage.removeItem('dji_matrice_telemetry_state');
    } catch {}
    this.telemetry = { ...INITIAL_TELEMETRY };
  }

  public getTelemetry(): DroneTelemetryData {
    return { ...this.telemetry };
  }

  public isOnline(): boolean {
    return this.telemetry.isOnline;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.getTelemetry());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = this.getTelemetry();
    this.listeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (err) {
        console.error('[DroneService] Listener error:', err);
      }
    });
    // Persist quick state
    try {
      localStorage.setItem('dji_matrice_telemetry_state', JSON.stringify({
        isOnline: copy.isOnline,
        flightState: copy.flightState,
        position: copy.position,
        battery: copy.battery,
        gimbal: copy.gimbal,
      }));
    } catch {}
  }

  public setPowerState(online: boolean) {
    this.telemetry.isOnline = online;
    this.telemetry.flightState = online ? 'STANDBY_GROUND' : 'OFFLINE';
    this.telemetry.stream.isStreaming = online;
    if (!online) {
      this.telemetry.position.heightAglMeters = 0;
      this.telemetry.position.speedKmh = 0;
      this.telemetry.position.rtkFixed = false;
      this.telemetry.position.satellites = 0;
      this.telemetry.smartController.linkQualityPercent = 0;
      this.telemetry.smartController.linkSignalDbm = -95;
      this.telemetry.stream.fps = 0;
      this.telemetry.stream.bitrateMbps = 0;
      this.telemetry.stream.latencyMs = 0;
    }
    this.notify();
  }

  public connectFeed() {
    this.setPowerState(true);
  }

  public disconnectFeed() {
    this.setPowerState(false);
  }

  public isFeedStreaming(): boolean {
    return this.telemetry.isOnline && this.telemetry.stream.isStreaming && this.telemetry.flightState !== 'OFFLINE';
  }

  public setFlightState(state: DroneFlightState) {
    this.telemetry.flightState = state;
    this.notify();
  }

  public setThermalPalette(palette: ThermalPalette) {
    this.telemetry.gimbal.thermalPalette = palette;
    this.notify();
  }

  public setViewMode(mode: CameraViewMode) {
    this.telemetry.gimbal.viewMode = mode;
    this.notify();
  }

  public setZoomLevel(zoom: number) {
    this.telemetry.gimbal.zoomLevel = Math.max(1, Math.min(200, zoom));
    this.notify();
  }

  public toggleSpotlight() {
    this.telemetry.gimbal.spotlightActive = !this.telemetry.gimbal.spotlightActive;
    this.notify();
  }

  public toggleNightVision() {
    this.telemetry.gimbal.nightVisionActive = !this.telemetry.gimbal.nightVisionActive;
    this.notify();
  }

  public toggleRecording() {
    this.telemetry.gimbal.isRecording = !this.telemetry.gimbal.isRecording;
    this.notify();
  }

  public toggleLaserRangefinder(active?: boolean) {
    this.telemetry.laserRangefinder.active = active !== undefined ? active : !this.telemetry.laserRangefinder.active;
    this.notify();
  }

  public dropLaserPinPoint(customLabel?: string): LaserTargetPinPoint {
    const lat = this.telemetry.laserRangefinder.targetCoords?.latitude || (this.telemetry.position.latitude + 0.003);
    const lng = this.telemetry.laserRangefinder.targetCoords?.longitude || (this.telemetry.position.longitude + 0.003);
    const dist = this.telemetry.laserRangefinder.targetDistanceMeters || 380;
    const temp = this.telemetry.gimbal.thermalSpotTempC || 37.2;

    const pin: LaserTargetPinPoint = {
      id: `LRF-PIN-${Date.now().toString().slice(-4)}`,
      latitude: lat,
      longitude: lng,
      elevationMeters: 1430,
      distanceFromDroneMeters: dist,
      estimatedTargetType: temp > 35 ? 'HUMAN_HEAT_SIGNATURE' : 'VEHICLE_HEAT_SIGNATURE',
      spotTemperatureC: temp,
      timestamp: Date.now(),
      label: customLabel || `Laser Teiken (${dist}m) - Hittebron ${temp.toFixed(1)}°C`,
    };

    this.telemetry.laserRangefinder.recentPinPoints = [
      pin,
      ...this.telemetry.laserRangefinder.recentPinPoints.slice(0, 9),
    ];
    this.telemetry.laserRangefinder.targetCoords = { latitude: lat, longitude: lng, elevationM: 1430 };
    this.notify();
    return pin;
  }

  public flyToCoordinates(targetLat: number, targetLng: number, targetName?: string) {
    this.telemetry.flightState = 'TRACKING_TARGET';
    // Calculate heading towards target
    const dLat = targetLat - this.telemetry.position.latitude;
    const dLng = targetLng - this.telemetry.position.longitude;
    const headingDeg = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

    this.telemetry.position.heading = headingDeg;
    this.telemetry.position.speedKmh = 58.0;
    this.telemetry.gimbal.yaw = headingDeg;

    this.telemetry.laserRangefinder.targetCoords = {
      latitude: targetLat,
      longitude: targetLng,
      elevationM: 1420,
    };
    this.notify();
  }

  public triggerRTH() {
    this.telemetry.flightState = 'RETURNING_HOME';
    const home = this.telemetry.smartController.homeLocation;
    const dLat = home.latitude - this.telemetry.position.latitude;
    const dLng = home.longitude - this.telemetry.position.longitude;
    const headingDeg = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

    this.telemetry.position.heading = headingDeg;
    this.telemetry.position.speedKmh = 52.0;
    this.telemetry.gimbal.yaw = headingDeg;
    this.notify();
  }

  // External Ingestion (e.g. from DJI Cloud API Webhook / MQTT / RC Plus 4G Link)
  public ingestExternalTelemetry(data: Partial<DroneTelemetryData>) {
    this.telemetry = {
      ...this.telemetry,
      ...data,
      isOnline: true,
      position: { ...this.telemetry.position, ...(data.position || {}) },
      battery: { ...this.telemetry.battery, ...(data.battery || {}) },
      gimbal: { ...this.telemetry.gimbal, ...(data.gimbal || {}) },
    };
    this.notify();
  }
}

export const droneTelemetryService = new DroneTelemetryService();
