
import React, { useMemo } from 'react';

interface NeuralWebProps {
  isProcessing: boolean;
}

const NeuralWeb: React.FC<NeuralWebProps> = ({ isProcessing }) => {
  const nodes = useMemo(() => [...Array(40)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3.5,
    speed: 40 + Math.random() * 60,
    pulseOffset: Math.random() * 4
  })), []);

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-[4000ms] ${isProcessing ? 'opacity-30' : 'opacity-15'}`}>
      <svg className="w-full h-full">
        {nodes.map((n, i) => (
          nodes.slice(i + 1, i + 3).map((target, j) => (
            <line
              key={`${i}-${j}`}
              x1={`${n.x}%`}
              y1={`${n.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              stroke="rgba(34, 211, 238, 0.08)"
              strokeWidth="0.8"
            />
          ))
        ))}

        {nodes.map((n) => (
          <g key={n.id} style={{ animation: `drift-quantum ${n.speed}s linear infinite alternate` }}>
            <circle
              cx={`${n.x}%`}
              cy={`${n.y}%`}
              r={n.size}
              fill="rgba(34, 211, 238, 0.25)"
              className="animate-pulse"
              style={{ animationDelay: `${n.pulseOffset}s` }}
            />
            <circle
               cx={`${n.x}%`}
               cy={`${n.y}%`}
               r={n.size * 0.5}
               fill="#ffffff"
               className="opacity-20"
            />
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes drift-quantum {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default NeuralWeb;
