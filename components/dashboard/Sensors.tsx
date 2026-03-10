'use client';

import React from 'react';
import { Cloud, Droplet, Leaf, Sun } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';

export default function Sensors() {
  const { sensorData } = useDashboardStore();

  const sensors = [
    {
      name: 'Temperature (DHT22)',
      value: Math.round(sensorData.temperature * 10) / 10,
      unit: '°C',
      icon: <Cloud size={24} />,
      min: 10,
      max: 35,
    },
    {
      name: 'Humidity (DHT22)',
      value: Math.round(sensorData.humidity),
      unit: '%',
      icon: <Droplet size={24} />,
      min: 20,
      max: 90,
    },
    ...sensorData.soilMoisture.map((val, idx) => ({
      name: `Soil Moisture ${idx + 1}`,
      value: Math.round(val),
      unit: 'mV',
      icon: <Leaf size={24} />,
      min: 1000,
      max: 4000,
    })),
    ...sensorData.lightIntensity.map((val, idx) => ({
      name: `Light Sensor ${idx + 1}`,
      value: Math.round(val),
      unit: 'lux',
      icon: <Sun size={24} />,
      min: 0,
      max: 3000,
    })),
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
        Sensor Monitoring
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sensors.map((sensor, idx) => {
          const percentage = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
          const progress = Math.max(0, Math.min(100, percentage));

          return (
            <div
              key={idx}
              className="p-6 rounded-xl border border-neon-blue border-opacity-20 hover:border-opacity-50 bg-dark-bg bg-opacity-50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-neon-blue">{sensor.icon}</div>
                  <div>
                    <p className="font-semibold text-white">{sensor.name}</p>
                    <p className="text-sm text-gray-400">Live Data</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-neon-green">
                  {sensor.value} {sensor.unit}
                </p>
              </div>
              <div className="bg-dark-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{sensor.min}</span>
                <span>{sensor.max}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
