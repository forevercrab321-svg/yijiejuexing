import React, { useState, useRef, useEffect } from 'react';
import { Users, Flame, Send, MessageSquare, AlertTriangle, ArrowRight, X, Heart, Share2, Image as ImageIcon, Film, PlayCircle, Plus, MoreHorizontal, Briefcase, Camera, Crown, Shield, Mic, Search, UserPlus, Check, Tent, FileText, PenTool, ChevronLeft, LogOut, Bell, QrCode, Settings, ChevronRight } from 'lucide-react';
import { MOCK_POSTS, TRANSLATIONS, BRAND_MANIFESTO, MOCK_GUILDS } from '../constants';
import { CommunityPost, Quest, User, PlayerGuild } from '../types';

interface GuildBoardProps {
  onClose: () => void;
  lang: 'zh' | 'en';
  onAcceptUrgent: (questId: string) => void;
  urgentQuests: Quest[];
  currentUser: User;
  onSpeak: (text: string) => void;
}

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  role: 'sys' | 'user' | 'me';
  timestamp: string;
  avatar?: string;
}

const GuildBoard: React.FC<GuildBoardProps> = ({ onClose, lang, onAcceptUrgent, urgentQuests, currentUser, onSpeak }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'GUILD' | 'WORLD' | 'ALLIANCES' | 'SQUADS'>('GUILD');
  const [viewMode, setViewMode] = useState<'BOARD' | 'SQUAD_CHAT' | 'SQUAD_MANAGE'>('BOARD');
  
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS);
  
  // Guilds State
  const [guildList, setGuildList] = useState<PlayerGuild[]>(MOCK_GUILDS);
  const [guildSearch, setGuildSearch] = useState('');
  const [joinedGuilds, setJoinedGuilds] = useState<string[]>(MOCK_GUILDS.filter(g => g.isJoined).map(g => g.id));
  const [myGuild, setMyGuild] = useState<PlayerGuild | undefined>(MOCK_GUILDS.find(g => g.isJoined));
  
  // Create Guild Modal State
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');

  // Application Flow State
  const [applicationTarget, setApplicationTarget] = useState<PlayerGuild | null>(null);
  const [applicationMsg, setApplicationMsg] = useState('');

  // Create Post State
  const [showComposer, setShowComposer] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General Chat State (Hall)
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
      { id: 'sys-1', author: 'System', text: 'Connection established to Aethelgard Relay #404.', role: 'sys', timestamp: '08:00' },
      { id: 'msg-1', author: 'Gabiru', text: 'Has anyone seen my spear? I left it at the tavern!', role: 'user', timestamp: '09:12' },
      { id: 'msg-2', author: 'Gobta', text: 'Again? Captain is going to be mad.', role: 'user', timestamp: '09:15' },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Squad Chat State (Specific Guild)
  const [squadChatInput, setSquadChatInput] = useState('');
  const [squadMessages, setSquadMessages] = useState<ChatMessage[]>([
      { id: 'sq-1', author: 'ChefSan', text: 'Tonight\'s special is Dragon Tail Soup! 🍲 Everyone come by before 8 PM.', role: 'user', timestamp: '18:30', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop' },
      { id: 'sq-2', author: 'Me', text: 'On my way! Save a bowl for me.', role: 'me', timestamp: '18:35', avatar: currentUser.avatarUrl },
      { id: 'sq-3', author: 'NekoKishi', text: 'Bringing some herbs from the dungeon run.', role: 'user', timestamp: '18:40', avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop' },
  ]);
  const squadChatEndRef = useRef<HTMLDivElement>(null);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);

  const t = TRANSLATIONS[lang];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (viewMode === 'SQUAD_CHAT') {
        squadChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [squadMessages, viewMode]);

  // --- Handlers ---
  
  const handleVoiceInput = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice input not supported in this browser.");
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'zh' ? 'zh-TW' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setter((prev: string) => prev ? prev + ' ' + text : text);
    };
    recognition.onerror = () => setIsListening(false);
    
    recognition.start();
  };

  const triggerFileUpload = (type: 'image' | 'video') => {
      if (fileInputRef.current) {
          fileInputRef.current.accept = type === 'video' ? 'video/*' : 'image/*';
          fileInputRef.current.click();
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const type = file.type.startsWith('video') ? 'video' : 'image';
          const url = URL.createObjectURL(file);
          setNewPostMedia({ type, url });
          setShowComposer(true); // Ensure composer is open
      }
  };

  const handleCreatePost = () => {
      if (!newPostText.trim() && !newPostMedia) return;

      const post: CommunityPost = {
          id: Date.now().toString(),
          author: currentUser.name || 'Anonymous',
          avatar: currentUser.avatarUrl,
          content: newPostText,
          timestamp: 'Just now',
          likes: 0,
          isUrgent: false,
          mediaType: newPostMedia?.type,
          mediaUrl: newPostMedia?.url,
          comments: []
      };

      setPosts([post, ...posts]);
      setNewPostText('');
      setNewPostMedia(null);
      setShowComposer(false);
      setActiveTab('WORLD');
  };

  const handleLike = (postId: string) => {
      setPosts(prev => prev.map(p => {
          if (p.id === postId) {
              return { 
                  ...p, 
                  likes: p.isLiked ? p.likes - 1 : p.likes + 1, 
                  isLiked: !p.isLiked 
              };
          }
          return p;
      }));
  };

  const handleSendChat = (
      input: string, 
      setInput: React.Dispatch<React.SetStateAction<string>>,
      msgListSetter: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) => {
      if(!input.trim()) return;
      
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMessage: ChatMessage = { 
        id: Date.now().toString(),
        author: currentUser.name || 'Me', 
        text: input, 
        role: 'me',
        timestamp: timeString,
        avatar: currentUser.avatarUrl
      };
      
      msgListSetter(prev => [...prev, newMessage]);
      setInput('');
      
      // Simulate random response
      setTimeout(() => {
           const responses = ["Roger that.", "LOL", "Are you serious?", "Nice!", "Coordinates received.", "Anyone need healing?"];
           const randomResp = responses[Math.floor(Math.random() * responses.length)];
           const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

           const replyMessage: ChatMessage = {
             id: (Date.now() + 1).toString(),
             author: 'GuildMate',
             text: randomResp,
             role: 'user',
             timestamp: replyTime,
             avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
           };
           
           msgListSetter(prev => [...prev, replyMessage]);
      }, 1000 + Math.random() * 1000);
  };

  const handleGuildAction = (guild: PlayerGuild) => {
      if (joinedGuilds.includes(guild.id)) {
          // Confirm leave in manage view
      } else {
          // Join Logic - Open Application Form
          setApplicationTarget(guild);
          setApplicationMsg("");
          onSpeak(`You are applying to ${guild.name}. Please state your intent.`);
      }
  };

  const leaveGuild = () => {
      if (myGuild) {
          setJoinedGuilds(prev => prev.filter(id => id !== myGuild.id));
          setMyGuild(undefined);
          onSpeak(t.guild_leave_success);
          setViewMode('BOARD');
      }
  };

  const submitApplication = () => {
      if (applicationTarget) {
          setJoinedGuilds(prev => [...prev, applicationTarget.id]);
          onSpeak(t.guild_join_success);
          setMyGuild(guildList.find(g => g.id === applicationTarget.id));
          setApplicationTarget(null); // Close modal
      }
  };

  const createGuild = () => {
      if (!newGuildName || !newGuildDesc) return;
      const newGuild: PlayerGuild = {
          id: `new-${Date.now()}`,
          name: newGuildName,
          description: newGuildDesc,
          leader: currentUser.name,
          memberCount: 1,
          level: 1,
          isJoined: true,
          tags: ['新人', '創立'],
          bannerUrl: 'https://images.unsplash.com/photo-1519810755548-39de21758377?auto=format&fit=crop&w=800&q=80'
      };
      setGuildList([newGuild, ...guildList]);
      setJoinedGuilds([...joinedGuilds, newGuild.id]);
      setMyGuild(newGuild);
      setShowCreateGuild(false);
      setNewGuildName('');
      setNewGuildDesc('');
      onSpeak(t.guild_create_success);
      setActiveTab('SQUADS'); 
  };

  // --- VIEW: SQUAD CHAT ---
  if (viewMode === 'SQUAD_CHAT' && myGuild) {
      return (
          <div className="fixed inset-0 z-[1100] bg-slate-950 flex flex-col font-sans animate-in slide-in-from-right duration-300">
              {/* Chat Header */}
              <div className="pt-[env(safe-area-inset-top)] bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between shadow-lg z-10">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setViewMode('BOARD')} className="p-2 -ml-2 text-slate-400 hover:text-white">
                          <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div>
                          <h2 className="text-base font-bold text-white flex items-center gap-2">
                              {myGuild.name} 
                              <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700">Official</span>
                          </h2>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {myGuild.memberCount} members
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setViewMode('SQUAD_MANAGE')} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full">
                      <MoreHorizontal className="w-5 h-5" />
                  </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b1120]">
                  <div className="text-center py-4 opacity-50">
                      <div className="text-[10px] text-slate-500 font-mono mb-2">{new Date().toDateString()}</div>
                      <div className="inline-block bg-slate-900/80 px-3 py-1 rounded text-[10px] text-slate-400">
                          Messages are encrypted by Guild Magic Protocol
                      </div>
                  </div>
                  
                  {squadMessages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'me' ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                              {msg.avatar ? (
                                  <img src={msg.avatar} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">{msg.author[0]}</div>
                              )}
                          </div>
                          
                          <div className={`flex flex-col max-w-[70%] ${msg.role === 'me' ? 'items-end' : 'items-start'}`}>
                              {msg.role !== 'me' && <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.author}</span>}
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                  msg.role === 'me' 
                                  ? 'bg-emerald-600 text-white rounded-tr-sm' 
                                  : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                              }`}>
                                  {msg.text}
                              </div>
                              <span className="text-[9px] text-slate-600 mt-1 mx-1">{msg.timestamp}</span>
                          </div>
                      </div>
                  ))}
                  <div ref={squadChatEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-slate-900 border-t border-slate-800 p-3 pb-[env(safe-area-inset-bottom)] flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white">
                      <Plus className="w-6 h-6" />
                  </button>
                  <div className="flex-1 bg-black border border-slate-700 rounded-xl flex items-center px-2">
                      <input 
                          value={squadChatInput}
                          onChange={(e) => setSquadChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChat(squadChatInput, setSquadChatInput, setSquadMessages)}
                          className="flex-1 bg-transparent py-2.5 px-2 text-sm text-white outline-none"
                          placeholder="Message..."
                      />
                      <button 
                          onClick={() => handleVoiceInput(setSquadChatInput)}
                          className={`p-1.5 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                      >
                          <Mic className="w-4 h-4" />
                      </button>
                  </div>
                  {squadChatInput.trim() ? (
                      <button 
                          onClick={() => handleSendChat(squadChatInput, setSquadChatInput, setSquadMessages)} 
                          className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg active:scale-95 transition-transform"
                      >
                          <Send className="w-5 h-5" />
                      </button>
                  ) : (
                      <button className="p-2 text-slate-400 hover:text-white">
                          <ImageIcon className="w-6 h-6" />
                      </button>
                  )}
              </div>
          </div>
      );
  }

  // --- VIEW: SQUAD MANAGE ---
  if (viewMode === 'SQUAD_MANAGE' && myGuild) {
      return (
          <div className="fixed inset-0 z-[1100] bg-slate-950 flex flex-col font-sans animate-in slide-in-from-right duration-300 overflow-y-auto">
              {/* Header */}
              <div className="pt-[env(safe-area-inset-top)] bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-20">
                  <button onClick={() => setViewMode('SQUAD_CHAT')} className="p-2 -ml-2 text-slate-400 hover:text-white">
                      <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-base font-bold text-white">Guild Details</h2>
                  <div className="w-10"></div>
              </div>

              <div className="p-4 space-y-6 pb-20">
                  
                  {/* Members Grid */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="grid grid-cols-5 gap-4 mb-2">
                          {/* Mock Members */}
                          {[
                              { name: 'Me', img: currentUser.avatarUrl },
                              { name: 'Chef', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop' },
                              { name: 'Neko', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop' },
                              { name: 'Warrior', img: null },
                              { name: 'Mage', img: null }
                          ].map((m, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                                      {m.img ? <img src={m.img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">{m.name[0]}</div>}
                                  </div>
                                  <span className="text-[9px] text-slate-400 truncate w-full text-center">{m.name}</span>
                              </div>
                          ))}
                          {/* Add Button */}
                          <div className="flex flex-col items-center gap-1 cursor-pointer group">
                              <div className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:border-slate-500 transition-colors">
                                  <Plus className="w-5 h-5" />
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-slate-300">Invite</span>
                          </div>
                      </div>
                      <div className="text-center mt-3 pt-3 border-t border-slate-800">
                          <button className="text-xs text-slate-500 hover:text-white flex items-center justify-center gap-1 w-full">
                              View All {myGuild.memberCount} Members <ChevronRight className="w-3 h-3" />
                          </button>
                      </div>
                  </div>

                  {/* Settings Group 1 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="p-4 flex items-center justify-between border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <span className="text-sm text-white">Guild Name</span>
                          <div className="flex items-center gap-2 text-slate-500">
                              <span className="text-xs">{myGuild.name}</span>
                              <ChevronRight className="w-4 h-4" />
                          </div>
                      </div>
                      <div className="p-4 flex items-center justify-between border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <span className="text-sm text-white">Guild QR Code</span>
                          <div className="flex items-center gap-2 text-slate-500">
                              <QrCode className="w-4 h-4" />
                              <ChevronRight className="w-4 h-4" />
                          </div>
                      </div>
                      <div className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <span className="text-sm text-white">Guild Notice</span>
                          <div className="flex items-center gap-2 text-slate-500">
                              <span className="text-xs truncate max-w-[150px]">{myGuild.description}</span>
                              <ChevronRight className="w-4 h-4" />
                          </div>
                      </div>
                  </div>

                  {/* Settings Group 2 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="p-4 flex items-center justify-between border-b border-slate-800">
                          <span className="text-sm text-white">Mute Notifications</span>
                          <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer">
                              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                          </div>
                      </div>
                      <div className="p-4 flex items-center justify-between border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <span className="text-sm text-white">My Alias in Guild</span>
                          <div className="flex items-center gap-2 text-slate-500">
                              <span className="text-xs">{currentUser.name}</span>
                              <ChevronRight className="w-4 h-4" />
                          </div>
                      </div>
                      <div className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <span className="text-sm text-white">Background</span>
                          <div className="flex items-center gap-2 text-slate-500">
                              <ChevronRight className="w-4 h-4" />
                          </div>
                      </div>
                  </div>

                  {/* Danger Zone */}
                  <button 
                      onClick={leaveGuild}
                      className="w-full bg-slate-900 border border-slate-800 text-red-500 py-4 rounded-xl font-bold text-sm hover:bg-red-950/20 hover:border-red-900/50 transition-all flex items-center justify-center gap-2"
                  >
                      <LogOut className="w-4 h-4" />
                      Delete and Leave
                  </button>

              </div>
          </div>
      );
  }

  // --- VIEW: BOARD (DEFAULT) ---
  return (
    <div className="fixed inset-0 z-[1100] bg-slate-950 flex flex-col font-sans animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
      />

      {/* 1. Header Area */}
      <div className="pt-[env(safe-area-inset-top)] bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-20 shadow-xl">
          <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${activeTab === 'GUILD' ? 'bg-indigo-600 shadow-indigo-500/30' : activeTab === 'ALLIANCES' ? 'bg-amber-600 shadow-amber-500/30' : activeTab === 'SQUADS' ? 'bg-cyan-600 shadow-cyan-500/30' : 'bg-emerald-600 shadow-emerald-500/30'}`}>
                      {activeTab === 'GUILD' ? <Users className="w-5 h-5 text-white" /> : activeTab === 'ALLIANCES' ? <Briefcase className="w-5 h-5 text-white" /> : activeTab === 'SQUADS' ? <Tent className="w-5 h-5 text-white" /> : <Flame className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                      <h2 className="text-lg font-['Cinzel'] font-bold text-white tracking-widest leading-none mb-1">
                          {activeTab === 'GUILD' ? t.guild_title : activeTab === 'ALLIANCES' ? t.tab_alliances : activeTab === 'SQUADS' ? t.tab_squads : t.tab_world}
                      </h2>
                      <div className="flex gap-4 text-[10px] font-bold tracking-wider uppercase overflow-x-auto max-w-[200px] no-scrollbar">
                          <button onClick={() => setActiveTab('GUILD')} className={`transition-colors whitespace-nowrap ${activeTab === 'GUILD' ? 'text-indigo-400 border-b border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}>
                              {t.tab_guild}
                          </button>
                          <button onClick={() => setActiveTab('SQUADS')} className={`transition-colors whitespace-nowrap ${activeTab === 'SQUADS' ? 'text-cyan-400 border-b border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}>
                              {t.tab_squads}
                          </button>
                          <button onClick={() => setActiveTab('WORLD')} className={`transition-colors whitespace-nowrap ${activeTab === 'WORLD' ? 'text-emerald-400 border-b border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}>
                              {t.tab_world}
                          </button>
                          <button onClick={() => setActiveTab('ALLIANCES')} className={`transition-colors whitespace-nowrap ${activeTab === 'ALLIANCES' ? 'text-amber-400 border-b border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}>
                              {t.tab_alliances}
                          </button>
                      </div>
                  </div>
              </div>
              
              <div className="flex items-center gap-3">
                  {activeTab === 'WORLD' && (
                      <button 
                        onClick={() => setShowComposer(true)}
                        className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-900/50 active:scale-95 transition-transform"
                      >
                          <Plus className="w-5 h-5" />
                      </button>
                  )}
                  <button onClick={onClose} className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                  </button>
              </div>
          </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950 relative scroll-touch">
          
          {/* --- GUILD HALL TAB --- */}
          {activeTab === 'GUILD' && (
              <div className="p-4 space-y-6 min-h-full pb-20 animate-in fade-in slide-in-from-right-8 duration-300">
                  
                  {/* Urgent Board */}
                  <section>
                      <div className="flex items-center justify-between mb-3 px-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.urgent_tag}</h3>
                          </div>
                          <span className="text-[10px] text-red-500/60 font-mono">LIVE FEED</span>
                      </div>
                      
                      <div className="space-y-3">
                          {urgentQuests.length === 0 ? (
                              <div className="text-center py-8 text-slate-600 text-xs italic border border-slate-800 rounded-xl bg-slate-900/50">
                                  No urgent requests. Peace prevails.
                              </div>
                          ) : (
                              urgentQuests.map(quest => (
                                  <div key={quest.id} className="bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 rounded-2xl p-4 relative overflow-hidden group">
                                      {/* Tech lines */}
                                      <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                                      
                                      <div className="flex justify-between items-start mb-2">
                                          <h4 className="text-base font-bold text-red-100 font-['Cinzel']">{quest.title}</h4>
                                          <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg animate-pulse">
                                              S.O.S
                                          </div>
                                      </div>
                                      
                                      <p className="text-xs text-red-200/60 mb-4 line-clamp-2 leading-relaxed">{quest.description}</p>
                                      
                                      <button 
                                          onClick={() => { onAcceptUrgent(quest.id); onClose(); }}
                                          className="w-full bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.1)] active:scale-95 transition-all uppercase tracking-wider"
                                      >
                                          Accept Priority Contract <ArrowRight className="w-3 h-3" />
                                      </button>
                                  </div>
                              ))
                          )}
                      </div>
                  </section>

                  {/* Guild Chat Room (Hall) */}
                  <section className="flex flex-col h-[400px] bg-slate-900/50 border border-indigo-500/20 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="bg-slate-900/90 p-3 border-b border-indigo-500/20 flex items-center justify-between backdrop-blur">
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                              <MessageSquare className="w-3 h-3" /> {t.guild_chat_title}
                          </span>
                          <span className="text-[9px] text-emerald-500 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                             ● {Math.floor(Math.random() * 5000) + 1000} ONLINE
                          </span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/20">
                          {chatMessages.map((msg) => (
                              <div key={msg.id} className={`flex flex-col mb-2 ${msg.role === 'me' ? 'items-end' : msg.role === 'sys' ? 'items-center my-2' : 'items-start'}`}>
                                  {msg.role !== 'sys' && (
                                     <div className={`flex items-end gap-2 mb-1 ${msg.role === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <span className={`text-[10px] font-bold ${msg.role === 'me' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                           {msg.author}
                                        </span>
                                        <span className="text-[8px] text-slate-500 font-mono opacity-70">
                                           {msg.timestamp}
                                        </span>
                                     </div>
                                  )}
                                  <div className={`text-xs px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${
                                      msg.role === 'me' 
                                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20' 
                                      : msg.role === 'sys'
                                      ? 'bg-slate-800/50 text-slate-500 font-mono text-[10px] w-full text-center border border-dashed border-slate-700 py-1'
                                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                  }`}>
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          <div ref={chatEndRef} />
                      </div>

                      <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2">
                          <div className="flex-1 relative">
                             <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChat(chatInput, setChatInput, setChatMessages)}
                                className="w-full bg-black border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                                placeholder="Type to Guild..."
                             />
                             <button 
                                onClick={() => handleVoiceInput(setChatInput)}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                             >
                                <Mic className="w-3 h-3" />
                             </button>
                          </div>
                          <button onClick={() => handleSendChat(chatInput, setChatInput, setChatMessages)} className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500">
                              <Send className="w-4 h-4" />
                          </button>
                      </div>
                  </section>
              </div>
          )}

          {/* --- SQUADS TAB --- */}
          {activeTab === 'SQUADS' && (
              <div className="p-4 space-y-6 min-h-full pb-20 animate-in fade-in slide-in-from-right-8 duration-300">
                  
                  {/* Search & Create Bar */}
                  <div className="flex gap-2 mb-4">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                              type="text" 
                              value={guildSearch}
                              onChange={(e) => setGuildSearch(e.target.value)}
                              placeholder={t.guild_search_placeholder}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
                          />
                      </div>
                      <button 
                        onClick={() => setShowCreateGuild(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
                      >
                          <Plus className="w-5 h-5" />
                      </button>
                  </div>
                  
                  {/* My Guild Highlight */}
                  {myGuild && (
                    <div className="mb-6">
                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2 ml-1">My Squad</div>
                        <div className="bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/50 rounded-2xl p-4 flex gap-4 shadow-lg shadow-emerald-900/20">
                             <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/30">
                                 <img src={myGuild.bannerUrl} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1">
                                 <h3 className="text-white font-bold font-['Cinzel'] text-lg">{myGuild.name}</h3>
                                 <div className="text-xs text-slate-400 mb-2">Rank {myGuild.level} • {myGuild.memberCount} members</div>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => setViewMode('SQUAD_CHAT')}
                                        className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-1.5 rounded hover:bg-emerald-500 transition-colors active:scale-95 shadow-lg"
                                     >
                                        Squad Chat
                                     </button>
                                     <button 
                                        onClick={() => setViewMode('SQUAD_MANAGE')}
                                        className="flex-1 bg-slate-800 text-slate-300 text-[10px] font-bold py-1.5 rounded hover:bg-slate-700 transition-colors active:scale-95"
                                     >
                                        Manage
                                     </button>
                                 </div>
                             </div>
                        </div>
                    </div>
                  )}

                  {/* Guild List */}
                  <div className="space-y-4">
                      {guildList.filter(g => g.name.toLowerCase().includes(guildSearch.toLowerCase())).map(guild => {
                          const isJoined = joinedGuilds.includes(guild.id);
                          return (
                              <div key={guild.id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden group hover:border-cyan-500/50 transition-colors relative">
                                  {/* Banner */}
                                  <div className="h-24 w-full relative">
                                      <img src={guild.bannerUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                                      <div className="absolute bottom-2 left-3">
                                          <h3 className="text-white font-bold text-lg font-['Cinzel'] shadow-black drop-shadow-md">{guild.name}</h3>
                                          <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono">
                                              <span>Lv.{guild.level}</span>
                                              <span>•</span>
                                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {guild.memberCount}</span>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Content */}
                                  <div className="p-4 pt-2">
                                      <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                                          {guild.description}
                                      </p>
                                      
                                      <div className="flex flex-wrap gap-2 mb-4">
                                          {guild.tags.map(tag => (
                                              <span key={tag} className="text-[9px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">#{tag}</span>
                                          ))}
                                      </div>

                                      <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                                          <div className="text-[9px] text-slate-500">
                                              Leader: <span className="text-slate-300 font-bold">{guild.leader}</span>
                                          </div>
                                          <button 
                                              onClick={() => handleGuildAction(guild)}
                                              className={`text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 ${
                                                  isJoined 
                                                  ? 'bg-red-950/50 text-red-400 border border-red-500/30' 
                                                  : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/20'
                                              }`}
                                          >
                                              {isJoined ? (
                                                  <><X className="w-3 h-3" /> {t.guild_leave}</>
                                              ) : (
                                                  <><UserPlus className="w-3 h-3" /> {t.guild_join}</>
                                              )}
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* --- ALLIANCES & WORLD TABS --- */}
          {activeTab === 'ALLIANCES' && (
             // ... existing alliances content ...
             <div className="p-4 space-y-8 min-h-full pb-20 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="text-center py-6 border-b border-amber-900/30">
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-950/30 border border-amber-500/30 mb-3">
                          <Briefcase className="w-6 h-6 text-amber-500" />
                      </div>
                      <h2 className="text-xl font-['Cinzel'] font-bold text-white tracking-widest">GUILD ALLIANCES</h2>
                      <p className="text-[10px] text-amber-500/60 uppercase tracking-widest mt-1">Real Trust • No Fabricated Influence</p>
                  </div>
                  {/* ... rest of alliances ... */}
                  <div className="space-y-4">
                      {BRAND_MANIFESTO.map((item, idx) => (
                          <div key={idx} className={`p-5 rounded-2xl border ${item.highlight ? 'bg-gradient-to-br from-amber-950/40 to-black border-amber-500/50 shadow-lg shadow-amber-900/20' : 'bg-slate-900/50 border-slate-800'}`}>
                              <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.highlight ? 'text-amber-400' : 'text-slate-400'}`}>
                                  {item.title}
                              </h3>
                              <p className="text-sm text-slate-300 leading-relaxed font-serif italic">
                                  "{item.content}"
                              </p>
                          </div>
                      ))}
                  </div>
             </div>
          )}

          {activeTab === 'WORLD' && (
              // ... existing world content ...
               <div className="pb-20 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="relative h-48 w-full bg-slate-800 mb-8">
                       <img src="https://image.pollinations.ai/prompt/cyberpunk%20fantasy%20city%20skyline%20night%20neon%20lights%20anime%20style%20panorama?width=800&height=300&nologo=true" className="w-full h-full object-cover opacity-60" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                       <div className="absolute -bottom-6 right-4 flex items-end gap-3">
                           <div className="text-right mb-2">
                               <div className="text-white font-bold text-lg drop-shadow-md">{currentUser.name}</div>
                               <div className="text-slate-400 text-xs font-mono text-right opacity-80">Lv.{currentUser.level}</div>
                           </div>
                           <div className="w-20 h-20 rounded-xl bg-slate-800 border-4 border-slate-950 overflow-hidden shadow-2xl">
                               <img src={currentUser.avatarUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                           </div>
                       </div>
                  </div>
                  <div className="space-y-8 px-4">
                      {posts.map(post => (
                          <div key={post.id} className="flex gap-3 pb-6 border-b border-slate-800/50 last:border-0">
                              <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
                                   {post.avatar ? (
                                       <img src={post.avatar} className="w-full h-full object-cover" />
                                   ) : (
                                       <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{post.author[0]}</div>
                                   )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="text-emerald-400 font-bold text-sm mb-1">{post.author}</div>
                                  <div className="text-slate-200 text-sm mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</div>
                                  {post.mediaUrl && (
                                      <div className="mb-3 rounded-lg overflow-hidden border border-slate-700 bg-black/50 max-w-sm">
                                          {post.mediaType === 'video' ? (
                                              <video src={post.mediaUrl} controls className="w-full h-auto max-h-64 object-cover" />
                                          ) : (
                                              <img src={post.mediaUrl} className="w-full h-auto max-h-64 object-cover" />
                                          )}
                                      </div>
                                  )}
                                  <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                                      <span>{post.timestamp}</span>
                                      <div className="flex gap-4">
                                           <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 hover:text-emerald-400 transition-colors ${post.isLiked ? 'text-red-500' : ''}`}>
                                               <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                               {post.likes > 0 && post.likes}
                                           </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
               </div>
          )}
      </div>

      {/* 3. Composer Modal */}
      {showComposer && (
          <div className="absolute inset-0 z-[1200] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900">
                  <button onClick={() => { setShowComposer(false); setNewPostMedia(null); setNewPostText(''); }} className="text-slate-400 text-sm">Cancel</button>
                  <button onClick={handleCreatePost} disabled={!newPostText && !newPostMedia} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors">Post</button>
              </div>
              <div className="flex-1 p-4 relative">
                  <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} className="w-full h-32 bg-transparent text-white text-base outline-none resize-none placeholder-slate-600 pr-10" placeholder={t.post_placeholder} autoFocus />
                  <button onClick={() => handleVoiceInput(setNewPostText)} className={`absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}><Mic className="w-4 h-4" /></button>
              </div>
          </div>
      )}

      {/* 4. Create Guild Modal */}
      {showCreateGuild && (
          <div className="absolute inset-0 z-[1200] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 p-6">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-['Cinzel'] font-bold text-white">{t.guild_create}</h2>
                  <button onClick={() => setShowCreateGuild(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Squad Name</label>
                      <input value={newGuildName} onChange={e => setNewGuildName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500" placeholder="Ex: Night Owls" />
                  </div>
                  <div className="space-y-2 relative">
                      <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Mission Statement</label>
                      <textarea value={newGuildDesc} onChange={e => setNewGuildDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 h-32 resize-none" placeholder="What is your squad's purpose?" />
                      <button onClick={() => handleVoiceInput(setNewGuildDesc)} className={`absolute right-2 top-8 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}><Mic className="w-4 h-4" /></button>
                  </div>
              </div>
              <button onClick={createGuild} disabled={!newGuildName || !newGuildDesc} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all mt-auto mb-[env(safe-area-inset-bottom)]">Establish Squad</button>
          </div>
      )}

      {/* 5. Application Form Modal */}
      {applicationTarget && (
          <div className="absolute inset-0 z-[1300] bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                 <div>
                     <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Applying to</div>
                     <h2 className="text-xl font-['Cinzel'] font-bold text-white">{applicationTarget.name}</h2>
                 </div>
                 <button onClick={() => setApplicationTarget(null)} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
             </div>

             <div className="p-6 flex-1 flex flex-col">
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 flex items-start gap-4">
                     <FileText className="w-6 h-6 text-slate-500 mt-1" />
                     <div>
                         <h3 className="text-sm font-bold text-white mb-1">Squad Requirements</h3>
                         <p className="text-xs text-slate-400 leading-relaxed">{applicationTarget.description}</p>
                     </div>
                 </div>

                 <div className="space-y-2 flex-1">
                      <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <PenTool className="w-3 h-3" /> Application Message
                      </label>
                      <textarea 
                          value={applicationMsg}
                          onChange={e => setApplicationMsg(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 h-40 resize-none text-sm leading-relaxed"
                          placeholder="Why do you want to join? What are your skills?"
                          autoFocus
                      />
                 </div>

                 <button 
                    onClick={submitApplication}
                    disabled={!applicationMsg.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all mt-auto mb-[env(safe-area-inset-bottom)] flex items-center justify-center gap-2"
                 >
                    <Send className="w-4 h-4" /> Submit Application
                 </button>
             </div>
          </div>
      )}

    </div>
  );
};

export default GuildBoard;