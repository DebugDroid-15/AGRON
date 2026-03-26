# AGRON ESP32 Arduino Setup Guide

## Quick Start

### 1. Install Arduino IDE
- Download from: https://www.arduino.cc/en/software
- Install the latest version

### 2. Add ESP32 Board Support
1. Open Arduino IDE
2. Go to **File** → **Preferences**
3. Add this URL to "Additional Boards Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools** → **Board** → **Boards Manager**
5. Search for "esp32" and install latest version by Espressif Systems

### 3. Install Required Libraries
Open **Tools** → **Manage Libraries** and install:

```
1. DHT sensor library by Adafruit (v1.4.4+)
2. ArduinoJson by Benoit Blanchon (v6.21.0+)
3. ESP32 by Espressif Systems (v2.0.0+)
```

Or use the `libraries.txt` file:
- Copy library names from `libraries.txt`
- Search and install each in Library Manager

### 4. Configure WiFi Credentials

Edit `AGRON_ESP32_Main.ino`:

**Line 33-34:**
```cpp
const char* ssid = "YOUR_WIFI_SSID";           // ← Change this
const char* password = "YOUR_WIFI_PASSWORD";   // ← Change this
```

Replace with your WiFi network name and password.

### 5. Connect Hardware

#### ESP32 Pin Configuration:

| Component | ESP32 Pin | GPIO |
|-----------|-----------|------|
| DHT22 Data | GPIO 4 | Pin D4 |
| Soil Moisture 1 | GPIO 35 | ADC0 |
| Soil Moisture 2 | GPIO 34 | ADC1 |
| Soil Moisture 3 | GPIO 39 | ADC2 |
| Soil Moisture 4 | GPIO 36 | ADC3 |
| Light Intensity 1 | GPIO 32 | ADC4 |
| Light Intensity 2 | GPIO 33 | ADC5 |
| Relay Pump | GPIO 12 | Pin D12 |
| Relay Grow Light | GPIO 14 | Pin D14 |
| Relay Fan 1 | GPIO 27 | Pin D27 |
| Relay Fan 2 | GPIO 26 | Pin D26 |

#### Sensor Connections:

**DHT22:**
- VCC → 3.3V
- GND → GND
- DATA → GPIO 4

**Soil Moisture Sensors (Analog):**
- VCC → 5V or 3.3V
- GND → GND
- Signal → GPIO 35, 34, 39, 36 (analog input)

**Light Intensity Sensors (Analog):**
- VCC → 5V or 3.3V
- GND → GND
- Signal → GPIO 32, 33 (analog input)

**Relay Module:**
- VCC → 5V
- GND → GND
- IN1 (Pump) → GPIO 12
- IN2 (Grow Light) → GPIO 14
- IN3 (Fan 1) → GPIO 27
- IN4 (Fan 2) → GPIO 26

### 6. Upload Sketch

1. Connect ESP32 to computer via USB
2. Go to **Tools** → **Board** → Select "ESP32 Dev Module"
3. Go to **Tools** → **Port** → Select COM port
4. Click **Upload** button
5. Wait for compilation and upload to complete

### 7. Monitor Serial Output

1. After upload, open **Tools** → **Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   AGRON IoT Smart Agriculture System
   ESP32 Sensor & Control Module
   
   [WiFi] Connecting to: YOUR_WIFI_SSID
   [WiFi] ✓ Connected!
   [WiFi] IP Address: 192.168.x.x
   ```

### 8. Verify Data Flow

Watch the serial monitor for:
- ✓ WiFi connection status
- ✓ Sensor readings (Temperature, Humidity, Soil Moisture, Light)
- ✓ API POST requests (Data submitted successfully)
- ✓ Relay state updates

## Data Flow

```
ESP32 Sensors
    ↓
Read every 5 seconds
    ↓
POST to https://agron-tau.vercel.app/api/sensor-data
    ↓
Supabase Database
    ↓
Dashboard & Mobile App Display
    ↓
