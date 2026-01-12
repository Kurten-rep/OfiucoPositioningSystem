import React, { useState } from 'react';
import StarGate from './components/StarGate';
import CosmicDisplay from './components/CosmicDisplay';
import { getCelestialCoordinates } from './api';

import CurrentTime from './components/CurrentTime';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Auto-tracking effect
  React.useEffect(() => {
    let intervalId;

    if (isTracking && searchParams) {
      intervalId = setInterval(async () => {
        const result = await getCelestialCoordinates(
            searchParams.target, 
            searchParams.lat, 
            searchParams.lon
        );
        
        if (!result.error) {
            setData({ ...result, timestamp: new Date() });
        }
      }, 5000); // Update every 5 seconds
    }

    return () => clearInterval(intervalId);
  }, [isTracking, searchParams]);

  const handleSearch = async ({ target, lat, lon }) => {
    setLoading(true);
    setError(null);
    setData(null);
    setIsTracking(false); // Stop tracking on new search
    setSearchParams({ target, lat, lon }); // Save params for tracking

    const result = await getCelestialCoordinates(target, lat, lon);
    
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      setData(result); // Pass result anyway if it has raw_response
    } else {
      setData({ ...result, timestamp: new Date() });
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative">
      <div className="stars-container"></div>
      
      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        <div className="flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold text-center glow-text bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-2 font-[Orbitron] tracking-wide">
            TELESCOPIO
          </h1>
          <p className="text-center text-cyan-200/60 uppercase tracking-[0.5em] text-xs font-[Rajdhani] font-semibold">
            Orbital Positioning System
          </p>
          <CurrentTime />
        </div>

        <StarGate onSearch={handleSearch} isLoading={loading} />
        
        {(data || error) && (
          <CosmicDisplay 
            data={data} 
            error={error} 
            isTracking={isTracking}
            onToggleTracking={() => setIsTracking(!isTracking)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
