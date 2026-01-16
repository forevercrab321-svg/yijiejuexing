import React, { useState } from 'react';
import { X, ShieldCheck, Zap, Rotate3d, CheckCircle2, Coins, Fingerprint, UserCircle2, FilePlus2, ChevronLeft, Eye, HeartHandshake, Repeat, Crown, Mic, Users, Clock, Trophy, MapPin, Lock } from 'lucide-react';
import { User, Quest, Race } from '../types';
import { RACE_CONFIG, INITIAL_QUESTS } from '../constants';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onCreateQuest: (quest: Partial<Quest>) => boolean;
  onOpenProModal: () => void;
  onOpenFriends: () => void;
  lang: 'zh' | 'en';
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  user, 
  onClose, 
  onCreateQuest, 
  onOpenProModal, 
  onOpenFriends, 
  lang 
}) => {
  const raceInfo = RACE_CONFIG[user.race];
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'ABILITIES'>('OVERVIEW');

  // Simulated History
  const history = [
      { id: 'h1', title: 'Midnight Patrol', date: '2 days ago', reward: 150, status: 'COMPLETED' },
      { id: 'h2', title: 'Lost Cat Retrieval', date: '5 days ago', reward: 50, status: 'COMPLETED' },
  ];

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-white animate-in zoom-in-95 duration-200">
      <div className="bg-[#050b14] border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Background */}
        <div className="relative h-32 bg-slate-900">
           <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-40 mix-blend-overlay" alt="banner" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] to-transparent"></div>
           <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition-colors z-10">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* User Info Header */}
        <div className="px-6 -mt-12 relative flex items-end gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-[#050b14] overflow-hidden bg-slate-800 shadow-xl relative group">
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                {user.isProMember && (
                    <div className="absolute bottom-0 right-0 bg-amber-500 text-black p-1 rounded-tl-lg">
                        <Crown className="w-3 h-3" />
                    </div>
                )}
            </div>
            <div className="pb-1 flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 truncate">
                    {user.name}
                </h2>
                <div className="text-slate-400 text-xs font-mono">ID: {user.id.slice(0, 8)}</div>
                <div className="flex gap-2 mt-2">
                    <div className="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 truncate max-w-[100px]">{raceInfo.job}</div>
                    {user.verified && <div className="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">Verified</div>}
                </div>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-slate-800 mb-4">
            {['OVERVIEW', 'HISTORY', 'ABILITIES'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 pb-3 text-[10px] font-bold tracking-widest transition-colors relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-fantasy-gold shadow-[0_0_10px_#D4AF37]"></div>}
                </button>
            ))}
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto min-h-0">
            
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Level</div>
                            <div className="text-xl font-black text-indigo-400 font-mono">{user.level}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Trust</div>
                            <div className="text-xl font-black text-emerald-400 font-mono">{user.trustScore}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Gold</div>
                            <div className="text-xl font-black text-amber-500 font-mono">{user.goldCoins}</div>
                        </div>
                    </div>

                    {/* Bio & Race */}
                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Soul Signature</div>
                            <div className="text-[10px] text-fantasy-gold font-bold">{user.race.split('·')[0]}</div>
                        </div>
                        <p className="text-sm text-slate-300 italic leading-relaxed">"{user.bio}"</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button 
                            onClick={onOpenFriends}
                            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-4 rounded-xl flex items-center gap-3 transition-all active:scale-95 group"
                        >
                            <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/40 transition-colors">
                                <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-bold">Soul Links (Contacts)</div>
                                <div className="text-[10px] text-slate-500">Manage friends & resonance</div>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-600 rotate-180" />
                        </button>

                        {!user.isProMember && (
                            <button 
                                onClick={onOpenProModal}
                                className="w-full bg-gradient-to-r from-amber-900/50 to-slate-900 border border-amber-500/30 text-white p-4 rounded-xl flex items-center gap-3 transition-all active:scale-95 group hover:border-amber-500/60"
                            >
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Crown className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-bold text-amber-100">Pro License Application</div>
                                    <div className="text-[10px] text-amber-500/60">Unlock elite contracts</div>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-amber-700 rotate-180" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- HISTORY TAB --- */}
            {activeTab === 'HISTORY' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    {history.map(item => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <Clock className="w-3 h-3" /> {item.date}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-amber-400 font-mono font-bold text-sm">+{item.reward} G</div>
                                <div className="text-[9px] text-emerald-500 font-bold bg-emerald-950/30 px-2 py-0.5 rounded mt-1 border border-emerald-500/20">
                                    {item.status}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="text-center text-[10px] text-slate-600 pt-4">No more records in archive.</div>
                </div>
            )}

            {/* --- ABILITIES TAB --- */}
            {activeTab === 'ABILITIES' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 p-4 rounded-xl border border-indigo-500/30">
                        <div className="flex items-center gap-2 mb-2">
                             <Zap className="w-4 h-4 text-cyan-400" />
                             <h3 className="text-sm font-bold text-white">Racial Trait: {raceInfo.buff.split('+')[0]}</h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{raceInfo.desc}</p>
                        <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[70%]"></div>
                        </div>
                        <div className="text-right text-[9px] text-cyan-500 mt-1">Mastery: 70%</div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 opacity-60">
                         <div className="flex items-center gap-2 mb-2">
                             <Lock className="w-4 h-4 text-slate-500" />
                             <h3 className="text-sm font-bold text-slate-400">Ultimate Skill</h3>
                         </div>
                         <p className="text-xs text-slate-600">Unlock at Level 10 to reveal hidden potential.</p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;