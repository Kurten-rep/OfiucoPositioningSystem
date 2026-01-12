export async function getCelestialCoordinates(target, lat, lon) {
  const params = new URLSearchParams({
    target,
    lat: lat.toString(),
    lon: lon.toString(),
    alt: '0' // Default to sea level for now
  });

  try {
    // API endpoint is proxied via Vite to http://localhost:8000/api/lookup
    const response = await fetch(`/api/lookup?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { error: error.message };
  }
}
