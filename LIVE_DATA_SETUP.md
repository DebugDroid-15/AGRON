# 🔌 AGRON Complete Setup Guide - Live Data Integration

## 📋 Complete Workflow

This guide shows how to set up the entire AGRON system so that real ESP32 data flows to your Vercel dashboard.

---

## 🎯 System Architecture

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  ESP32 Device    │────────→│  Vercel Backend  │────────→│  Vercel Frontend │
│  (Field)         │  HTTPS  │  (API Routes)    │  JSON   │  (Dashboard)     │
│                  │   POST  │                  │         │                  │
│  - DHT22         │  /api/  │ - Memory Store   │  Fetch  │ - React          │
│  - Soil (4x)     │sensor   │ - Real-time Data │  every  │ - Zustand        │
│  - Light (2x)    │-data    │ - Control Logic  │  5 sec  │ - Charts         │
│  - Relays        │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

---

## 🚀 Step 1: Deploy Updated Dashboard to Vercel

Your API endpoints are now built in! Just push and redeploy.

```bash
cd c:\Downloads\agronwebdasb

# Commit all changes
git add .
git commit -m "feat: Add API endpoints for live sensor data and control commands"
git push origin main
```

**Vercel will automatically redeploy** your dashboard with the new API endpoints.

Wait for deployment to complete (2-3 minutes) → Check your Vercel dashboard for success.

---

## 🔌 Step 2: Get Your Vercel Domain

After deployment, your API is live at:

```
https://agron.vercel.app/api/sensor-data (GET/POST)
https://agron.vercel.app/api/controls (GET/PUT)
```

Or if you have a custom domain:
```
https://your-domain.com/api/sensor-data
https://your-domain.com/api/controls
```

---

## 📱 Step 3: Update Arduino Sketch

Edit `ESP32_AGRON_SENSOR.ino` and update these lines (~18-21):

**FIND:**
```cpp
const char* API_URL = "https://your-vercel-domain.vercel.app/api/sensor-data";
const char* API_CONTROL_URL = "https://your-vercel-domain.vercel.app/api/controls";
```

**REPLACE WITH:**
```cpp
const char* API_URL = "https://agron.vercel.app/api/sensor-data";
const char* API_CONTROL_URL = "https://agron.vercel.app/api/controls";
```

(Or use your custom domain)

---

## 📡 Step 4: Upload Arduino Sketch to ESP32

1. **Open Arduino IDE**
2. **Open** `ESP32_AGRON_SENSOR.ino`
3. **Install Libraries** (if not done):
   - Sketch → Include Library → Manage Libraries
   - Search: `DHT sensor library by Adafruit` → Install
   - Search: `ArduinoJson by Benoit Blanchon` → Install

4. **Configure WiFi** (lines 12-13):
   ```cpp
   const char* SSID = "YOUR_WIFI_NAME";
   const char* PASSWORD = "YOUR_PASSWORD";
   ```

5. **Upload**:
   - Board: ESP32 Dev Module
   - Port: COM3 (or your port)
   - Baud: 115200
   - Click Upload

6. **Monitor** (Tools → Serial Monitor):
   ```
   ✓ WiFi Connected Successfully!
   ✓ Data sent to API. Response: 200
   ```

---

## ✅ Step 5: Verify Live Data

### Dashboard:
1. Open: https://agron.vercel.app/dashboard
2. Check Overview tab
3. Real sensor data should appear (updating every 5 seconds)

### API Testing:
```bash
# Get latest data
curl https://agron.vercel.app/api/sensor-data

# Get control state
curl "https://agron.vercel.app/api/controls?device_id=ESP32_AGRON_01"

# Update control
curl -X PUT https://agron.vercel.app/api/controls \
  -H "Content-Type: application/json" \
  -d '{"device_id":"ESP32_AGRON_01","pump":true}'
```

---

## 🎮 Step 6: Test Control Commands

