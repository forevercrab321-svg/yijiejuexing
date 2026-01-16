
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Wifi, Activity, AlertTriangle, Settings, Save, RotateCcw, MousePointer2, Eye, Move } from 'lucide-react';

interface ElenaLivePortraitProps {
  imageUrl: string;
  isSpeaking: boolean;
  lang: 'zh' | 'en';
  intensity?: number;
  emotion?: 'neutral' | 'tease' | 'serious';
  isVoiceOffline?: boolean;
}

// --- 类型定义 ---
interface Rect {
  x: number; // percentage 0-100
  y: number;
  w: number;
  h: number;
}

interface CalibrationData {
  leftEye: Rect;
  rightEye: Rect;
  mouth: Rect;
}

// --- 默认配置 (适配 Seed 101 原画) ---
const DEFAULT_CONFIG: CalibrationData = {
  leftEye: { x: 34, y: 39, w: 11, h: 2.2 },
  rightEye: { x: 54, y: 39, w: 11, h: 2.2 },
  mouth: { x: 45, y: 49.8, w: 9, h: 2.5 }
};

const STORAGE_KEY = 'elena_portrait_calibration_v1';

const ElenaLivePortrait: React.FC<ElenaLivePortraitProps> = ({ 
  imageUrl, 
  isSpeaking, 
  lang, 
  intensity = 1,
  emotion = 'neutral',
  isVoiceOffline = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null); // NEW: Mouth Ref
  
  // --- 状态管理 ---
  const [config, setConfig] = useState<CalibrationData>(DEFAULT_CONFIG);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [activeRegion, setActiveRegion] = useState<keyof CalibrationData | null>(null);
  const [hasError, setHasError] = useState(false);
  
  // 动画状态
  const [blinkState, setBlinkState] = useState(0); // 0:Open, 1:Closed
  
  // 物理引擎 Refs
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const headState = useRef({ pitch: 0, yaw: 0, roll: 0 }); // 头部姿态
  const breatheRef = useRef(0);
  const reqRef = useRef<number>(0);

  // --- 1. 初始化与存储 ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load calibration", e);
      }
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setIsCalibrating(false);
    setActiveRegion(null);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // --- 2. 物理引擎循环 (The "Live2D" Core) ---
  useEffect(() => {
    const loop = () => {
      // A. 基础呼吸
      breatheRef.current += 0.01;
      const breatheY = Math.sin(breatheRef.current) * 0.3; 
      
      // B. 鼠标视差 (Lerp)
      const ease = emotion === 'serious' ? 0.03 : 0.06;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      // C. 头部自然动作 (Speaking Micro-movements)
      // 说话时增加随机点头(Pitch)和侧摆(Roll)
      let targetPitch = -currentPos.current.y * 10 * intensity;
      let targetYaw = currentPos.current.x * 12 * intensity;
      let targetRoll = 0;

      if (isSpeaking) {
          // 说话时的节奏性点头
          const speakRhythm = Math.sin(Date.now() / 150); 
          const speakWobble = Math.cos(Date.now() / 400);
          targetPitch += speakRhythm * 2; 
          targetRoll += speakWobble * 1.5;
      }

      headState.current.pitch += (targetPitch - headState.current.pitch) * 0.1;
      headState.current.yaw += (targetYaw - headState.current.yaw) * 0.1;
      headState.current.roll += (targetRoll - headState.current.roll) * 0.1;

      // D. Mouth Physics (Dynamic Lip-sync Simulation)
      if (mouthRef.current) {
          let mouthScaleY = 0.2;
          let mouthOpacity = 0;
          
          if (isSpeaking) {
              const t = Date.now();
              // Create complex wave to mimic syllables
              // Base carrier wave (syllable pacing)
              const carrier = Math.sin(t * 0.015) + 1; // 0 to 2
              // High freq modulation (jaw movement)
              const modulator = Math.sin(t * 0.04);
              
              // Combine: Mouth opens more when carrier is high
              const opening = Math.abs(modulator) * carrier * 0.5;
              
              // Add randomness/noise
              const noise = Math.random() * 0.2;

              mouthScaleY = 0.5 + opening + noise; 
              // Clamp max open
              mouthScaleY = Math.min(2.0, Math.max(0.4, mouthScaleY));
              
              mouthOpacity = 0.85;
          }

          mouthRef.current.style.transform = `translate(-50%, -50%) scale(1, ${mouthScaleY})`;
          mouthRef.current.style.opacity = mouthOpacity.toString();
      }

      // E. Apply Head Transforms
      if (layerRef.current) {
        layerRef.current.style.transform = `
            perspective(1000px) 
            rotateX(${headState.current.pitch}deg) 
            rotateY(${headState.current.yaw}deg) 
            rotateZ(${headState.current.roll}deg)
            translateY(${breatheY}%)
            scale(1.02) 
        `;
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [intensity, emotion, isSpeaking]);

  // --- 3. 交互监听 ---
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isCalibrating) {
            // 正常模式：更新视差目标
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            let cx, cy;
            if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
            else { cx = (e as MouseEvent).clientX; cy = (e as MouseEvent).clientY; }
            
            const x = ((cx - rect.left) / rect.width) * 2 - 1;
            const y = ((cy - rect.top) / rect.height) * 2 - 1;
            targetPos.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
        } else if (activeRegion && containerRef.current) {
            // 校准模式：拖拽选区
            const rect = containerRef.current.getBoundingClientRect();
            let cx, cy;
            if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
            else { cx = (e as MouseEvent).clientX; cy = (e as MouseEvent).clientY; }
            
            // 计算百分比位置 (中心点)
            const xPct = ((cx - rect.left) / rect.width) * 100;
            const yPct = ((cy - rect.top) / rect.height) * 100;
            
            setConfig(prev => ({
                ...prev,
                [activeRegion]: {
                    ...prev[activeRegion],
                    x: Math.max(0, Math.min(100, xPct)),
                    y: Math.max(0, Math.min(100, yPct))
                }
            }));
        }
    };
    
    const handleUp = () => setActiveRegion(null);
    const handleLeave = () => { targetPos.current = { x: 0, y: 0 }; setActiveRegion(null); };

    // 滚轮缩放选区
    const handleWheel = (e: WheelEvent) => {
        if (isCalibrating && activeRegion) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.5 : 0.5;
            setConfig(prev => {
                const current = prev[activeRegion];
                // 按住 Shift 调整高度，否则调整宽度
                if (e.shiftKey) {
                    return { ...prev, [activeRegion]: { ...current, h: Math.max(0.5, current.h + delta) } };
                } else {
                    return { ...prev, [activeRegion]: { ...current, w: Math.max(1, current.w + delta) } };
                }
            });
        }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    containerRef.current?.addEventListener('mouseleave', handleLeave);
    containerRef.current?.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchend', handleUp);
        containerRef.current?.removeEventListener('mouseleave', handleLeave);
        containerRef.current?.removeEventListener('wheel', handleWheel);
    };
  }, [isCalibrating, activeRegion]);

  // --- 4. 眨眼逻辑 ---
  useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      const triggerBlink = () => {
          setBlinkState(1);
          setTimeout(() => setBlinkState(0), 180);
          
          let nextInterval = Math.random() * 3000 + 2000;
          if (Math.random() < 0.2) { // 双眨
              setTimeout(() => {
                  setBlinkState(1);
                  setTimeout(() => setBlinkState(0), 150);
              }, 250);
          }
          timeoutId = setTimeout(triggerBlink, nextInterval);
      };
      timeoutId = setTimeout(triggerBlink, 2000);
      return () => clearTimeout(timeoutId);
  }, []);

  if (hasError) return <img src={imageUrl} className="w-full h-full object-cover" />;

  // --- 渲染辅助 ---
  const renderEyeLids = (region: Rect, side: 'left' | 'right') => {
      // 皮肤遮罩颜色，硬编码适配当前模型
      const skinColor = '#eecdbf'; 
      return (
          <div 
            key={side}
            className={`absolute pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]`}
            style={{
                top: `${region.y}%`, left: `${region.x}%`, 
                width: `${region.w}%`, height: `${region.h}%`,
                transform: 'translate(-50%, -50%)', // 中心定位
                zIndex: 10
            }}
          >
              {/* 上眼睑: 闭合时覆盖 80% */}
              <div className="absolute top-0 w-full bg-[#eecdbf] origin-top transition-transform duration-200"
                   style={{ 
                       height: '70%', 
                       backgroundColor: skinColor,
                       transform: `scaleY(${blinkState ? 1.2 : 0})`,
                       borderRadius: '50% 50% 20% 20%',
                       boxShadow: '0 2px 4px rgba(0,0,0,0.1) inset'
                   }}
              ></div>
              {/* 下眼睑: 闭合时覆盖 20% */}
              <div className="absolute bottom-0 w-full bg-[#eecdbf] origin-bottom transition-transform duration-200"
                   style={{ 
                       height: '40%', 
                       backgroundColor: skinColor,
                       transform: `scaleY(${blinkState ? 1.0 : 0})`,
                       borderRadius: '20% 20% 50% 50%'
                   }}
              ></div>
          </div>
      );
  };

  const renderCalBox = (regionKey: keyof CalibrationData, label: string) => {
      const r = config[regionKey];
      const isActive = activeRegion === regionKey;
      return (
          <div 
             className={`absolute border-2 flex items-center justify-center cursor-move z-50 group ${isActive ? 'border-green-500 bg-green-500/20' : 'border-red-500/50 hover:border-red-400 bg-red-500/10'}`}
             style={{
                 top: `${r.y}%`, left: `${r.x}%`, width: `${r.w}%`, height: `${r.h}%`,
                 transform: 'translate(-50%, -50%)'
             }}
             onMouseDown={(e) => { e.stopPropagation(); setActiveRegion(regionKey); }}
             onTouchStart={(e) => { e.stopPropagation(); setActiveRegion(regionKey); }}
          >
              <div className="absolute -top-6 text-[9px] bg-black/80 text-white px-1 rounded whitespace-nowrap pointer-events-none">
                  {label} {Math.round(r.w)}x{Math.round(r.h)}
              </div>
              <Move className={`w-3 h-3 text-white opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`} />
          </div>
      );
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0f1e] select-none">
        
        {/* --- 核心层: Live2D 模拟 --- */}
        <div 
            ref={layerRef}
            className="relative w-full h-full will-change-transform origin-center"
            style={{ transformStyle: 'preserve-3d' }} 
        >
            {/* 1. 底图 */}
            <img 
                src={imageUrl} 
                className="w-full h-full object-cover object-top pointer-events-none" 
                onError={() => setHasError(true)}
            />

            {/* 2. 动态眼睑 */}
            {renderEyeLids(config.leftEye, 'left')}
            {renderEyeLids(config.rightEye, 'right')}

            {/* 3. 动态嘴部 (Ref Driven Physics) */}
            <div 
                ref={mouthRef}
                className="absolute pointer-events-none mix-blend-multiply will-change-transform"
                style={{
                    top: `${config.mouth.y}%`, left: `${config.mouth.x}%`, 
                    width: `${config.mouth.w}%`, height: `${config.mouth.h}%`,
                    // Initial State, driven by loop
                    transform: 'translate(-50%, -50%) scale(1, 0.2)',
                    zIndex: 11,
                    opacity: 0,
                }}
            >
                {/* 口腔阴影 */}
                <div className={`w-full h-full bg-[#8a4a3a] rounded-[40%] blur-[3px]`}></div>
                {/* 牙齿/高光微动 */}
                <div className={`absolute top-1/3 left-1/4 w-[50%] h-[20%] bg-white/20 blur-[2px] rounded-full`}></div>
            </div>
        </div>

        {/* --- 后期特效层 (Post-Processing) --- */}
        
        {/* A. 电影暗角 (带呼吸) */}
        <div className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply animate-pulse"
             style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.9) 100%)', animationDuration: '4s' }}
        ></div>

        {/* B. 极细微色差 (Chromatic Aberration) - 模拟边缘 RGB 分离 */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-30 mix-blend-screen"
             style={{ 
                 boxShadow: 'inset 2px 0 2px rgba(255,0,0,0.1), inset -2px 0 2px rgba(0,255,255,0.1)',
             }}
        ></div>

        {/* C. 胶片噪点 (Film Grain) - 降低强度 */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-20 mix-blend-overlay"
             style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                 backgroundSize: '150px 150px'
             }}
        ></div>

        {/* D. 流光 (Specular Sheen) */}
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            <div className="absolute top-0 bottom-0 w-[30%] bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-25 animate-sheen blur-2xl"></div>
        </div>


        {/* --- 校准模式 UI Overlay --- */}
        {isCalibrating && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[1px]">
                {renderCalBox('leftEye', 'L.Eye')}
                {renderCalBox('rightEye', 'R.Eye')}
                {renderCalBox('mouth', 'Mouth')}
                
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 border border-slate-600 rounded-xl p-4 text-white text-xs flex flex-col items-center gap-3 shadow-2xl">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-widest">
                        <Settings className="w-4 h-4" /> Calibration Mode
                    </div>
                    <p className="text-slate-400 text-[10px]">Drag to move • Scroll to resize (Shift+Scroll for Height)</p>
                    <div className="flex gap-2 w-full">
                        <button onClick={resetConfig} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded flex items-center justify-center gap-1">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                        <button onClick={saveConfig} className="flex-1 bg-green-700 hover:bg-green-600 py-2 rounded flex items-center justify-center gap-1 font-bold">
                            <Save className="w-3 h-3" /> Save
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- HUD 状态层 (Corner UI) --- */}
        <div className="absolute top-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
            {/* Calibration Button */}
            <button 
                onClick={() => setIsCalibrating(!isCalibrating)}
                className={`text-[9px] font-bold px-2 py-1 rounded border backdrop-blur-md flex items-center gap-1 transition-all ${isCalibrating ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-black/30 text-slate-500 border-slate-700 hover:text-white'}`}
            >
                <MousePointer2 className="w-3 h-3" /> CAL
            </button>

            {/* 语言指示 */}
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg shadow-xl pointer-events-none">
                <div className={`w-1.5 h-1.5 rounded-full ${isVoiceOffline ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                <span className={`text-[9px] font-bold ${lang === 'en' ? 'text-white' : 'text-slate-500'}`}>EN</span>
                <span className={`text-[9px] font-bold ${lang === 'zh' ? 'text-cyan-400' : 'text-slate-500'}`}>ZH</span>
            </div>

            {/* 状态指示 */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 pointer-events-none ${isSpeaking ? 'bg-amber-950/80 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105' : 'bg-slate-900/60 border-slate-700 text-slate-500'}`}>
                {isSpeaking ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Wifi className="w-3.5 h-3.5" />}
                <span className="text-[9px] font-bold font-mono tracking-widest">
                    {isSpeaking ? 'VOICE_TX' : (isVoiceOffline ? 'OFFLINE' : 'ONLINE')}
                </span>
            </div>
            
            {/* 离线警告 */}
            {isVoiceOffline && (
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-red-950/90 border border-red-500/50 rounded text-red-400 animate-in slide-in-from-right-4 shadow-lg pointer-events-none">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider">FALLBACK_MODE</span>
                 </div>
            )}
        </div>

        {/* --- CSS Keyframes (Scoped) --- */}
        <style>{`
            @keyframes sheen {
                0% { left: -100%; opacity: 0; }
                10% { opacity: 1; }
                20% { left: 200%; opacity: 0; }
                100% { left: 200%; opacity: 0; }
            }
            .animate-sheen {
                animation: sheen 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
        `}</style>
    </div>
  );
};

export default ElenaLivePortrait;
