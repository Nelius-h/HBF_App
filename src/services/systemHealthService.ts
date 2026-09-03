import { SystemHealthComponent, SystemErrorLogEntry, ErrorSeverity } from '../types';

export const INITIAL_HEALTH_COMPONENTS: SystemHealthComponent[] = [
  {
    id: 'HC-DB',
    name: 'Firestore Database & Index Engine',
    category: 'DATABASE',
    status: 'HEALTHY',
    lastChecked: new Date().toISOString(),
    latencyMs: 38,
    errorCount: 0,
    details: 'Read/write latency normal. All 14 security query indexes active and responsive.',
  },
  {
    id: 'HC-FN',
    name: 'Cloud Functions & Triggers',
    category: 'FUNCTIONS',
    status: 'HEALTHY',
    lastChecked: new Date().toISOString(),
    latencyMs: 110,
    errorCount: 0,
    details: 'Emergency dispatch workers running. Zero cold-start timeouts in last 24h.',
  },
  {
    id: 'HC-NOTIF',
    name: 'FCM Push Notification Service',
    category: 'NOTIFICATIONS',
    status: 'HEALTHY',
    lastChecked: new Date().toISOString(),
    latencyMs: 145,
    errorCount: 0,
    details: 'High-priority APNS/FCM channels open. Average delivery latency 420ms.',
  },
  {
    id: 'HC-WA',
    name: 'WhatsApp Cloud API Gateway',
    category: 'WHATSAPP',
    status: 'HEALTHY',
    lastChecked: new Date().toISOString(),
    latencyMs: 220,
    errorCount: 0,
    details: 'Direct webhook active with automated fallback to manual operator web links.',
  },
  {
    id: 'HC-MEDIA',
    name: 'WebRTC Live Audio Streaming',
    category: 'AUDIO_MEDIA',
    status: 'HEALTHY',
    lastChecked: new Date().toISOString(),
    latencyMs: 65,
    errorCount: 0,
    details: 'STUN/TURN mesh online with Opus 16kHz emergency voice transmission.',
  },
  {
    id: 'HC-BKP',
    name: 'Automated Backup & Snapshot Engine',
    category: 'BACKUP',
    status: 'HEALTHY',
    lastChecked: new Date().toISOString(),
    latencyMs: 310,
    errorCount: 0,
    details: 'Daily snapshots passing SHA-256 parity verification and multi-region replication.',
  },
  {
    id: 'HC-AI',
    name: 'Gemini Safety & Intel Assistant',
    category: 'AI_SERVICE',
    status: 'HEALTHY',
    lastChecked: new Date().toISOString(),
    latencyMs: 680,
    errorCount: 0,
    details: 'gemini-3.6-flash online. Non-blocking auxiliary analysis; manual fallback guaranteed.',
  },
];

export const INITIAL_ERROR_LOGS: SystemErrorLogEntry[] = [
  {
    id: 'ERR-2026-08-19-01',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    severity: 'LOW',
    subsystem: 'PUSH_NOTIFICATIONS',
    message: 'Temporary network retry for client FCM token (Device was in deep sleep / low power mode)',
    details: 'Token USR-CLIENT-004 re-acknowledged upon next heartbeat cycle.',
    acknowledged: true,
  },
  {
    id: 'ERR-2026-08-18-22',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    severity: 'MEDIUM',
    subsystem: 'WHATSAPP',
    message: 'WhatsApp Cloud API rate limit burst threshold reached during multi-sector drill',
    details: 'Fallback to individual direct broadcast links engaged without dispatch delay.',
    acknowledged: true,
  },
];

// Idempotency tracking to prevent rapid accidental taps from flooding emergencies
const recentEmergencyMap = new Map<string, number>();

export function checkEmergencyIdempotency(clientUid: string, debounceWindowMs = 8000): { isDuplicate: boolean; remainingSec: number } {
  const lastTime = recentEmergencyMap.get(clientUid) || 0;
  const now = Date.now();
  const elapsed = now - lastTime;

  if (elapsed < debounceWindowMs) {
    const remainingSec = Math.ceil((debounceWindowMs - elapsed) / 1000);
    return { isDuplicate: true, remainingSec };
  }

  recentEmergencyMap.set(clientUid, now);
  return { isDuplicate: false, remainingSec: 0 };
}
