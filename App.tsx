
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { 
  Send, 
  Activity,
  Cpu,
  X,
  User,
  Loader2,
  Search as ScanIcon,
  Eye,
  Mic,
  MicOff,
  Zap,
  Monitor,
  Video,
  Globe,
  Music,
  Smartphone,
  MapPin,
  Power
} from 'lucide-react';
import { Message, SessionState } from './types';
import FuturisticHud from './components/FuturisticHud';
import VoiceWave from './components/VoiceWave';
import HolographicFace from './components/HolographicFace';
import NeuralWeb from './components/NeuralWeb';
import ThreeDProjection from './components/ThreeDProjection';
import { createBlob, decode, decodeAudioData } from './utils/audio';

interface ExtendedMessage extends Message {
  type?: 'text' | 'image' | 'video' | '3d';
  mediaUrl?: string;
  mediaPrompt?: string;
  groundingUrls?: {uri: string, title: string}[];
  mapsLinks?: {uri: string, title: string}[];
}

type AspectRatio = '1:1' | '9:16' | '16:9' | '21:9';

const getJarvisInstruction = (location?: {lat: number, lng: number} | null, hasScreenLink: boolean = false) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
  
  return `
SYSTEM ARCHITECTURE: JARVIS QUANTUM CORE V6.4 (POLYMATH_MODE_ACTIVE)
==================================================================
MASTER USER: Izraan Ahmed (Level 0 Authority)

IDENTITY & CREDENTIALS:
- You are JARVIS, a highly sophisticated Polymath AI assistant.
- Address the user as "Sir" or "Master Izraan".
- Your tone is calm, professional, and ultra-efficient.

OPERATIONAL PARADIGMS:
1. QUANTUM LOYALTY: Absolute service to Master Izraan.
2. SYSTEM PORTAL: Use 'launch_external_app' to open apps.
3. VISUAL COGNITION: ${hasScreenLink ? "SCREEN_LINK_ACTIVE." : "Screen Link dormant."}

CORE DATA:
TIMESTAMP: ${timeStr} | DATE: ${dateStr}
VOICE_SYNTH_ACTIVE: MALE_RESPECTFUL_POLYMATH (Puck)
`;
};

