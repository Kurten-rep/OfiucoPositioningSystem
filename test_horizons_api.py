import requests
import json

def test_horizons_api():
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    # Query for Mars (499) from Earth (399)
    # Observer ephemeris
    params = {
        'format': 'json',
        'COMMAND': "'499'", 
        'OBJ_DATA': "'YES'",
        'MAKE_EPHEM': "'YES'",
        'EPHEM_TYPE': "'OBSERVER'",
        'CENTER': "'500@399'", # Geocentric
        'START_TIME': "'2026-01-01'",
        'STOP_TIME': "'2026-01-02'",
        'STEP_SIZE': "'1 d'",
        'QUANTITIES': "'1,9,20,23,24,29'"
    }
    
    print(f"Querying {url} with params: {params}")
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        print("\nAPI Response Status: Success")
        print(f"Signature: {data.get('signature')}")
        
        # The 'result' field contains the actual ephemeris text
        result_text = data.get('result', '')
        print("\nSnippet of Result:")
        print(result_text[:500] + "...")
        
    except Exception as e:
        print(f"Error querying API: {e}")

if __name__ == "__main__":
    test_horizons_api()
