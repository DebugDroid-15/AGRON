# AGRON - Smart Agriculture IoT Dashboard

![AGRON Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Getting Started](#getting-started)
- [ESP32 Integration](#esp32-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🌾 Overview

**AGRON** is a premium SaaS-level IoT dashboard designed for smart agriculture monitoring and control. Built with modern web technologies, it provides real-time data visualization from multiple ESP32 sensors deployed in agricultural fields. The dashboard enables farmers and agricultural managers to monitor environmental conditions, control irrigation systems, and make data-driven decisions to optimize crop yield and resource utilization.

### Key Capabilities
- **Real-time Sensor Monitoring** - Live data from temperature, humidity, soil moisture, and light sensors
- **Intelligent Irrigation Control** - Automated and manual control of water pump systems
- **Advanced Analytics** - Historical data analysis with trend visualization
- **Multi-Zone Management** - Monitor and control multiple field zones independently
- **Mobile-Responsive Design** - Accessible from any device (desktop, tablet, mobile)
- **Production-Ready Code** - Enterprise-grade TypeScript with full type safety

---

## ✨ Features

### 1. **Real-Time Sensor Monitoring**
- Temperature & Humidity tracking (DHT22 sensors)
- 4-Channel Soil Moisture sensors with volumetric water content (VWC) calculation
- 2-Channel Light Intensity sensors for crop growth optimization
- Live data updates every 5 seconds
- Automatic calibration and normalization

### 2. **Intelligent Soil Moisture Analysis**
- **Raw ADC Values** - Direct sensor readings (0-4095 mV)
- **Moisture Percentage** - Calculated moisture level (0-100%)
- **VWC (Volumetric Water Content)** - Agricultural standard measurement (0-60%)
- **Irrigation Status** - Automatic alerts for watering needs:
  - 🔴 Dry - Urgent (<30%)
  - 🟠 Dry - Water Needed (30-50%)
  - 🟢 Normal (50-70%)
  - 🔵 Wet - Good (>70%)
- Color-coded progress bars for quick status assessment

### 3. **System Controls**
- **Water Pump Toggle** - Turn irrigation on/off with single click
- **Grow Light Control** - Manage artificial lighting for crop growth
- **Fan Management** - Control ventilation systems (2 independent fans)
- Real-time state indicators showing active/inactive status
- Neon-glowing UI with smooth transitions

### 4. **Advanced Analytics**
- **Temperature & Humidity Trends** - 24-hour line charts
- **Soil Moisture Analysis** - Area charts with historical data
- **System Health Metrics** - Overall system performance overview
- Interactive Recharts integration for detailed data exploration
- Responsive charts that work on all screen sizes

### 5. **Dashboard Navigation**
- **Overview** - High-level system status and key metrics
- **Sensors** - Detailed sensor readings with progress tracking
- **Controls** - Interactive toggles for system actuators
- **Analytics** - Historical trends and data visualization
- **Settings** - System configuration and data export
- Responsive sidebar with mobile hamburger menu

### 6. **Premium UI/UX**
- Neon futuristic aesthetic with glassmorphism effects
- Custom color palette (Neon Blue, Green, Pink, Purple)
- Smooth animations and transitions using CSS keyframes
- Dark theme optimized for extended viewing
- Mobile-first responsive design
- Accessibility-focused color contrasts

---

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 14.2.35** - React framework with App Router for optimal performance
- **React 18.3.1** - Modern React with concurrent features
- **TypeScript 5.2** - Static type checking for reliability
- **Node.js** - JavaScript runtime

### Styling & UI
- **TailwindCSS 3.3** - Utility-first CSS framework
- **Custom Theme** - Neon colors and glassmorphism effects
- **CSS Animations** - Custom keyframes for smooth transitions
- **Lucide React** - Modern icon library (18+ icons)

### State Management & Data
- **Zustand 4.4** - Lightweight state management for sensor data and controls
- **Recharts 2.10.3** - React charting library for data visualization
- **Axios 1.6.2** - HTTP client for API calls (ready for ESP32 backend)

### Development Tools
- **ESLint** - Code quality and linting
- **Prettier** (configured) - Code formatting
- **PostCSS** - CSS preprocessing with Autoprefixer

### Deployment
- **Vercel** - Production hosting with automatic deployments
- **GitHub** - Version control and CI/CD integration

---

## 📁 Project Structure

```
agron-iot-dashboard/
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # Root layout with global metadata
│   ├── page.tsx                     # Home landing page
│   ├── globals.css                  # Global styles and animations
│   └── dashboard/
│       └── page.tsx                 # Dashboard main page with layout
│
├── components/                       # Reusable React components
│   ├── Sidebar.tsx                  # Navigation sidebar (7 tabs)
│   └── dashboard/
│       ├── Overview.tsx             # System overview & soil moisture analysis
│       ├── Sensors.tsx              # Detailed sensor monitoring
│       ├── Controls.tsx             # System control toggles
│       ├── Analytics.tsx            # Data visualization with Recharts
│       └── Settings.tsx             # System configuration
│
├── store/                            # Global state management
│   └── dashboard.ts                 # Zustand store for sensor data & controls
│
├── lib/                              # Utility functions (ready for expansion)
│
├── public/                           # Static assets and images
│
├── Configuration Files
│   ├── package.json                 # Dependencies and build scripts
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.js           # TailwindCSS custom theme
│   ├── postcss.config.js            # CSS preprocessing
│   ├── next.config.js               # Next.js optimization
│   └── .gitignore                   # Git ignore rules
│
├── Documentation
│   ├── README.md                    # This file
│   └── DEPLOYMENT_GUIDE.md          # GitHub & Vercel setup
│
└── .git/                             # Git repository
```

---

## 🏗 Component Architecture

### Data Flow

```
ESP32 Sensors (Hardware)
         ↓
   API Endpoint (Node.js/Express)
         ↓
   Axios HTTP Client
         ↓
   Zustand Store (dashboard.ts)
         ↓
   React Components
         ├── Overview (Summary view)
         ├── Sensors (Detail view)
         ├── Controls (Actuator control)
         ├── Analytics (Data visualization)
         └── Settings (Configuration)
```

### State Management (Zustand)

```typescript
interface SensorData {
  temperature: number;              // °C (18-30°C range)
  humidity: number;                 // % (40-80% range)
  soilMoisture: number[];          // mV array (4 sensors)
  lightIntensity: number[];        // lux array (2 sensors)
}

interface Controls {
  pump: boolean;                    // Water pump on/off
  growLight: boolean;              // Grow light on/off
  fan1: boolean;                   // Ventilation fan 1
  fan2: boolean;                   // Ventilation fan 2
}
```

### Component Hierarchy

```
Dashboard (Page)
├── Sidebar (Navigation)
├── TopBar (Status & Info)
└── MainContent
    ├── Overview
    │   ├── MetricCards (5 quick metrics)
    │   ├── SoilMoistureAnalysis (4 sensors)
    │   └── SystemStatus
    ├── Sensors
    │   └── SensorGrid (8 detailed readings)
    ├── Controls
    │   └── ControlCards (4 actuators)
    ├── Analytics
    │   ├── LineChart (Temp & Humidity)
    │   └── AreaChart (Soil Moisture)
    └── Settings
        ├── GeneralSettings
        └── DataManagement
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/DebugDroid-15/AGRON.git
cd AGRON
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000          # Home page
http://localhost:3000/dashboard # Dashboard
```

### Available Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

---

## 🔌 ESP32 Integration

### Architecture Overview

The AGRON dashboard is designed to work with ESP32 microcontroller(s) deployed in the field. Here's how the integration works:

```
┌─────────────────────────────────────────────────────┐
│  AGRON Dashboard (Web Browser)                      │
│  - Real-time visualization                         │
│  - Control interface                               │
│  - Data analysis                                   │
└────────────────┬────────────────────────────────────┘
                 │ HTTPS/WebSocket
                 ↓
┌─────────────────────────────────────────────────────┐
│  Backend Server (Node.js/Express - To be created)  │
│  - API endpoints for data                          │
│  - WebSocket for real-time updates                │
│  - Database for historical data                   │
└────────────────┬────────────────────────────────────┘
                 │ WiFi/MQTT/HTTP
                 ↓
┌─────────────────────────────────────────────────────┐
│  ESP32 Microcontroller (Field)                     │
│  - DHT22: Temperature & Humidity                   │
│  - Soil Moisture Sensors (4x)                      │
│  - Light Sensors (2x)                             │
│  - Relay modules for pump/lights/fans            │
└─────────────────────────────────────────────────────┘
```

### Sensor Specifications

| Sensor | Type | Channels | Range | Update Interval |
|--------|------|----------|-------|-----------------|
| DHT22 | Temperature/Humidity | 1 | 15-28°C, 0-100% | 5 sec |
| Soil Moisture | Capacitive ADC | 4 | 0-4095 mV | 5 sec |
| Light Intensity | LDR + OpAmp | 2 | 0-3000 lux | 5 sec |
| Water Pump | Relay | 1 | ON/OFF | Real-time |
| Grow Light | Relay | 1 | ON/OFF | Real-time |
| Ventilation Fans | Relay | 2 | ON/OFF | Real-time |

### ESP32 Code Example (Arduino Sketch)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

// API endpoint
const char* apiEndpoint = "http://your-backend.com/api/sensor-data";

// Sensor pins
#define TEMP_HUMIDITY_PIN 4
#define SOIL_MOISTURE_1 32
#define SOIL_MOISTURE_2 33
#define SOIL_MOISTURE_3 34
#define SOIL_MOISTURE_4 35
#define LIGHT_SENSOR_1 36
#define LIGHT_SENSOR_2 37
#define PUMP_RELAY 12
#define LIGHT_RELAY 13
#define FAN1_RELAY 14
#define FAN2_RELAY 15

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  // Configure relay pins as output
  pinMode(PUMP_RELAY, OUTPUT);
  pinMode(LIGHT_RELAY, OUTPUT);
  pinMode(FAN1_RELAY, OUTPUT);
  pinMode(FAN2_RELAY, OUTPUT);
}

void loop() {
  if (WiFi.isConnected()) {
    // Read sensors
    float temperature = readTemperature();
    float humidity = readHumidity();
    int soil1 = analogRead(SOIL_MOISTURE_1);
    int soil2 = analogRead(SOIL_MOISTURE_2);
    int soil3 = analogRead(SOIL_MOISTURE_3);
    int soil4 = analogRead(SOIL_MOISTURE_4);
    int light1 = analogRead(LIGHT_SENSOR_1);
    int light2 = analogRead(LIGHT_SENSOR_2);
    
    // Send data to backend
    sendSensorData(temperature, humidity, soil1, soil2, soil3, soil4, light1, light2);
  }
  
  delay(5000); // Update every 5 seconds
}

void sendSensorData(float temp, float hum, int s1, int s2, int s3, int s4, int l1, int l2) {
  HTTPClient http;
  http.begin(apiEndpoint);
  
  String payload = "{\"temperature\":" + String(temp) + 
                   ",\"humidity\":" + String(hum) +
                   ",\"soil_moisture\":[" + String(s1) + "," + String(s2) + "," + String(s3) + "," + String(s4) + "]" +
                   ",\"light_intensity\":[" + String(l1) + "," + String(l2) + "]}";
  
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(payload);
  http.end();
}
```

### Backend Setup (Next Steps)

To connect ESP32 sensors, you'll need to create a backend API server. Here's the recommended approach:

1. **Create Express.js server** (in `server.js` or `api/index.js`)
2. **Database** - MongoDB/PostgreSQL for historical data
3. **WebSocket** - Real-time data streaming to dashboard
4. **MQTT Broker** (Optional) - For pub/sub sensor data
5. **Authentication** - JWT tokens for API security

### API Endpoints (To be implemented)

```
POST   /api/sensor-data         # Receive data from ESP32
GET    /api/sensor-data/:id     # Get sensor data by ID
PUT    /api/controls/:id        # Send commands to ESP32
GET    /api/history/:sensor     # Get historical data
WebSocket /ws/live-feed         # Real-time data stream
```

---

## 📊 Real-Time Data Simulation

Currently, the dashboard uses **mock data** that simulates realistic sensor readings:

- Temperature: 18-30°C with small random variations
- Humidity: 40-80% with realistic patterns
- Soil Moisture: 1500-3500 mV across 4 sensors
- Light Intensity: 500-3000 lux with natural variation

This allows you to:
1. Test the dashboard UI/UX
2. Develop and validate the design
3. Prepare integration with real ESP32 data

**To switch to real ESP32 data**, simply update the sensor data endpoint in `store/dashboard.ts`:

```typescript
// Replace the mock data interval with API call
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await axios.get('/api/sensor-data');
    setSensorData(response.data);
  }, 5000);
  
  return () => clearInterval(interval);
}, [setSensorData]);
```

---

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#00D4FF` (Neon Blue) - Primary action & highlights
- **Secondary Green**: `#00FF9C` (Neon Green) - Success states & confirmations
- **Accent Pink**: `#FF006E` (Neon Pink) - Alerts & attention
- **Accent Purple**: `#B537F2` (Neon Purple) - Secondary actions
- **Dark Background**: `#040404-#0a0a0a` - Main background
- **Dark Secondary**: `#1a1a1a` - Card backgrounds

