'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStore } from '@/store/dashboard';

export default function Analytics() {
  const { sensorData } = useDashboardStore();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        time: `${i}:00`,
        temperature: 20 + Math.sin(i * 0.26) * 5 + Math.random() * 2,
        humidity: 65 + Math.cos(i * 0.26) * 15 + Math.random() * 5,
        soilMoisture: 2500 + Math.sin(i * 0.26) * 700 + Math.random() * 300,
      });
    }
    setChartData(data);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
        Advanced Analytics
      </h2>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-xl border border-neon-blue border-opacity-20 bg-dark-bg bg-opacity-50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-neon-blue mb-4">Temperature & Humidity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.1)" />
              <XAxis stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(3,3,3,0.8)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#00D4FF"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#FF006E"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl border border-neon-blue border-opacity-20 bg-dark-bg bg-opacity-50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-neon-blue mb-4">Soil Moisture Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.1)" />
              <XAxis stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(3,3,3,0.8)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="soilMoisture"
                fill="rgba(0, 255, 156, 0.3)"
                stroke="#00FF9C"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
