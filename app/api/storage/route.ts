import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase-store';

/**
 * GET /api/storage
 * Returns current Supabase database storage usage
 */
export async function GET() {
  try {
    // Get total rows and size from sensor_readings table
    const { count: readingsCount, error: readingsError } = await supabase
      .from('sensor_readings')
      .select('*', { count: 'exact', head: true });

    if (readingsError) throw readingsError;

    // Get count from device_controls
    const { count: controlsCount, error: controlsError } = await supabase
      .from('device_controls')
      .select('*', { count: 'exact', head: true });

    if (controlsError) throw controlsError;

    // Get count from alerts
    const { count: alertsCount, error: alertsError } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true });

    if (alertsError) throw alertsError;

    // Get count from device_settings
    const { count: settingsCount, error: settingsError } = await supabase
      .from('device_settings')
      .select('*', { count: 'exact', head: true });

    if (settingsError) throw settingsError;

    // Estimate storage usage (rough calculation)
    // Average sensor reading: ~500 bytes
    // Average control record: ~200 bytes
    // Average alert: ~300 bytes
    // Average setting: ~400 bytes
    const estimatedSensorSize = (readingsCount || 0) * 500; // bytes
    const estimatedControlsSize = (controlsCount || 0) * 200;
    const estimatedAlertsSize = (alertsCount || 0) * 300;
    const estimatedSettingsSize = (settingsCount || 0) * 400;

    const totalBytes = estimatedSensorSize + estimatedControlsSize + estimatedAlertsSize + estimatedSettingsSize;
    const totalKB = totalBytes / 1024;
    const totalMB = totalKB / 1024;
    const totalGB = totalMB / 1024;

    // Supabase free tier has 500 MB limit
    const quotaGB = 0.5; // 500 MB in GB
    const usagePercent = (totalGB / quotaGB) * 100;

    return NextResponse.json({
      used: {
        bytes: totalBytes,
        kb: Math.round(totalKB * 100) / 100,
        mb: Math.round(totalMB * 100) / 100,
        gb: Math.round(totalGB * 10000) / 10000,
      },
      quota: {
        mb: 500,
        gb: quotaGB,
      },
      usage: {
        percent: Math.min(100, Math.round(usagePercent * 10) / 10),
      },
      breakdown: {
        readings: readingsCount || 0,
        controls: controlsCount || 0,
        alerts: alertsCount || 0,
        settings: settingsCount || 0,
      },
      status: totalGB > quotaGB * 0.9 ? 'warning' : 'healthy',
    });
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch storage information',
        used: { bytes: 0, kb: 0, mb: 0, gb: 0 },
        quota: { mb: 500, gb: 0.5 },
        usage: { percent: 0 },
        breakdown: { readings: 0, controls: 0, alerts: 0, settings: 0 },
        status: 'unknown',
      },
      { status: 200 }
    );
  }
}
