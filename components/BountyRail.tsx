
import React, { useState, useMemo } from 'react';
import { Quest, QuestDifficulty } from '../types';
import { MapPin, Coins, Filter, Lock, Flame, Sparkles, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface BountyRailProps {
  quests: Quest[];
  onFocus: (quest: Quest) => void;
  onAccept: (quest: Quest, skipConfirm?: boolean) => void;
  activeQuestId: string | null;
  focusedQuestId: string | null;
  userLevel: number;
  lang: 'zh' | 'en';
}

const BountyRail: React.FC<BountyRailProps> = ({ 
  quests, onFocus, onAccept, activeQuestId, focusedQuestId, userLevel, lang 
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const t = TRANSLATIONS[lang];

  // Filters
  const types = ['ALL', '物资运输', '魔物讨伐', '迷宫建设'];

  const filteredQuests = useMemo(() => {
    return quests.filter(q => {
      const typeMatch = filterType === 'ALL' || q.type === filterType;
      return typeMatch;
    });
  }, [quests, filterType]);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] flex flex-col justify-end pointer-events-none pb-[env(safe-area-inset-bottom)]">
      
      {/* Filter Chips */}
      <div className="mx-auto w-full max-w-3xl pointer-events-auto mb-4 px-4 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-touch pb-2">
            <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300 flex-shrink-0 backdrop-blur-md bg-slate-900/80 rounded-full border border-slate-700">
                <Filter className="w-3 h-3 text-cyan-500" />
                <span className="font-bold font-['Cinzel'] tracking-wider">{t.filter_all}</span>
            </div>

            {types.map(type => (
                <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-lg ${
                        filterType === type 
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-500/30' 
                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    {type === 'ALL' ? t.filter_all : t[type as keyof typeof t] || type}
                </button>
            ))}
        </div>
      </div>

      {/* Quest Cards Rail */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-8 snap-x snap-mandatory pointer-events-auto no-scrollbar scroll-touch">
        {filteredQuests.map((quest) => {
            const isActive = quest.id === activeQuestId;
            const isFocused = quest.id === focusedQuestId;
            const isLocked = userLevel < quest.minLevel;
            const isUrgent = quest.isUrgent;
            
            return (
              <div 
                key={quest.id}
                onClick={() => onFocus(quest)}
                onDoubleClick={() => !isLocked && onAccept(quest, true)}
                className={`
                  snap-center flex-shrink-0 w-[85vw] sm:w-[320px] h-[180px] rounded-[1.5rem] transition-all relative overflow-hidden active:scale-95 duration-300 cursor-pointer select-none group border
                  ${isFocused ? 'scale-[1.02] border-fantasy-gold shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)]' : 'scale-100 border-slate-700 shadow-xl'}
                  ${isLocked ? 'grayscale opacity-80' : ''}
                `}
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-slate-900">
                    <img 
                        src={quest.imageUrl || 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="Quest BG"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                </div>

                {/* Locked Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                        <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                )}
                
                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                     {/* Top Row */}
                     <div className="flex justify-between items-start">
                         <div className={`px-2 py-1 rounded bg-slate-900/80 backdrop-blur text-[9px] font-bold uppercase tracking-wider ${
                            quest.difficulty.includes('S') ? 'text-purple-400 border border-purple-500/50' : 'text-slate-300 border border-slate-600'
                         }`}>
                             {quest.difficulty.split('·')[0]}
                         </div>
                         {isUrgent && <Flame className="w-4 h-4 text-red-500 animate-pulse" />}
                     </div>

                     {/* Bottom Row */}
                     <div>
                         <div className="flex items-center gap-1 text-cyan-400 text-[10px] font-bold mb-1">
                             <MapPin className="w-3 h-3" /> {quest.locationName}
                         </div>
                         <h3 className="text-white font-['Cinzel'] font-bold text-lg leading-tight mb-2 drop-shadow-md">
                             {quest.title}
                         </h3>
                         <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                             <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400"/> {quest.trustPoints}</span>
                             <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber-400"/> {quest.rewardGold}</span>
                         </div>
                     </div>
                </div>

                {/* Focus Border Effect */}
                {isFocused && (
                     <div className="absolute inset-0 border-[2px] border-fantasy-gold rounded-[1.5rem] pointer-events-none z-30 animate-pulse"></div>
                )}
              </div>
            );
        })}
        <div className="w-4 flex-shrink-0"></div>
      </div>
    </div>
  );
};

export default BountyRail;