### Effects
- **Glassmorphism** - Semi-transparent cards with backdrop blur
- **Neon Glow** - Box shadows with neon colors
- **Smooth Animations** - CSS keyframes for transitions
- **Floating Effect** - Subtle up/down animations

### Responsive Breakpoints
- Mobile: 0-640px
- Tablet: 640px-1024px
- Desktop: 1024px+

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub:
```bash
git remote add origin https://github.com/DebugDroid-15/AGRON.git
git branch -M main
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "Add New Project"
5. Select this repository
6. Click "Deploy"

Your dashboard will be live at: `https://agron.vercel.app`

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API endpoint (when ready)
- `DATABASE_URL` - Database connection (when adding backend)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📈 Future Enhancements

### Phase 2 (Backend Integration)
- [ ] Express.js/Node.js backend server
- [ ] MongoDB/PostgreSQL database
- [ ] Real ESP32 sensor integration
- [ ] WebSocket real-time updates
- [ ] Historical data storage & analysis
- [ ] User authentication & authorization
- [ ] Multi-farm support
- [ ] Notification system (alerts via email/SMS)

### Phase 3 (Advanced Features)
- [ ] Machine learning for crop prediction
- [ ] Automated irrigation scheduling
- [ ] Weather API integration
- [ ] Mobile app (React Native)
- [ ] IoT device pairing & management
- [ ] Advanced analytics & reporting
- [ ] Export to CSV/PDF

