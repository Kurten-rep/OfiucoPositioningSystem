# Raspberry Pi Implementation Guide

This guide details how to turn a standard Raspberry Pi into a dedicated **Cosmic Tracking Station**.

## Hardware Requirements

- **Raspberry Pi**: Model 3B+, 4, or 5 (2GB+ RAM recommended).
- **SD Card**: 16GB+ running Raspberry Pi OS (64-bit Lite or Desktop).
- **Telescope Mount/Display** (Optional): A device connected via USB Serial (Arduino, ESP32, etc.).

---

## Step-by-Step Installation

### 1. System Preparation

Ensure your Pi is up to date:

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install git python3-pip nodejs npm -y
```

### 2. Get the Code

Clone the repository to your user folder (e.g., `/home/pi`):

```bash
cd ~
git clone https://github.com/your-repo/telescopio.git
cd telescopio
```

### 3. Backend Setup

Install the Python dependencies (FastAPI, Uvicorn, Serial):

```bash
# Recommended: Use a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install fastapi uvicorn requests pyserial
```

### 4. Frontend Build

Compile the React application into optimized static files that the Python server can serve directly:

```bash
cd frontend
npm install
npm run build
# This creates a 'dist' folder
cd ..
```

---

## Running the Application

### Manual Start

To start the server immediately:

```bash
# From the root 'telescopio' folder
source venv/bin/activate
python3 main.py
```

_The server will start on Port 8000._

### Auto-Start on Boot (Systemd)

To make this a true appliance that runs on power-up:

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/telescopio.service
   ```
2. Paste the following configuration (adjust paths as needed):

   ```ini
   [Unit]
   Description=Telescopio Cosmic Tracker
   After=network.target

   [Service]
   User=pi
   WorkingDirectory=/home/pi/telescopio
   ExecStart=/home/pi/telescopio/venv/bin/python3 main.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and Start:
   ```bash
   sudo systemctl enable telescopio
   sudo systemctl start telescopio
   ```

---

## Using the Serial Feature

Simply plug your USB device (Arduino/Controller) into the Pi.

- The system checks for `/dev/ttyUSB*` and `/dev/ttyACM*`.
- It will automatically connect and verify.
- Every time coordinates update, your device receives: `AZ:XXX.XX,ALT:XXX.XX`
