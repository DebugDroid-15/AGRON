'use client';

import React from 'react';
import { Cloud, Droplet, Leaf, Sun, Activity, TrendingDown, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';

interface SoilMoistureParams {
  rawValue: number;
  percentage: number;
  vwc: number;
  status: string;
  statusColor: string;
  irrigationNeeded: boolean;
}

function calculateSoilMoistureParams(rawValue: number): SoilMoistureParams {
  // Calibration range for soil moisture sensor (in mV)
  const DRY_VALUE = 4095;    // Analog reading in dry soil (~4095 mV)
  const WET_VALUE = 2047;    // Analog reading in wet soil (~2047 mV)
  
  // Convert to percentage (0% = dry, 100% = wet)
  const percentage = Math.max(0, Math.min(100, ((DRY_VALUE - rawValue) / (DRY_VALUE - WET_VALUE)) * 100));
  
  // Calculate Volumetric Water Content (VWC) - typical range 0-60%
  const vwc = (percentage * 0.6);
  
  // Determine irrigation status based on percentage
  let status = 'Normal';
  let statusColor = 'text-neon-green';
  let irrigationNeeded = false;
  
  if (percentage < 30) {
    status = 'Dry - Urgent';
    statusColor = 'text-red-500';
    irrigationNeeded = true;
  } else if (percentage < 50) {
    status = 'Dry - Water Needed';
    statusColor = 'text-orange-400';
    irrigationNeeded = true;
  } else if (percentage < 70) {
    status = 'Normal';
    statusColor = 'text-neon-green';
  } else {
    status = 'Wet - Good';
    statusColor = 'text-neon-blue';
  }
  
  return {
    rawValue,
    percentage: Math.round(percentage * 10) / 10,
    vwc: Math.round(vwc * 10) / 10,
    status,
    statusColor,
    irrigationNeeded,
  };
}

export default function Overview() {
  const { sensorData } = useDashboardStore();
  
  // Calculate parameters for all soil moisture sensors
  const soilParams = sensorData.soilMoisture.map(value => calculateSoilMoistureParams(value));
  const avgSoilMoisture = Math.round((soilParams.reduce((sum, p) => sum + p.percentage, 0) / soilParams.length) * 10) / 10;
  const avgVWC = Math.round((soilParams.reduce((sum, p) => sum + p.vwc, 0) / soilParams.length) * 10) / 10;

  const metrics = [
    {
      icon: <Cloud size={28} />,
      label: 'Temperature',
      value: Math.round(sensorData.temperature * 10) / 10,
      unit: '°C',
      color: 'text-neon-blue',
    },
    {
      icon: <Droplet size={28} />,
      label: 'Humidity',
      value: Math.round(sensorData.humidity),
      unit: '%',
      color: 'text-neon-green',
    },
    {
      icon: <Leaf size={28} />,
      label: 'Soil Moisture (Avg)',
      value: avgSoilMoisture,
      unit: '%',
      color: 'text-neon-pink',
    },
    {
      icon: <Sun size={28} />,
      label: 'Light Intensity',
      value: Math.round(sensorData.lightIntensity[0]),
      unit: 'lux',
      color: 'text-yellow-400',
    },
    {
      icon: <Activity size={28} />,
      label: 'System Health',
      value: '98',
      unit: '%',
      color: 'text-neon-green',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
        System Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border border-neon-blue border-opacity-20 hover:border-opacity-50 bg-dark-bg bg-opacity-50 backdrop-blur-sm transition-all hover:shadow-neon-blue"
          >
            <div className={`${metric.color} mb-3`}>{metric.icon}</div>
            <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
            <p className="text-2xl font-bold">
              {metric.value}
              <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Soil Moisture Parameters Section */}
      <div className="p-8 rounded-xl border border-neon-green border-opacity-20 bg-dark-bg bg-opacity-50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-neon-green mb-6 flex items-center gap-2">
          <Leaf size={20} /> Soil Moisture Parameters Analysis
        </h3>
        
        {/* Average Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-neon-green border-opacity-20">
          <div className="bg-dark-secondary bg-opacity-50 p-4 rounded-lg border border-neon-green border-opacity-10">
            <p className="text-gray-400 text-sm mb-2">Average Moisture %</p>
            <p className="text-3xl font-bold text-neon-green">{avgSoilMoisture}%</p>
            <p className="text-xs text-gray-500 mt-1">Across all sensors</p>
          </div>
          <div className="bg-dark-secondary bg-opacity-50 p-4 rounded-lg border border-neon-blue border-opacity-10">
            <p className="text-gray-400 text-sm mb-2">Avg VWC</p>
            <p className="text-3xl font-bold text-neon-blue">{avgVWC}%</p>
            <p className="text-xs text-gray-500 mt-1">Volumetric Water Content</p>
          </div>
          <div className="bg-dark-secondary bg-opacity-50 p-4 rounded-lg border border-neon-pink border-opacity-10">
            <p className="text-gray-400 text-sm mb-2">Irrigation Status</p>
            <p className="text-2xl font-bold text-neon-pink">
              {soilParams.some(p => p.irrigationNeeded) ? '⚠ Alert' : '✓ OK'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Watering required</p>
          </div>
          <div className="bg-dark-secondary bg-opacity-50 p-4 rounded-lg border border-yellow-400 border-opacity-10">
            <p className="text-gray-400 text-sm mb-2">Sensor Count</p>
            <p className="text-3xl font-bold text-yellow-400">{sensorData.soilMoisture.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active sensors</p>
          </div>
        </div>

        {/* Individual Sensor Details */}
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Individual Sensor Readings</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {soilParams.map((param, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-lg border transition-all ${
                param.irrigationNeeded
                  ? 'border-orange-500 border-opacity-50 bg-orange-500 bg-opacity-5'
                  : 'border-neon-green border-opacity-30 bg-neon-green bg-opacity-5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-white">Sensor {idx + 1}</h5>
                <div className="flex items-center gap-2">
                  {param.irrigationNeeded && (
                    <AlertCircle size={18} className="text-orange-400" />
                  )}
                  <span className={`text-sm font-bold ${param.statusColor}`}>
                    {param.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Raw ADC Value</span>
                  <span className="text-neon-blue font-mono">{Math.round(param.rawValue)} mV</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Moisture %</span>
                  <span className="text-neon-green font-semibold">{param.percentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">VWC</span>
                  <span className="text-yellow-400 font-semibold">{param.vwc}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="bg-dark-secondary rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        param.percentage < 30
                          ? 'bg-gradient-to-r from-red-500 to-orange-500'
                          : param.percentage < 50
                          ? 'bg-gradient-to-r from-orange-400 to-yellow-400'
                          : param.percentage < 70
                          ? 'bg-gradient-to-r from-neon-green to-neon-blue'
                          : 'bg-gradient-to-r from-neon-blue to-neon-green'
                      }`}
                      style={{ width: `${param.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Dry (0%)</span>
                    <span>Wet (100%)</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="p-8 rounded-xl border border-neon-blue border-opacity-20 bg-dark-bg bg-opacity-50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-neon-blue mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Connection</span>
            <span className="text-neon-green">● Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Data Sync</span>
            <span className="text-neon-green">● Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Storage</span>
            <span className="text-neon-blue">2.4 GB / 4 GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