### Phase 4 (Enterprise)
- [ ] Multi-tenant SaaS platform
- [ ] Role-based access control (RBAC)
- [ ] API marketplace
- [ ] Third-party integrations
- [ ] Scalable infrastructure on AWS/GCP
- [ ] Real-time alerts & notifications

---

## 🔒 Security Considerations

### Current Implementation
- XSS protection via React's built-in escaping
- CSRF protection ready for backend integration
- TypeScript for type safety
- ESLint for code quality

### Future Security Enhancements
- [ ] API rate limiting
- [ ] JWT authentication
- [ ] HTTPS/TLS encryption (Vercel auto-includes)
- [ ] Input validation & sanitization
- [ ] Environment variable security
- [ ] Database query parameterization
- [ ] CORS configuration
- [ ] Security headers (CSP, X-Frame-Options, etc.)

---

## 📝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all components
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Support & Contact

### Documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

### Issues & Bug Reports
GitHub Issues: [AGRON Issues](https://github.com/DebugDroid-15/AGRON/issues)

### Social Links
- GitHub: [@DebugDroid-15](https://github.com/DebugDroid-15)

---

## 🙏 Acknowledgments

Built with ❤️ for sustainable agriculture using:
- Next.js & React community
- TailwindCSS
- Vercel hosting
- Open-source communities

---

**AGRON Dashboard** - Empowering Smart Agriculture 🌾🚀

Last Updated: March 11, 2026
Version: 1.0.0 - Production Ready
