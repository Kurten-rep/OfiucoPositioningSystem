from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import requests
import re
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Star Gazer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Constants
HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"

def parse_horizons_response(text_response: str):
    """
    Parses the raw text response from Horizons API for Quantities=4 (Apparent Az/El).
    Looking for the $$SOE ... $$EOE block.
    """
    try:
        # Extract data between $$SOE and $$EOE
        soe_index = text_response.find("$$SOE")
        eoe_index = text_response.find("$$EOE")
        
        if soe_index == -1 or eoe_index == -1:
            logger.error("Could not find data block in Horizons response")
            return None

        # The data line is typically the first line after $$SOE
        data_block = text_response[soe_index + 5 : eoe_index].strip()
        lines = data_block.splitlines()
        
        if not lines:
            return None

        # Parse the last available line (latest data point)
        latest_line = lines[-1].strip()
        
        # Horizons output format for quantity 4 (Azimuth & Elevation) typically looks like:
        # Date__(UT)__HR:MN     Azimuth_(a-app)___Elevation_  ...
        # 2026-Jan-11 04:19     253.123456         45.678901  ...
        
        # We'll split by whitespace and try to identify the Az/El columns
        # Note: This is brittle and depends on exact column formatting which Horizons tries to keep stable but can vary.
        # A safer way with Quantities='4' is typically:
        # Date, Azimuth, Elevation, ...
        
        parts = latest_line.split()
        
        # Re-constructing based on known fixed width or position is better, but splitting works for basic checks.
        # Expecting: 
        # 0: Date
        # 1: Time
        # 2: Azimuth
        # 3: Elevation
        # ... (other text columns might interfere)
        
        # Let's extract based on the regex structure of the data line for Quantity 4
        # "2026-Jan-11 04:19 * 253.1234 * 45.6789 ..."
        # The asterisk '*' indicates daylight or other flags, sometimes it's space.
        
        # Regex to find two floating point numbers after the date/time
        # Matches: YYYY-Mon-DD HH:MM [space/flags] AZIMUTH [space/flags] ELEVATION
        match = re.search(r'\d{4}-[A-Za-z]{3}-\d{2}\s\d{2}:\d{2}.*?(\d+\.\d+).*?([+-]?\d+\.\d+)', latest_line)
        
        if match:
            return {
                "azimuth": float(match.group(1)),
                "altitude": float(match.group(2)),
                "raw_line": latest_line
            }
            
        return {"raw_line": latest_line, "error": "Could not parse azimuth/altitude strictly"}

    except Exception as e:
        logger.error(f"Parsing error: {e}")
        return None

