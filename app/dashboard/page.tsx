'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Overview from '@/components/dashboard/Overview';
import Sensors from '@/components/dashboard/Sensors';
import Controls from '@/components/dashboard/Controls';
import Analytics from '@/components/dashboard/Analytics';
import Settings from '@/components/dashboard/Settings';
import { useDashboardStore } from '@/store/dashboard';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'sensors':
        return <Sensors />;
      case 'controls':
        return <Controls />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-neon-blue border-opacity-20 bg-dark-bg bg-opacity-80 backdrop-blur-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-neon-blue hover:text-neon-green transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="hidden md:block text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            AGRON Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Real-time Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
