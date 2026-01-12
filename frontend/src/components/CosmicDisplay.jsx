import React from 'react';
import { Compass, ArrowUpCircle, AlertTriangle, Radio } from 'lucide-react';
import { CELESTIAL_BODIES } from '../data/celestialBodies';

export default function CosmicDisplay({ data, error, isTracking, onToggleTracking }) {
  if (error) {
    return (
      <div className="glass-panel p-6 max-w-md w-full mx-auto mt-8 border-red-500/30 bg-red-900/10">
        <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={24} /> Signal Lost
        </h3>
        <p className="text-gray-300">{error}</p>
        {data && data.raw_response && (
            <pre className="mt-4 p-2 bg-black/50 rounded text-xs text-red-200 overflow-auto max-h-40">
                {data.raw_response}
            </pre>
        )}
      </div>
    );
  }

  if (!data || !data.data) return null;

  const { target, data: celestialData } = data;
  const { azimuth, altitude } = celestialData;

  // Resolve body name
  const bodyInfo = CELESTIAL_BODIES.find(b => b.id === target || b.name.toLowerCase() === target.toLowerCase());
  const displayName = bodyInfo ? bodyInfo.name : target;
  const displayId = bodyInfo ? bodyInfo.id : '';
  const description = bodyInfo ? bodyInfo.description : 'Celestial object data retrieved from JPL Horizon system.';

  return (
    <div className="glass-panel p-8 max-w-md w-full mx-auto mt-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center justify-between mb-2">
            <div className="text-sm md:text-lg font-bold text-white uppercase tracking-wider glow-text font-[Orbitron]">
                Target Acquired: {displayName} <span className="text-cyan-400 mx-1">|</span> ID: "{displayId || target}"
            </div>
            {onToggleTracking && (
                <button 
                    onClick={onToggleTracking}
                    className={`premium-btn btn-pill flex items-center gap-2 !py-1 !px-4 !text-xs transition-all ${
                        isTracking 
                        ? '!bg-white !text-black !border-white' 
                        : '!bg-transparent !text-gray-400 !border-white/20 hover:!border-white hover:!text-white'
                    }`}
                >
                    <Radio size={14} className={isTracking ? 'animate-pulse' : ''} />
                    {isTracking ? 'Tracking Active' : 'Enable Tracking'}
                </button>
            )}
        </div>
        <p className="text-cyan-200/60 text-sm font-[Rajdhani] leading-relaxed">
            {description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center mb-3 bg-cyan-900/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Compass className="text-cyan-400" size={32} />
          </div>
          <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Azimuth</span>
          <span className="text-3xl font-light text-white font-mono">
            {azimuth ? parseFloat(azimuth).toFixed(2) : "---"}<span className="text-cyan-500 text-lg">°</span>
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 flex items-center justify-center mb-3 bg-purple-900/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <ArrowUpCircle className="text-purple-400" size={32} />
          </div>
          <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Altitude</span>
          <span className="text-3xl font-light text-white font-mono">
            {altitude ? parseFloat(altitude).toFixed(2) : "---"}<span className="text-purple-500 text-lg">°</span>
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 text-center flex justify-between items-center text-xs text-gray-500 font-mono">
         <div className="font-bold text-cyan-500/70">
            {data.timestamp && (
                <span>
                    Last Update: {data.timestamp.toLocaleTimeString([], { hour12: false })} / {data.timestamp.toLocaleTimeString([], { hour12: true })}
                </span>
            )}
         </div>
         <span>JPL HORIZONS</span>
      </div>
    </div>
  );
}
