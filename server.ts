import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsing middlewares
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-Memory & File-Backed Emergency & Data Store for Guaranteed Cross-Device Synchronization
interface EmergencyRecord {
  id: string;
  [key: string]: any;
}

const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

const EMERGENCIES_FILE = path.join(DATA_DIR, 'emergencies.json');
const PATROLS_FILE = path.join(DATA_DIR, 'patrols.json');

let inMemoryEmergencies: EmergencyRecord[] = [];
let inMemoryPatrolUnits: any[] = [];

// Load existing emergencies from disk if available
try {
  if (fs.existsSync(EMERGENCIES_FILE)) {
    const raw = fs.readFileSync(EMERGENCIES_FILE, 'utf-8');
    const loaded = JSON.parse(raw);
    if (Array.isArray(loaded)) {
      inMemoryEmergencies = loaded.map((emg: any) => {
        // Sanitize any corrupt status where resolution details or resolvedTime was set
        if (emg.resolvedTime || emg.resolutionDetails?.resolutionStatus === 'SAFE') {
          return {
            ...emg,
            status: 'SAFE',
            audioSession: emg.audioSession ? { ...emg.audioSession, status: 'ENDED', connectionState: 'ENDED' } : undefined,
            locationSession: emg.locationSession ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED' } : undefined,
          };
        }
        return emg;
      });
    }
  }
} catch (err) {
  console.warn('[Server] Could not read emergencies.json from disk:', err);
}

// Load existing active patrol units from disk if available
try {
  if (fs.existsSync(PATROLS_FILE)) {
    const raw = fs.readFileSync(PATROLS_FILE, 'utf-8');
    inMemoryPatrolUnits = JSON.parse(raw);
  }
} catch (err) {
  console.warn('[Server] Could not read patrols.json from disk:', err);
}

function persistEmergenciesToDisk() {
  try {
    fs.writeFileSync(EMERGENCIES_FILE, JSON.stringify(inMemoryEmergencies, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Server] Could not write emergencies.json to disk:', err);
  }
}

function persistPatrolsToDisk() {
  try {
    fs.writeFileSync(PATROLS_FILE, JSON.stringify(inMemoryPatrolUnits, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Server] Could not write patrols.json to disk:', err);
  }
}

// SSE Connected Clients Registry
const sseClients = new Set<Response>();

function broadcastSseMessage(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Periodic SSE Keep-Alive Ping (prevents proxies from timing out connections)
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keep-alive\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// ==========================================
// API ROUTES (Before Vite Middleware)
// ==========================================

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    activeEmergenciesCount: inMemoryEmergencies.filter(
      (e) => e.status !== 'SAFE' && e.status !== 'FALSE_ALARM' && e.status !== 'CLOSED'
    ).length,
    connectedSseClients: sseClients.size,
  });
});