1. **Open Dashboard** → Controls tab
2. **Click** "Turn On" for Water Pump
3. **Check Serial Monitor** on ESP32:
   ```
   🎮 Control updated for ESP32_AGRON_01:
   pump: true
   ```
4. **Check Relay** - should activate!

---

## 📊 Live Data Flow

```
ESP32 (every 5 seconds):
  1. Read sensors
  2. POST to API with JSON data
  3. API stores data in memory
  4. Dashboard polls API
  5. Dashboard updates in real-time

Dashboard (every 5 seconds):
  1. GET /api/sensor-data
  2. Receives latest readings
  3. Updates charts & displays
  4. Shows within 5 seconds of ESP32 reading
```

---

## 🔧 API Endpoints Reference

### GET /api/sensor-data
**Get latest sensor readings**
```bash
curl https://agron.vercel.app/api/sensor-data

Response:
{
  "type": "all_latest",
  "readings": [
    {
      "device_id": "ESP32_AGRON_01",
      "timestamp": 12345,
      "temperature": 24.5,
      "humidity": 65.3,
      "soil_moisture": [...],
      "light_intensity": [1500, 1800],
      "signal_strength": -65,
      "received_at": "2026-03-24..."
    }
  ]
}
```

### POST /api/sensor-data
**ESP32 sends sensor data**
```json
{
  "device_id": "ESP32_AGRON_01",
  "timestamp": 12345,
  "temperature": 24.5,
  "humidity": 65.3,
  "soil_moisture": [
    {"raw": 3000, "percentage": 50, "vwc": 30},
    ...
  ],
  "light_intensity": [1500, 1800],
  "signal_strength": -65
}
```

### GET /api/controls?device_id=XXX
**ESP32 requests control commands**
```json
{
  "device_id": "ESP32_AGRON_01",
  "pump": true,
  "growLight": false,
  "fan1": false,
  "fan2": false
}
```

### PUT /api/controls
**Dashboard updates control state**
```json
{
  "device_id": "ESP32_AGRON_01",
  "pump": true,
  "growLight": false,
  "fan1": true,
  "fan2": false
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| ESP32 won't connect | Check WiFi SSID/password, verify signal strength |
| API returns 404 | Make sure Vercel domain is correct in sketch |
| Dashboard shows mock data | Check browser console for API errors |
| Controls don't work | Verify SSH/TLS is working (use HTTPS!) |
| No data appearing | Check ESP32 serial monitor for errors |

---

## 📈 What's Included in This Setup

✅ **Backend API** (in Next.js App Router):
- `app/api/sensor-data/route.ts` - Data endpoints
- `app/api/controls/route.ts` - Control endpoints
- `lib/db/memory-store.ts` - In-memory storage

✅ **Frontend Updates**:
- `store/dashboard.ts` - Real API integration
- `components/dashboard/Controls.tsx` - Control command sending

✅ **Hardware**:
- `ESP32_AGRON_SENSOR.ino` - Updated with Vercel URL

✅ **Deployment**:
- Everything runs on Vercel (frontend + backend)
- No additional server needed!

---

## 🔐 Security Notes

⚠️ **For Production**:
- Add API key authentication
- Use database instead of memory storage
- Implement rate limiting
- Add HTTPS/TLS validation
- Secure ESP32 credentials

Currently, the system is **open for testing**.

---

## 📚 Next Steps

1. **Historical Data**: Currently stores only latest, add database for history
2. **Multiple Devices**: System ready for multiple ESP32 units
3. **Alerts**: Add email/SMS notifications for thresholds
4. **Mobile App**: Build React Native app using same API
5. **Advanced Analytics**: Add ML for crop prediction

---

## 🎓 Learning Resources

- [Vercel Deployment](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/)
- [ArduinoJson Guide](https://arduinojson.org/)

---

**Your AGRON system is now fully integrated and ready for live data! 🌾🚀**

Last Updated: March 24, 2026
Version: 2.0.0 - API Integration Complete
