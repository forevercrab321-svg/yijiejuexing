
import React, { useRef, useEffect, useState } from 'react';
import { Settings, Activity, Shield, ScanLine } from 'lucide-react';

interface ElenaAvatar2_5DProps {
  imageUrl: string;
  isSpeaking: boolean;
  lang: 'zh' | 'en';
  emotion?: 'neutral' | 'tease' | 'serious';
  intensity?: number;
  safeMode: boolean;
  onToggleSafeMode: () => void;
}

const ElenaAvatar2_5D: React.FC<ElenaAvatar2_5DProps> = ({
  imageUrl,
  isSpeaking,
  safeMode,
  onToggleSafeMode,
  emotion = 'neutral'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics State
  const mouse = useRef({ x: 0, y: 0 }); 
  const current = useRef({ x: 0, y: 0 }); 

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      let cx, cy;
      
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 0) { 
          cx = (e as TouchEvent).touches[0].clientX; 
          cy = (e as TouchEvent).touches[0].clientY; 
      } else { 
          cx = (e as MouseEvent).clientX; 
          cy = (e as MouseEvent).clientY; 
      }
      
      const x = Math.max(-1, Math.min(1, ((cx - left) / width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((cy - top) / height) * 2 - 1));
      mouse.current = { x, y };
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  useEffect(() => {
    let frameId: number;
    let time = 0;

    const loop = () => {
      time += 0.01;
      const factor = 0.05;
      current.current.x += (mouse.current.x - current.current.x) * factor;
      current.current.y += (mouse.current.y - current.current.y) * factor;

      if (containerRef.current && !safeMode) {
        // Parallax Effect
        const tiltX = current.current.y * -3; 
        const tiltY = current.current.x * 3;  
        const breathY = Math.sin(time) * 3;
        
        containerRef.current.style.setProperty('--rot-x', `${tiltX}deg`);
        containerRef.current.style.setProperty('--rot-y', `${tiltY}deg`);
        containerRef.current.style.setProperty('--tx', `${current.current.x * -10}px`);
        containerRef.current.style.setProperty('--ty', `${(current.current.y * -10) + breathY}px`);
      }
      frameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [safeMode, emotion]);

  if (safeMode) {
    return (
      <div className="relative w-full h-full bg-[#020617] overflow-hidden flex items-center justify-center select-none">
        <div className="absolute top-4 right-4 z-50">
           <button onClick={onToggleSafeMode} className="bg-emerald-900/80 text-emerald-400 text-[9px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-500/50 hover:bg-emerald-800 transition-colors shadow-lg">
             <Shield className="w-3 h-3" /> SAFE MODE
           </button>
        </div>
        <img src={imageUrl} className="w-full h-full object-cover object-top opacity-50 grayscale" alt="Elena Safe" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#050b14] overflow-hidden select-none perspective-container">
      <style>{`
        .perspective-container { perspective: 1000px; }
        .parallax-layer {
            position: absolute; inset: -5%; width: 110%; height: 110%; 
            background-size: cover; 
            /* UPDATED: Center 20% frames the face better for half-body/medium-closeup shots */
            background-position: center 20%; 
            will-change: transform; 
            transition: transform 0.1s linear; 
        }
        .hologram-mask {
            mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%);
        }
        @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
        }
        .scan-beam {
            position: absolute; width: 100%; height: 50px;
            background: linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.2), transparent);
            animation: scanline 4s linear infinite;
            pointer-events: none;
            z-index: 20;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; border-width: 2px; }
            100% { transform: scale(1.5); opacity: 0; border-width: 0px; }
        }
      `}</style>

      {/* Control HUD */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
         <button onClick={onToggleSafeMode} className="bg-black/40 text-slate-400 hover:text-white text-[9px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 backdrop-blur-md active:scale-95 transition-all">
             <Settings className="w-3 h-3" /> 3D PROJECTION
         </button>
         {isSpeaking && (
            <div className="flex items-center gap-1.5 bg-fantasy-gold/20 text-fantasy-gold border border-fantasy-gold/50 px-3 py-1 rounded-full text-[9px] font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Activity className="w-3 h-3" /> SPEAKING
            </div>
         )}
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b14] via-[#081424] to-[#050b14]">
         <div className="absolute bottom-0 w-full h-1/3 bg-[linear-gradient(transparent_0%,rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,transparent_0%,rgba(0,240,255,0.1)_1px,transparent_1px)]" style={{backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg)'}}></div>
      </div>

      {/* Layer 1: Blurred Back (Depth Shadow) */}
      <div className="parallax-layer hologram-mask"
        style={{ 
            backgroundImage: `url(${imageUrl})`,
            transform: `translate3d(calc(var(--tx) * -0.5), calc(var(--ty) * -0.2), 0) scale(1.02)`,
            filter: 'blur(8px) brightness(0.5) hue-rotate(180deg)',
            opacity: 0.5
        }}
      ></div>

      {/* Layer 2: Main Character */}
      <div className="parallax-layer hologram-mask"
        style={{ 
            backgroundImage: `url(${imageUrl})`,
            transform: `translate3d(var(--tx), var(--ty), 0px) rotateX(var(--rot-x)) rotateY(var(--rot-y)) scale(1.0)`,
            filter: isSpeaking ? 'brightness(1.1) drop-shadow(0 0 10px rgba(212,175,55,0.3))' : 'brightness(1.0)',
            transition: 'filter 0.2s ease'
        }}
      >
      </div>

      <div className="scan-beam"></div>
      
      {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-[300px] h-[600px] border border-fantasy-gold/30 rounded-[50%] animate-[pulse-ring_2s_linear_infinite]"></div>
          </div>
      )}

      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 bg-gradient-to-tr from-transparent via-cyan-500/20 to-transparent" style={{ transform: `translateX(calc(var(--tx) * 1.5))` }}></div>
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#050b14] to-transparent z-10"></div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 opacity-60">
           <div className="flex items-center gap-2 text-[8px] font-mono text-cyan-500 tracking-[0.3em]">
               <ScanLine className="w-3 h-3 animate-spin" style={{animationDuration: '5s'}}/>
               PROJECTION_ACTIVE
           </div>
           <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      </div>
    </div>
  );
};

export default ElenaAvatar2_5D;
