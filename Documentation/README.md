# Telescopio: Smillero de Astronomia Universidad El Bosque.

Este es un proyecto del semillero de Astronomia de la Universidad El Bosque, Colombia.
Es un sistema autonomo de posicionamiento en tiempo real de cuerpos celestes, que funciona en conjunto a nuestro telescopio con montura Altazimuthal para el avistamiento de cuerpos celestes del espacio cercano.


![Sci-Fi UI](https://your-image-url-here.png)
_(Replace with actual screenshot)_

# OfiucoPositioningSysten

A positioning system connected to NASA api for real time celestial body tracking and telescope control

**Telescopio** is a web application for real-time celestial tracking. Designed with a premium to be used with a raspberry pi and an MCU (Arduino, ESP32, etc.), it connects directly to NASA's JPL Horizons system to calculate the precise Altitude and Azimuth of celestial bodies from any location on Earth.

## Key Features

- **🚀 Real-Time Telemetry**: Calculates exact aiming coordinates (Azimuth/Altitude) for planets, moons, and asteroids.
- **📡 Hardware Integration**: Automatically sends coordinate data to connected hardware (Arduino or ESP32) via Serial/USB.
- **🌌 Cosmic Catalog**: A searchable database of over 100+ celestial objects.
- **🛰️ Auto-Tracking**: "Lock on" to a target to receive continuous position updates every 5 seconds.
- **⚡ Raspberry Pi Ready**: Lightweight architecture designed for embedded deployment calculation.

## Quick Start

1. **Install Dependencies**:

   ```bash
   pip install fastapi uvicorn requests pyserial
   cd frontend && npm install
   ```

2. **Run Development Mode**:
   - Backend: `uvicorn main:app --reload`
   - Frontend: `npm run dev`

3. **Deploy**:
   - Build frontend: `cd frontend && npm run build`
   - Run Server: `python3 main.py`
   - Access at `http://localhost:8000`

## Documentation

- **[Raspberry Pi Setup](RASPBERRY_PI_SETUP.md)**: Full guide to running this as a standalone appliance.
- **[Technical Docs](TECHNICAL_DOCS.md)**: API reference and architecture details.
