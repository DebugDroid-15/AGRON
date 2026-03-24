/**
 * AGRON Control Commands API Endpoint
 * 
 * GET /api/controls?device_id=XXX - Get control commands for ESP32
 * PUT /api/controls - Update control state
 * 
 * Control states:
 * {
 *   "device_id": "ESP32_AGRON_01",
 *   "pump": true,
 *   "growLight": true,
 *   "fan1": false,
 *   "fan2": false
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateControlState,
  getControlState,
} from '@/lib/db/supabase-store';

// GET: Retrieve control commands for ESP32
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id');
    
    if (!deviceId) {
      return NextResponse.json(
        { error: 'device_id parameter required' },
        { status: 400 }
      );
    }
    
    const controlState = await getControlState(deviceId);
    
    if (!controlState) {
      // Return default OFF state if no commands set yet
      return NextResponse.json(
        {
          device_id: deviceId,
          pump: false,
          growLight: false,
          fan1: false,
          fan2: false,
          status: 'default',
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(controlState, { status: 200 });
  } catch (error) {
    console.error('❌ Control GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve controls' },
      { status: 500 }
    );
  }
}

// PUT: Update control state (from dashboard)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.device_id) {
      return NextResponse.json(
        { error: 'device_id required' },
        { status: 400 }
      );
    }
    
    const controlState = {
      pump: data.pump ?? false,
      growLight: data.growLight ?? false,
      fan1: data.fan1 ?? false,
      fan2: data.fan2 ?? false,
    };
    
    await updateControlState(data.device_id, controlState);
    
    console.log(`🎮 Control updated for ${data.device_id}:`, {
      pump: controlState.pump,
      growLight: controlState.growLight,
      fan1: controlState.fan1,
      fan2: controlState.fan2,
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Control state updated',
        device_id: data.device_id,
        ...controlState,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Control PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update controls' },
      { status: 500 }
    );
  }
}

// POST: Alternative for updating controls
export async function POST(request: NextRequest) {
  return PUT(request);
}
