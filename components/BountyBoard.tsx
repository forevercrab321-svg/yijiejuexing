
import React, { useState, useMemo, useEffect } from 'react';
import { Quest } from '../types';
import { X, MapPin, Terminal, ChevronRight, ChevronLeft, MessageSquare, Sparkles, Bug, Mic2, Wand2, Play, Map } from 'lucide-react';
import ElenaAvatar2_5D from './ElenaAvatar2_5D'; 

interface BountyBoardProps {
  quests: Quest[];
  onFocus: (quest: Quest) => void;
  onAccept: (quest: Quest) => void;
  activeQuestId: string | null;
  focusedQuestId: string | null;
  userLevel: number;
  onClose: () => void;
  lang: 'zh' | 'en';
  isSpeaking?: boolean;
  onTestVoice?: (type: 'AUTO' | 'EN' | 'ZH') => void;
  isVoiceOffline?: boolean;
  voiceDebugInfo?: any;
  voiceParams?: any;
  setVoiceParams?: any;
}

const BountyBoard: React.FC<BountyBoardProps> = ({ 
  quests, onFocus, onAccept, activeQuestId, focusedQuestId, onClose, lang, 
  isSpeaking = false, onTestVoice, isVoiceOffline = false, voiceDebugInfo,
  voiceParams, setVoiceParams
}) => {
  const [viewState, setViewState] = useState<'GREETING' | 'TERMINAL'>('GREETING');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [showDebug, setShowDebug] = useState(false); 
  const [safeMode, setSafeMode] = useState(false);

  const filteredQuests = useMemo(() => quests.filter(q => filter === 'ALL' || q.type === filter), [quests, filter]);
  const activeQuest = filteredQuests[currentIdx];

  useEffect(() => {
    if (activeQuest && viewState === 'TERMINAL') onFocus(activeQuest);
  }, [currentIdx, viewState, activeQuest, onFocus]);

  // UPDATED: Mature (32yo), Intellectual, Natural Look
  const ELENA_IMG = "https://image.pollinations.ai/prompt/portrait%20of%20a%2032%20year%20old%20female%20tactical%20analyst%2C%20intellectual%20beauty%2C%20silver%20rimless%20glasses%2C%20messy%20platinum%20blonde%20bun%2C%20white%20lab%20coat%20over%20dark%20turtleneck%2C%20calm%20intelligent%20eyes%2C%20soft%20natural%20lighting%2C%20cyberpunk%20command%20center%20background%2C%20highly%20detailed%20digital%20art%2C%208k%20masterpiece?width=720&height=1080&nologo=true&seed=882";
  
  const currentEmotion = isVoiceOffline ? 'serious' : isSpeaking ? 'tease' : 'neutral';

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050b14] flex flex-col font-sans overflow-hidden select-none animate-in fade-in duration-300">
      
      {/* 1. Background Avatar Layer */}
      <div className="absolute inset-0 z-0 transition-transform duration-1000 ease-out" 
           style={{ transform: viewState === 'TERMINAL' ? 'translateX(10%) scale(1.05) brightness(0.3) blur(2px)' : 'translateX(0) scale(1)' }}>
          <ElenaAvatar2_5D 
              imageUrl={ELENA_IMG}
              isSpeaking={isSpeaking} 
              lang={lang}
              safeMode={safeMode}
              onToggleSafeMode={() => setSafeMode(!safeMode)}
              emotion={currentEmotion}
          />
      </div>

      {/* 2. Top Bar */}
      <div className="relative z-20 pt-[env(safe-area-inset-top)] px-6 py-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-[10px] text-fantasy-gold font-black tracking-[0.4em] uppercase opacity-80 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Quest_Manager_ELENA</span>
          <div className="h-0.5 w-12 bg-fantasy-gold shadow-[0_0_10px_#D4AF37]"></div>
        </div>
        <button onClick={onClose} className="pointer-events-auto w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70 border border-white/10 backdrop-blur-xl transition-all active:scale-90 z-50 hover:border-fantasy-gold/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Interactive Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pointer-events-none">
        
        {/* --- STATE: GREETING --- */}
        {viewState === 'GREETING' && (
          // Dialog Box at BOTTOM
          <div className="absolute bottom-24 left-4 right-4 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pointer-events-auto">
            
            {/* Main Greeting Card */}
            <div className="bg-[#050b14]/80 backdrop-blur-xl border border-fantasy-gold/30 p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-fantasy-gold/50 rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-fantasy-gold/50 rounded-bl-3xl"></div>

              <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-fantasy-gold to-yellow-300 rounded-full flex items-center justify-center text-black shadow-lg animate-bounce">
                    <MessageSquare className="w-4 h-4" />
                 </div>
                 <div>
                    <h2 className="text-sm font-black text-fantasy-gold tracking-[0.2em] uppercase font-['Cinzel']">ELENA</h2>
                    <div className="text-[9px] text-slate-400 font-bold">LV.99 • Chief Tactician</div>
                 </div>
              </div>
              
              <p className="text-sm text-white font-sans font-medium leading-relaxed mb-6">
                "{lang === 'en' ? "Identity confirmed. I've prepared the briefings. Try not to make a mess this time." : "身份确认。简报已经准备好了。这次... 尽量别搞砸了。"}"
              </p>
              
              <button 
                onClick={() => setViewState('TERMINAL')}
                className="w-full bg-fantasy-gold hover:bg-white text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <Terminal className="w-4 h-4" />
                <span className="text-xs tracking-[0.2em] uppercase">Start Mission</span>
              </button>
            </div>
            
          </div>
        )}

        {/* --- STATE: TERMINAL --- */}
        {viewState === 'TERMINAL' && (
          <div className="w-full max-w-md bg-[#050b14]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[70vh] animate-in zoom-in-95 duration-500 relative pointer-events-auto">
            
            {/* Filter Tabs */}
            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/40">
              {['ALL', '物资运输', '魔物讨伐', '迷宫建设'].map(t => (
                <button
                  key={t}
                  onClick={() => { setFilter(t); setCurrentIdx(0); }}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-wider transition-all whitespace-nowrap border ${filter === t ? 'bg-fantasy-gold/10 border-fantasy-gold text-fantasy-gold' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                  {t === 'ALL' ? '全部任务' : t}
                </button>
              ))}
            </div>

            {/* Quest Content */}
            <div className="flex-1 p-8 flex flex-col relative">
              {activeQuest ? (
                <div key={activeQuest.id} className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center mb-6">
                     <div className="bg-red-950/50 text-red-400 border border-red-500/30 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.2)]">{activeQuest.difficulty}</div>
                     <span className="text-[9px] text-slate-500 font-mono tracking-widest">ID_{activeQuest.id.slice(0,4)}</span>
                  </div>

                  <h3 className="text-2xl font-black text-white font-['Cinzel'] mb-4 leading-tight drop-shadow-md">{activeQuest.title}</h3>

                  <div className="flex items-center gap-3 text-[10px] text-fantasy-gold mb-8 font-mono tracking-wider">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {activeQuest.locationName}</span>
                    <span className="opacity-30">|</span>
                    <span>预计 {activeQuest.estimatedTime} 分钟</span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-serif italic mb-8 border-l border-fantasy-gold/30 pl-4 py-2 bg-gradient-to-r from-white/5 to-transparent rounded-r-lg">
                    "{activeQuest.description}"
                  </p>

                  <div className="mt-auto bg-[#020408]/80 rounded-2xl p-5 border border-white/10 flex items-center justify-between shadow-inner">
                    <div className="flex flex-col gap-2">
                       <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeQuest.location[0]},${activeQuest.location[1]}`)}
                            className="text-[9px] text-cyan-400 hover:text-white flex items-center gap-1 font-bold uppercase"
                       >
                           <Map className="w-3 h-3" /> Open Map
                       </button>
                       <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">信任报酬</div>
                       <div className="text-xl font-black text-emerald-400 flex items-center gap-1 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]"><Sparkles className="w-4 h-4"/> +{activeQuest.trustPoints}</div>
                    </div>
                    <button 
                      onClick={() => onAccept(activeQuest)}
                      className="bg-fantasy-gold hover:bg-white text-black px-6 py-3 rounded-xl font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] active:scale-95"
                    >
                      接受委托
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-600 uppercase tracking-widest">暂无可用委托</div>
              )}

              {/* Navigation Arrows */}
              {filteredQuests.length > 1 && (
                <>
                  <button onClick={() => setCurrentIdx(p => (p - 1 + filteredQuests.length) % filteredQuests.length)} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-white transition-colors"><ChevronLeft className="w-8 h-8" /></button>
                  <button onClick={() => setCurrentIdx(p => (p + 1) % filteredQuests.length)} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-white transition-colors"><ChevronRight className="w-8 h-8" /></button>
                </>
              )}
            </div>

            <button onClick={() => setViewState('GREETING')} className="absolute top-5 right-5 text-[8px] font-bold text-slate-500 hover:text-fantasy-gold flex items-center gap-1 uppercase transition-colors">
              <ChevronLeft className="w-3 h-3" /> 返回
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BountyBoard;
