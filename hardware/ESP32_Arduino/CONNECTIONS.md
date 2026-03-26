# AGRON ESP32 Hardware Connections

## GPIO Pin Configuration

```
┌─────────────────────────────────────────────────────────┐
│                  ESP32 PINOUT                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  3V3 ──────────────────────────────────────────── GND   │
│  EN                                               D23   │
│  VP  ▅▅▅▅▅ ESP32 DEVKIT V1 ▅▅▅▅▅ D22 (SDA)           │
│  VN                                               D21   │
│  D34 📊 (ADC1) ← LIGHT 2                          RX0   │
│  D35 📊 (ADC0) ← LIGHT 1                          TX0   │
│  D32 📊 (ADC4) ← LIGHT 1 ALT                      D19   │
│  D33 📊 (ADC5) ← LIGHT 2 ALT                      D18   │
│  D25 🔊                                            D5    │
│  D26 🔴 RELAY 4 (Fan 2)                           D17   │
│  D27 🔴 RELAY 3 (Fan 1)                           D16   │
│  D14 🔴 RELAY 2 (Grow Light)                      D4 🌡️ DHT22
│  D12 🔴 RELAY 1 (Pump)                            D2    │
│  D13                                               D15   │
│  GND ──                                            D0    │
│  VIN ──                                            GND   │
│  5V  ──                                            3V3   │
│                                                         │
└─────────────────────────────────────────────────────────┘

Legend:
  🌡️  = Temperature/Humidity (DHT22)
  📊 = Analog ADC Input (Sensors)
  🔴 = Digital Output (Relays)
```

## Complete Connection Table

| Component | Pin | GPIO | Type | Function |
|-----------|-----|------|------|----------|
| **Sensors** |
| DHT22 Data | D4 | GPIO 4 | Digital Input | Temp & Humidity |
| Soil Moisture 1 | D35 | GPIO 35 | ADC0 (Analog In) | Soil Sensor 1 |
| Soil Moisture 2 | D34 | GPIO 34 | ADC1 (Analog In) | Soil Sensor 2 |
| Soil Moisture 3 | D39 | GPIO 39 | ADC2 (Analog In) | Soil Sensor 3 |
| Soil Moisture 4 | D36 | GPIO 36 | ADC3 (Analog In) | Soil Sensor 4 |
| Light Intensity 1 | D32 | GPIO 32 | ADC4 (Analog In) | Light Sensor 1 |
| Light Intensity 2 | D33 | GPIO 33 | ADC5 (Analog In) | Light Sensor 2 |
| **Relays** |
| Pump Relay | D12 | GPIO 12 | Digital Output | Water Pump Control |
| Grow Light Relay | D14 | GPIO 14 | Digital Output | Grow Panel Control |
| Fan 1 Relay | D27 | GPIO 27 | Digital Output | Ventilation Fan 1 |
| Fan 2 Relay | D26 | GPIO 26 | Digital Output | Ventilation Fan 2 |
| **Power** |
| 3.3V Out | 3V3 | - | Power Supply | Logic Level (3.3V) |
| 5V Out | 5V | - | Power Supply | Sensor/Relay Power |
| Ground | GND | - | Ground | Reference |

## Detailed Sensor Connections

### DHT22 (Temperature & Humidity)

```
     DATA (Pin 2)
      │
      ├─[10kΩ Pull-up]─── 3.3V
      │
    ESP32 GPIO4 (D4)
    
    DHT22 Pinout (front view):
    1: VCC (3.3V - 5.5V)
    2: DATA (to GPIO4)
    3: NC
    4: GND
    
Wiring:
    DHT22  →  ESP32
    Pin 1  →  5V (or 3.3V)
    Pin 2  →  GPIO 4 (D4) [with 10kΩ pull-up to 3.3V]
    Pin 4  →  GND
```

### Soil Moisture Sensors (×4)

```
Typical Moisture Sensor:
    VCC (5V or 3.3V) ─┐
    GND              ├─ Signal → ADC (Analog)
    Signal (Analog) ─┘
    
Sensor 1:
    VCC  → 5V
    GND  → GND
    SIG  → GPIO 35 (D35) / ADC0

Sensor 2:
    VCC  → 5V
    GND  → GND
    SIG  → GPIO 34 (D34) / ADC1

Sensor 3:
    VCC  → 5V
    GND  → GND
    SIG  → GPIO 39 (D39) / ADC2

Sensor 4:
    VCC  → 5V
    GND  → GND
    SIG  → GPIO 36 (D36) / ADC3
```

### Light Intensity Sensors (×2)

```
Typical LDR / Light Sensor:
    VCC (3.3V-5V) ─┐
    GND           ├─ Signal → ADC (Analog)
    Signal        ─┘
    
Sensor 1 (Main):
    VCC  → 5V
    GND  → GND
    SIG  → GPIO 32 (D32) / ADC4

Sensor 2 (Backup):
    VCC  → 5V
    GND  → GND
    SIG  → GPIO 33 (D33) / ADC5
```

### Relay Module (×4 Channel)

