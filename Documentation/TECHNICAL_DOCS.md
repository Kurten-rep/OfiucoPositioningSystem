# System Architecture

## Overview

**Telescopio** is a hybrid celestial tracking application that combines a high-performance React frontend with a robust Python/FastAPI backend. It is designed to run on low-power devices like the Raspberry Pi while providing a premium, "Sci-Fi" user interface.

## Tech Stack

### Frontend

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide React
- **Fonts**: Orbitron (Headers), Rajdhani (Data), Playfair Display (Buttons)
- **State Management**: React Hooks (`useState`, `useEffect`)

### Backend

- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **Tracking**: `pyserial` for hardware communication
- **External API**: NASA JPL Horizons System

---

## API Endpoints

### `GET /api/lookup`

Proxies requests to NASA's specific Horizons API to calculate local Altitude and Azimuth.

**Parameters:**

- `target`: celestial body ID or name (e.g., `'499'`, `'Mars'`)
- `lat`: Observer Latitude (decimal degrees)
- `lon`: Observer Longitude (decimal degrees)
- `alt`: Observer Altitude (km) - default `0.0`

**Response:**

```json
{
  "target": "499",
  "observer": { "lat": 25.0, "lon": -80.0, "alt": 0.0 },
  "data": {
    "azimuth": 253.12,
    "altitude": 45.67,
    "raw_line": "..."
  }
}
```

---

## Serial Communication

The system includes an automated **Serial Manager** that bridges the web world with physical hardware.

### Behavior

1.  **Auto-Discovery**: On startup (and lazy-load), the system scans for USB/ACM devices (e.g., `/dev/ttyUSB0`).
2.  **Protocol**: Unidirectional (PC -> Device).
3.  **Format**: ASCII Text Line
    ```text
    AZ:123.45,ALT:45.67\n
    ```
4.  **Frequency**: Updates whenever a new target is located or the "Auto-Tracking" interval triggers (default: 5s).

---

## Directory Structure

```
/
├── main.py                 # FastAPI Application & Serial Logic
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI Components (StarGate, CosmicDisplay, etc.)
│   │   ├── data/           # Static celestial data
│   │   └── App.jsx         # Main Logic
│   └── dist/               # Compiled Static Files (Served by Python)
```