// Real-Time Server-Sent Events (SSE) Stream for Instant Cross-Device SOS Broadcast
app.get('/api/emergencies/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Register client
  sseClients.add(res);

  // Send immediate snapshot of current emergencies and active patrols to newly connected device
  res.write(`event: initial_state\ndata: ${JSON.stringify(inMemoryEmergencies)}\n\n`);
  res.write(`event: patrols_initial_state\ndata: ${JSON.stringify(inMemoryPatrolUnits)}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Get all emergencies
app.get('/api/emergencies', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: inMemoryEmergencies,
    serverTime: new Date().toISOString(),
  });
});

// Trigger or Update an SOS Emergency
app.post('/api/emergencies', (req: Request, res: Response) => {
  const emergency = req.body;
  if (!emergency || !emergency.id) {
    return res.status(400).json({ success: false, error: 'Invalid emergency payload, id required' });
  }

  const existingIndex = inMemoryEmergencies.findIndex((e) => e.id === emergency.id);
  if (existingIndex >= 0) {
    const current = inMemoryEmergencies[existingIndex];
    // If the emergency is already marked SAFE, FALSE_ALARM, or CLOSED, only allow a status change
    // if the incoming emergency is an explicit new trigger with a new startTime or explicit status
    const isCurrentlyResolved = current.status === 'SAFE' || current.status === 'FALSE_ALARM' || current.status === 'CLOSED';
    const isIncomingResolved = emergency.status === 'SAFE' || emergency.status === 'FALSE_ALARM' || emergency.status === 'CLOSED';
    
    let resolvedSafeStatus = emergency.status;
    if (isCurrentlyResolved && !isIncomingResolved) {
      // Retain resolved status to prevent stale client location/telemetry heartbeats from reviving old alarms
      resolvedSafeStatus = current.status;
    }

    inMemoryEmergencies[existingIndex] = {
      ...current,
      ...emergency,
      status: resolvedSafeStatus,
      serverUpdatedAt: new Date().toISOString(),
    };
  } else {
    inMemoryEmergencies.unshift({
      ...emergency,
      serverCreatedAt: new Date().toISOString(),
      serverUpdatedAt: new Date().toISOString(),
    });
  }

  persistEmergenciesToDisk();

  const finalRecord = inMemoryEmergencies.find((e) => e.id === emergency.id) || emergency;

  // Broadcast instantly to all connected consoles and devices
  broadcastSseMessage('emergency_update', finalRecord);
  broadcastSseMessage('emergencies_list', inMemoryEmergencies);

  console.log(`[Server SOS Alert] Emergency ${emergency.id} received for ${emergency.clientName || 'Unknown'} (status: ${finalRecord.status}). Broadcasted to ${sseClients.size} live devices.`);

  res.status(200).json({
    success: true,
    emergency: finalRecord,
    broadcastClientsCount: sseClients.size,
  });
});

// Live Audio Telemetry Stream (Mic Level & Waveform)
app.post('/api/emergencies/:id/audio/telemetry', (req: Request, res: Response) => {
  const { id } = req.params;
  const { audioLevel, waveform, isTransmitting, timestamp } = req.body;

  const existingIndex = inMemoryEmergencies.findIndex((e) => e.id === id);
  if (existingIndex >= 0) {
    const current = inMemoryEmergencies[existingIndex];
    if (current.audioSession) {
      current.audioSession.audioLevel = audioLevel ?? current.audioSession.audioLevel;
      current.audioSession.lastHeartbeat = timestamp || new Date().toISOString();
      current.audioSession.waveform = waveform;
      current.audioSession.isTransmitting = isTransmitting ?? true;
    }
  }

  // Broadcast immediately to all Control Room listeners via SSE
  broadcastSseMessage('audio_telemetry', {
    id,
    audioLevel,
    waveform,
    isTransmitting: isTransmitting ?? true,
    timestamp: timestamp || new Date().toISOString(),
  });

  res.json({ success: true });
});

// Live Audio Chunk Stream (Recorded Voice / Ambient Audio Chunks)
app.post('/api/emergencies/:id/audio/chunk', (req: Request, res: Response) => {
  const { id } = req.params;
  const { chunkData, mimeType, durationMs, audioLevel, timestamp } = req.body;

  // Broadcast to all Control Room listening consoles for live audio playback
  broadcastSseMessage('audio_chunk', {
    id,
    chunkData,
    mimeType: mimeType || 'audio/webm',
    durationMs: durationMs || 2500,
    audioLevel: audioLevel || 35,
    timestamp: timestamp || new Date().toISOString(),
  });

  res.json({ success: true });
});

// Update an existing emergency status / CAD / responders
app.patch('/api/emergencies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const existingIndex = inMemoryEmergencies.findIndex((e) => e.id === id);
  if (existingIndex === -1) {
    // If not in memory yet, create it
    const newRecord = { id, ...updates, serverUpdatedAt: new Date().toISOString() };
    inMemoryEmergencies.unshift(newRecord);
  } else {
    const current = inMemoryEmergencies[existingIndex];
    const isCurrentlyResolved = current.status === 'SAFE' || current.status === 'FALSE_ALARM' || current.status === 'CLOSED';
    const isIncomingResolved = updates.status === 'SAFE' || updates.status === 'FALSE_ALARM' || updates.status === 'CLOSED';

    let resolvedSafeStatus = updates.status !== undefined ? updates.status : current.status;
    if (isCurrentlyResolved && !isIncomingResolved && updates.status !== undefined) {
      // Retain resolved status to prevent stale client location/telemetry heartbeats from reviving old alarms
      resolvedSafeStatus = current.status;
    }

    inMemoryEmergencies[existingIndex] = {
      ...current,
      ...updates,
      status: resolvedSafeStatus,
      serverUpdatedAt: new Date().toISOString(),
    };
  }

  persistEmergenciesToDisk();

  const updatedRecord = inMemoryEmergencies.find((e) => e.id === id);
  broadcastSseMessage('emergency_update', updatedRecord);
  broadcastSseMessage('emergencies_list', inMemoryEmergencies);

  res.json({ success: true, emergency: updatedRecord });
});

// Resolve and stand down ALL active emergencies across all connected devices
app.post('/api/emergencies/clear-all', (req: Request, res: Response) => {
  const now = new Date().toISOString();
  const { resolvedByName = 'Control Room', notes = 'System-wide alarm clearance' } = req.body || {};

  let resolvedCount = 0;
  inMemoryEmergencies = inMemoryEmergencies.map((emg) => {
    if (emg.status !== 'SAFE' && emg.status !== 'FALSE_ALARM' && emg.status !== 'CLOSED') {
      resolvedCount++;
      return {
        ...emg,
        status: 'SAFE',
        resolvedTime: now,
        resolutionDetails: {
          resolutionStatus: 'SAFE',
          resolutionTimestamp: now,
          resolvedByName,
          notes,
          policeInvolved: false,
          ambulanceInvolved: false,
          reactionForceInvolved: false,
          caseCreated: false,
          followUpRequired: false,
        },
        audioSession: emg.audioSession
          ? { ...emg.audioSession, status: 'ENDED', connectionState: 'ENDED', endTime: now }
          : undefined,
        locationSession: emg.locationSession
          ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED', sessionEnd: now }
          : undefined,
        updatedAt: now,
        serverUpdatedAt: now,
      };
    }
    return emg;
  });

  persistEmergenciesToDisk();

  // Instant broadcast to all SSE subscribers across all connected clients & devices
  broadcastSseMessage('emergencies_cleared', { resolvedCount, timestamp: now });
  broadcastSseMessage('emergencies_list', inMemoryEmergencies);

  console.log(`[Server SOS Alert] All active alarms cleared (${resolvedCount} active resolved). Broadcasted to all ${sseClients.size} live devices.`);

  res.json({
    success: true,
    resolvedCount,
    emergencies: inMemoryEmergencies,
    timestamp: now,
  });
});

app.post('/api/emergencies/resolve-all', (req: Request, res: Response) => {
  // Alias to clear-all
  const now = new Date().toISOString();
  const { resolvedByName = 'Control Room', notes = 'All active emergencies resolved by operator' } = req.body || {};

  let resolvedCount = 0;
  inMemoryEmergencies = inMemoryEmergencies.map((emg) => {
    if (emg.status !== 'SAFE' && emg.status !== 'FALSE_ALARM' && emg.status !== 'CLOSED') {
      resolvedCount++;
      return {
        ...emg,
        status: 'SAFE',
        resolvedTime: now,
        resolutionDetails: {
          resolutionStatus: 'SAFE',
          resolutionTimestamp: now,
          resolvedByName,
          notes,
          policeInvolved: false,
          ambulanceInvolved: false,
          reactionForceInvolved: false,
          caseCreated: false,
          followUpRequired: false,
        },
        audioSession: emg.audioSession
          ? { ...emg.audioSession, status: 'ENDED', connectionState: 'ENDED', endTime: now }
          : undefined,
        locationSession: emg.locationSession
          ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED', sessionEnd: now }
          : undefined,
        updatedAt: now,
        serverUpdatedAt: now,
      };
    }
    return emg;
  });

  persistEmergenciesToDisk();

  broadcastSseMessage('emergencies_cleared', { resolvedCount, timestamp: now });
  broadcastSseMessage('emergencies_list', inMemoryEmergencies);

  res.json({
    success: true,
    resolvedCount,
    emergencies: inMemoryEmergencies,
    timestamp: now,
  });
});

// Push Live GPS Location Update
app.post('/api/emergencies/:id/location', (req: Request, res: Response) => {
  const { id } = req.params;
  const { location, locationEvent, locationPoint } = req.body;

  const existingIndex = inMemoryEmergencies.findIndex((e) => e.id === id);
  if (existingIndex >= 0) {
    const current = inMemoryEmergencies[existingIndex];
    const locHist = Array.isArray(current.locationHistory) ? current.locationHistory : [];
    if (locationEvent) {
      locHist.push(locationEvent);
    }
    
    // Also update locationSession if available
    let locSession = current.locationSession;
    if (locationPoint && locSession) {
      const history = Array.isArray(locSession.history) ? locSession.history : [];
      if (!history.some((p: any) => p.id === locationPoint.id)) {
        locSession = {
          ...locSession,
          lastUpdate: locationPoint.timestamp || new Date().toISOString(),
          history: [...history, locationPoint],
        };
      }
    }

    inMemoryEmergencies[existingIndex] = {
      ...current,
      location: location || current.location,
      locationHistory: locHist,
      locationSession: locSession || current.locationSession,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: new Date().toISOString(),
    };
    persistEmergenciesToDisk();
  }

  // Broadcast location update to all connected consoles
  broadcastSseMessage('location_update', { id, location, locationEvent, locationPoint });

  res.json({ success: true });
});

// ==========================================
// ACTIVE PATROL BEACONS & VEHICLE TRACKING
// ==========================================

// Get all active patrols
app.get('/api/patrols', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: inMemoryPatrolUnits,
    serverTime: new Date().toISOString(),
  });
});

// Register or update active patrol beacon
app.post('/api/patrols', (req: Request, res: Response) => {
  const unit = req.body;
  if (!unit || (!unit.id && !unit.uid)) {
    return res.status(400).json({ success: false, error: 'Invalid patrol payload, id or uid required' });
  }

  const unitId = unit.id || `PATROL-${unit.uid}`;
  const normalizedUnit = {
    ...unit,
    id: unitId,
    status: unit.status || 'PATROLLING',
    isLiveTrackingActive: unit.isLiveTrackingActive !== false,
    lastUpdated: new Date().toISOString(),
  };

  const existingIdx = inMemoryPatrolUnits.findIndex((u) => u.id === unitId || u.uid === unit.uid);
  if (existingIdx >= 0) {
    inMemoryPatrolUnits[existingIdx] = {
      ...inMemoryPatrolUnits[existingIdx],
      ...normalizedUnit,
    };
  } else {
    inMemoryPatrolUnits.unshift(normalizedUnit);
  }

  persistPatrolsToDisk();

  // Broadcast to all Control Room consoles instantly
  broadcastSseMessage('patrol_update', normalizedUnit);
  broadcastSseMessage('patrols_list', inMemoryPatrolUnits);

  console.log(`[Server Patrol Beacon] Patrol ${unit.callsign || unit.name || unitId} activated/updated. Broadcasted to ${sseClients.size} live devices.`);

  res.status(200).json({
    success: true,
    patrol: normalizedUnit,
    broadcastClientsCount: sseClients.size,
  });
});

// Update patrol unit status or details
app.patch('/api/patrols/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const existingIdx = inMemoryPatrolUnits.findIndex((u) => u.id === id || u.uid === id);
  if (existingIdx === -1) {
    const newUnit = { id, ...updates, lastUpdated: new Date().toISOString() };
    inMemoryPatrolUnits.unshift(newUnit);
  } else {
    inMemoryPatrolUnits[existingIdx] = {
      ...inMemoryPatrolUnits[existingIdx],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
  }

  persistPatrolsToDisk();

  const updatedUnit = inMemoryPatrolUnits.find((u) => u.id === id || u.uid === id);
  broadcastSseMessage('patrol_update', updatedUnit);
  broadcastSseMessage('patrols_list', inMemoryPatrolUnits);

  res.json({ success: true, patrol: updatedUnit });
});

// Stream real-time GPS coordinates for active patrol unit
app.post('/api/patrols/:id/location', (req: Request, res: Response) => {
  const { id } = req.params;
  const { latitude, longitude, accuracy, speed, heading, battery, timestamp } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ success: false, error: 'latitude and longitude are required' });
  }

  const now = timestamp || new Date().toISOString();
  let updatedUnit: any = null;

  const existingIdx = inMemoryPatrolUnits.findIndex((u) => u.id === id || u.uid === id);
  if (existingIdx >= 0) {
    const current = inMemoryPatrolUnits[existingIdx];
    const trail = Array.isArray(current.trailHistory) ? current.trailHistory : [];
    const newTrail = [...trail, { latitude, longitude, timestamp: now }].slice(-40);

    inMemoryPatrolUnits[existingIdx] = {
      ...current,
      latitude,
      longitude,
      accuracy: accuracy ?? current.accuracy ?? 10,
      speed: speed ?? current.speed ?? '0 km/h',
      heading: heading ?? current.heading ?? 0,
      battery: battery ?? current.battery ?? '100%',
      status: 'PATROLLING',
      isLiveTrackingActive: true,
      lastUpdated: now,
      trailHistory: newTrail,
    };
    updatedUnit = inMemoryPatrolUnits[existingIdx];
  } else {
    // Upsert new patrol unit if not yet registered in memory
    const newUnit = {
      id,
      uid: id.replace('PATROL-', ''),
      name: 'Active Patrol Beacon',
      callsign: id.startsWith('PATROL-') ? id.replace('PATROL-', 'PATROL-') : id,
      role: 'Active Patrol Unit',
      userRole: 'CLIENT',
      sector: 'Hartbeesfontein Sektor 2',
      phone: '082 000 0000',
      vehicle: 'Patrol Vehicle',
      radioChannel: 'CH 01 Ops Prime',
      latitude,
      longitude,
      accuracy: accuracy ?? 10,
      speed: speed ?? '0 km/h',
      heading: heading ?? 0,
      battery: battery ?? '100%',
      status: 'PATROLLING',
      isLiveTrackingActive: true,
      startedAt: now,
      lastUpdated: now,
      notes: 'Live patrol GPS stream',
      trailHistory: [{ latitude, longitude, timestamp: now }],
    };
    inMemoryPatrolUnits.unshift(newUnit);
    updatedUnit = newUnit;
    broadcastSseMessage('patrol_update', updatedUnit);
  }

  persistPatrolsToDisk();

  // Broadcast patrol coordinate update to all connected consoles
  broadcastSseMessage('patrol_location_update', {
    id,
    latitude,
    longitude,
    accuracy: accuracy ?? updatedUnit.accuracy,
    speed: speed ?? updatedUnit.speed,
    heading: heading ?? updatedUnit.heading,
    battery: battery ?? updatedUnit.battery,
    timestamp: now,
  });
  broadcastSseMessage('patrols_list', inMemoryPatrolUnits);

  res.json({ success: true, patrol: updatedUnit });
});

// Remove / Stop Patrol Beacon
app.delete('/api/patrols/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  inMemoryPatrolUnits = inMemoryPatrolUnits.filter((u) => u.id !== id && u.uid !== id);
  persistPatrolsToDisk();

  broadcastSseMessage('patrol_remove', { id });
  broadcastSseMessage('patrols_list', inMemoryPatrolUnits);

  res.json({ success: true });
});

// ==========================================
// VITE & STATIC SPA MIDDLEWARE
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HBF Emergency Operations Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
