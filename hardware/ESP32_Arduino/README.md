# AGRON IoT Smart Agriculture - Hardware Folder

Complete ESP32 firmware and documentation for the AGRON smart agriculture system.

## 📁 Files in This Folder

### `AGRON_ESP32_Main.ino`
Complete Arduino sketch for ESP32 with:
- **Sensor Reading**: DHT22, 4× soil moisture, 2× light intensity
- **WiFi Connectivity**: Auto-reconnect with signal monitoring
- **API Integration**: POST sensor data to `/api/sensor-data` every 5 seconds
- **Relay Control**: 4× GPIO outputs for pump, grow light, and fans
- **JSON Communication**: Using ArduinoJson library
- **Serial Debugging**: Comprehensive logging with status indicators

### `ARDUINO_SETUP_GUIDE.md`
Step-by-step setup instructions:
- Arduino IDE installation
- ESP32 board support setup
- Library installation (DHT, ArduinoJson)
- WiFi credential configuration
- Hardware connections
- Serial monitor verification
- Data flow explanation
- Troubleshooting guide

### `CONNECTIONS.md`
Detailed hardware wiring documentation:
- Complete GPIO pin configuration
- Sensor connections (DHT22, soil moisture, light)
- Relay module wiring
- ADC (analog input) details
- Power budget calculations
- ASCII pin diagrams
- Connection verification checklist

### `REQUIRED_LIBRARIES.txt`
List of Arduino libraries needed:
- DHT sensor library by Adafruit (v1.4.4+)
- ArduinoJson by Benoit Blanchon (v6.21.0+)
- ESP32 Board Support by Espressif Systems (v2.0.0+)

## 🚀 Quick Start

1. **Read** `ARDUINO_SETUP_GUIDE.md`
2. **Install** libraries from `REQUIRED_LIBRARIES.txt`
3. **Connect** sensors according to `CONNECTIONS.md`
4. **Configure** WiFi in `AGRON_ESP32_Main.ino` (lines 33-34)
5. **Upload** sketch to ESP32
6. **Monitor** Serial output at 115200 baud

## 📊 System Architecture

```
ESP32 Hardware
    ├── Sensors (read every 5 seconds)
    │   ├── DHT22: Temperature & Humidity
    │   ├── 4× Soil Moisture: GPIO 35, 34, 39, 36 (ADC)
    │   └── 2× Light Intensity: GPIO 32, 33 (ADC)
    │
    ├── WiFi Connectivity
    │   └── Auto-reconnect with signal monitoring
    │
    ├── API Communication
    │   ├── POST → /api/sensor-data (sensor readings)
    │   └── GET → /api/controls (relay commands)
    │
    └── Relay Control (GPIO outputs)
        ├── GPIO 12: Water Pump
        ├── GPIO 14: Grow Light
        ├── GPIO 27: Ventilation Fan 1
        └── GPIO 26: Ventilation Fan 2

↓ ↓ ↓

Vercel API (https://agron-tau.vercel.app)
    ├── POST /api/sensor-data → Supabase PostgreSQL
    └── GET /api/controls ← Supabase PostgreSQL

↓ ↓ ↓

Web Dashboard & Mobile App
    ├── Display real-time sensor values
    ├── Toggle relays
    └── View analytics & history
```

## 🔌 Hardware Specifications

| Component | Quantity | Voltage | Notes |
|-----------|----------|---------|-------|
| ESP32 DevKit V1 | 1 | 3.3V (USB powered) | Main microcontroller |
| DHT22 | 1 | 3.3V-5V | Temperature & humidity |
| Capacitive Soil Moisture | 4 | 3.3V-5V | Analog input sensors |
| Light Intensity (LDR) | 2 | 3.3V-5V | Analog input sensors |
| 4-Channel Relay Module | 1 | 5V control, 12V load | GPIO controlled |
| Water Pump | 1 | 12V DC | Relay 1 |
| LED Grow Panel | 1 | 12V DC | Relay 2 |
| Ventilation Fans | 2 | 12V DC | Relay 3 & 4 |
| USB Power Bank | 1 | 5V / 2A | ESP32 power |
| 12V Power Supply | 1 | 12V / 10A | Relay loads |

## 📡 API Endpoints

### POST `/api/sensor-data`
Send sensor readings to Supabase database every 5 seconds:
```json
{
  "device_id": "ESP32_AGRON_01",
  "timestamp": 1698765432,
  "temperature": 24.5,
  "humidity": 65.0,
  "soil_moisture": [2048, 2150, 1950, 2100],
  "light_intensity": [2500, 2400],
  "signal_strength": -45
}
```