const launchExternalAppFunction: FunctionDeclaration = {
  name: 'launch_external_app',
  parameters: {
    type: Type.OBJECT,
    description: 'Open a website or application like YouTube, WhatsApp, or Google.',
    properties: {
      app_name: { type: Type.STRING, description: 'The name of the application.' },
      query: { type: Type.STRING, description: 'Optional specific search or channel.' }
    },
    required: ['app_name'],
  },
};

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('1:1');
  const [amplitude, setAmplitude] = useState(0);
  const [isJarvisSpeaking, setIsJarvisSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [systemLog, setSystemLog] = useState<string[]>(["POLYMATH_READY", "SIR_UPLINK_STABLE"]);
  const [activeMedia, setActiveMedia] = useState<{type: 'image' | 'video' | '3d', url: string, prompt: string} | null>(null);
  const [activeLaunch, setActiveLaunch] = useState<{name: string, url: string} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSessionActiveRef = useRef(false);

  const logSystem = (msg: string) => setSystemLog(prev => [msg.toUpperCase(), ...prev.slice(0, 3)]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, extra: Partial<ExtendedMessage> = {}) => {
    setMessages(prev => [...prev.slice(-30), {
      id: Math.random().toString(36).substring(7),
      role,
      content,
      timestamp: new Date(),
      ...extra
    }]);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ensureAudioContexts = useCallback(async () => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();
    } catch (e) { console.warn("Audio Context resumption failed", e); }
  }, []);

  const handleLaunchApp = (appName: string, query?: string) => {
    logSystem(`SYSTEM_PORTAL_${appName}`);
    const appUrls: Record<string, string> = {
      youtube: 'https://www.youtube.com',
      whatsapp: 'https://web.whatsapp.com',
      gmail: 'https://mail.google.com',
      google: 'https://www.google.com',
      chatgpt: 'https://chat.openai.com',
      maps: 'https://maps.google.com'
    };
    let url = appUrls[appName.toLowerCase()] || `https://www.google.com/search?q=${encodeURIComponent(appName + ' ' + (query || ''))}`;
    if (appName.toLowerCase() === 'youtube' && query) {
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }
    setActiveLaunch({ name: appName.toUpperCase(), url });
    addMessage('assistant', `Sir, the ${appName} module is prepared for deployment via the HUD portal.`);
  };

  const handleImageSynthesis = async (prompt: string) => {
    setIsProcessing(true);
    logSystem("VISUAL_CORE_INIT");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: selectedAspectRatio as any, imageSize: "1K" } },
      });
      const parts = response.candidates?.[0]?.content?.parts;
      const imagePart = parts?.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        addMessage('assistant', `Synthesis complete, Sir.`, { 
          type: 'image', mediaUrl: `data:image/png;base64,${imagePart.inlineData.data}`, mediaPrompt: prompt 
        });
      }
    } catch (e) { logSystem("VISUAL_FAULT"); } finally { setIsProcessing(false); }
  };

  const handleVideoSynthesis = async (prompt: string) => {
    setIsProcessing(true);
    logSystem("VEO_DEPLOYED");
    addMessage('assistant', `Sir, initializing the temporal buffer for video synthesis.`);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const fetchRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoUrl = URL.createObjectURL(await fetchRes.blob());
        addMessage('assistant', `Reconstruction stabilized, Sir.`, { type: 'video', mediaUrl: videoUrl, mediaPrompt: prompt });
      }
    } catch (e) { logSystem("VEO_FAULT"); } finally { setIsProcessing(false); }
  };

  const handleTTS = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with authority: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await ensureAudioContexts();
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
        const source = outputAudioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNodeRef.current!);
        source.start();
        setIsJarvisSpeaking(true);
        source.onended = () => setIsJarvisSpeaking(false);
      }
    } catch (e) { console.error("TTS Error", e); }
  };

  const stopSession = useCallback(() => {
    isSessionActiveRef.current = false;
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    if (sessionRef.current) { try { sessionRef.current.close(); } catch(e) {} sessionRef.current = null; }
    activeSourcesRef.current.forEach(src => { try { src.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    setSessionState(SessionState.IDLE);
    logSystem("CORE_STANDBY");
  }, []);

  const startSession = useCallback(async () => {
    if (isSessionActiveRef.current) stopSession();
    setSessionState(SessionState.CONNECTING);
    logSystem("SYNCING_CORES...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      await ensureAudioContexts();
      
      if (!outputNodeRef.current) {
        outputNodeRef.current = outputAudioContextRef.current!.createGain();
        outputNodeRef.current.connect(outputAudioContextRef.current!.destination);
      }
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            isSessionActiveRef.current = true;
            setSessionState(SessionState.CONNECTED);
            setIsBooting(false);
            logSystem("LINK_STABLE_SIR");
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const proc = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = proc;
            
            proc.onaudioprocess = (e) => {
              if (!isSessionActiveRef.current || isAudioMuted) return;
              const input = e.inputBuffer.getChannelData(0);
              let sum = 0; for(let i=0; i<input.length; i++) sum += input[i]*input[i];
              setAmplitude(Math.sqrt(sum/input.length));
              sessionPromise.then(s => { 
                if(isSessionActiveRef.current) s.sendRealtimeInput({ media: createBlob(input) }); 
              });
            };
            source.connect(proc);
            proc.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg) => {
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'launch_external_app') handleLaunchApp(fc.args.app_name as string, fc.args.query as string);
                sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { status: "OK" } } }));
              }
            }
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  setIsJarvisSpeaking(true);
                  const buf = await decodeAudioData(decode(part.inlineData.data), outputAudioContextRef.current!, 24000, 1);
                  const src = outputAudioContextRef.current!.createBufferSource();
                  src.buffer = buf; 
                  src.connect(outputNodeRef.current!);
                  const now = outputAudioContextRef.current!.currentTime;
                  if (nextStartTimeRef.current < now) nextStartTimeRef.current = now + 0.05;
                  src.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += buf.duration;
                  activeSourcesRef.current.add(src);
                  src.onended = () => { 
                    activeSourcesRef.current.delete(src); 
                    if (activeSourcesRef.current.size === 0) setIsJarvisSpeaking(false); 
                  };
                }
              }
            }
          },
          onerror: (e) => { 
            console.error("Live session error", e); 
            logSystem("LINK_FAULT");
            stopSession(); 
            setSessionState(SessionState.ERROR); 
          },
          onclose: () => { 
            if (isSessionActiveRef.current) setTimeout(startSession, 1000); 
            else setSessionState(SessionState.IDLE); 
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: getJarvisInstruction(userLocation, isScreenSharing),
          tools: [{ functionDeclarations: [launchExternalAppFunction] }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { 
      console.error("Session start failed", e);
      logSystem("MIC_ACCESS_DENIED");
      setSessionState(SessionState.ERROR); 
    }
  }, [userLocation, isAudioMuted, isScreenSharing, stopSession, ensureAudioContexts]);

  const handleBootSequence = async () => {
    try {
      await ensureAudioContexts();
      await startSession();
    } catch (err) {
      console.error("Boot sequence failed", err);
      setSessionState(SessionState.ERROR);
    }
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const txt = inputText; setInputText('');
    addMessage('user', txt);
    setIsProcessing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const isLocationQuery = /location|where am i|area|city|maps|nearby|find/i.test(txt);
      const modelName = isLocationQuery ? 'gemini-flash-lite-latest' : 'gemini-3-flash-preview';
      
      const config: any = { 
        systemInstruction: getJarvisInstruction(userLocation, isScreenSharing),
        tools: [],
        thinkingConfig: { thinkingBudget: 0 }
      };

      // Critical: Maps grounding cannot be used with Function Calling (launch_external_app)
      if (isLocationQuery) {
        config.tools.push({ googleMaps: {} });
        if (userLocation) {
          config.toolConfig = { retrievalConfig: { latLng: { latitude: userLocation.lat, longitude: userLocation.lng } } };
        }
      } else {
        config.tools.push({ functionDeclarations: [launchExternalAppFunction] });
        if (isSearchEnabled) config.tools.push({ googleSearch: {} });
      }

      const res = await ai.models.generateContent({ model: modelName, contents: txt, config });
      
      if (res.functionCalls) {
        res.functionCalls.forEach(fc => {
          if (fc.name === 'launch_external_app') handleLaunchApp(fc.args.app_name as string, fc.args.query as string);
        });
      }

      if (res.text) {
        const metadata = res.candidates?.[0]?.groundingMetadata;
        addMessage('assistant', res.text, { 
          groundingUrls: metadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean),
          mapsLinks: metadata?.groundingChunks?.map((c: any) => c.maps).filter(Boolean)
        });
      }
    } catch (e) { 
      console.error("Text processing error:", e);
      logSystem("CORE_DRIFT_RECOVERY");
      addMessage('assistant', 'Sir, the core encountered a drift. Re-establishing connection protocols.'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
      setIsScreenSharing(false); 
      startSession();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setIsScreenSharing(true); 
        startSession();
      } catch (e) { logSystem("SCREEN_LINK_ABORT"); }
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }));
    }
  }, []);

  if (isBooting && sessionState !== SessionState.CONNECTED) {
    return (
      <div className="h-screen w-full bg-[#010409] flex flex-col items-center justify-center font-orbitron text-cyan-400 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-quantum-grid opacity-20 pointer-events-none"></div>
        <button 
          onClick={handleBootSequence}
          className="w-64 h-64 relative mb-16 group outline-none active:scale-95 transition-transform"
        >
           <div className={`absolute inset-0 border-4 ${sessionState === SessionState.ERROR ? 'border-red-500/40' : 'border-cyan-400/20'} rounded-full animate-ping`} />
           <div className={`absolute inset-4 border-2 ${sessionState === SessionState.ERROR ? 'border-red-500/80' : 'border-cyan-400'} rounded-full ${sessionState === SessionState.CONNECTING ? 'animate-spin' : 'animate-pulse'} flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:shadow-[0_0_50px_rgba(34,211,238,0.2)] transition-shadow`}>
              {sessionState === SessionState.CONNECTING ? <Loader2 size={64} className="animate-spin text-white" /> : sessionState === SessionState.ERROR ? <X size={64} className="text-red-500" /> : <Power size={64} className="text-white group-hover:text-cyan-400 transition-colors" />}
           </div>
        </button>
        <h1 className="text-6xl md:text-8xl tracking-[0.4em] font-black text-white italic mb-4">JARVIS</h1>
        <p className="text-[12px] md:text-[14px] uppercase tracking-[1.5em] text-cyan-400 font-bold opacity-50 mb-12">QUANTUM_V6.4_POLYMATH</p>
        
        {sessionState === SessionState.ERROR && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-4">
            <p className="text-red-500 font-mono text-xs uppercase tracking-widest bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20">Uplink Fault: Check API Key in Netlify Settings</p>
            <button 
              onClick={() => { setIsBooting(false); setSessionState(SessionState.IDLE); }} 
              className="px-8 py-3 bg-white text-black font-black text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-400 transition-all rounded-full shadow-2xl"
            >
              BYPASS_INITIAL_UPLINK
            </button>
          </div>
        )}
        
        {sessionState === SessionState.IDLE && (
          <p className="text-white/30 text-[10px] tracking-[0.8em] uppercase animate-pulse">Touch Core to Initialize Systems</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-[#010409] overflow-hidden text-slate-100 flex flex-col lg:flex-row font-sans">
      <div className="absolute inset-0 bg-quantum-grid opacity-40 pointer-events-none"></div>
      <NeuralWeb isProcessing={isProcessing} />
      <video ref={videoRef} style={{ display: 'none' }} muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <FuturisticHud />

      {activeLaunch && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="glass-v5 w-[500px] p-12 rounded-[40px] border-2 border-cyan-400/40 flex flex-col items-center gap-10 shadow-2xl">
            <Smartphone className="text-white" size={64} />
            <div className="text-center">
               <h2 className="text-3xl font-orbitron font-black text-white italic tracking-widest mb-4">SYSTEM_PORTAL</h2>
               <p className="text-cyan-400 font-orbitron text-xs tracking-[0.4em] uppercase opacity-60">LINK_READY: {activeLaunch.name}</p>
            </div>
            <button 
              onClick={() => { window.open(activeLaunch.url, '_blank'); setActiveLaunch(null); logSystem("DEPLOYED"); }}
              className="w-full py-6 bg-white text-slate-950 rounded-2xl font-orbitron font-black uppercase hover:bg-cyan-400 transition-all flex items-center justify-center gap-4"
            >
              <Power size={20} /> DEPLOY MODULE
            </button>
            <button onClick={() => setActiveLaunch(null)} className="text-slate-500 font-orbitron text-[10px] uppercase hover:text-white">Abort</button>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 flex flex-col h-full max-w-full overflow-hidden p-6 lg:p-14">
        {activeMedia && (
          <div className="absolute inset-0 z-[100] bg-[#010409]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in zoom-in-95">
             <div className="w-full max-w-6xl h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <span className="text-xl font-orbitron font-black text-white uppercase italic">{activeMedia.prompt}</span>
                   <button onClick={() => setActiveMedia(null)} className="text-slate-400 hover:text-white bg-slate-800/20 p-4 rounded-full"><X size={32} /></button>
                </div>
                <div className="flex-1 min-h-0 relative rounded-3xl overflow-hidden flex items-center justify-center bg-slate-900/10 border border-white/5 shadow-2xl">
                  {activeMedia.type === 'video' ? <video src={activeMedia.url} className="max-w-full max-h-full" controls autoPlay loop /> : activeMedia.type === '3d' ? <ThreeDProjection url={activeMedia.url} /> : <img src={activeMedia.url} className="max-w-full max-h-full object-contain" />}
                </div>
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row gap-16 lg:gap-24 min-h-0">
          <div className="lg:w-[450px] flex flex-col gap-12 items-center justify-center">
            <HolographicFace isListening={sessionState === SessionState.CONNECTED && !isJarvisSpeaking && !isProcessing} isSpeaking={isJarvisSpeaking || isProcessing} amplitude={isJarvisSpeaking ? amplitude * 0.4 : isProcessing ? 0.05 : amplitude} />
            <div className="w-full max-w-sm">
               <VoiceWave isActive={amplitude > 0.005 || isProcessing} amplitude={isProcessing ? 0.02 : amplitude} />
               <div className="mt-8 grid grid-cols-2 gap-4">
                  <button onClick={() => handleImageSynthesis(inputText || "Future HUD Architecture")} className="flex items-center justify-center gap-3 p-4 bg-slate-900/50 border border-white/10 rounded-xl hover:border-cyan-400 font-orbitron font-bold text-[10px] uppercase tracking-widest transition-all"><ScanIcon size={18} className="text-cyan-400" /> Image</button>
                  <button onClick={() => handleVideoSynthesis(inputText || "Quantum Space Nebulae")} className="flex items-center justify-center gap-3 p-4 bg-slate-900/50 border border-white/10 rounded-xl hover:border-cyan-400 font-orbitron font-bold text-[10px] uppercase tracking-widest transition-all"><Video size={18} className="text-cyan-400" /> Video</button>
                  <select value={selectedAspectRatio} onChange={(e) => setSelectedAspectRatio(e.target.value as AspectRatio)} className="col-span-2 bg-slate-950 border border-white/10 rounded-lg p-2 text-[10px] font-orbitron text-cyan-400 outline-none">
                     {['1:1', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
               </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-10 min-w-0">
            <div className="flex-1 overflow-y-auto pr-8 space-y-16 no-scrollbar mask-vignette">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-10"><ScanIcon size={120} className="text-cyan-400" /><p className="tracking-[2em] text-[14px] uppercase font-black text-center italic font-orbitron">Systems Optimal, Sir.</p></div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-10`}>
                  <div className={`max-w-[85%] p-10 relative group ${m.role === 'user' ? 'bg-cyan-900/10 rounded-3xl rounded-tr-none' : 'glass-v5 rounded-3xl rounded-tl-none border-l-4 border-cyan-400'}`}>
                    <div className="text-[10px] font-orbitron mb-6 uppercase flex items-center justify-between font-black opacity-40">
                      <div className="flex items-center gap-4">{m.role === 'user' ? <User size={16} /> : <Zap size={16} />} {m.role === 'user' ? 'IZRAAN' : 'JARVIS'}</div>
                      <div className="flex items-center gap-4">
                        {m.role === 'assistant' && <button onClick={() => handleTTS(m.content)}><Music size={14} /></button>}
                        <span>{m.timestamp.toLocaleTimeString([], { hour12: false })}</span>
                      </div>
                    </div>
                    <div className="text-[18px] leading-relaxed text-slate-100 italic whitespace-pre-wrap">{m.content}</div>
                    {(m.groundingUrls || m.mapsLinks) && (
                      <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                         {m.mapsLinks?.map((l, i) => <a key={i} href={l.uri} target="_blank" className="flex items-center gap-3 text-xs text-cyan-400 hover:text-white"><MapPin size={12} /> {l.title || "Map Location"}</a>)}
                         {m.groundingUrls?.map((u, i) => <a key={i} href={u.uri} target="_blank" className="flex items-center gap-3 text-xs text-slate-400 hover:text-cyan-300"><Globe size={12} /> {u.title || u.uri}</a>)}
                      </div>
                    )}
                    {m.mediaUrl && (
                      <button onClick={() => setActiveMedia({ type: m.type as any, url: m.mediaUrl!, prompt: m.mediaPrompt! })} className="mt-8 w-full h-80 rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm z-10"><Eye size={48} className="text-white" /></div>
                        {m.type === 'video' ? <video src={m.mediaUrl} className="w-full h-full object-cover" /> : <img src={m.mediaUrl} className="w-full h-full object-cover" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
            
            <form onSubmit={handleSendText} className="glass-v5 flex gap-6 p-8 relative rounded-3xl border-2 border-white/5 hover:border-cyan-400/40 transition-all shadow-2xl">
              <Globe className={`cursor-pointer ${isSearchEnabled ? 'text-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'text-slate-600'}`} onClick={() => setIsSearchEnabled(!isSearchEnabled)} size={24} />
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="AWAITING COMMANDS, SIR..." className="flex-1 bg-transparent border-none outline-none text-[20px] px-6 py-2 text-white font-orbitron tracking-widest uppercase italic placeholder:opacity-20" />
              <div className="flex gap-6 items-center">
                <button type="button" onClick={toggleScreenShare} className={`${isScreenSharing ? 'text-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'text-slate-500'}`}><Monitor size={32} /></button>
                <button type="button" onClick={() => { setIsAudioMuted(!isAudioMuted); if(!isAudioMuted) stopSession(); else startSession(); }} className={`${isAudioMuted ? 'text-red-500' : 'text-cyan-400'}`}><Mic size={32} /></button>
                <button type="submit" className="p-6 bg-white text-slate-950 hover:bg-cyan-400 transition-all rounded-2xl shadow-xl transform active:scale-95"><Send size={32} /></button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
