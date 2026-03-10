'use client';

import React from 'react';
import { Download, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
        System Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-xl border border-neon-blue border-opacity-20 bg-dark-bg bg-opacity-50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SettingsIcon size={20} /> General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">System Name</label>
              <input
                type="text"
                defaultValue="AGRON Farm 01"
                className="w-full bg-dark-secondary border border-neon-blue border-opacity-20 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Data Refresh Rate</label>
              <select className="w-full bg-dark-secondary border border-neon-blue border-opacity-20 rounded-lg px-4 py-2 text-white">
                <option>Every 5 seconds</option>
                <option>Every 10 seconds</option>
                <option>Every 30 seconds</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-xl border border-neon-blue border-opacity-20 bg-dark-bg bg-opacity-50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Download size={20} /> Data Management
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-neon-blue text-dark-bg py-2 rounded-lg font-semibold hover:shadow-neon-blue transition-all">
              Export CSV
            </button>
            <button className="w-full border border-neon-blue text-neon-blue py-2 rounded-lg font-semibold hover:bg-neon-blue hover:bg-opacity-10 transition-all">
              Clear Cache
            </button>
            <button className="w-full border border-red-500 text-red-400 py-2 rounded-lg font-semibold hover:bg-red-500 hover:bg-opacity-10 transition-all">
              Reset System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
