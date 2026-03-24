/**
 * In-Memory Data Storage for AGRON Dashboard
 * 
 * This provides a simple in-memory database for development and testing.
 * In production, replace with MongoDB/PostgreSQL connection.
 * 
 * Data Structure:
 * - sensorReadings: Array of latest sensor data points
 * - controlStates: Current state of all actuators
 * - devices: Registered ESP32 devices
 */

interface SoilMoistureData {
  raw: number;
  percentage: number;
  vwc: number;
}

interface SensorReading {
  device_id: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  soil_moisture: SoilMoistureData[];
  light_intensity: number[];
  signal_strength: number;
  received_at: string;
}

interface ControlState {
  device_id: string;
  pump: boolean;
  growLight: boolean;
  fan1: boolean;
  fan2: boolean;
  updated_at: string;
}

// In-memory data storage
const store = {
  sensorReadings: [] as SensorReading[],
  controlStates: new Map<string, ControlState>(),
  maxReadings: 1000, // Keep last 1000 readings per device
};

/**
 * Add sensor reading to storage
 * Keeps only the latest readings to prevent memory bloat
 */
export function addSensorReading(reading: SensorReading): void {
  store.sensorReadings.push(reading);
  
  // Keep only the latest readings
  if (store.sensorReadings.length > store.maxReadings) {
    store.sensorReadings = store.sensorReadings.slice(-store.maxReadings);
  }
}

/**
 * Get the latest sensor reading for a device
 */
export function getLatestSensorReading(deviceId: string): SensorReading | null {
  const readings = store.sensorReadings.filter(r => r.device_id === deviceId);
  return readings.length > 0 ? readings[readings.length - 1] : null;
}

/**
 * Get all latest sensor readings (for dashboard)
 */
export function getAllLatestReadings(): SensorReading[] {
  const uniqueDevices = new Set<string>();
  const latestReadings: SensorReading[] = [];
  
  // Iterate in reverse to get the latest reading for each device
  for (let i = store.sensorReadings.length - 1; i >= 0; i--) {
    const reading = store.sensorReadings[i];
    if (!uniqueDevices.has(reading.device_id)) {
      latestReadings.push(reading);
      uniqueDevices.add(reading.device_id);
    }
  }
  
  return latestReadings;
}

/**
 * Get sensor reading history for a device
 */
export function getSensorHistory(deviceId: string, limit: number = 100): SensorReading[] {
  const readings = store.sensorReadings
    .filter(r => r.device_id === deviceId)
    .slice(-limit);
  
  return readings;
}

/**
 * Update control state for a device
 */
export function updateControlState(controlState: ControlState): void {
  store.controlStates.set(controlState.device_id, controlState);
}

/**
 * Get control state for a device
 */
export function getControlState(deviceId: string): ControlState | null {
  return store.controlStates.get(deviceId) || null;
}

/**
 * Get all control states
 */
export function getAllControlStates(): ControlState[] {
  return Array.from(store.controlStates.values());
}

/**
 * Clear all data (use for testing/reset)
 */
export function clearAllData(): void {
  store.sensorReadings = [];
  store.controlStates.clear();
}

/**
 * Get storage statistics
 */
export function getStorageStats() {
  const deviceIds = new Set<string>();
  store.sensorReadings.forEach(r => deviceIds.add(r.device_id));
  
  return {
    totalReadings: store.sensorReadings.length,
    activeDevices: deviceIds.size,
    storageSize: JSON.stringify(store).length,
    controlStatesCount: store.controlStates.size,
  };
}
