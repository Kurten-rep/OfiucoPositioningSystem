import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Database } from 'lucide-react';
import CelestialCatalog from './CelestialCatalog';

export default function StarGate({ onSearch, isLoading }) {
  const [target, setTarget] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (target && lat && lon) {
      onSearch({ target, lat, lon });
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Precise formatting
          setLat(position.coords.latitude.toFixed(6));
          setLon(position.coords.longitude.toFixed(6));
        },
        (error) => {
          alert("Could not retrieve location. Please enter manually.");
          console.error(error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="glass-panel p-8 max-w-md w-full mx-auto relative overflow-hidden">
      {/* Decorative blurred orbit rings */}
      <div className="absolute -top-10 -right-10 w-40 h-40 border border-white/10 rounded-full blur-sm animate-spin-slow pointer-events-none"></div>
      
      <h2 className="text-3xl font-bold mb-6 text-center glow-text tracking-wider uppercase">
        Star Gate
      </h2>
      
      <form onSubmit={handleSearch} className="flex flex-col gap-6">
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 justify-between font-[Orbitron] text-xs">
            <span className="flex items-center gap-2"><Search size={16} /> Target Identifier</span>
            <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="premium-btn btn-pill flex items-center gap-2 !py-2 !px-4 !text-xs !border-white/20"
            >
                <Database size={12} /> Catalog
            </button>
          </label>
          <input
            type="text"
            className="premium-input font-[Rajdhani] font-medium text-lg"
            placeholder="e.g. Mars, 499, Jupiter"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 justify-between font-[Orbitron] text-xs">
            <span className="flex items-center gap-2"><MapPin size={16} /> Observer Location</span>
            <button 
                type="button" 
                onClick={getLocation}
                className="premium-btn btn-pill flex items-center gap-2 !py-2 !px-4 !text-xs !border-white/20"
            >
                <Navigation size={12} /> Auto-Locate
            </button>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              className="premium-input"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
            <input
              type="number"
              step="any"
              className="premium-input"
              placeholder="Longitude"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="premium-btn w-full mt-4 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-pulse">Aligning Sensors...</span>
          ) : (
            <>Initialize Scan</>
          )}
        </button>
      </form>

      <CelestialCatalog 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        onSelect={(selectedId) => setTarget(selectedId)} 
      />
    </div>
  );
}
