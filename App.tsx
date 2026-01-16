
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Quest, User, Race, QuestDifficulty } from './types';
import { INITIAL_QUESTS } from './constants';
import MapBoard from './components/MapBoard';
import BountyBoard from './components/BountyBoard';
import VerificationModal from './components/VerificationModal';
import ActiveQuestHUD from './components/ActiveQuestHUD';
import ProofSubmission from './components/ProofSubmission';
import ProfileModal from './components/ProfileModal';
import GuildBoard from './components/GuildBoard';
import ProMembershipModal from './components/ProMembershipModal';
import FriendsBoard from './components/FriendsBoard';
import ErrorBoundary from './components/ErrorBoundary';
import { Terminal as TerminalIcon, Users, Globe2, Sparkles, Wifi, WifiOff } from 'lucide-react';

// UPDATED: NATURAL & INTELLECTUAL DIALOGUE (Age 32)
// Tone: Natural, Calm, Professional but intimate, Intellectual.
const LINES = {
  bountyGreeting: {
    zh: "身份确认。简报已经准备好了。这次... 尽量别搞砸了，好吗？",
    en: "Identity verified. I've prepared the briefing. Try not to make a mess this time, alright?"
  },
  contractAccepted: {
    zh: "指令确认。听着，注意安全。我不希望我的报告里出现‘人员损耗’这个词。保持联系。",
    en: "Directive confirmed. Listen, stay safe. I don't want 'casualty' in my report. Stay on the line."
  },
  proUpgrade: {
    zh: "哦？权限升级了。看来你比我想象的要可靠一点。拿着这个，别弄丢了。",
    en: "Oh? Clearance upgraded. Seems you're more reliable than I predicted. Take this, and don't lose it."
  },
  proofSubmitted: {
    zh: "数据收到了。嗯... 处理得挺干净。辛苦了，去休息一下吧。",
    en: "Data received. Hmm... clean work. Good job. Go get some rest."
  },
  arrived: {
    zh: "到了。就是这里。深呼吸... 无论发生什么，我都会在频道里陪着你。",
    en: "We're here. Deep breath... No matter what happens, I'm right here on the comms."
  },
  openGuild: {
    zh: "正在切入公会频道。里面有点吵，你自己看着办吧。",
    en: "Patching into Guild comms. It's a bit noisy in there, handle it yourself."
  },
  openFriends: {
    zh: "通讯录... 即使在这个世界，保持联系也是很重要的。",
    en: "Contacts list... Even in this world, staying connected is important."
  }
};

