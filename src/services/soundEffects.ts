// Hartbeesfontein Veiligheid - Tactical Audio & Alert Chimes (Synthesized Web Audio)
import { NotificationSoundTone } from '../types';

let sosAlarmInterval: any = null;
let activeAudioContext: AudioContext | null = null;
let isAlarmRunning = false;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!activeAudioContext || activeAudioContext.state === 'closed') {
      activeAudioContext = new AudioContextClass();
    }
    if (activeAudioContext.state === 'suspended') {
      activeAudioContext.resume().catch(() => {});
    }
    return activeAudioContext;
  } catch (e) {
    console.debug('AudioContext initialization skipped:', e);
    return null;
  }
}

/**
 * Play a specific tone by ID with customizable volume (0.0 to 1.0)
 */
export function playTone(tone: NotificationSoundTone, volume = 0.6): void {
  const safeVol = Math.max(0.01, Math.min(1.0, volume));
  switch (tone) {
    case 'SOS_SIREN':
      playSosAlarmPulse(safeVol);
      break;
    case 'TRAFFIC_HORN':
      playTrafficAlertSound(safeVol);
      break;
    case 'FIRE_WARBLE':
      playFireAlertSound(safeVol);
      break;
    case 'SECURITY_BEEP':
      playSecurityAlertSound(safeVol);
      break;
    case 'BOLO_RADAR':
      playBoloAlertSound(safeVol);
      break;
    case 'CHIME_GENTLE':
      playGentleChime(safeVol);
      break;
    case 'TACTICAL_DOUBLE_BEEP':
      playTacticalDoubleBeep(safeVol);
      break;
    default:
      playIncidentAlertSound(safeVol);
      break;
  }
}

/**
 * Single incident chime
 */
export function playIncidentAlertSound(volume = 0.5): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 3-tone urgency chime (D5 -> G5 -> C6)
    const notes = [
      { freq: 587.33, start: 0, dur: 0.14, gain: 0.25 * volume },
      { freq: 783.99, start: 0.16, dur: 0.16, gain: 0.28 * volume },
      { freq: 1046.5, start: 0.34, dur: 0.38, gain: 0.32 * volume },
    ];

    notes.forEach(({ freq, start, dur, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  } catch (e) {
    console.debug('Incident sound playback skipped:', e);
  }
}

/**
 * Traffic Alert - distinctive dual road-warning chime (Amber tone)
 */
export function playTrafficAlertSound(volume = 0.6): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Dual resonant horn warning chime (F4 -> A4 -> C5)
    const tones = [
      { freq: 349.23, start: 0, dur: 0.18, gain: 0.35 * volume, type: 'sawtooth' as OscillatorType },
      { freq: 440.0, start: 0.08, dur: 0.22, gain: 0.4 * volume, type: 'triangle' as OscillatorType },
      { freq: 523.25, start: 0.28, dur: 0.35, gain: 0.38 * volume, type: 'triangle' as OscillatorType },
    ];

    tones.forEach(({ freq, start, dur, gain: peakGain, type }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.04);
    });
  } catch (e) {
    console.debug('Traffic sound skipped:', e);
  }
}

/**
 * Fire Alert - Fast oscillating high-low emergency warble siren
 */
export function playFireAlertSound(volume = 0.7): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency warble 650Hz to 1100Hz
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.15);
    osc.frequency.linearRampToValueAtTime(650, now + 0.3);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.45);
    osc.frequency.linearRampToValueAtTime(650, now + 0.6);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.35 * volume, now + 0.03);
    gainNode.gain.setValueAtTime(0.35 * volume, now + 0.55);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch (e) {
    console.debug('Fire sound skipped:', e);
  }
}

/**
 * Security & Farm Incident - sharp crisp double tactical pulse
 */
