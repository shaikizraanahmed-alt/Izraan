
import React, { useState, useRef, useEffect } from 'react';

interface ThreeDProjectionProps {
  url: string;
}

const ThreeDProjection: React.FC<ThreeDProjectionProps> = ({ url }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="w-full h-full flex items-center justify-center perspective-[3000px] overflow-hidden cursor-grab active:cursor-grabbing select-none bg-transparent"
    >
      {/* Interactive HUD Overlay */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-50">
        <div className="text-[10px] font-orbitron text-cyan-400 font-black tracking-[1em] uppercase opacity-40 animate-pulse">
          Volumetric Reconstruction
        </div>
        <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>

      <div 
        className="relative w-[80%] h-[80%] transition-transform duration-100 ease-out preserve-3d flex items-center justify-center"
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* The Free-Standing Subject Anchor */}
        <div className="relative w-full h-full flex items-center justify-center preserve-3d">
          
          {/* Main Volumetric Layer (Front) */}
          <div className="absolute inset-0 flex items-center justify-center preserve-3d">
            <img 
              src={url} 
              className="max-w-full max-h-full object-contain filter brightness-110 drop-shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              alt="Volumetric Front"
              style={{ transform: 'translateZ(20px)' }}
            />
          </div>

          {/* Depth Simulation Layers (Parallax Volume) */}
          {[15, 10, 5, 0, -5, -10, -15].map((z) => (
            <div 
              key={z} 
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 preserve-3d"
              style={{ transform: `translateZ(${z}px) scale(${1 + (Math.abs(z) * 0.001)})` }}
            >
              <img src={url} className="max-w-full max-h-full object-contain blur-[1px]" alt="" />
            </div>
          ))}

          {/* Reverse Volumetric Layer (Back) */}
          <div className="absolute inset-0 flex items-center justify-center preserve-3d rotate-y-180">
            <img 
              src={url} 
              className="max-w-full max-h-full object-contain opacity-20 blur-[3px] filter brightness-75 hue-rotate-180 grayscale contrast-150"
              alt="Volumetric Back"
              style={{ transform: 'translateZ(20px) scaleX(-1)' }}
            />
          </div>

          {/* Holographic Core Glow (Inside Subject) */}
          <div className="absolute w-32 h-32 bg-cyan-400/10 blur-[80px] rounded-full animate-pulse pointer-events-none" />
        </div>

        {/* Floating Scan-Beam (Localized to object) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-full h-[2px] bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-[scan-float_4s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Viewport Telemetry UI */}
      <div className="absolute bottom-12 left-12 flex flex-col gap-3 font-orbitron text-[9px] text-cyan-500/40 uppercase tracking-[0.3em] pointer-events-none border-l border-cyan-500/20 pl-4 py-2">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 bg-cyan-500/60 rounded-sm"></div>
           <span>PITCH_X: {Math.round(rotation.x)}°</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 bg-cyan-500/60 rounded-sm"></div>
           <span>YAW_Y: {Math.round(rotation.y)}°</span>
        </div>
        <div className="mt-2 text-indigo-400/20 flex items-center gap-2">
           <div className="w-8 h-[1px] bg-indigo-500/20" /> 
           SPATIAL_SYNC_XIII
        </div>
      </div>

      {/* Angle Legend (Top Right) */}
      <div className="absolute top-12 right-12 flex flex-col gap-1 text-right pointer-events-none">
         <div className="text-[10px] text-white/20 font-black italic tracking-widest border-r-2 border-cyan-400/30 pr-3">AXIS_ROT_ENABLE</div>
         <div className="text-[7px] text-cyan-400/30 uppercase tracking-[0.4em] pr-3 mt-1">360° ORBITAL_INSPECTION_MODE</div>
      </div>

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        @keyframes scan-float {
          0%, 100% { transform: translateY(-150px) translateZ(100px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(150px) translateZ(100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ThreeDProjection;