User toggles relay on app
    ↓
GET from https://agron-tau.vercel.app/api/controls
    ↓
ESP32 updates relay state
    ↓
Physical relay activates (Pump/Light/Fan)
```

## Serial Monitor Output Example

```
╔════════════════════════════════════════════════════════╗
║        AGRON IoT Smart Agriculture System              ║
║           ESP32 Sensor & Control Module                ║
╚════════════════════════════════════════════════════════╝

[SETUP] Initializing DHT22 sensor...
[SETUP] Initializing relay control pins...
[SETUP] Initializing analog sensors...
[SETUP] Connecting to WiFi...
[WiFi] Connecting to: MyHomeNetwork
...
[WiFi] ✓ Connected!
[WiFi] IP Address: 192.168.1.100
[WiFi] Signal Strength: -45 dBm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SENSORS] Reading all sensors...
[DHT22] 🌡️  Temperature: 24.5°C | 💧 Humidity: 65%
[SOIL] 🌾 Soil Moisture: S1=2048 | S2=2150 | S3=1950 | S4=2100
[LIGHT] ☀️  Light Intensity: L1=2500 | L2=2400
[WiFi] Signal: -45 dBm

[API] 📤 Posting sensor data to: https://agron-tau.vercel.app/api/sensor-data
[API] JSON: {"device_id":"ESP32_AGRON_01","timestamp":1698765432,...}
[API] ✓ Data submitted successfully (200 OK)

[RELAY] 💧 Pump: ON
[RELAY] 💡 Grow Light: OFF
```

## Troubleshooting

### WiFi Connection Failed
- Check SSID and password are correct
- Verify WiFi is broadcasting (not hidden)
- Move ESP32 closer to router
- Check WiFi supports 2.4GHz (ESP32 doesn't support 5GHz)

### DHT Sensor Reading Fails
- Check sensor wiring (VCC, GND, DATA)
- Ensure 10kΩ pull-up resistor on DATA pin (optional but recommended)
- Replace sensor if faulty

### API POST Fails (HTTP Error)
- Check Vercel deployment is running: https://agron-tau.vercel.app
- Verify internet connection
- Check firewall/proxy not blocking HTTPS
- Monitor endpoint: https://agron-tau.vercel.app/api/sensor-data (should return data)

### Relay Not Activating
- Check relay module wiring
- Verify relay VCC has sufficient power (some relays need 5V, not 3.3V)
- Test relay manually with jumper wire
- Check GPIO output with multimeter

### Serial Monitor Shows Only Gibberish
- Check baud rate is set to **115200**
- For older Arduino versions, try 9600 baud and modify sketch Line 109

## API Endpoints Used

**POST Sensor Data:**
```
Method: POST
URL: https://agron-tau.vercel.app/api/sensor-data
Content-Type: application/json
Body: {
  "device_id": "ESP32_AGRON_01",
  "timestamp": 1698765432,
  "temperature": 24.5,
  "humidity": 65.0,
  "soil_moisture": [2048, 2150, 1950, 2100],
  "light_intensity": [2500, 2400],
  "signal_strength": -45
}
```

**GET Control State:**
```
Method: GET
URL: https://agron-tau.vercel.app/api/controls?device_id=ESP32_AGRON_01
Response: {
  "pump": false,
  "growLight": false,
  "fan1": false,
  "fan2": false
}
```

## Next Steps

1. Upload sketch to ESP32
2. Verify data appears in dashboard: https://agron-tau.vercel.app/dashboard
3. Go to Sensors tab → should show real temperature, humidity values
4. Try toggling relays in Controls tab → watch ESP32 serial output
5. Check Analytics tab → historical data will populate over time

## Support

- Arduino ESP32 Docs: https://docs.espressif.com/projects/arduino-esp32/
- DHT Library: https://github.com/adafruit/DHT-sensor-library
- ArduinoJson: https://arduinojson.org/
- Vercel API Status: https://agron-tau.vercel.app/api/sensor-data