```
4-Channel Relay Module Connections:

Module Pin  →  Function     →  ESP32
────────────────────────────────────
VCC         → Power 5V      → 5V
GND         → Ground        → GND
IN1         → Relay 1 Ctrl  → GPIO 12 (D12)
IN2         → Relay 2 Ctrl  → GPIO 14 (D14)
IN3         → Relay 3 Ctrl  → GPIO 27 (D27)
IN4         → Relay 4 Ctrl  → GPIO 26 (D26)

Relay Outputs (Common Connections):

Relay 1 (Pump):
    NO  → Water Pump +12V
    COM → Power Supply +12V
    NC  → Not Connected

Relay 2 (Grow Light):
    NO  → LED Grow Panel +12V
    COM → Power Supply +12V
    NC  → Not Connected

Relay 3 (Fan 1):
    NO  → Fan Motor +12V
    COM → Power Supply +12V
    NC  → Not Connected

Relay 4 (Fan 2):
    NO  → Fan Motor +12V
    COM → Power Supply +12V
    NC  → Not Connected
```

## ADC (Analog-to-Digital Converter) Details

The ESP32 has 16 analog input channels. Our configuration uses:

```
ADC1 Channels (10-bit resolution, 0-3.3V → 0-4095):

GPIO 35 (ADC0)  ← Soil Moisture Sensor 1
GPIO 34 (ADC1)  ← Soil Moisture Sensor 2
GPIO 39 (ADC2)  ← Soil Moisture Sensor 3
GPIO 36 (ADC3)  ← Soil Moisture Sensor 4
GPIO 32 (ADC4)  ← Light Intensity Sensor 1
GPIO 33 (ADC5)  ← Light Intensity Sensor 2

ADC Voltage Mapping:
    0V    → ADC Value 0     → 0%
    1.65V → ADC Value 2048  → 50%
    3.3V  → ADC Value 4095  → 100%

Reading Formula:
    Voltage = (ADC_Value / 4095) × 3.3V
```

## Power Budget

```
Component                Power Supply  Current (approx)
─────────────────────────────────────────────────────
ESP32 Module             3.3V          500mA max
WiFi Peak                3.3V          200mA
DHT22 Sensor             3.3V          1mA
4× Soil Moisture         5V             4× 20mA = 80mA
2× Light Sensors         5V             2× 10mA = 20mA
4× Relay Module Control  5V             4× 50mA = 200mA
4× Relay Loads           12V            External supply
                               (pump, lights, fans)

Total 3.3V: ~500mA
Total 5V:   ~300mA
Total 12V:  External (controlled by relays)

Recommended Power Supply:
- USB Power Bank: 2A @ 5V (for development/testing)
- Industrial PSU: 3A @ 5V + 10A @ 12V (for production)
```

## Wiring Summary Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    POWER SUPPLIES                        │
│   USB 5V → ESP32   +   12V PSU → Relays & Load         │
└─────────────┬──────────────────────────┬────────────────┘
              │                          │
         ┌────▼────────────────────────────▼─────┐
         │  ESP32 DevKit V1 with I/O Shield      │
         │                                       │
         │  3V3 GPIO 4  → DHT22 (Temp/Humid)    │
         │  GND                                  │
         │                                       │
         │  GPIO 35,34,39,36 → Soil × 4 Sensors│
         │  GPIO 32,33       → Light × 2 Sensors │
         │                                       │
         │  GPIO 12,14,27,26 → Relay IN 1-4    │
         │  5V, GND → Relay VCC, GND            │
         └──────────┬─────────────────────────┘
                    │
         ┌──────────▼───────────┐
         │ 4-Channel Relay      │
         │ Module               │
         │ [IN1][IN2][IN3][IN4] │
         │                      │
         └────┬────┬────┬────┬──┘
              │    │    │    │
              ▼    ▼    ▼    ▼
            Pump Light Fan1 Fan2
```

## Testing Connections

```
Before uploading firmware, verify:

1. DHT22 Sensor:
   □ VCC → 3.3V
   □ GND → GND  
   □ DATA → GPIO 4 (D4)
   
2. Soil Moisture Sensors:
   □ All VCC → 5V (or breadboard power rail)
   □ All GND → GND (or breadboard ground)
   □ SIG1 → GPIO 35 (D35)
   □ SIG2 → GPIO 34 (D34)
   □ SIG3 → GPIO 39 (D39)
   □ SIG4 → GPIO 36 (D36)
   
3. Light Sensors:
   □ All VCC → 5V
   □ All GND → GND
   □ SIG1 → GPIO 32 (D32)
   □ SIG2 → GPIO 33 (D33)
   
4. Relay Module:
   □ VCC → 5V
   □ GND → GND
   □ IN1 → GPIO 12 (D12)
   □ IN2 → GPIO 14 (D14)
   □ IN3 → GPIO 27 (D27)
   □ IN4 → GPIO 26 (D26)
   
5. Power:
   □ ESP32 plugged into USB
   □ All power supplies connected
   □ No loose wires
   □ No shorts between VCC/GND
```

## Troubleshooting Connection Issues

| Problem | Check |
|---------|-------|
| ESP32 not recognized | USB cable (must be data cable, not charging-only) |
| DHT22 returns errors | Check pull-up resistor (10kΩ from DATA to 3.3V) |
| Analog readings always 0 | Check ADC pin connection, verify 3.3V on sensor |
| Analog readings always 4095 | Check GND connection, verify sensor output |
| Relay not switching | Check relay VCC is 5V (not 3.3V), verify GPIO output |
| WiFi signal very weak | Move antenna away from water sensors & cables |