export function playSecurityAlertSound(volume = 0.6): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const pulses = [
      { freq: 950, start: 0, dur: 0.1, gain: 0.32 * volume },
      { freq: 1200, start: 0.14, dur: 0.18, gain: 0.38 * volume },
    ];

    pulses.forEach(({ freq, start, dur, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
  } catch (e) {
    console.debug('Security alert sound skipped:', e);
  }
}

/**
 * BOLO / Suspect Watchlist - high radar sweep ping
 */
export function playBoloAlertSound(volume = 0.6): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.4 * volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  } catch (e) {
    console.debug('BOLO sound skipped:', e);
  }
}

/**
 * Gentle Chime for Sitreps & Informational updates
 */
export function playGentleChime(volume = 0.5): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, start: 0, dur: 0.25, gain: 0.22 * volume }, // C5
      { freq: 659.25, start: 0.12, dur: 0.35, gain: 0.25 * volume }, // E5
      { freq: 783.99, start: 0.24, dur: 0.45, gain: 0.28 * volume }, // G5
    ];

    notes.forEach(({ freq, start, dur, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  } catch (e) {
    console.debug('Gentle chime skipped:', e);
  }
}

/**
 * Tactical Radio Double Beep (for Reaction Force dispatch & status changes)
 */
export function playTacticalDoubleBeep(volume = 0.6): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const beeps = [
      { freq: 1100, start: 0, dur: 0.08, gain: 0.3 * volume },
      { freq: 1350, start: 0.12, dur: 0.12, gain: 0.35 * volume },
    ];

    beeps.forEach(({ freq, start, dur, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
  } catch (e) {
    console.debug('Double beep skipped:', e);
  }
}

/**
 * Play a tactical dual-tone SOS pulse (urgent emergency alarm burst)
 */
export function playSosAlarmPulse(volume = 0.8): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // High-urgency dual-burst pulse (880 Hz -> 987.77 Hz alternating)
    const pulses = [
      { freq: 880, start: 0, dur: 0.18, gain: 0.35 * volume, type: 'sawtooth' as OscillatorType },
      { freq: 987.77, start: 0.2, dur: 0.22, gain: 0.4 * volume, type: 'triangle' as OscillatorType },
      { freq: 880, start: 0.45, dur: 0.18, gain: 0.35 * volume, type: 'sawtooth' as OscillatorType },
      { freq: 987.77, start: 0.65, dur: 0.25, gain: 0.4 * volume, type: 'triangle' as OscillatorType },
    ];

    pulses.forEach(({ freq, start, dur, gain: peakGain, type }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.03);
    });
  } catch (e) {
    console.debug('SOS alarm pulse skipped:', e);
  }
}

/**
 * Start continuous SOS alarm tone until console is opened or silenced
 */
export function startSosContinuousAlarm(volume = 0.8): void {
  if (isAlarmRunning) return;
  isAlarmRunning = true;

  // Play initial burst immediately
  playSosAlarmPulse(volume);

  // Repeat alarm tone every 1.6 seconds
  if (sosAlarmInterval) {
    clearInterval(sosAlarmInterval);
  }
  sosAlarmInterval = setInterval(() => {
    if (isAlarmRunning) {
      playSosAlarmPulse(volume);
    }
  }, 1600);
}

/**
 * Stop continuous SOS alarm tone
 */
export function stopSosContinuousAlarm(): void {
  isAlarmRunning = false;
  if (sosAlarmInterval) {
    clearInterval(sosAlarmInterval);
    sosAlarmInterval = null;
  }
}

export function isSosAlarmSounding(): boolean {
  return isAlarmRunning;
}

export function playAcknowledgementChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Two calm confirmation notes (A5 -> D6)
    const notes = [
      { freq: 880.0, start: 0, dur: 0.12, gain: 0.18 },
      { freq: 1174.66, start: 0.14, dur: 0.25, gain: 0.2 },
    ];

    notes.forEach(({ freq, start, dur, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  } catch (e) {
    console.debug('Ack sound playback skipped:', e);
  }
}


