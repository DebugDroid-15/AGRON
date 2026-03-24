'use client';

import React, { useState } from 'react';
import { Droplet, Sun, Wind } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';

export default function Controls() {
  const { controls, updateControlState } = useDashboardStore();
  const [loading, setLoading] = useState<string | null>(null);

  const controlItems = [
    { id: 'pump', label: 'Water Pump', icon: <Droplet size={32} />, color: 'text-neon-blue' },
    { id: 'growLight', label: 'Grow Light', icon: <Sun size={32} />, color: 'text-neon-green' },
    { id: 'fan1', label: 'Fan 1', icon: <Wind size={32} />, color: 'text-neon-blue' },
    { id: 'fan2', label: 'Fan 2', icon: <Wind size={32} />, color: 'text-neon-green' },
  ];

  const handleToggle = async (controlId: string) => {
    setLoading(controlId);
    const control = controlId as keyof typeof controls;
    const newValue = !controls[control];
    
    await updateControlState(control, newValue);
    
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
        System Controls
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {controlItems.map((item) => {
          const isActive = controls[item.id as keyof typeof controls];
          const isLoading = loading === item.id;
          
          return (
            <div
              key={item.id}
              className="p-8 rounded-xl border border-neon-blue border-opacity-20 hover:border-opacity-50 bg-dark-bg bg-opacity-50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
                  <p className="text-sm text-gray-400">
                    {isActive ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <div className={`${item.color}`}>{item.icon}</div>
              </div>

              <button
                onClick={() => handleToggle(item.id)}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : isActive
                    ? 'bg-gradient-to-r from-neon-blue to-neon-green text-dark-bg shadow-neon-blue hover:shadow-lg'
                    : 'border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:bg-opacity-10'
                }`}
              >
                {isLoading ? 'Updating...' : isActive ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
