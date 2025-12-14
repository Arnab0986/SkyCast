# 🌤️ SkyCast — AI-Powered Weather Forecast PWA

SkyCast is a **premium, Apple-style weather web application** that delivers **real-time weather data, AI-powered forecasts, health advisories, and immersive animated backgrounds** — all wrapped in a **fast, installable Progressive Web App (PWA)**.

Designed with **glassmorphism UI**, smooth animations, and smart caching, SkyCast works beautifully on **desktop, tablet, and mobile** — even offline.

---

## ✨ Key Features

### 🌍 Location & Time
- Automatic **GPS-based location detection**
- Intelligent **IP fallback** if GPS is unavailable
- Displays **local time, date, and city name**
- Location caching for faster reloads

---

### 🌡️ Real-Time Weather
- Current temperature (°C / °F toggle)
- Weather condition with dynamic icons
- Humidity, wind speed, UV index
- Wind direction compass with smooth rotation

---

### 🧭 Wind Direction Compass
- Real-time wind angle visualization
- Cardinal directions (N, E, S, W)
- Smooth animated needle
- Direction label (NE, SW, etc.)

---

### 🌅 Sunrise & Sunset (Daily)
- Predicted **sunrise & sunset times**
- Cleanly displayed beside wind compass
- Based on real Open-Meteo data

---

### 🌧️ Rain & Thunderstorm Probability
- Daily **rain probability**
- Intelligent **thunderstorm risk estimation**
- Visual indicators for quick understanding

---

### 📅 7-Day Forecast (Interactive)
- Separate **glass boundary card for each day**
- Daily:
  - Max / Min temperature
  - Sunrise & sunset
  - Rain probability
- **Click any day → popup modal** with:
  - Detailed weather info
  - Thunderstorm risk
  - Health & AQI context

---

### ⏱️ 24-Hour Forecast
- Horizontal scroll (mobile friendly)
- Hourly temperature & weather icons
- Auto-detects current hour
- Smooth skeleton loaders

---

### 🤖 AI Forecast & Health Advisory
- Smart **AI-generated daily forecast**
- Practical health advice based on:
  - Temperature
  - UV index
  - Air quality (PM2.5)
  - Weather conditions
- **Text-to-Speech** (voice narration)

---

### 🌫️ Air Quality Monitoring
- Live **PM2.5 AQI data**
- Health-based AQI categorization:
  - Good
  - Moderate
  - Unhealthy
  - Very Unhealthy
- Clear health recommendations

---

### 🎨 Dynamic Weather Backgrounds
Animated backgrounds that change automatically:
- ☀️ Clear Day (floating clouds)
- 🌙 Clear Night (twinkling stars)
- 🌧️ Rain (animated raindrops)
- ❄️ Snow (snowfall particles)
- ⛈️ Thunderstorm (lightning flashes)

---

### 📲 Progressive Web App (PWA)
- Installable on **Android, iOS, Desktop**
- Offline support via **Service Worker**
- Cached weather & location data
- Periodic background updates
- App-like experience (no browser UI)

---

### 💾 Smart Caching
- Location caching (1 hour)
- Weather caching (30 minutes)
- Air quality caching (1 hour)
- Automatic fallback when offline

---

### 📢 Google AdSense Ready
- Fully integrated **Google AdSense**
- Responsive ad slots:
  - Top banner
  - In-content ads
  - Mobile-only ads
- Graceful ad placeholders if ads fail
- Optimized for AdSense policy compliance

---

### 🌗 Theme & Preferences
- Dark / Light theme toggle
- Temperature unit preference saved
- LocalStorage-based persistence

---

## 🛠️ Tech Stack

- **HTML5**
- **Tailwind CSS**
- **Vanilla JavaScript**
- **Open-Meteo APIs**
- **Service Workers**
- **Google AdSense**
- **Font Awesome**
- **Google Fonts (Inter)**

---

## 🌐 APIs Used

| Feature | API |
|------|-----|
| Weather Forecast | Open-Meteo Forecast API |
| Air Quality | Open-Meteo Air Quality API |
| Geocoding | Open-Meteo Geocoding API |
| IP Location (Fallback) | ipapi.co |

---

## 🚀 Installation & Usage

### 1️⃣ Clone or Download
```bash
git clone https://github.com/Arnab0986/SkyCast.git