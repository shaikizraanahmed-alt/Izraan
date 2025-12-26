
import React, { useEffect, useState } from 'react';
import { Hexagon, Lock, Fingerprint, Cpu, Globe, Activity, Database, Zap, ShieldCheck } from 'lucide-react';

const HudPanel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`glass-v5 p-6 rounded-2xl relative overflow-hidden ${className} border border-white/5`}>
    <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
      <span className="text-[11px] font-orbitron text-white uppercase tracking-[0.4em] flex items-center gap-4 font-black italic">
        <Hexagon size={16} className="text-cyan-400 animate-pulse" /> {title}
      </span>
      <div className="flex gap-1.5">
         <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
         <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
      </div>
    </div>
    {children}
  </div>
);

const FuturisticHud: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [stability, setStability] = useState(99.8);
  const [throughput, setThroughput] = useState(14.2);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const stabTimer = setInterval(() => {
      setStability(99.6 + Math.random() * 0.3);
      setThroughput(10 + Math.random() * 8);
    }, 4000);
    return () => { clearInterval(timer); clearInterval(stabTimer); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none p-12 flex flex-col justify-between z-0">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-10">
          <HudPanel title="AUTH_LEVEL_0_IZRAAN" className="w-[380px]">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-400/20 shadow-inner">
                  <Fingerprint className="text-white" size={44} />
               </div>
               <div className="flex-1">
                  <div className="text-lg font-orbitron font-black text-white italic tracking-[0.2em]">SHA_IZRAAN_AHMED</div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-cyan-400 font-black tracking-[0.3em] opacity-60 uppercase">
                     <ShieldCheck size={12} /> Master_Admin_V5
                  </div>
               </div>
            </div>
            <div className="mt-8 space-y-4">
               <div className="flex justify-between text-[10px] text-white/40 uppercase font-black tracking-[0.4em]">
                  <span className="flex items-center gap-2"><Cpu size={12} /> Neural_Stability</span>
                  <span className="text-cyan-400">{stability.toFixed(2)}%</span>
               </div>
               <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-px shadow-inner">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-white transition-all duration-1000 shadow-[0_0_15px_rgba(34,211,238,0.5)]" style={{ width: `${stability}%` }}></div>
               </div>
            </div>
          </HudPanel>
          
          <HudPanel title="QUANTUM_TELEMETRY" className="w-[280px]">
             <div className="space-y-4">
               {[
                 { label: 'CORES_ACTIVE', val: '128_QUANTUM', icon: <Cpu size={14} /> },
                 { label: 'DB_SYNC', val: 'OPTIMAL', icon: <Database size={14} /> },
                 { label: 'THROUGHPUT', val: `${throughput.toFixed(1)} GB/S`, icon: <Zap size={14} /> },
                 { label: 'LINK_LATENCY', val: '0.002 MS', icon: <Activity size={14} /> },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center text-[10px] font-mono group">
                    <span className="text-slate-500 flex items-center gap-3 italic font-black uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                       {item.icon} {item.label}
                    </span>
                    <span className="text-white font-black italic border-b border-white/5 pb-0.5">{item.val}</span>
                 </div>
               ))}
             </div>
          </HudPanel>
        </div>

        <div className="flex flex-col items-end gap-20">
          <div className="text-right flex flex-col items-end">
             <div className="flex items-center gap-4 mb-4 opacity-40">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-cyan-400"></div>
                <span className="text-[10px] font-orbitron tracking-[1em] uppercase">Spectral_V5</span>
             </div>
             <div className="text-9xl font-orbitron text-white tracking-tighter font-black italic drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] leading-none">
               JARVIS<span className="text-cyan-400 opacity-20 text-6xl ml-4">V5</span>
             </div>
             <div className="text-lg text-cyan-400 tracking-[1.8em] font-orbitron uppercase mt-8 font-black italic mr-[-1.8em] text-quantum">QUANTUM_CORE</div>
          </div>
          
          <HudPanel title="CHRONOS_UPLINK" className="w-[300px]">
            <div className="text-center py-2">
              <div className="text-6xl font-orbitron text-white font-black italic tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                 {time.toLocaleTimeString([], { hour12: false })}
              </div>
              <div className="text-[10px] text-slate-500 font-black tracking-[0.8em] mt-5 uppercase border-t border-white/5 pt-4">
                 {time.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </HudPanel>

          <div className="flex flex-col gap-6 items-end opacity-20">
             <div className="text-[11px] font-orbitron tracking-[0.6em] glass-v5 p-8 border-r-[15px] border-cyan-400 text-right uppercase font-black italic leading-loose shadow-2xl">
               <span className="text-cyan-400">// PROTOCOL: SENTINEL_PRIME_L0</span><br/>
               // USER: SH_IZRAAN_AHMED<br/>
               // OS: QUANTUM_BLUE_V5<br/>
               // STATUS: OPTIMAL_HD_CORE
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticHud;
