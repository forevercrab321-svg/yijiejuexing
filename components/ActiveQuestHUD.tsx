import React, { useEffect, useState } from 'react';
import { Quest } from '../types';
import { Camera, X, Timer, Zap, Navigation, ExternalLink, Map } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ActiveQuestHUDProps {
  quest: Quest;
  startTime: number | null;
  isAutoNavigating: boolean;
  onStartAutoNav: () => void;
  onStopAutoNav: () => void;
  onSubmitProof: () => void;
  onAbort: () => void;
  onRecenter: () => void;
  lang: 'zh' | 'en';
}

const ActiveQuestHUD: React.FC<ActiveQuestHUDProps> = ({ 
  quest, startTime, isAutoNavigating, onStartAutoNav, onStopAutoNav, onSubmitProof, onAbort, onRecenter, lang
}) => {
  const [elapsed, setElapsed] = useState(0);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute top-[calc(5rem+env(safe-area-inset-top))] left-4 right-4 z-[900] pointer-events-none">
      <div className="glass-panel rounded-2xl p-3 w-full max-w-lg mx-auto pointer-events-auto flex flex-col gap-2 animate-in slide-in-from-top-4 border-l-4 border-l-indigo-500 shadow-xl bg-black/80 backdrop-blur-md">
        
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <div>
                   <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">CURRENT OBJECTIVE</div>
                   <h3 className="font-['Cinzel'] font-bold text-white text-sm truncate max-w-[150px]">{quest.title}</h3>
                </div>
            </div>
            <div className="text-lg font-mono text-emerald-400 font-bold">{timeString}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
            {/* 1. In-App Navigation */}
            <button 
                onClick={isAutoNavigating ? onStopAutoNav : onStartAutoNav}
                className={`py-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 border transition-all active:scale-95
                  ${isAutoNavigating 
                    ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 animate-pulse' 
                    : 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/30'
                  }`}
            >
                <Navigation className={`w-4 h-4 ${isAutoNavigating ? 'animate-spin' : ''}`} />
                {isAutoNavigating ? 'NAVIGATING...' : 'IN-APP NAV'}
            </button>

            {/* 2. Google Maps Link (New) */}
            <button 
                onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${quest.location[0]},${quest.location[1]}`;
                    window.open(url, '_blank');
                }}
                className="bg-slate-800 text-white border border-slate-600 rounded-xl flex items-center justify-center gap-2 active:scale-95 hover:bg-slate-700 hover:border-white/30 transition-all"
            >
                <Map className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold">GOOGLE MAPS</span>
            </button>

            {/* 3. Abort Mission */}
            <button 
                onClick={onAbort}
                className="bg-red-950/50 border border-red-900 text-red-400 rounded-xl flex items-center justify-center active:scale-95 hover:bg-red-900/50 transition-all py-3"
            >
                <X className="w-4 h-4" />
            </button>

            {/* 4. Submit Proof */}
            <button 
                onClick={onSubmitProof}
                className="bg-emerald-800 text-white border border-emerald-600/50 rounded-xl flex items-center justify-center gap-2 active:scale-95 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 py-3"
            >
                <Camera className="w-4 h-4" />
                <span className="text-[10px] font-bold">SUBMIT PROOF</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveQuestHUD;