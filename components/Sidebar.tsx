'use client';

import React from 'react';
import {
  LayoutDashboard,
  Gauge,
  Zap,
  Cloud,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';

interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sensors', label: 'Sensors', icon: Gauge },
  { id: 'controls', label: 'Controls', icon: Zap },
  { id: 'environment', label: 'Environment', icon: Cloud },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const { isConnected, lastDataReceived } = useDashboardStore();
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-dark-bg border-r border-neon-blue border-opacity-20 p-6 overflow-y-auto transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 glass`}
      >
        <div className="flex items-center justify-between mb-8 md:mb-6">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            AGRON
          </h3>
          <button
            onClick={() => onToggle(false)}
            className="md:hidden text-neon-blue hover:text-neon-green"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onToggle(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-blue to-neon-green text-dark-bg shadow-neon-blue'
                    : 'text-gray-300 hover:bg-neon-blue hover:bg-opacity-10'
                }`}
              >
                <Icon size={20} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        {/* Status */}
        <div className="mt-12 pt-6 border-t border-neon-blue border-opacity-20">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">System Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isConnected 
                    ? 'bg-neon-green animate-pulse' 
                    : 'bg-gray-500'
                }`}></div>
                <span className={isConnected ? 'text-neon-green font-semibold' : 'text-gray-400'}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Last Update</span>
              <span className="text-neon-blue text-xs">
                {isConnected && lastDataReceived 
                  ? 'Just now'
                  : 'Waiting...'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
