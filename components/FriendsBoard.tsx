
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, UserPlus, MessageCircle, Shield, Camera, Mail, Link2, Sparkles, ChevronRight, UserCheck, ChevronLeft, Mic, Send, Aperture, RefreshCw, UploadCloud, Phone, PhoneOff, MicOff } from 'lucide-react';
import { TRANSLATIONS, RACE_CONFIG } from '../constants';
import { User, Race } from '../types';

interface FriendsBoardProps {
  onClose: () => void;
  lang: 'zh' | 'en';
  currentUser: User;
  onSpeak: (text: string) => void;
  onBack?: () => void; // Optional back navigation (e.g. to Profile)
}

interface ChatMessage {
    id: string;
    text: string;
    isMe: boolean;
    timestamp: string;
}

const FriendsBoard: React.FC<FriendsBoardProps> = ({ onClose, lang, currentUser, onSpeak, onBack }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'MINE' | 'PENDING'>('MINE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  
  // Navigation State
  const [viewMode, setViewMode] = useState<'LIST' | 'CHAT' | 'CAMERA' | 'CALL'>('LIST');
  const [activeFriend, setActiveFriend] = useState<any>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Call State
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Camera State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 模擬好友數據
  const [friends] = useState([
    { id: 'f1', name: '影之獵人', race: Race.KIJIN, level: 25, status: 'online', resonance: 88, avatarUrl: RACE_CONFIG[Race.KIJIN].img },
    { id: 'f2', name: '喵喵指揮官', race: Race.SLIME, level: 12, status: 'offline', resonance: 45, lastSeen: '2h ago', avatarUrl: RACE_CONFIG[Race.SLIME].img },
    { id: 'f3', name: '紐約大賢者', race: Race.DAEMON, level: 50, status: 'online', resonance: 100, avatarUrl: RACE_CONFIG[Race.DAEMON].img },
  ]);

  useEffect(() => {
    if (viewMode === 'CHAT' && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewMode]);

  // Call Timer Effect
  useEffect(() => {
      let interval: any;
      if (viewMode === 'CALL') {
          setCallDuration(0);
          interval = setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [viewMode]);

  // Camera Effect
  useEffect(() => {
    if (viewMode === 'CAMERA' && !capturedImage) {
        const startStream = async () => {
             try {
                 const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                 streamRef.current = stream;
                 if (videoRef.current) {
                     videoRef.current.srcObject = stream;
                 }
             } catch (err) {
                 console.error("Camera Error", err);
                 onSpeak("Optical sensors offline or permission denied.");
             }
        };
        startStream();
    } 
    
    // Cleanup function when viewMode changes or component unmounts
    return () => {
        if (viewMode !== 'CAMERA' && streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };
  }, [viewMode, capturedImage]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    onSpeak("Scanning local magical signatures...");
    
    // 模擬搜尋邏輯
    setTimeout(() => {
        setIsSearching(false);
        // 模擬找到一個路人
        if (searchQuery.includes('123') || searchQuery.includes('@')) {
            setSearchResult({
                id: 's1',
                name: '神秘冒險者',
                race: Race.DRAGONNEWT,
                level: 5,
                isVerified: true
            });
            onSpeak("Signal detected. Match found.");
        } else {
            onSpeak(t.friends_no_found);
        }
    }, 1500);
  };

  const startChat = (friend: any) => {
      setActiveFriend(friend);
      setViewMode('CHAT');
      setMessages([
          { id: 'm1', text: 'Hey, are you free for a quest?', isMe: false, timestamp: '10:00 AM' }
      ]);
      onSpeak(`Opening secure channel with ${friend.name}.`);
  };

  const startCall = (friend: any) => {
      setActiveFriend(friend);
      setViewMode('CALL');
      setIsMuted(false);
      onSpeak(`Establishing voice link with ${friend.name}.`);
  };

  const endCall = () => {
      onSpeak("Voice link terminated.");
      setViewMode('LIST');
      setActiveFriend(null);
  };

  const startCamera = (friend: any) => {
      setActiveFriend(friend);
      setViewMode('CAMERA');
      setCapturedImage(null);
      onSpeak(`Activating visual link for ${friend.name}.`);
  };

  const closeCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      setViewMode('LIST');
  };

  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setCapturedImage(dataUrl);
              onSpeak("Image captured.");
          }
      }
  };

  const retakePhoto = () => {
      setCapturedImage(null);
  };
  
  const sendPhoto = () => {
      onSpeak("Uploading evidence to secure channel...");
      setTimeout(() => {
          onSpeak("Transfer complete.");
          closeCamera();
      }, 1000);
  };

  const sendMessage = () => {
      if (!newMessage.trim()) return;
      const msg: ChatMessage = {
          id: Date.now().toString(),
          text: newMessage,
          isMe: true,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      
      // Auto reply
      setTimeout(() => {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: "Got it! I'm on my way.",
              isMe: false,
              timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }]);
      }, 1500);
  };

  const handleBack = () => {
      if (viewMode !== 'LIST') {
          if (viewMode === 'CAMERA') {
              closeCamera();
          } else if (viewMode === 'CALL') {
              endCall();
          } else {
              setViewMode('LIST');
              setActiveFriend(null);
          }
      } else if (onBack) {
          onBack();
      } else {
          onClose();
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-950 flex flex-col font-sans animate-in slide-in-from-right duration-300">
        
        {/* === CALL INTERFACE (VOICE ONLY) === */}
        {viewMode === 'CALL' && activeFriend && (
            <div className="absolute inset-0 z-[1200] bg-slate-950 flex flex-col items-center justify-between p-8 animate-in fade-in duration-500">
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                </div>

                {/* Top Info */}
                <div className="relative z-10 text-center mt-12">
                    <div className="w-24 h-24 mx-auto rounded-full p-1 border-2 border-cyan-500/30 mb-6 relative">
                         <div className="absolute inset-0 rounded-full border border-cyan-400 animate-[ping_2s_ease-in-out_infinite]"></div>
                         <img src={activeFriend.avatarUrl} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-['Cinzel']">{activeFriend.name}</h2>
                    <div className="text-cyan-400 font-mono tracking-widest text-sm mb-1">{formatTime(callDuration)}</div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider">Voice Link Secure</div>
                </div>

                {/* Audio Visualizer (CSS Simulated) */}
                <div className="relative z-10 flex items-center justify-center gap-1 h-12 w-full max-w-xs opacity-80">
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-2 bg-emerald-500 rounded-full"
                            style={{
                                height: '100%',
                                animation: `sound-wave ${0.4 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        ></div>
                    ))}
                </div>

                {/* Controls */}
                <div className="relative z-10 flex items-center gap-8 mb-12">
                     <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-95 ${isMuted ? 'bg-white text-black border-white' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
                     >
                         {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                     </button>
                     
                     <button 
                        onClick={endCall}
                        className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 transition-all"
                     >
                         <PhoneOff className="w-8 h-8" />
                     </button>

                     <button className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all active:scale-95">
                         <MessageCircle className="w-6 h-6" />
                     </button>
                </div>
            </div>
        )}

        {/* === CAMERA INTERFACE === */}
        {viewMode === 'CAMERA' && activeFriend && (
            <div className="absolute inset-0 z-[1200] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
                
                {/* Hidden Canvas */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Main Viewport */}
                <div className="relative w-full h-full flex flex-col">
                    
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pt-[calc(1rem+env(safe-area-inset-top))]">
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                             <div className="text-xs font-mono text-red-500 font-bold uppercase tracking-widest">
                                 {capturedImage ? 'IMAGE_FROZEN' : 'LIVE_FEED'}
                             </div>
                         </div>
                         <button onClick={closeCamera} className="bg-black/40 border border-white/20 text-white p-2 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors">
                             <X className="w-5 h-5" />
                         </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative overflow-hidden bg-slate-900">
                        {!capturedImage ? (
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img src={capturedImage} className="w-full h-full object-cover" />
                        )}
                        
                        {/* HUD Overlays */}
                        <div className="absolute inset-0 pointer-events-none opacity-50">
                            {/* Crosshair */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-cyan-500/30"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-2 bg-cyan-500/50"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-1 bg-cyan-500/50"></div>
                            
                            {/* Corners */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg"></div>
                        </div>

                        {/* Friend Info Overlay */}
                        <div className="absolute top-20 right-4 bg-black/60 backdrop-blur border border-cyan-500/30 p-2 rounded-lg max-w-[150px]">
                            <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider mb-1">RECIPIENT</div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-slate-800 overflow-hidden border border-slate-600">
                                    <img src={activeFriend.avatarUrl} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-xs text-white font-bold truncate">{activeFriend.name}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="h-40 bg-black/80 backdrop-blur-md border-t border-slate-800 flex items-center justify-center gap-8 pb-[env(safe-area-inset-bottom)] z-20">
                        
                        {!capturedImage ? (
                            <button 
                                onClick={capturePhoto}
                                className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center relative group active:scale-95 transition-transform"
                            >
                                <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform"></div>
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={retakePhoto}
                                    className="flex flex-col items-center gap-2 text-slate-400 hover:text-white"
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <RefreshCw className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase">Retake</span>
                                </button>
                                
                                <button 
                                    onClick={sendPhoto}
                                    className="flex flex-col items-center gap-2 text-cyan-400 hover:text-cyan-300"
                                >
                                    <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center border-4 border-cyan-900 shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] transition-all">
                                        <Send className="w-8 h-8 ml-1" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase">Send Proof</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className={`pt-[calc(1rem+env(safe-area-inset-top))] bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between ${viewMode === 'CAMERA' || viewMode === 'CALL' ? 'hidden' : ''}`}>
            <div className="flex items-center gap-3">
                <button onClick={handleBack} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-slate-700">
                    <ChevronLeft className="w-5 h-5" />
                </button>
               
                <div>
                    <h2 className="text-lg font-['Cinzel'] font-bold text-white tracking-widest leading-none">
                        {viewMode === 'CHAT' ? activeFriend?.name : t.friends_title}
                    </h2>
                    {viewMode === 'LIST' && (
                        <div className="flex gap-4 mt-2">
                            <button onClick={() => setActiveTab('MINE')} className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${activeTab === 'MINE' ? 'text-cyan-400 border-b border-cyan-500' : 'text-slate-500'}`}>
                                {t.friends_tab_mine}
                            </button>
                            <button onClick={() => setActiveTab('PENDING')} className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${activeTab === 'PENDING' ? 'text-cyan-400 border-b border-cyan-500' : 'text-slate-500'}`}>
                                {t.friends_tab_pending} (0)
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {viewMode !== 'CHAT' && (
                <button onClick={onClose} className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>

        {/* === LIST VIEW === */}
        {viewMode === 'LIST' && (
          <>
            {/* Search Bar */}
            <div className="p-4 bg-slate-900/50 border-b border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={t.friends_search_placeholder}
                        className="w-full bg-black border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-all"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 scroll-touch">
                
                {/* Search Results */}
                {searchResult && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em] mb-2 ml-1">Search Result</div>
                        <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xl">
                                {searchResult.name[0]}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold text-sm flex items-center gap-1">
                                    {searchResult.name}
                                    {searchResult.isVerified && <UserCheck className="w-3 h-3 text-emerald-400" />}
                                </h4>
                                <div className="text-[10px] text-slate-500 font-mono">Lv.{searchResult.level} {searchResult.race.split('·')[0]}</div>
                            </div>
                            <button 
                                onClick={() => { onSpeak(t.friends_add_success); setSearchResult(null); }}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-all active:scale-90"
                            >
                                <UserPlus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Friends List */}
                {activeTab === 'MINE' && (
                    <div className="space-y-3">
                        {friends.map(friend => (
                            <div key={friend.id} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center gap-4 transition-all group">
                                {/* Avatar with Status */}
                                <div className="relative cursor-pointer" onClick={() => startChat(friend)}>
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800">
                                        <img src={friend.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 shadow-sm ${friend.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startChat(friend)}>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-white font-bold text-sm truncate">{friend.name}</h4>
                                        <span className="text-[10px] text-slate-500 font-mono">Lv.{friend.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold uppercase ${friend.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {friend.status === 'online' ? t.friends_online : t.friends_offline}
                                        </span>
                                        {friend.status === 'offline' && <span className="text-[9px] text-slate-600 italic">{friend.lastSeen}</span>}
                                    </div>
                                    {/* Resonance Bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500" style={{width: `${friend.resonance}%`}}></div>
                                        </div>
                                        <span className="text-[9px] text-cyan-400 font-bold font-mono">{friend.resonance}%</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button onClick={() => startChat(friend)} className="p-2 bg-slate-800 hover:bg-indigo-900/50 text-slate-400 hover:text-indigo-400 rounded-xl transition-all active:scale-90 border border-slate-700">
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => startCall(friend)} className="p-2 bg-slate-800 hover:bg-emerald-900/50 text-slate-400 hover:text-emerald-400 rounded-xl transition-all active:scale-90 border border-slate-700">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => startCamera(friend)} className="p-2 bg-slate-800 hover:bg-cyan-900/50 text-slate-400 hover:text-cyan-400 rounded-xl transition-all active:scale-90 border border-slate-700">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'PENDING' && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                        <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm italic">沒有待處理的契約請求喔～</p>
                    </div>
                )}

                {/* Sync Contacts Button */}
                <div className="pt-6">
                    <button 
                        onClick={() => onSpeak("Syncing contacts with global registry...")}
                        className="w-full py-4 border border-dashed border-slate-700 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all bg-slate-900/20 active:scale-95"
                    >
                        <Link2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t.friends_sync_contacts}</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-20"></div>
            </div>
          </>
        )}

        {/* === CHAT VIEW === */}
        {viewMode === 'CHAT' && activeFriend && (
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="text-center py-4">
                        <div className="text-xs text-slate-500 font-bold mb-1">{new Date().toDateString()}</div>
                        <div className="text-[10px] text-slate-600 font-mono">ENCRYPTED CHANNEL ESTABLISHED</div>
                    </div>
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            {!msg.isMe && (
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden mr-2">
                                    <img src={activeFriend.avatarUrl} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                msg.isMe 
                                ? 'bg-cyan-600 text-white rounded-tr-sm' 
                                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                            }`}>
                                {msg.text}
                                <div className={`text-[9px] mt-1 text-right ${msg.isMe ? 'text-cyan-200' : 'text-slate-500'}`}>{msg.timestamp}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                
                <div className="p-3 bg-slate-900 border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
                    <div className="flex gap-2">
                        <input 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-black border border-slate-700 rounded-full px-4 text-sm text-white focus:border-cyan-500 outline-none"
                        />
                        <button onClick={sendMessage} className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 active:scale-95 transition-all">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default FriendsBoard;
