import React, { useState } from 'react';
import { Search, X, Crosshair } from 'lucide-react';
import { CELESTIAL_BODIES } from '../data/celestialBodies';

export default function CelestialCatalog({ isOpen, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredBodies = CELESTIAL_BODIES.filter(body => 
    body.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    body.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col relative overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div>
                <h2 className="text-2xl font-bold glow-text uppercase tracking-widest font-[Orbitron]">Cosmic Catalog</h2>
                <p className="text-cyan-400/60 text-xs uppercase tracking-wider font-[Rajdhani] font-medium">Database Access Terminal</p>
            </div>
          <button 
            onClick={onClose}
            className="btn-icon-square hover:text-black hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-black/20 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input
              type="text"
              placeholder="Search Catalog..."
              className="premium-input !pl-10 !border-white/20 !rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBodies.map((body) => (
              <button
                key={body.id}
                onClick={() => {
                  onSelect(body.id);
                  onClose();
                }}
                className="premium-btn flex items-center justify-between !bg-transparent !border-white/10 hover:!border-white hover:!bg-white hover:!text-black !p-4 !text-left !rounded-lg w-full group"
              >
                <div>
                  <div className="font-bold text-gray-200 group-hover:text-black transition-colors uppercase tracking-wider text-sm font-[Orbitron]">
                    {body.name}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600 uppercase tracking-widest mt-1 font-[Rajdhani] font-medium">
                    {body.type}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-black transform translate-x-2 group-hover:translate-x-0 relative z-10">
                    <Crosshair size={16} />
                </div>
              </button>
            ))}
            
            {filteredBodies.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-500 italic">
                    No celestial objects found matching query.
                </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                {filteredBodies.length} Objects Detected in Sector
            </p>
        </div>

      </div>
    </div>
  );
}
