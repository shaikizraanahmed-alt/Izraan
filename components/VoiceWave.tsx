
import React from 'react';

interface VoiceWaveProps {
  isActive: boolean;
  amplitude: number;
}

const VoiceWave: React.FC<VoiceWaveProps> = ({ isActive, amplitude }) => {
  return (
    <div className="flex items-end justify-center space-x-[5px] h-12 w-full max-w-md mx-auto px-6 overflow-hidden">
      {[...Array(48)].map((_, i) => {
        const distFromCenter = Math.abs(i - 24) / 24;
        const multiplier = Math.pow(1 - distFromCenter, 2.5);
        
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            style={{
              height: isActive 
                ? `${Math.max(3, (amplitude * 300 * multiplier) + (Math.random() * 6))}px` 
                : '3px',
              opacity: isActive ? 0.3 + (multiplier * 0.7) : 0.05,
              background: isActive && i % 6 === 0 
                ? 'linear-gradient(to top, #22d3ee, #ffffff)' 
                : 'linear-gradient(to top, #0891b2, #22d3ee)',
            }}
          />
        );
      })}
    </div>
  );
};

export default VoiceWave;
