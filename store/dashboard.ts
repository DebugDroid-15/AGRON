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
  setSensorData: (data: SensorData) => void;
  setControls: (controls: Partial<Controls>) => void;
  toggleControl: (control: keyof Controls) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  sensorData: {
    temperature: 22,
    humidity: 65,
    soilMoisture: [2500, 2500, 2500, 2500],
    lightIntensity: [1500, 1500],
  },
  controls: {
    pump: false,
    growLight: true,
    fan1: false,
    fan2: false,
  },
  isConnected: true,
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
}));
