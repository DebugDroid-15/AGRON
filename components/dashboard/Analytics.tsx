'use client';

import React from 'react';
import { useDashboardStore } from '@/store/dashboard';

export default function Analytics() {
  const { apiAvailable } = useDashboardStore();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
        Advanced Analytics
      </h2>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-12 rounded-xl border border-neon-blue border-opacity-20 bg-dark-bg bg-opacity-50 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-neon-blue border-opacity-50 flex items-center justify-center">
              <div className="text-neon-blue text-3xl">📊</div>
            </div>
            <h3 className="text-lg font-semibold text-neon-blue mb-2">Historical Data</h3>
            <p className="text-gray-400 mb-4">
              {apiAvailable 
                ? 'Charts will populate as real ESP32 data is collected over time'
                : 'Waiting for ESP32 to connect and send real sensor data...'}
            </p>
            <p className="text-xs text-gray-500">
              Once the ESP32 is connected, historical trends will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