### GET `/api/controls?device_id=ESP32_AGRON_01`
Fetch relay states from Supabase every 5 seconds:
```json
{
  "pump": false,
  "growLight": false,
  "fan1": false,
  "fan2": false
}
```

## ⚙️ Configuration

### WiFi Credentials
Edit `AGRON_ESP32_Main.ino` lines 33-34:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

### API Endpoint
Default: `https://agron-tau.vercel.app`
Change line 35 if using different deployment:
```cpp
const char* api_base_url = "https://your-vercel-deployment.vercel.app";
```

### Device ID
Default: `ESP32_AGRON_01`
Matches web/mobile app default, unique per ESP32:
```cpp
const char* device_id = "ESP32_AGRON_01";
```

## 📝 Installation Steps

### Step 1: Prepare Arduino IDE
- Install Arduino IDE 1.8.19 or later
- Add ESP32 Boards Manager URL
- Install ESP32 board support (Tools → Boards Manager)

### Step 2: Install Libraries
- Tools → Manage Libraries
- Install "DHT sensor library" by Adafruit
- Install "ArduinoJson" by Benoit Blanchon

### Step 3: Hardware Assembly
- Connect DHT22 to GPIO 4 with 10kΩ pull-up
- Connect 4 soil moisture sensors to GPIO 35, 34, 39, 36
- Connect 2 light sensors to GPIO 32, 33
- Connect relay module to GPIO 12, 14, 27, 26
- Power: USB to ESP32, 5V to relay module, 12V to loads

### Step 4: Configure & Upload
- Edit WiFi credentials in sketch (lines 33-34)
- Connect ESP32 via USB
- Select Board: "ESP32 Dev Module"
- Select Port: COM port where ESP32 is connected
- Click Upload (Ctrl+U)

### Step 5: Verify Operation
- Open Serial Monitor (Tools → Serial Monitor)
- Set baud rate to 115200
- See "WiFi ✓ Connected!" message
- Watch sensor readings appear every 5 seconds
- Verify "✓ Data submitted successfully" for API posts

## 🔍 Serial Monitor Output Examples

**Successful WiFi Connection:**
```
[WiFi] Connecting to: MyHomeNetwork
...
[WiFi] ✓ Connected!
[WiFi] IP Address: 192.168.1.100
[WiFi] Signal Strength: -45 dBm
```

**Sensor Reading:**
```
[SENSORS] Reading all sensors...
[DHT22] 🌡️  Temperature: 24.5°C | 💧 Humidity: 65%
[SOIL] 🌾 Soil Moisture: S1=2048 | S2=2150 | S3=1950 | S4=2100
[LIGHT] ☀️  Light Intensity: L1=2500 | L2=2400
```

**API Post Successful:**
```
[API] 📤 Posting sensor data...
[API] ✓ Data submitted successfully (200 OK)
```

## 🛠️ Troubleshooting

### ESP32 Not Uploading
- Check USB cable (must support data transfer)
- Try different USB port
- Hold BOOT button while uploading

### DHT22 Showing Errors
- Verify 10kΩ pull-up resistor on DATA pin
- Check connections are secure
- Replace sensor if faulty

### WiFi Disconnects Frequently
- Move ESP32 closer to router
- Reduce interference (2.4GHz band)
- Check WiFi password is correct

### Relay Not Switching
- Verify relay module VCC is 5V (not 3.3V)
- Check GPIO output with multimeter
- Ensure relay load power supply is connected

### API Calls Failing (HTTP Error)
- Verify Vercel deployment is running
- Check internet connection
- Ensure HTTPS (not HTTP)
- Monitor firewall/proxy settings

## 📞 Support Resources

- **Arduino ESP32 Docs**: https://docs.espressif.com/projects/arduino-esp32/
- **DHT Library**: https://github.com/adafruit/DHT-sensor-library
- **ArduinoJson**: https://arduinojson.org/
- **Vercel API Status**: https://agron-tau.vercel.app/api/sensor-data

## 📄 License

This hardware firmware and documentation are part of the AGRON smart agriculture project.

---

**Next Steps After Upload:**
1. Check web dashboard: https://agron-tau.vercel.app/dashboard
2. Verify "Connected" status appears on sidebar (green dot)
3. Watch real sensor data populate in Overview tab
4. Toggle relays from Controls tab → verify ESP32 responds
5. Check Analytics tab as historical data accumulates over time
