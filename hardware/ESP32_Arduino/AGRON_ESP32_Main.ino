/*
 * AGRON IoT Smart Agriculture System - ESP32 Arduino Sketch
 * 
 * Features:
 * - DHT22 Temperature & Humidity Sensor
 * - 4x Soil Moisture Sensors (Analog)
 * - 2x Light Intensity Sensors (Analog)
 * - 4x Relay Controls (Pump, Grow Light, Fan1, Fan2)
 * - WiFi connectivity with auto-reconnect
 * - POST sensor data to Vercel API every 5 seconds
 * - GET relay control states from API
 * - Auto-update dashboard in real-time
 * 
 * WiFi & API Configuration:
 * - Update SSID and PASSWORD below
 * - API Endpoint: https://agron-tau.vercel.app/api/sensor-data
 * - Control Endpoint: https://agron-tau.vercel.app/api/controls
 * 
 * Author: AGRON Development Team
 * Date: March 2026
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>

// ============================================================================
// WIFI CONFIGURATION - UPDATE THESE WITH YOUR CREDENTIALS
// ============================================================================
const char* ssid = "YOUR_WIFI_SSID";           // ← Change this
const char* password = "YOUR_WIFI_PASSWORD";   // ← Change this
const char* api_url = "https://agron-tau.vercel.app/api/sensor-data";
const char* control_url = "https://agron-tau.vercel.app/api/controls";
const char* device_id = "ESP32_AGRON_01";

// ============================================================================
// PIN CONFIGURATION
// ============================================================================
// DHT22 Sensor
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Soil Moisture Sensors (Analog pins - ADC)
const int soil_moisture_pins[4] = {35, 34, 39, 36}; // GPIO35, GPIO34, GPIO39, GPIO36

// Light Intensity Sensors (Analog)
const int light_intensity_pins[2] = {32, 33};       // GPIO32, GPIO33

// Relay Control Pins (Digital)
const int relay_pump = 12;
const int relay_grow_light = 14;
const int relay_fan1 = 27;
const int relay_fan2 = 26;

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================
const unsigned long SENSOR_READ_INTERVAL = 5000;     // Read sensors every 5 seconds
const unsigned long API_SUBMIT_INTERVAL = 5000;      // Send data to API every 5 seconds
const unsigned long CONTROL_CHECK_INTERVAL = 5000;   // Check for control updates every 5 seconds
const unsigned long RECONNECT_INTERVAL = 10000;      // Try WiFi reconnect every 10 seconds

unsigned long last_sensor_read = 0;
unsigned long last_api_submit = 0;
unsigned long last_control_check = 0;
unsigned long last_reconnect_attempt = 0;

// ============================================================================
// SENSOR DATA STRUCTURES
// ============================================================================
struct SensorData {
  float temperature = 0.0;
  float humidity = 0.0;
  int soil_moisture[4] = {0, 0, 0, 0};
  int light_intensity[2] = {0, 0};
  int signal_strength = 0;
  unsigned long timestamp = 0;
};

struct RelayState {
  bool pump = false;
  bool grow_light = false;
  bool fan1 = false;
  bool fan2 = false;
};

SensorData current_data;
RelayState current_relay_state;
bool wifi_connected = false;
bool api_data_sent = false;

// ============================================================================
// SETUP - Runs once on startup
// ============================================================================
void setup() {
  // Initialize Serial for debugging
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════════════════════╗");
  Serial.println("║        AGRON IoT Smart Agriculture System              ║");
  Serial.println("║           ESP32 Sensor & Control Module                ║");
  Serial.println("╚════════════════════════════════════════════════════════╝");
  
  // Initialize DHT22 sensor
  Serial.println("[SETUP] Initializing DHT22 sensor...");
  dht.begin();
  
  // Initialize Relay pins as outputs
  Serial.println("[SETUP] Initializing relay control pins...");
  pinMode(relay_pump, OUTPUT);
  pinMode(relay_grow_light, OUTPUT);
  pinMode(relay_fan1, OUTPUT);
  pinMode(relay_fan2, OUTPUT);
  
  digitalWrite(relay_pump, LOW);
  digitalWrite(relay_grow_light, LOW);
  digitalWrite(relay_fan1, LOW);
  digitalWrite(relay_fan2, LOW);
  
  // Initialize ADC for analog sensors
  Serial.println("[SETUP] Initializing analog sensors...");
  analogSetWidth(12); // 12-bit resolution (0-4095)
  analogSetAttenuation(ADC_11db); // Full scale 0-3.3V
  
  // Connect to WiFi
  Serial.println("[SETUP] Connecting to WiFi...");
  connectToWiFi();
  
  // Set timezone for timestamp
  configTime(5*3600, 0, "pool.ntp.org");
  
  Serial.println("[SETUP] ✓ Initialization complete!");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// ============================================================================
// MAIN LOOP
// ============================================================================
void loop() {
  unsigned long current_time = millis();
  
  // Check WiFi connection
  if (!WiFi.isConnected()) {
    if (current_time - last_reconnect_attempt >= RECONNECT_INTERVAL) {
      Serial.println("[WiFi] 🔴 Connection lost! Attempting to reconnect...");
      connectToWiFi();
      last_reconnect_attempt = current_time;
    }
  } else {
    if (!wifi_connected) {
      wifi_connected = true;
      Serial.println("[WiFi] 🟢 Connected!");
    }
  }
  
  // Read sensor data at interval
  if (current_time - last_sensor_read >= SENSOR_READ_INTERVAL) {
    readAllSensors();
    last_sensor_read = current_time;
  }
  
  // Send data to API at interval
  if (current_time - last_api_submit >= API_SUBMIT_INTERVAL && wifi_connected) {
    submitSensorDataToAPI();
    last_api_submit = current_time;
  }
  
  // Check for relay control updates from API
  if (current_time - last_control_check >= CONTROL_CHECK_INTERVAL && wifi_connected) {
    fetchControlStateFromAPI();
    last_control_check = current_time;
  }
  
  delay(10); // Small delay to prevent watchdog timeout
}

// ============================================================================
// WIFI CONNECTION
// ============================================================================
void connectToWiFi() {
  if (String(ssid) == "YOUR_WIFI_SSID") {
    Serial.println("⚠️  WARNING: WiFi credentials not configured!");
    Serial.println("    Please update SSID and PASSWORD in the sketch.");
    return;
  }
  
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.isConnected()) {
    Serial.println();
    Serial.println("[WiFi] ✓ Connected!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    wifi_connected = true;
  } else {
    Serial.println();
    Serial.println("[WiFi] ✗ Connection failed!");
    wifi_connected = false;
  }
}

// ============================================================================
// SENSOR READING FUNCTIONS
// ============================================================================
void readAllSensors() {
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("[SENSORS] Reading all sensors...");
  
  // Read DHT22 (Temperature & Humidity)
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (isnan(temp) || isnan(humidity)) {
    Serial.println("[DHT22] ✗ Failed to read DHT sensor!");
    temp = current_data.temperature;
    humidity = current_data.humidity;
  } else {
    current_data.temperature = temp;
    current_data.humidity = humidity;
    Serial.print("[DHT22] 🌡️  Temperature: ");
    Serial.print(temp);
    Serial.print("°C | 💧 Humidity: ");
    Serial.print(humidity);
    Serial.println("%");
  }
  
  // Read Soil Moisture Sensors
  Serial.print("[SOIL] 🌾 Soil Moisture: ");
  for (int i = 0; i < 4; i++) {
    current_data.soil_moisture[i] = analogRead(soil_moisture_pins[i]);
    Serial.print("S");
    Serial.print(i + 1);
    Serial.print("=");
    Serial.print(current_data.soil_moisture[i]);
    if (i < 3) Serial.print(" | ");
  }
  Serial.println();
  
  // Read Light Intensity Sensors
  Serial.print("[LIGHT] ☀️  Light Intensity: ");
  for (int i = 0; i < 2; i++) {
    current_data.light_intensity[i] = analogRead(light_intensity_pins[i]);
    Serial.print("L");
    Serial.print(i + 1);
    Serial.print("=");
    Serial.print(current_data.light_intensity[i]);
    if (i < 1) Serial.print(" | ");
  }
  Serial.println();
  
  // Get WiFi signal strength
  current_data.signal_strength = WiFi.RSSI();
  Serial.print("[WiFi] Signal: ");
  Serial.print(current_data.signal_strength);
  Serial.println(" dBm");
  
  // Get timestamp
  current_data.timestamp = time(nullptr);
  
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// ============================================================================
// API FUNCTIONS - SUBMIT DATA
// ============================================================================
void submitSensorDataToAPI() {
  if (!wifi_connected) {
    Serial.println("[API] ⚠️  WiFi not connected, skipping API submit");
    return;
  }
  
  HTTPClient http;
  
  Serial.print("[API] 📤 Posting sensor data to: ");
  Serial.println(api_url);
  
  http.begin(api_url);
  http.addHeader("Content-Type", "application/json");
  http.setConnectTimeout(5000);
  http.setTimeout(5000);
  
  // Build JSON payload
  StaticJsonDocument<512> doc;
  doc["device_id"] = device_id;
  doc["timestamp"] = current_data.timestamp;
  doc["temperature"] = current_data.temperature;
  doc["humidity"] = current_data.humidity;
  
  JsonArray soil_array = doc.createNestedArray("soil_moisture");
  for (int i = 0; i < 4; i++) {
    soil_array.add(current_data.soil_moisture[i]);
  }
  
  JsonArray light_array = doc.createNestedArray("light_intensity");
  for (int i = 0; i < 2; i++) {
    light_array.add(current_data.light_intensity[i]);
  }
  
  doc["signal_strength"] = current_data.signal_strength;
  
  String json_string;
  serializeJson(doc, json_string);
  
  Serial.print("[API] JSON: ");
  Serial.println(json_string);
  
  int http_response_code = http.POST(json_string);
  
  if (http_response_code == 200) {
    Serial.println("[API] ✓ Data submitted successfully (200 OK)");
    api_data_sent = true;
  } else if (http_response_code > 0) {
    Serial.print("[API] ⚠️  HTTP Error: ");
    Serial.println(http_response_code);
    String response = http.getString();
    Serial.print("[API] Response: ");
    Serial.println(response);
  } else {
    Serial.print("[API] ✗ Connection failed: ");
    Serial.println(http.errorToString(http_response_code));
  }
  
  http.end();
}

// ============================================================================
// API FUNCTIONS - FETCH CONTROL STATE
// ============================================================================
void fetchControlStateFromAPI() {
  if (!wifi_connected) {
    return;
  }
  
  HTTPClient http;
  String control_url_with_id = String(control_url) + "?device_id=" + device_id;
  
  http.begin(control_url_with_id);
  http.setConnectTimeout(5000);
  http.setTimeout(5000);
  
  int http_response_code = http.GET();
  
  if (http_response_code == 200) {
    String response = http.getString();
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      bool new_pump = doc["pump"] | false;
      bool new_grow_light = doc["growLight"] | false;
      bool new_fan1 = doc["fan1"] | false;
      bool new_fan2 = doc["fan2"] | false;
      
      // Update relays if state changed
      if (new_pump != current_relay_state.pump) {
        digitalWrite(relay_pump, new_pump ? HIGH : LOW);
        current_relay_state.pump = new_pump;
        Serial.print("[RELAY] 💧 Pump: ");
        Serial.println(new_pump ? "ON" : "OFF");
      }
      
      if (new_grow_light != current_relay_state.grow_light) {
        digitalWrite(relay_grow_light, new_grow_light ? HIGH : LOW);
        current_relay_state.grow_light = new_grow_light;
        Serial.print("[RELAY] 💡 Grow Light: ");
        Serial.println(new_grow_light ? "ON" : "OFF");
      }
      
      if (new_fan1 != current_relay_state.fan1) {
        digitalWrite(relay_fan1, new_fan1 ? HIGH : LOW);
        current_relay_state.fan1 = new_fan1;
        Serial.print("[RELAY] 🌀 Fan 1: ");
        Serial.println(new_fan1 ? "ON" : "OFF");
      }
      
      if (new_fan2 != current_relay_state.fan2) {
        digitalWrite(relay_fan2, new_fan2 ? HIGH : LOW);
        current_relay_state.fan2 = new_fan2;
        Serial.print("[RELAY] 🌀 Fan 2: ");
        Serial.println(new_fan2 ? "ON" : "OFF");
      }
    } else {
      Serial.print("[API] ⚠️  JSON Parse Error: ");
      Serial.println(error.c_str());
    }
  }
  
  http.end();
}

// ============================================================================
// RECEIVE CONTROL UPDATES (For future real-time updates via callbacks)
// ============================================================================
void updateRelayState(String control_name, bool state) {
  if (control_name == "pump") {
    digitalWrite(relay_pump, state ? HIGH : LOW);
    current_relay_state.pump = state;
    Serial.println("[RELAY] Pump updated via callback");
  }
  else if (control_name == "growLight") {
    digitalWrite(relay_grow_light, state ? HIGH : LOW);
    current_relay_state.grow_light = state;
    Serial.println("[RELAY] Grow Light updated via callback");
  }
  else if (control_name == "fan1") {
    digitalWrite(relay_fan1, state ? HIGH : LOW);
    current_relay_state.fan1 = state;
    Serial.println("[RELAY] Fan 1 updated via callback");
  }
  else if (control_name == "fan2") {
    digitalWrite(relay_fan2, state ? HIGH : LOW);
    current_relay_state.fan2 = state;
    Serial.println("[RELAY] Fan 2 updated via callback");
  }
}
