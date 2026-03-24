/**
 * AGRON Smart Agriculture IoT System
 * ESP32 Sensor Data Collection & Control Unit
 * 
 * Version: 1.0.0
 * Date: March 2026
 * Author: AGRON Development Team
 * 
 * Features:
 * - DHT22 Temperature & Humidity sensing
 * - 4-Channel Soil Moisture monitoring with calibration
 * - 2-Channel Light Intensity sensing
 * - Relay control for pump, lights, and fans
 * - WiFi connectivity with auto-reconnect
 * - JSON data transmission to backend API
 * - Command reception for actuator control
 * - Serial debugging output
 * 
 * Required Libraries:
 * - DHT sensor library by Adafruit
 * - ArduinoJson by Benoit Blanchon
 * - AsyncTCP by me-no-dev
 * - ESPAsyncWebServer by me-no-dev
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"
#include <SPIFFS.h>
#include <time.h>

// ============================================================================
// CONFIGURATION - EDIT THESE BEFORE UPLOADING
// ============================================================================

// WiFi Configuration
const char* SSID = "YOUR_SSID";                          // WiFi network name
const char* PASSWORD = "YOUR_PASSWORD";                  // WiFi password

// API Configuration
// Replace with your actual Vercel domain
const char* API_URL = "https://your-vercel-domain.vercel.app/api/sensor-data";  // Backend API endpoint
const char* API_CONTROL_URL = "https://your-vercel-domain.vercel.app/api/controls";  // Control endpoint
const char* DEVICE_ID = "ESP32_AGRON_01";               // Unique device identifier

// Connection Settings
const int WIFI_TIMEOUT = 20000;                         // WiFi connection timeout (ms)
const int API_TIMEOUT = 10000;                          // API request timeout (ms)
const int SENSOR_UPDATE_INTERVAL = 5000;                // Sensor reading interval (ms)
const int API_SEND_INTERVAL = 5000;                     // API send interval (ms)
const int CONTROL_CHECK_INTERVAL = 5000;                // Control command check interval (ms)

// ============================================================================
// HARDWARE PIN CONFIGURATION
// ============================================================================

// DHT22 Sensor (Temperature & Humidity)
#define DHT_PIN 4
#define DHT_TYPE DHT22

// Soil Moisture Sensors (Analog inputs with ADC)
#define SOIL_MOISTURE_1 32      // GPIO32 - ADC4_4
#define SOIL_MOISTURE_2 33      // GPIO33 - ADC4_5
#define SOIL_MOISTURE_3 34      // GPIO34 - ADC6_6
#define SOIL_MOISTURE_4 35      // GPIO35 - ADC6_7

// Light Intensity Sensors (Analog inputs)
#define LIGHT_SENSOR_1 36       // GPIO36 - ADC4_0
#define LIGHT_SENSOR_2 37       // GPIO37 - ADC4_1

// Relay Control Pins (Digital outputs - HIGH = ON, LOW = OFF)
#define PUMP_RELAY 12           // GPIO12 - Water pump relay
#define LIGHT_RELAY 13          // GPIO13 - Grow light relay
#define FAN1_RELAY 14           // GPIO14 - Ventilation fan 1
#define FAN2_RELAY 15           // GPIO15 - Ventilation fan 2

// Status LED (Optional)
#define STATUS_LED 2            // GPIO2 - Onboard LED for WiFi status

// ============================================================================
// SENSOR CALIBRATION VALUES
// ============================================================================

// Soil Moisture Calibration
// These values depend on your specific sensor - adjust based on real-world testing
const int SOIL_DRY = 4095;      // ADC reading in completely dry soil
const int SOIL_WET = 2047;      // ADC reading in saturated soil
const float VWC_MAX = 60.0;     // Maximum VWC (Volumetric Water Content) percentage

// Light Sensor Calibration
const float LIGHT_CALIBRATION = 1.0;  // Adjust based on your sensor specs

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient wifiClient;

// Timing variables
unsigned long lastSensorUpdate = 0;
unsigned long lastAPISend = 0;
unsigned long lastControlCheck = 0;
unsigned long lastWiFiCheck = 0;

// Sensor data structure
struct SensorData {
  float temperature;
  float humidity;
  int soil_moisture[4];
  int light_intensity[2];
  unsigned long timestamp;
} currentSensorData;

// Control states
struct ControlStates {
  bool pump;
  bool growLight;
  bool fan1;
  bool fan2;
} controlStates = {false, false, false, false};

// System status
bool wifiConnected = false;
int wifiSignalStrength = 0;

// ============================================================================
// FUNCTION DECLARATIONS
// ============================================================================

void setup();
void loop();
void initializeWiFi();
void connectToWiFi();
void checkWiFiConnection();
void readSensors();
void readDHT22();
void readSoilMoisture();
void readLightIntensity();
float calculateVWC(int rawValue, int index);
void sendDataToAPI();
void checkControlCommands();
void updateRelayStates();
void digitalWrite_safe(int pin, int state);
void digitalWrite_safe_led();
void printSensorData();
void printDebug(const char* message);

// ============================================================================
// SETUP - RUNS ONCE ON STARTUP
// ============================================================================

void setup() {
  // Initialize Serial Communication
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n========================================");
  Serial.println("   AGRON ESP32 Sensor System v1.0.0");
  Serial.println("========================================\n");
  
  // Initialize SPIFFS for potential future use
  if (!SPIFFS.begin(true)) {
    Serial.println("ERROR: SPIFFS Mount Failed");
  } else {
    Serial.println("✓ SPIFFS Mounted Successfully");
  }
  
  // Set up relay pins as outputs (initial state OFF)
  pinMode(PUMP_RELAY, OUTPUT);
  digitalWrite(PUMP_RELAY, LOW);
  
  pinMode(LIGHT_RELAY, OUTPUT);
  digitalWrite(LIGHT_RELAY, LOW);
  
  pinMode(FAN1_RELAY, OUTPUT);
  digitalWrite(FAN1_RELAY, LOW);
  
  pinMode(FAN2_RELAY, OUTPUT);
  digitalWrite(FAN2_RELAY, LOW);
  
  // Status LED
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println("✓ Relay pins configured");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("✓ DHT22 sensor initialized");
  
  // Initialize WiFi
  initializeWiFi();
  
  // Synchronize time from NTP server (for accurate timestamps)
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("✓ NTP time sync initiated");
  
  Serial.println("\n========================================");
  Serial.println("   Setup Complete - Starting Main Loop");
  Serial.println("========================================\n");
  
  delay(1000);
}

// ============================================================================
// MAIN LOOP - RUNS CONTINUOUSLY
// ============================================================================

void loop() {
  // Check WiFi connection status
  checkWiFiConnection();
  
  // Read sensors at specified interval
  if (millis() - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    readSensors();
    printSensorData();
    lastSensorUpdate = millis();
  }
  
  // Send data to API at specified interval
  if (wifiConnected && (millis() - lastAPISend >= API_SEND_INTERVAL)) {
    sendDataToAPI();
    lastAPISend = millis();
  }
  
  // Check for control commands from dashboard
  if (wifiConnected && (millis() - lastControlCheck >= CONTROL_CHECK_INTERVAL)) {
    checkControlCommands();
    lastControlCheck = millis();
  }
  
  // Keep relay states updated
  updateRelayStates();
  
  delay(100);  // Small delay to prevent watchdog timeout
}

// ============================================================================
// WiFi FUNCTIONS
// ============================================================================

void initializeWiFi() {
  Serial.println("\n--- WiFi Initialization ---");
  Serial.print("Connecting to: ");
  Serial.println(SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.setHostname("AGRON-ESP32");
  
  connectToWiFi();
}

void connectToWiFi() {
  WiFi.begin(SSID, PASSWORD);
  
  unsigned long startTime = millis();
  int dotCount = 0;
  
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
    dotCount++;
    
    if (dotCount % 20 == 0) {
      Serial.print(" ");
    }
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    digitalWrite(STATUS_LED, HIGH);  // LED ON when connected
    
    Serial.println("✓ WiFi Connected Successfully!");
    Serial.print("  IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("  Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    wifiConnected = false;
    digitalWrite(STATUS_LED, LOW);
    Serial.println("✗ WiFi Connection Failed!");
    Serial.println("  Will retry in 30 seconds...");
  }
}

void checkWiFiConnection() {
  if (millis() - lastWiFiCheck >= 30000) {  // Check every 30 seconds
    lastWiFiCheck = millis();
    
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\n⚠ WiFi Disconnected - Attempting to reconnect...");
      wifiConnected = false;
      digitalWrite(STATUS_LED, LOW);
      connectToWiFi();
    } else {
      wifiConnected = true;
      digitalWrite(STATUS_LED, HIGH);
      wifiSignalStrength = WiFi.RSSI();
    }
  }
}

// ============================================================================
// SENSOR READING FUNCTIONS
// ============================================================================

void readSensors() {
  readDHT22();
  readSoilMoisture();
  readLightIntensity();
  
  // Update timestamp
  currentSensorData.timestamp = millis();
}

void readDHT22() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  // Check for DHT reading errors
  if (isnan(temp) || isnan(hum)) {
    Serial.println("⚠ DHT22 Error: Failed to read data");
    return;
  }
  
  currentSensorData.temperature = temp;
  currentSensorData.humidity = hum;
}

void readSoilMoisture() {
  // Read all 4 soil moisture sensors
  currentSensorData.soil_moisture[0] = analogRead(SOIL_MOISTURE_1);
  currentSensorData.soil_moisture[1] = analogRead(SOIL_MOISTURE_2);
  currentSensorData.soil_moisture[2] = analogRead(SOIL_MOISTURE_3);
  currentSensorData.soil_moisture[3] = analogRead(SOIL_MOISTURE_4);
}

void readLightIntensity() {
  // Read both light sensors
  currentSensorData.light_intensity[0] = analogRead(LIGHT_SENSOR_1);
  currentSensorData.light_intensity[1] = analogRead(LIGHT_SENSOR_2);
}

float calculateVWC(int rawValue, int index) {
  // Convert raw ADC value to moisture percentage
  float percentage = constrain(((float)(SOIL_DRY - rawValue) / (SOIL_DRY - SOIL_WET)), 0.0, 1.0) * 100.0;
  
  // Convert to VWC (Volumetric Water Content)
  float vwc = (percentage / 100.0) * VWC_MAX;
  
  return vwc;
}

// ============================================================================
// API COMMUNICATION FUNCTIONS
// ============================================================================

void sendDataToAPI() {
  if (!wifiConnected) {
    Serial.println("⚠ Cannot send data - WiFi not connected");
    return;
  }
  
  HTTPClient http;
  http.setTimeout(API_TIMEOUT);
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = currentSensorData.timestamp;
  doc["temperature"] = currentSensorData.temperature;
  doc["humidity"] = currentSensorData.humidity;
  
  // Soil moisture array with raw values and calculated VWC
  JsonArray soilArray = doc.createNestedArray("soil_moisture");
  for (int i = 0; i < 4; i++) {
    JsonObject soilObj = soilArray.createNestedObject();
    soilObj["raw"] = currentSensorData.soil_moisture[i];
    soilObj["percentage"] = constrain(((float)(SOIL_DRY - currentSensorData.soil_moisture[i]) / (SOIL_DRY - SOIL_WET)), 0.0, 1.0) * 100.0;
    soilObj["vwc"] = calculateVWC(currentSensorData.soil_moisture[i], i);
  }
  
  // Light intensity array
  JsonArray lightArray = doc.createNestedArray("light_intensity");
  lightArray.add(currentSensorData.light_intensity[0]);
  lightArray.add(currentSensorData.light_intensity[1]);
  
  // Signal strength
  doc["signal_strength"] = wifiSignalStrength;
  
  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  http.begin(wifiClient, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "AGRON-ESP32/1.0");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("✓ Data sent to API. Response: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("✗ API Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}

void checkControlCommands() {
  if (!wifiConnected) {
    return;
  }
  
  HTTPClient http;
  http.setTimeout(API_TIMEOUT);
  
  // Build GET request URL with device ID
  String url = String(API_CONTROL_URL) + "?device_id=" + DEVICE_ID;
  
  http.begin(wifiClient, url.c_str());
  http.addHeader("User-Agent", "AGRON-ESP32/1.0");
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    
    // Parse JSON response
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      // Update control states from API response
      if (doc.containsKey("pump")) {
        controlStates.pump = doc["pump"];
      }
      if (doc.containsKey("growLight")) {
        controlStates.growLight = doc["growLight"];
      }
      if (doc.containsKey("fan1")) {
        controlStates.fan1 = doc["fan1"];
      }
      if (doc.containsKey("fan2")) {
        controlStates.fan2 = doc["fan2"];
      }
      
      Serial.println("✓ Control commands received and applied");
    } else {
      Serial.println("⚠ Failed to parse control response JSON");
    }
  } else if (httpResponseCode != 404) {  // 404 means no new commands
    Serial.print("⚠ Control check error: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

// ============================================================================
// RELAY CONTROL FUNCTIONS
// ============================================================================

void updateRelayStates() {
  digitalWrite(PUMP_RELAY, controlStates.pump ? HIGH : LOW);
  digitalWrite(LIGHT_RELAY, controlStates.growLight ? HIGH : LOW);
  digitalWrite(FAN1_RELAY, controlStates.fan1 ? HIGH : LOW);
  digitalWrite(FAN2_RELAY, controlStates.fan2 ? HIGH : LOW);
}

// ============================================================================
// DEBUG & UTILITY FUNCTIONS
// ============================================================================

void printSensorData() {
  Serial.println("\n--- Sensor Data ---");
  Serial.print("Temperature: ");
  Serial.print(currentSensorData.temperature);
  Serial.println(" °C");
  
  Serial.print("Humidity: ");
  Serial.print(currentSensorData.humidity);
  Serial.println(" %");
  
  Serial.println("Soil Moisture:");
  for (int i = 0; i < 4; i++) {
    float percentage = constrain(((float)(SOIL_DRY - currentSensorData.soil_moisture[i]) / (SOIL_DRY - SOIL_WET)), 0.0, 1.0) * 100.0;
    Serial.print("  Sensor ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(currentSensorData.soil_moisture[i]);
    Serial.print(" mV (");
    Serial.print(percentage);
    Serial.println(" %)");
  }
  
  Serial.println("Light Intensity:");
  Serial.print("  Sensor 1: ");
  Serial.print(currentSensorData.light_intensity[0]);
  Serial.println(" lux");
  Serial.print("  Sensor 2: ");
  Serial.print(currentSensorData.light_intensity[1]);
  Serial.println(" lux");
  
  Serial.print("WiFi Signal: ");
  Serial.print(wifiSignalStrength);
  Serial.println(" dBm");
  
  Serial.println("Relay States:");
  Serial.print("  Pump: ");
  Serial.println(controlStates.pump ? "ON" : "OFF");
  Serial.print("  Grow Light: ");
  Serial.println(controlStates.growLight ? "ON" : "OFF");
  Serial.print("  Fan 1: ");
  Serial.println(controlStates.fan1 ? "ON" : "OFF");
  Serial.print("  Fan 2: ");
  Serial.println(controlStates.fan2 ? "ON" : "OFF");
  
  Serial.println();
}

void printDebug(const char* message) {
  Serial.print("[DEBUG] ");
  Serial.println(message);
}

// ============================================================================
// END OF ARDUINO SKETCH
// ============================================================================

/*
 * TROUBLESHOOTING GUIDE
 * 
 * 1. Upload failures:
 *    - Select "ESP32 Dev Module" board
 *    - Set baud rate to 115200
 *    - Ensure USB drivers are installed
 * 
 * 2. WiFi not connecting:
 *    - Check SSID and PASSWORD in configuration
 *    - Verify ESP32 antenna is properly attached
 *    - Check distance to WiFi router
 *    - Look at serial output for error messages
 * 
 * 3. Sensor not reading:
 *    - Verify pin connections match GPIO definitions
 *    - Check sensor power supply (3.3V or 5V)
 *    - Use multimeter to test sensor outputs
 *    - Look for "Error: Failed to read" messages
 * 
 * 4. API connection fails:
 *    - Verify API_URL is correct
 *    - Check backend server is running
 *    - Ensure ESP32 can reach the server (ping test)
 *    - Check firewall settings
 * 
 * 5. Wrong sensor readings:
 *    - Adjust SOIL_DRY and SOIL_WET calibration values
 *    - Verify ADC resolution and reference voltage
 *    - Use serial output to monitor raw values
 *    - Test sensors with multimeter
 */
