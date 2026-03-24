/**
 * AGRON Sensor Data API Endpoint
 * 
 * POST /api/sensor-data - Receive sensor data from ESP32
 * GET /api/sensor-data - Retrieve latest sensor data for dashboard
 * 
 * Request format from ESP32:
 * {
 *   "device_id": "ESP32_AGRON_01",
 *   "timestamp": 12345,
 *   "temperature": 24.5,
 *   "humidity": 65.3,
 *   "soil_moisture": [...],
 *   "light_intensity": [1500, 1800],
 *   "signal_strength": -65
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  addSensorReading,
  getLatestSensorReading,
  getAllLatestReadings,
  getSensorHistory,
} from '@/lib/db/supabase-store';

// POST: Receive data from ESP32
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.device_id || data.temperature === undefined || data.humidity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create sensor reading record
    const reading = {
      device_id: data.device_id,
      timestamp: data.timestamp || Date.now(),
      temperature: parseFloat(data.temperature),
      humidity: parseFloat(data.humidity),
      soil_moisture: data.soil_moisture || [],
      light_intensity: data.light_intensity || [],
      signal_strength: data.signal_strength || 0,
      received_at: new Date().toISOString(),
    };
    
    // Store the reading in Supabase
    await addSensorReading(reading);
    
    // Log the data
    console.log(`📊 Data received from ${data.device_id}:`, {
      temperature: reading.temperature + '°C',
      humidity: reading.humidity + '%',
      soilMoisture: reading.soil_moisture.length + ' sensors',
      lightIntensity: reading.light_intensity.length + ' sensors',
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Data received successfully',
        device_id: data.device_id,
        received_at: reading.received_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// GET: Retrieve sensor data for dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id');
    const history = searchParams.get('history');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    let response;
    
    if (history === 'true' && deviceId) {
      // Return historical data for a specific device
      const readings = await getSensorHistory(deviceId, limit);
      response = {
        type: 'history',
        device_id: deviceId,
        readings: readings,
        count: readings.length,
      };
    } else if (deviceId) {
      // Return latest reading for a specific device
      const reading = await getLatestSensorReading(deviceId);
      if (!reading) {
        return NextResponse.json(
          { error: 'No data found for this device' },
          { status: 404 }
        );
      }
      response = {
        type: 'latest',
        device_id: deviceId,
        reading: reading,
      };
    } else {
      // Return all latest readings (for dashboard)
      const readings = await getAllLatestReadings();
      response = {
        type: 'all_latest',
        readings: readings,
        count: readings.length,
        timestamp: new Date().toISOString(),
      };
    }
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Get Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data' },
      { status: 500 }
    );
  }
}

// Health check
export async function HEAD(request: NextRequest) {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
