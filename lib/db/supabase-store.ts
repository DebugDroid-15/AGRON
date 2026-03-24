import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured. Using fallback mode.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// SENSOR DATA FUNCTIONS
// ============================================================================

export interface SoilMoistureData {
  raw: number
  percentage: number
  vwc: number
}

export interface SensorReading {
  id?: number
  device_id: string
  timestamp: number
  temperature: number
  humidity: number
  soil_moisture: SoilMoistureData[]
  light_intensity: number[]
  signal_strength: number
  received_at?: string
  created_at?: string
}

export interface ControlState {
  device_id: string
  pump: boolean
  growLight: boolean
  fan1: boolean
  fan2: boolean
  updated_at?: string
}

/**
 * Add a new sensor reading to Supabase
 */
export async function addSensorReading(data: SensorReading) {
  try {
    const { data: result, error } = await supabase
      .from('sensor_readings')
      .insert({
        device_id: data.device_id,
        timestamp: data.timestamp,
        temperature: data.temperature,
        humidity: data.humidity,
        soil_moisture: data.soil_moisture,
        light_intensity: data.light_intensity,
        signal_strength: data.signal_strength,
      })
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    console.log(`✓ Sensor reading stored for device: ${data.device_id}`)
    return result?.[0] || null
  } catch (error) {
    console.error('Error adding sensor reading:', error)
    throw error
  }
}

/**
 * Get the latest sensor reading for a specific device
 */
export async function getLatestSensorReading(deviceId: string) {
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is OK
      console.error('Supabase query error:', error)
      throw error
    }

    return data || null
  } catch (error) {
    console.error('Error fetching latest reading:', error)
    return null
  }
}

/**
 * Get all latest readings from all devices
 */
export async function getAllLatestReadings() {
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('device_id', { ascending: true })
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Get latest reading per device
    const latestByDevice: { [key: string]: SensorReading } = {}
    data?.forEach((reading) => {
      if (!latestByDevice[reading.device_id]) {
        latestByDevice[reading.device_id] = reading
      }
    })

    return Object.values(latestByDevice)
  } catch (error) {
    console.error('Error fetching all latest readings:', error)
    return []
  }
}

/**
 * Get historical sensor data for a device
 */
export async function getSensorHistory(deviceId: string, limit: number = 100) {
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching history:', error)
    return []
  }
}

// ============================================================================
// CONTROL STATE FUNCTIONS
// ============================================================================

/**
 * Update control state for a device
 */
export async function updateControlState(deviceId: string, state: Omit<ControlState, 'device_id' | 'updated_at'>) {
  try {
    // Try to update existing record, insert if not exists
    const { data: existing, error: fetchError } = await supabase
      .from('device_controls')
      .select('*')
      .eq('device_id', deviceId)
      .limit(1)
      .single()

    let result
    let error

    if (existing) {
      // Update existing
      const updateResponse = await supabase
        .from('device_controls')
        .update({
          pump: state.pump,
          growLight: state.growLight,
          fan1: state.fan1,
          fan2: state.fan2,
        })
        .eq('device_id', deviceId)
        .select()

      result = updateResponse.data
      error = updateResponse.error
    } else {
      // Insert new
      const insertResponse = await supabase
        .from('device_controls')
        .insert({
          device_id: deviceId,
          pump: state.pump,
          growLight: state.growLight,
          fan1: state.fan1,
          fan2: state.fan2,
        })
        .select()

      result = insertResponse.data
      error = insertResponse.error
    }

    if (error) {
      console.error('Supabase control update error:', error)
      throw error
    }

    console.log(`✓ Control state updated for device: ${deviceId}`)
    return result?.[0] || null
  } catch (error) {
    console.error('Error updating control state:', error)
    throw error
  }
}

/**
 * Get the current control state for a device
 */
export async function getControlState(deviceId: string): Promise<ControlState> {
  try {
    const { data, error } = await supabase
      .from('device_controls')
      .select('*')
      .eq('device_id', deviceId)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet, return defaults
      console.warn('Could not fetch control state:', error)
    }

    if (data) {
      return {
        device_id: deviceId,
        pump: data.pump || false,
        growLight: data.growLight || false,
        fan1: data.fan1 || false,
        fan2: data.fan2 || false,
      }
    }

    // Return default state if device not found
    return {
      device_id: deviceId,
      pump: false,
      growLight: false,
      fan1: false,
      fan2: false,
    }
  } catch (error) {
    console.error('Error fetching control state:', error)
    // Return default state on error
    return {
      device_id: deviceId,
      pump: false,
      growLight: false,
      fan1: false,
      fan2: false,
    }
  }
}

export function getStorageStats() {
  return {
    backend: 'Supabase PostgreSQL',
    url: supabaseUrl?.slice(0, 30) + '...' || 'not configured',
    status: supabaseUrl && supabaseKey ? 'connected' : 'disconnected',
  }
}
