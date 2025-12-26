
import React, { useMemo } from 'react';

interface HolographicFaceProps {
  isListening: boolean;
  isSpeaking: boolean;
  amplitude: number;
}

const HolographicFace: React.FC<HolographicFaceProps> = ({ isListening, isSpeaking, amplitude }) => {
  const coreAuraColor = isSpeaking 
    ? `rgba(34, 211, 238, ${0.5 + amplitude * 2.0})` 
    : isListening ? 'rgba(34, 211, 238, 0.3)' : 'rgba(59, 130, 246, 0.15)'; 
    
  const ringCount = 10;
  const innerRings = useMemo(() => [...Array(ringCount)].map((_, i) => i), []);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center perspective-[5000px]">
      {/* High-Fidelity Glow Core */}
      <div 
        className="absolute w-[85%] h-[85%] rounded-full blur-[120px] transition-all duration-300 ease-out"
        style={{ 
          background: `radial-gradient(circle, ${coreAuraColor} 0%, transparent 85%)`,
          opacity: isSpeaking || isListening ? 1.0 : 0.5,
          transform: `scale(${1 + amplitude * 0.7})`,
          boxShadow: isSpeaking ? `0 0 100px rgba(34, 211, 238, 0.3)` : 'none'
        }}
      />
      
      <div className="relative w-[75%] aspect-square flex items-center justify-center">
        {/* Outer Housing */}
        <div className="absolute inset-0 bg-white/5 rounded-full border border-white/10 shadow-[inset_0_0_50px_rgba(255,255,255,0.05)]" />

        {innerRings.map((i) => (
          <div
            key={i}
            className="absolute inset-0 border border-transparent rounded-full flex items-start justify-center"
            style={{
              borderColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              borderTopColor: i % 3 === 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(34, 211, 238, 0.6)',
              transform: `rotate(${i * 36 + (amplitude * 80)}deg) scale(${0.25 + (i * 0.08)})`,
              animation: `spin-hd-v5 ${12 + i * 3}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }}
          >
             <div className={`w-1.5 h-6 ${i % 3 === 0 ? 'bg-white shadow-[0_0_10px_#fff]' : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'} opacity-80 rounded-full`} />
          </div>
        ))}

        {/* The Iris of Jarvis Quantum */}
        <div className="absolute z-40 flex items-center justify-center">
           <div 
             className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border-2 border-white/20 transition-all duration-200"
             style={{ 
               transform: `scale(${1 + amplitude * 0.3})`,
               animation: isSpeaking ? 'none' : 'eye-v5-pulse 6s ease-in-out infinite'
             }}
           >
              <div className="w-full h-full bg-cyan-400 rounded-full animate-ping opacity-30 shadow-[0_0_50px_#22d3ee]" />
              <div className="absolute w-5 h-5 bg-slate-950 rounded-full shadow-[0_0_20px_rgba(34,211,238,1.0)] border-2 border-cyan-400 flex items-center justify-center">
                 <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]" />
              </div>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-hd-v5 {
          from { transform: rotate(0deg) scale(inherit); }
          to { transform: rotate(360deg) scale(inherit); }
        }
        @keyframes eye-v5-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; filter: drop-shadow(0 0 20px rgba(34,211,238,0.3)); }
          50% { transform: scale(1.2); opacity: 1.0; filter: drop-shadow(0 0 50px rgba(34,211,238,0.7)); }
        }
      `}</style>
    </div>
  );
};

export default HolographicFace;