const MOCK_USER: User = {
  id: 'u1',
  realName: 'Unknown',
  idCard: '***',
  name: 'Traveler',
  race: Race.SLIME,
  level: 1,
  magicules: 0,
  bio: 'Just arrived.',
  verified: false,
  avatarUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
  trustScore: 80,
  goldCoins: 0,
  guildContribution: 0
};

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<User>(MOCK_USER);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  
  // Navigation & Modals
  const [view, setView] = useState<'MAP' | 'BOUNTY' | 'GUILD' | 'FRIENDS'>('MAP');
  const [showProfile, setShowProfile] = useState(false);
  const [showVerify, setShowVerify] = useState(true);
  const [showProof, setShowProof] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Quest Logic
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [focusedQuestId, setFocusedQuestId] = useState<string | null>(null);
  const [questStartTime, setQuestStartTime] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Location
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Audio / Voice
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceOffline, setIsVoiceOffline] = useState(false); // Track if we are using fallback
  
  // Audio Refs (Singleton Pattern for Stability)
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // --- LOCATION TRACKING ---
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // CRITICAL FIX: Prevent NaN values from crashing the map
        if (
            typeof latitude === 'number' && !isNaN(latitude) && isFinite(latitude) &&
            typeof longitude === 'number' && !isNaN(longitude) && isFinite(longitude)
        ) {
            setUserLocation([latitude, longitude]);
        }
      },
      (err) => console.warn("GPS Error", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // --- VOICE SYSTEM (GEMINI TTS + ROBUST FALLBACK) ---
  const speakAsElena = useCallback(async (text: string, lang: 'zh' | 'en' = 'zh') => {
    // 1. Cleanup previous audio to prevent overlap
    if (activeSourceRef.current) {
        try { activeSourceRef.current.stop(); } catch(e) { /* ignore */ }
        activeSourceRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    setIsSpeaking(true);
    setIsVoiceOffline(false);

    try {
      if (!process.env.API_KEY) throw new Error("No API Key");

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Request High Quality "Real Life" Voice
      // Model: gemini-2.5-flash-preview-tts
      // Voice: 'Aoede' (Professional, Deep, Intellectual Female - Matches Elena)
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text: text }] }, 
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Aoede' } 
                }
            }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio) {
         // Lazy Initialize Audio Context (Reusing it is smoother than recreating)
         if (!audioContextRef.current) {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
         }
         const ctx = audioContextRef.current;
         
         // Ensure context is running (browsers suspend it until interaction)
         if (ctx.state === 'suspended') {
             await ctx.resume();
         }

         // Decode Raw PCM (16-bit Little Endian)
         const binaryString = atob(base64Audio);
         const len = binaryString.length;
         const bytes = new Uint8Array(len);
         for (let i = 0; i < len; i++) {
             bytes[i] = binaryString.charCodeAt(i);
         }
         const int16Data = new Int16Array(bytes.buffer);
         
         // Create Buffer: The Model returns 24kHz audio. 
         // We tell the browser this buffer is 24kHz, and the browser handles resampling to the hardware rate (e.g. 48k).
         const audioBuffer = ctx.createBuffer(1, int16Data.length, 24000);
         const channelData = audioBuffer.getChannelData(0);
         for (let i = 0; i < int16Data.length; i++) {
             channelData[i] = int16Data[i] / 32768.0;
         }

         // Play
         const source = ctx.createBufferSource();
         source.buffer = audioBuffer;
         source.connect(ctx.destination);
         source.onended = () => setIsSpeaking(false);
         source.start(0);
         
         activeSourceRef.current = source;
      } else {
         throw new Error("Empty audio response");
      }

    } catch (e: any) {
      // --- FALLBACK SYSTEM ---
      console.warn("Gemini Voice Failed. Switching to System Fallback.", e);
      setIsVoiceOffline(true);
      
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
          
          // Tune system voice to be less robotic
          utterance.pitch = 0.9; // Slightly deeper
          utterance.rate = 1.0; 
          
          // Try to find a high-quality system voice (Google/Microsoft/Samantha)
          const voices = window.speechSynthesis.getVoices();
          const targetLangPrefix = lang === 'zh' ? 'zh' : 'en';
          
          // Prioritize online neural voices if available in browser
          const preferredVoice = voices.find(v => 
             (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural')) && 
             v.lang.startsWith(targetLangPrefix)
          );
          
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          
          window.speechSynthesis.speak(utterance);
      } else {
          setIsSpeaking(false);
      }
    }
  }, []);

  // Ensure system voices are loaded for fallback
  useEffect(() => {
     if ('speechSynthesis' in window) {
         window.speechSynthesis.getVoices();
     }
  }, []);

  // --- ACTIONS ---

  const handleVerifyComplete = (data: Partial<User>) => {
    setUser(prev => ({ ...prev, ...data, verified: true, level: 1 }));
    setShowVerify(false);
    speakAsElena(LINES.bountyGreeting.zh);
    setView('BOUNTY');
  };

  const handleAcceptQuest = (quest: Quest) => {
    setActiveQuestId(quest.id);
    setQuestStartTime(Date.now());
    setView('MAP');
    setIsNavigating(true);
    speakAsElena(LINES.contractAccepted.zh);
  };

  const handleSubmitProof = () => {
    setShowProof(true);
  };

  const handleProofConfirmed = () => {
    setShowProof(false);
    setActiveQuestId(null);
    setQuestStartTime(null);
    setIsNavigating(false);
    setUser(prev => ({
        ...prev,
        goldCoins: prev.goldCoins + 100,
        trustScore: prev.trustScore + 50,
        level: prev.level + 1
    }));
    speakAsElena(LINES.proofSubmitted.zh);
  };

  const handleUrgentQuest = (qid: string) => {
    const q = quests.find(x => x.id === qid);
    if (q) handleAcceptQuest(q);
  };

  const activeQuest = quests.find(q => q.id === activeQuestId);
  const urgentQuests = quests.filter(q => q.isUrgent);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-full overflow-hidden bg-black font-sans text-white">
        
        {/* --- LAYER 1: MAP BACKGROUND --- */}
        <MapBoard 
            quests={activeQuest ? [activeQuest] : quests}
            activeQuestId={activeQuestId}
            focusedQuestId={focusedQuestId}
            userLocation={userLocation}
            isNavigating={isNavigating}
            onFocus={(q) => setFocusedQuestId(q.id)}
            onAccept={handleAcceptQuest}
            onRecenter={() => {}} 
        />

        {/* --- LAYER 2: HUD & OVERLAYS --- */}
        
        {/* System Status Indicator (Debug Helper) */}
        <div className="absolute top-4 left-4 z-[800] pointer-events-none flex flex-col gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur border ${isVoiceOffline ? 'border-red-500/50 text-red-400' : 'border-emerald-500/50 text-emerald-400'} text-[9px] font-mono`}>
                {isVoiceOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                <span>{isVoiceOffline ? 'NEURAL LINK: FALLBACK' : 'NEURAL LINK: GEMINI'}</span>
            </div>
        </div>
        
        {/* Top Right: Profile & Menus */}
        <div className="absolute top-4 right-4 z-[800] flex flex-col gap-3">
            <button 
                onClick={() => setShowProfile(true)}
                className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-900 overflow-hidden shadow-2xl active:scale-95 transition-transform"
            >
                <img src={user.avatarUrl} className="w-full h-full object-cover" />
            </button>
            <button 
                onClick={() => { setView('GUILD'); speakAsElena(LINES.openGuild.zh); }}
                className="w-12 h-12 rounded-full border border-indigo-500/50 bg-indigo-950/80 flex items-center justify-center text-indigo-300 shadow-lg active:scale-95 backdrop-blur-md"
            >
                <Users className="w-5 h-5" />
            </button>
            <button 
                onClick={() => { setView('FRIENDS'); speakAsElena(LINES.openFriends.zh); }}
                className="w-12 h-12 rounded-full border border-cyan-500/50 bg-cyan-950/80 flex items-center justify-center text-cyan-300 shadow-lg active:scale-95 backdrop-blur-md"
            >
                <Globe2 className="w-5 h-5" />
            </button>
        </div>

        {/* Bottom Center: Mission Start Button (Only if no active quest and on map) */}
        {!activeQuestId && view === 'MAP' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[800] animate-in slide-in-from-bottom-4">
                <button 
                    onClick={() => { setView('BOUNTY'); speakAsElena(LINES.bountyGreeting.zh); }}
                    className="bg-black/80 backdrop-blur-md border border-fantasy-gold/50 text-fantasy-gold px-8 py-4 rounded-2xl font-['Cinzel'] font-bold text-lg tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.3)] flex items-center gap-3 active:scale-95 transition-all hover:bg-fantasy-gold hover:text-black group"
                >
                    <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                    <span>MISSION START</span>
                </button>
            </div>
        )}

        {/* Active Quest HUD */}
        {activeQuest && (
            <ActiveQuestHUD 
                quest={activeQuest}
                startTime={questStartTime}
                isAutoNavigating={isNavigating}
                onStartAutoNav={() => setIsNavigating(true)}
                onStopAutoNav={() => setIsNavigating(false)}
                onAbort={() => { setActiveQuestId(null); setIsNavigating(false); speakAsElena("Mission aborted. Return to base."); }}
                onSubmitProof={handleSubmitProof}
                onRecenter={() => {}}
                lang="zh"
            />
        )}

        {/* --- LAYER 3: FULL SCREEN MODALS --- */}

        {showVerify && (
            <VerificationModal 
                onComplete={handleVerifyComplete}
                lang="zh" 
            />
        )}

        {view === 'BOUNTY' && (
            <BountyBoard 
                quests={quests}
                activeQuestId={activeQuestId}
                focusedQuestId={focusedQuestId}
                onFocus={(q) => setFocusedQuestId(q.id)}
                onAccept={handleAcceptQuest}
                onClose={() => setView('MAP')}
                userLevel={user.level}
                lang="zh"
                isSpeaking={isSpeaking}
                isVoiceOffline={isVoiceOffline}
            />
        )}

        {view === 'GUILD' && (
            <GuildBoard 
                onClose={() => setView('MAP')}
                lang="zh"
                urgentQuests={urgentQuests}
                onAcceptUrgent={handleUrgentQuest}
                currentUser={user}
                onSpeak={(t) => speakAsElena(t, 'zh')}
            />
        )}

        {view === 'FRIENDS' && (
            <FriendsBoard 
                onClose={() => setView('MAP')}
                lang="zh"
                currentUser={user}
                onSpeak={(t) => speakAsElena(t, 'zh')}
            />
        )}

        {showProfile && (
            <ProfileModal 
                user={user}
                onClose={() => setShowProfile(false)}
                onCreateQuest={() => false}
                onOpenProModal={() => { setShowProfile(false); setShowProModal(true); }}
                onOpenFriends={() => { setShowProfile(false); setView('FRIENDS'); }}
                lang="zh"
            />
        )}

        {showProModal && (
            <ProMembershipModal 
                user={user}
                onClose={() => setShowProModal(false)}
                onUpgrade={() => { 
                    setUser(u => ({...u, isProMember: true})); 
                    speakAsElena(LINES.proUpgrade.zh); 
                }}
                lang="zh"
            />
        )}

        {showProof && (
            <ProofSubmission 
                onConfirm={handleProofConfirmed}
                onCancel={() => setShowProof(false)}
            />
        )}

      </div>
    </ErrorBoundary>
  );
};

export default App;
