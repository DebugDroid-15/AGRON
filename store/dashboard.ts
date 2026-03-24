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

interface DashboardStore {
  sensorData: SensorData;
  controls: Controls;
  isConnected: boolean;
  apiAvailable: boolean;
  deviceId: string;
  setSensorData: (data: SensorData) => void;
  setControls: (controls: Partial<Controls>) => void;
  toggleControl: (control: keyof Controls) => void;
  fetchSensorData: () => Promise<void>;
  updateControlState: (control: keyof Controls, value: boolean) => Promise<void>;
}

// Default mock data (fallback if API unavailable)
const defaultSensorData: SensorData = {
  temperature: 22,
  humidity: 65,
  soilMoisture: [2500, 2500, 2500, 2500],
  lightIntensity: [1500, 1500],
};

const defaultControls: Controls = {
  pump: false,
  growLight: true,
  fan1: false,
  fan2: false,
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  sensorData: defaultSensorData,
  controls: defaultControls,
  isConnected: false,
  apiAvailable: false,
  deviceId: 'ESP32_AGRON_01',

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
        
        set({ sensorData, isConnected: true, apiAvailable: true });
      }
    } catch (error) {
      console.warn('📡 API unavailable, using mock data:', error);
      set({ apiAvailable: false, isConnected: false });
      
      // Generate realistic mock data as fallback
      set((state) => ({
        sensorData: {
          temperature: 18 + Math.random() * 12,
          humidity: 40 + Math.random() * 40,
          soilMoisture: [
            1500 + Math.random() * 2000,
            1500 + Math.random() * 2000,
            1500 + Math.random() * 2000,
            1500 + Math.random() * 2000,
          ],
          lightIntensity: [
            500 + Math.random() * 2500,
            600 + Math.random() * 2400,
          ],
        },
      }));
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
}));

// Initialize data fetching on client side
if (typeof window !== 'undefined') {
  const store = useDashboardStore;
  
  // Fetch data immediately
  store.getState().fetchSensorData();
  
  // Set up polling (every 5 seconds)
  setInterval(() => {
    store.getState().fetchSensorData();
  }, 5000);
}
