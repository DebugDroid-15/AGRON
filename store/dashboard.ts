'use client';

import { create } from 'zustand';

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number[];
  lightIntensity: number[];
}

interface Controls {
  pump: boolean;
  growLight: boolean;
  fan1: boolean;
  fan2: boolean;
}

interface StorageStats {
  used: {
    bytes: number;
    kb: number;
    mb: number;
    gb: number;
  };
  quota: {
    mb: number;
    gb: number;
  };
  usage: {
    percent: number;
  };
  breakdown: {
    readings: number;
    controls: number;
    alerts: number;
    settings: number;
  };
  status: 'healthy' | 'warning' | 'unknown';
}

interface DashboardStore {
  sensorData: SensorData;
  controls: Controls;
  storageStats: StorageStats;
  isConnected: boolean;
  apiAvailable: boolean;
  deviceId: string;
  lastDataReceived: number; // Timestamp of last successful data fetch
  setSensorData: (data: SensorData) => void;
  setControls: (controls: Partial<Controls>) => void;
  toggleControl: (control: keyof Controls) => void;
  fetchSensorData: () => Promise<void>;
  updateControlState: (control: keyof Controls, value: boolean) => Promise<void>;
  fetchStorageStats: () => Promise<void>;
}

// Empty initial state - will be filled by real API data
const defaultSensorData: SensorData = {
  temperature: 0,
  humidity: 0,
  soilMoisture: [0, 0, 0, 0],
  lightIntensity: [0, 0],
};

const defaultControls: Controls = {
  pump: false,
  growLight: false,
  fan1: false,
  fan2: false,
};

const defaultStorageStats: StorageStats = {
  used: {
    bytes: 0,
    kb: 0,
    mb: 0,
    gb: 0,
  },
  quota: {
    mb: 500,
    gb: 0.5,
  },
  usage: {
    percent: 0,
  },
  breakdown: {
    readings: 0,
    controls: 0,
    alerts: 0,
    settings: 0,
  },
  status: 'unknown',
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  sensorData: defaultSensorData,
  controls: defaultControls,
  storageStats: defaultStorageStats,
  isConnected: false,
  apiAvailable: false,
  deviceId: 'ESP32_AGRON_01',
  lastDataReceived: 0, // Unix timestamp

  setSensorData: (data) => set({ sensorData: data }),

  setControls: (controls) =>
    set((state) => ({
      controls: { ...state.controls, ...controls },
    })),

  toggleControl: (control) =>
    set((state) => ({
      controls: {
        ...state.controls,
        [control]: !state.controls[control],
      },
    })),

  // Fetch real sensor data from API
  fetchSensorData: async () => {
    try {
      const response = await fetch('/api/sensor-data');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.readings && data.readings.length > 0) {
        // Get the latest reading from the API
        const latestReading = data.readings[0];
        
        // Transform API data to store format
        const sensorData: SensorData = {
          temperature: latestReading.temperature || defaultSensorData.temperature,
          humidity: latestReading.humidity || defaultSensorData.humidity,
          soilMoisture: latestReading.soil_moisture?.map((s: any) => s.raw) || defaultSensorData.soilMoisture,
          lightIntensity: latestReading.light_intensity || defaultSensorData.lightIntensity,
        };
        
        // Update connection status - if we received real data, ESP32 is actively polling
        const now = Date.now();
        set({ 
          sensorData, 
          isConnected: true,  // Real data means ESP32 is connected and polling
          apiAvailable: true, 
          lastDataReceived: now
        });
      } else {
        // No readings yet - waiting for first data from ESP32
        set({ apiAvailable: false, isConnected: false });
      }
    } catch (error) {
      console.warn('📡 API unavailable. Waiting for real sensor data from ESP32...', error);
      
      // Check if we had recent data before - connection timeout after 15 seconds
      const now = Date.now();
      const timeSinceLastData = now - get().lastDataReceived;
      const isStillConnected = timeSinceLastData < 15000; // 15 second timeout
      
      set({ 
        apiAvailable: false, 
        isConnected: isStillConnected  // Keep connected if data was recent
      });
    }
  },

  // Update control state via API
  updateControlState: async (control: keyof Controls, value: boolean) => {
    try {
      const currentControls = get().controls;
      const updatedControls = { ...currentControls, [control]: value };
      
      // Optimistically update local state
      set({ controls: updatedControls });
      
      // Send to API
      const response = await fetch('/api/controls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: get().deviceId,
          ...updatedControls,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      console.log(`✅ Control updated: ${control} = ${value}`);
    } catch (error) {
      console.error('❌ Failed to update control:', error);
      // Revert to previous state on error
      set((state) => ({
        controls: { ...state.controls, [control]: !get().controls[control] },
      }));
    }
  },

  // Fetch storage stats from API
  fetchStorageStats: async () => {
    try {
      const response = await fetch('/api/storage');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const stats = await response.json();
      set({ storageStats: stats });
    } catch (error) {
      console.warn('⚠️ Failed to fetch storage stats:', error);
      // Keep showing previous stats on error
    }
  },
}));

// Initialize data fetching on client side
if (typeof window !== 'undefined') {
  const store = useDashboardStore;
  
  // Fetch data immediately
  store.getState().fetchSensorData();
  store.getState().fetchStorageStats();
  
  // Set up polling (every 5 seconds for sensor data)
  setInterval(() => {
    store.getState().fetchSensorData();
  }, 5000);
  
  // Set up polling (every 30 seconds for storage stats)
  setInterval(() => {
    store.getState().fetchStorageStats();
  }, 30000);
}
