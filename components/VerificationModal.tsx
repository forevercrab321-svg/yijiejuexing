
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Race } from '../types';
import { RACE_CONFIG, LANDING_HERO_IMAGE } from '../constants';
import { Fingerprint, Terminal, Check, Sparkles, ChevronLeft, CreditCard, User, Shield, ArrowRight, ScanFace, Camera, Cpu, Loader2, Mic } from 'lucide-react';

interface VerificationModalProps {
  onComplete: (data: {
      realName: string;
      idCard: string;
      name: string;
      race: Race;
      bio: string;
      avatarUrl: string; 
  }) => void;
  lang?: 'zh' | 'en';
}

const VerificationModal: React.FC<VerificationModalProps> = ({ onComplete, lang = 'zh' }) => {
  // 0: Identity, 1: Face, 2: Soul (Was 3), 3: Result (Was 4), 4: Loading (Was 5)
  const [step, setStep] = useState<number>(0);
  
  // Form State
  const [realName, setRealName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  
  // Face Scan State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [analysisText, setAnalysisText] = useState('初始化扫描模组...');
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);

  // Race & Avatar State
  const [selectedRace, setSelectedRace] = useState<Race>(Race.SLIME);
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string>('');

  // Animation text
  const [loadingText, setLoadingText] = useState('LINKING SOUL...');

  // Voice Input Logic
  const handleVoiceInput = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
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

  // Camera Logic
  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    if (step === 1 && !scanComplete) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                mediaStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.warn("Camera Access Denied", err);
                setAnalysisText("摄像头连接失败，切换至模拟信号...");
                // Fallback for demo without camera
                setTimeout(() => {
                    if (step === 1 && !scanComplete) {
                        setAnalysisText("模拟捕获完成，正在分析...");
                        // Automatically try basic analysis if camera fails
                        setSelectedRace(Race.SLIME);
                        setGeneratedAvatarUrl(RACE_CONFIG[Race.SLIME].img);
                        setScanComplete(true);
                    }
                }, 2000);
            });
    }

    return () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
    };
  }, [step, scanComplete]);

  // AI Face Analysis & Avatar Generation
  const analyzeFace = async () => {
    if (!videoRef.current || !canvasRef.current) {
        // Fallback for testing/no camera
        setIsScanning(true);
        setAnalysisText("大贤者连接异常，分配素体...");
        setTimeout(() => {
            setSelectedRace(Race.SLIME);
            setGeneratedAvatarUrl(RACE_CONFIG[Race.SLIME].img);
            setScanComplete(true);
            setIsScanning(false);
        }, 1500);
        return;
    }

    setIsScanning(true);
    setAnalysisText("正在捕获生物特征...");

    try {
        // 1. Capture Image
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context failed");
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        setAnalysisText("正在连接大贤者解析面相...");

        // 2. Call Gemini API
        const apiKey = process.env.API_KEY || "";
        
        // Fallback if no key
        if (!apiKey) {
             throw new Error("No API Key");
        }
        
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: `
                        You are an AI creating a 'Pop Mart' style toy character profile. 
                        Analyze the person in the image (gender, hair style/color, glasses, vibe).
                        
                        1. Assign one of these Races based on vibe: ${Object.values(Race).join(', ')}
                        2. Create a "visual_prompt" for image generation. 
                           The style MUST BE: "Pop Mart style 3D render, blind box toy, chibi proportions, round face, big expressive eyes, smooth vinyl toy texture, clean lighting, pastel or vibrant colors, fashion streetwear mixed with fantasy elements".
                           Describe their key features (e.g. "silver messy hair, round glasses, oversized hoodie, cool sneakers") to match this style.
                    ` }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        race: { type: Type.STRING, enum: Object.values(Race) },
                        visual_prompt: { type: Type.STRING }
                    },
                    required: ["race", "visual_prompt"]
                }
            }
        });

        const result = JSON.parse(response.text || '{}');
        console.log("AI Analysis Result:", result);

        // 3. Process Result
        const matchedRace = result.race as Race;
        const visualPrompt = result.visual_prompt || "cute trendy character";
        
        setSelectedRace(matchedRace);
        
        // 4. Generate Dynamic Avatar URL
        const styleKeywords = "Pop Mart style, blind box toy, 3d render, chibi, cute, big expressive eyes, round face, smooth vinyl texture, soft studio lighting, volumetric lighting, octane render, c4d, blender, high fidelity, 8k, fashion streetwear, trendy outfit, masterpiece, clean pastel background";
        const raceCostume = matchedRace === Race.KIJIN ? "japanese oni horns, samurai bomber jacket, katana on back" 
                          : matchedRace === Race.ANGEL ? "small white wings, halo, oversized white hoodie, glowing accents"
                          : matchedRace === Race.DRAGONNEWT ? "small dragon horns, tail, green scaled jacket, futuristic goggles"
                          : matchedRace === Race.DAEMON ? "demon horns, tail, black butler suit with sneakers, mysterious vibe"
                          : "translucent blue accessories, crown, futuristic streetwear, slime texture elements";

        const fullPrompt = `${styleKeywords}, ${visualPrompt}, ${raceCostume}`;
        const safePrompt = encodeURIComponent(fullPrompt);
        
        const avatarUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=500&height=750&nologo=true&seed=${Math.floor(Math.random()*1000)}`;
        
        setGeneratedAvatarUrl(avatarUrl);
        setAnalysisText("解析完成。专属灵骸已生成。");
        setScanComplete(true);

    } catch (error) {
        console.error("AI Analysis Failed", error);
        setAnalysisText("解析受阻，分配基础素体。");
        // FALLBACK: Assign random race so user isn't stuck
        const fallbackRaces = Object.values(Race);
        const randomRace = fallbackRaces[Math.floor(Math.random() * fallbackRaces.length)];
        setSelectedRace(randomRace);
        setGeneratedAvatarUrl(RACE_CONFIG[randomRace].img);
        setScanComplete(true);
    } finally {
        setIsScanning(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
        const texts = [
            'VERIFYING TRUST SIGNALS...',
            'ESTABLISHING COMMUNITY LINK...',
            'RECONSTRUCTING SOUL...',
            'SYNC COMPLETE.'
        ];
        let i = 0;
        const interval = setInterval(() => {
            setLoadingText(texts[i]);
            i++;
            if (i >= texts.length) {
                clearInterval(interval);
                setTimeout(() => {
                    onComplete({
                        realName, idCard, name, race: selectedRace, bio,
                        avatarUrl: generatedAvatarUrl
                    });
                }, 800);
            }
        }, 800);
        return () => clearInterval(interval);
    }
  }, [step, onComplete, realName, idCard, name, selectedRace, bio, generatedAvatarUrl]);

  const goBack = () => {
      if(step > 0) setStep(s => s - 1);
  };

  const raceInfo = RACE_CONFIG[selectedRace];

  return (
    <div className="fixed inset-0 z-[5000] flex flex-col items-center justify-center bg-black font-sans overflow-y-auto">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
          <img 
            src={LANDING_HERO_IMAGE} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-90 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="w-full h-full max-w-md relative flex flex-col z-10 min-h-[600px] pointer-events-auto">
        
        {/* Navigation Header */}
        <div className="pt-12 px-6 flex items-center justify-between z-20">
            {step > 0 && step < 4 ? (
                <button onClick={goBack} className="text-white/80 hover:text-white flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-bold">BACK</span>
                </button>
            ) : <div></div>}
            
            {step < 4 && (
                <div className="flex gap-1">
                    {[0,1,2,3].map(i => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= step ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                    ))}
                </div>
            )}
        </div>

        {/* STEP 0: REAL IDENTITY (Trust Verification) */}
        {step === 0 && (
          <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500">
            <div className="mt-4 mb-8 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-800/80 backdrop-blur rounded-2xl flex items-center justify-center border border-amber-500/30 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Shield className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-3xl font-['Cinzel'] font-bold text-white tracking-widest">信任觉醒</h1>
                <p className="text-xs text-slate-400 mt-2">COMMUNITY TRUST PROTOCOL</p>
            </div>

            <div className="space-y-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-md shadow-xl">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider ml-1">真实姓名 (Real Name)</label>
                    <input 
                        value={realName}
                        onChange={e => setRealName(e.target.value)}
                        className="w-full bg-black/40 border border-slate-600 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors pointer-events-auto"
                        placeholder="社区互助基于真实信任"
                    />
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider ml-1">身份证号 (Identity Hash)</label>
                    <input 
                        value={idCard}
                        onChange={e => setIdCard(e.target.value)}
                        className="w-full bg-black/40 border border-slate-600 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors font-mono pointer-events-auto"
                        placeholder="仅用于信任验证，不公开"
                    />
                </div>
                
                <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-700 pt-3">
                    * 声明：本平台为社区志愿互助系统，非雇佣平台。您的身份信息仅用于建立社区信任，平台不经手任何资金，不提供收入担保。
                </div>
            </div>

            <div className="mt-auto py-4">
                <button 
                    disabled={!realName || !idCard}
                    onClick={() => setStep(1)}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg pointer-events-auto"
                >
                    同意公约并继续 <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        )}

        {/* STEP 1: FACE VERIFICATION & AI ANALYSIS */}
        {step === 1 && (
            <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500">
                <div className="mt-4 mb-4 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-800/80 backdrop-blur rounded-2xl flex items-center justify-center border border-sky-500/30 mb-4 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                        <ScanFace className="w-8 h-8 text-sky-500" />
                    </div>
                    <h1 className="text-3xl font-['Cinzel'] font-bold text-white tracking-widest">大贤者解析</h1>
                    <p className="text-xs text-slate-400 mt-2">GREAT SAGE ANALYSIS</p>
                </div>

                {/* Camera Viewport */}
                <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl mb-6">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${scanComplete ? 'opacity-0' : 'opacity-100'}`}
                    />
                    
                    {/* Success / Generated Image Overlay */}
                    {scanComplete && generatedAvatarUrl && (
                         <div className="absolute inset-0 bg-slate-950">
                             <img src={generatedAvatarUrl} className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" alt="Generated Avatar" />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                             
                             <div className="absolute bottom-10 left-0 right-0 text-center animate-in slide-in-from-bottom-4">
                                <div className="text-emerald-400 font-bold tracking-widest text-lg drop-shadow-md">MATCH CONFIRMED</div>
                                <div className="text-xs text-slate-300 mt-1">Unique Blind Box Avatar Generated</div>
                             </div>
                         </div>
                    )}
                    
                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-sky-500 rounded-tl-lg"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-sky-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-sky-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-sky-500 rounded-br-lg"></div>
                        
                        {!scanComplete && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-64 border border-sky-500/30 rounded-[3rem] relative">
                                    {isScanning && (
                                        <div className="absolute left-0 right-0 h-1 bg-sky-400 shadow-[0_0_15px_#38bdf8] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Status Text overlay */}
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <span className="text-[10px] bg-black/60 px-2 py-1 rounded text-cyan-400 border border-cyan-800 backdrop-blur font-mono animate-pulse">
                                {analysisText}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto py-4">
                    {!scanComplete ? (
                        <button 
                            onClick={analyzeFace}
                            disabled={isScanning}
                            className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg pointer-events-auto
                                ${isScanning ? 'bg-slate-700 text-slate-400' : 'bg-sky-600 text-white hover:bg-sky-500'}
                            `}
                        >
                            {isScanning ? (
                                <><Cpu className="w-4 h-4 animate-spin" /> 解析中...</>
                            ) : (
                                <><Camera className="w-4 h-4" /> 鉴定灵魂相性</>
                            )}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setStep(2)}
                            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg animate-in fade-in slide-in-from-bottom-2 pointer-events-auto"
                        >
                            下一步 <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* STEP 2: SOUL CONSTRUCTION (Was Step 3) */}
        {step === 2 && (
          <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500">
             <div className="mt-4 mb-8 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-800/80 backdrop-blur rounded-2xl flex items-center justify-center border border-cyan-500/30 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <User className="w-8 h-8 text-cyan-500" />
                </div>
                <h1 className="text-3xl font-['Cinzel'] font-bold text-white tracking-widest">灵魂重构</h1>
            </div>

            <div className="space-y-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-md shadow-xl">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider ml-1">转生代号 (Agent Name)</label>
                    <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-black/40 border border-slate-600 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors pointer-events-auto"
                        placeholder="请输入你在异世界的名字"
                    />
                </div>

                <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider ml-1">志愿宣言 (Bio)</label>
                    <div className="relative">
                        <input 
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full bg-black/40 border border-slate-600 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors italic pr-12 pointer-events-auto"
                            placeholder="例如：乐于助人的史莱姆"
                        />
                        <button 
                            onClick={() => handleVoiceInput(setBio)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors pointer-events-auto ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-auto py-4">
                <button 
                    disabled={!name}
                    onClick={() => setStep(3)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg pointer-events-auto"
                >
                    查看鉴定结果 <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        )}

        {/* STEP 3: RACE RESULT REVEAL (Was Step 4) */}
        {step === 3 && (
          <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right duration-500 bg-slate-950/90 backdrop-blur-md p-6">
             <div className="pt-8 mb-4 text-center z-10">
                 <h2 className="text-2xl font-['Cinzel'] font-bold text-white tracking-widest mb-1">转生鉴定书</h2>
                 <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">SOUL COMPATIBILITY RESULT</p>
             </div>
             
             {/* Result Card */}
             <div className="flex-1 flex flex-col items-center justify-center">
                 <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)] group bg-black">
                    {/* Dynamic Background Image */}
                    {generatedAvatarUrl ? (
                        <img 
                            src={generatedAvatarUrl} 
                            className="w-full h-96 object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700" 
                            onLoad={(e) => (e.target as HTMLImageElement).classList.remove('opacity-0')}
                            alt="Avatar"
                        />
                    ) : (
                         <div className="w-full h-96 flex items-center justify-center text-amber-500">
                             <Loader2 className="w-10 h-10 animate-spin" />
                         </div>
                    )}
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">VOLUNTEER IDENTITY</div>
                        </div>
                        <h3 className="text-2xl font-bold text-white font-['Cinzel'] mb-1">{selectedRace.split('·')[0]}</h3>
                        <div className="text-sm text-cyan-400 font-bold mb-3">{raceInfo.job}</div>
                        
                        <div className="bg-slate-900/80 backdrop-blur p-3 rounded-xl border border-slate-700 text-xs text-slate-300 leading-relaxed mb-3">
                            {raceInfo.desc}
                        </div>
                         <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-2 py-1 rounded w-fit border border-emerald-500/30">
                            <span>▲</span> {raceInfo.buff}
                        </div>
                    </div>
                 </div>
                 
                 <div className="mt-6 text-center text-slate-500 text-xs italic">
                     * 根据您的面部特征生成唯一专属形象
                 </div>
             </div>

             {/* Footer Button */}
             <div className="mt-auto pt-6 pb-4">
                <button 
                    onClick={() => setStep(4)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_25px_rgba(147,51,234,0.4)] transform active:scale-95 transition-all font-['Cinzel'] tracking-[0.2em] flex items-center justify-center gap-2 border border-purple-400/30 pointer-events-auto"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>加入互助社区</span>
                </button>
             </div>
          </div>
        )}

        {/* STEP 4: LOADING ANIMATION (Was Step 5) */}
        {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 backdrop-blur-xl bg-black/60">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-4 border-amber-900/30 rounded-full"></div>
                    <div className="absolute inset-0 border-t-4 border-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-cyan-900/30 rounded-full"></div>
                    <div className="absolute inset-4 border-b-4 border-cyan-500 rounded-full animate-spin direction-reverse duration-1000"></div>
                </div>
                <h2 className="text-2xl font-['Cinzel'] text-white tracking-widest mb-2 animate-pulse">SYSTEM SYNC</h2>
                <div className="flex items-center gap-2 text-amber-500/80 font-mono text-xs">
                    <Terminal className="w-3 h-3" />
                    <span>{loadingText}</span>
                </div>
            </div>
        )}

      </div>
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VerificationModal;