@app.get("/api/lookup")
async def get_coordinates(
    target: str = Query(..., description="Target body name or ID (e.g., '499' for Mars)"),
    lat: float = Query(..., description="Observer Latitude"),
    lon: float = Query(..., description="Observer Longitude"),
    alt: float = Query(0.0, description="Observer Altitude (km)")
):
    """
    Proxies request to NASA Horizons to get Altitude/Azimuth of a target.
    """
    
    # Construct center string: 'coord@399' for custom location on Earth
    # Longitude is East-positive in Horizons
    center = f"coord@399"
    coord_site = f"{lon},{lat},{alt}" # "E-Lon,Lat,Alt"
    
    from datetime import datetime, timedelta
    now_str = datetime.utcnow().strftime("'%Y-%m-%d %H:%M'")
    stop_str = (datetime.utcnow() + timedelta(minutes=1)).strftime("'%Y-%m-%d %H:%M'")

    params = {
        'format': 'json',
        'COMMAND': f"'{target}'",
        'OBJ_DATA': "'NO'",
        'MAKE_EPHEM': "'YES'",
        'EPHEM_TYPE': "'OBSERVER'",
        'CENTER': f"'{center}'",
        'COORD_TYPE': "'GEODETIC'",
        'SITE_COORD': f"'{coord_site}'",
        'START_TIME': now_str, 
        'STOP_TIME': stop_str,
        'STEP_SIZE': "'1 m'",
        'QUANTITIES': "'4'",   # 4 = Apparent Azimuth & Elevation
        'SKIP_DAYLT': "'NO'"
    }

    logger.info(f"Querying Horizons for {target} at {coord_site} Time: {now_str}")
    
    try:
        response = requests.get(HORIZONS_URL, params=params)
        response.raise_for_status()
        
        json_data = response.json()
        result_text = json_data.get('result', '')

        # Identify if Horizons returned an error in the text
        if "!$$SOF" in result_text:
             pass

        data = parse_horizons_response(result_text)
        
        if not data:
            # Fallback: check if it was an ambiguous search
            if "Multiple major-bodies match string" in result_text or "Matching body results" in result_text:
                 return {"error": "Target ambiguous. Please try a more specific ID (e.g., '499' for Mars).", "raw_response": result_text[:500]}
            
            return {"error": "Could not parse Horizons data.", "debug_response_snippet": result_text[:2000]} # Increase snippet size check

        # --- SERIAL SEND ---
        # Send the valid data to any connected telescope/device
        serial_manager.send_data(data['azimuth'], data['altitude'])
        # -------------------

        return {
            "target": target,
            "observer": {"lat": lat, "lon": lon, "alt": alt},
            "data": data
        }

    except Exception as e:
        logger.error(f"Server error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- SERIAL COMMUNICATION MANAGER ---
try:
    import serial
    import serial.tools.list_ports
    SERIAL_AVAILABLE = True
except ImportError:
    SERIAL_AVAILABLE = False
    logger.warning("pyserial not installed. Serial communication disabled. Install with 'pip install pyserial'")

class SerialManager:
    def __init__(self):
        self.ser = None
        self.connected_port = None
        
    def find_and_connect(self):
        """Attempts to find a likely Arduino/Controller device and connect."""
        if not SERIAL_AVAILABLE:
            return False

        # If already connected, check if still alive
        if self.ser and self.ser.is_open:
            return True

        ports = list(serial.tools.list_ports.comports())
        target_port = None
        
        # Heuristic: verify common USB-Serial descriptions or just pick the first likely one
        for p in ports:
            # Linux: /dev/ttyUSB*, /dev/ttyACM*
            # Windows: COM*
            if "USB" in p.device or "ACM" in p.device or "Arduino" in p.description:
                target_port = p.device
                break
        
        if not target_port and ports:
            # Fallback for generic adapters if no obvious one found
            target_port = ports[0].device
            
        if target_port:
            try:
                self.ser = serial.Serial(target_port, 9600, timeout=1)
                self.connected_port = target_port
                logger.info(f"Serial connected to {target_port}")
                return True
            except Exception as e:
                logger.error(f"Failed to connect to {target_port}: {e}")
                self.ser = None
                return False
        
        return False

    def send_data(self, azimuth: float, altitude: float):
        """Sends coordinates to the connected serial device."""
        if not SERIAL_AVAILABLE:
            return

        # Attempt connect if needed
        if not self.ser or not self.ser.is_open:
            if not self.find_and_connect():
                # Quietly fail if no device found to not spam logs too much, or debug log
                logger.debug("No serial device connected to receive coordinates.")
                return

        try:
            # Format: "AZ:123.45,ALT:45.67\n"
            msg = f"AZ:{azimuth:.2f},ALT:{altitude:.2f}\n"
            self.ser.write(msg.encode('utf-8'))
            logger.info(f"Sent Serial: {msg.strip()}")
        except Exception as e:
            logger.error(f"Serial write error: {e}")
            # Close connection to force simple reconnect logic next time
            try:
                self.ser.close()
            except:
                pass
            self.ser = None

# Initialize global manager
serial_manager = SerialManager()


# Mount the built frontend static files
# This allows the Python app to serve the React UI directly (Great for Raspberry Pi)
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    logger.warning(f"Frontend build not found at {frontend_dist}. API will work, but UI won't be served. Run 'npm run build' in frontend/.")

if __name__ == "__main__":
    import uvicorn
    # Clean up serial on exit (best effort)
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    finally:
        if serial_manager.ser and serial_manager.ser.is_open:
            serial_manager.ser.close()
