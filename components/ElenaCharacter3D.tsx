
import React from 'react';
import { Wifi, Activity, Cpu } from 'lucide-react';

interface ElenaCharacter3DProps {
  isSpeaking: boolean;
  lang: 'zh' | 'en';
  emotion?: 'neutral' | 'tease' | 'happy' | 'serious';
  fallbackImageUrl?: string;
  className?: string;
}

const ElenaCharacter3D: React.FC<ElenaCharacter3DProps> = ({ 
  isSpeaking, 
  lang, 
  emotion = 'neutral', 
  // Use a stable, high-quality Unsplash portrait instead of unreliable AI gen
  fallbackImageUrl = 'https://images.unsplash.com/photo-1615751072497-5f5169febeca?q=80&w=800&auto=format&fit=crop',
  className = ''
}) => {
  
  // 基础 2D 图片作为 Fallback，叠加 CSS 动画模拟 3D 呼吸感
  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 ${className}`}>
      
      {/* 1. 全局 CSS 动画定义 (Scoped) */}
      <style>{`
        @keyframes elena-float {
          0%, 100% { transform: translateY(0) scale(1.0); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes elena-breathe {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.1); }
        }
        @keyframes elena-talk {
          0%, 100% { transform: scale(1); filter: brightness(1.2); }
          50% { transform: scale(1.03); filter: brightness(1.4) drop-shadow(0 0 15px rgba(212,175,55,0.6)); }
        }
        @keyframes holo-scan {
          0% { top: -10%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes hud-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sound-wave {
          0% { height: 10%; }
          50% { height: 100%; }
          100% { height: 10%; }
        }
        @keyframes voice-ripple {
          0% { width: 100px; height: 100px; border-width: 4px; opacity: 0.8; }
          100% { width: 300px; height: 300px; border-width: 0px; opacity: 0; }
        }
        
        .elena-container {
           animation: elena-float 6s ease-in-out infinite;
           transform-origin: center bottom;
        }
        .elena-speaking {
           animation: elena-talk 0.3s ease-in-out infinite alternate;
        }
        .scan-line {
           background: linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.5), transparent);
           height: 20px;
           width: 100%;
           position: absolute;
           z-index: 20;
           animation: holo-scan 3s linear infinite;
           pointer-events: none;
        }
        .ripple {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid rgba(212, 175, 55, 0.6);
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
          pointer-events: none;
          z-index: 5;
        }
      `}</style>

      {/* 2. 背景全息特效层 */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-[150%] h-[150%] border-[1px] border-cyan-500/20 rounded-full animate-[hud-spin_20s_linear_infinite]"></div>
        <div className="absolute w-[120%] h-[120%] border-[1px] border-dashed border-[#D4AF37]/20 rounded-full animate-[hud-spin_30s_linear_infinite_reverse]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.1)_0%,_transparent_70%)]"></div>
      </div>

      {/* 3. 角色层 */}
      <div className={`relative z-10 w-full h-full flex items-end justify-center pb-0 transition-all duration-300`}>
         <div className={`elena-container relative w-full h-full max-w-lg ${isSpeaking ? 'elena-speaking' : ''}`}>
            
            {/* Visual Indicator: Expanding Ripples behind head */}
            {isSpeaking && (
              <>
                <div className="ripple" style={{ animation: 'voice-ripple 2s infinite linear' }}></div>
                <div className="ripple" style={{ animation: 'voice-ripple 2s infinite linear', animationDelay: '0.6s' }}></div>
                <div className="ripple" style={{ animation: 'voice-ripple 2s infinite linear', animationDelay: '1.2s' }}></div>
              </>
            )}

            {/* 主图 */}
            <img 
              src={fallbackImageUrl} 
              alt="Elena" 
              className="w-full h-full object-cover object-top mask-image-gradient relative z-10"
              style={{ 
                  maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
              }}
            />
            
            {/* 说话时的口部/面部光效增强 (简单模拟) */}
            {isSpeaking && (
               <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full mix-blend-overlay pointer-events-none z-20 animate-pulse"></div>
            )}
         </div>
      </div>

      {/* 4. 前景 HUD 扫描线 */}
      <div className="scan-line"></div>

      {/* 5. 状态 UI 面板 */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
         {/* 语言徽章 */}
         <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg shadow-lg transition-all duration-300">
            <span className={`text-[10px] font-black tracking-widest ${lang === 'en' ? 'text-white' : 'text-slate-500'}`}>EN</span>
            <div className="w-[1px] h-3 bg-white/20"></div>
            <span className={`text-[10px] font-black tracking-widest ${lang === 'zh' ? 'text-[#D4AF37]' : 'text-slate-500'}`}>ZH</span>
         </div>

         {/* 状态指示器 */}
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all ${isSpeaking ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' : 'bg-slate-900/60 border-slate-700 text-slate-400'}`}>
            {isSpeaking ? <Activity className="w-3 h-3 animate-pulse" /> : <Wifi className="w-3 h-3" />}
            <span className="text-[9px] font-bold font-mono tracking-widest">
               {isSpeaking ? 'VOICE_TRANSMITTING' : 'SYSTEM_IDLE'}
            </span>
         </div>
         
         {/* 说话时的音频波形模拟 */}
         {isSpeaking && (
             <div className="flex items-end gap-0.5 h-8 p-1 bg-black/40 rounded border border-emerald-500/30">
                 {[...Array(8)].map((_, i) => (
                     <div 
                        key={i} 
                        className="w-1 bg-emerald-400/80 rounded-t-sm"
                        style={{ 
                            height: '100%', 
                            animation: `sound-wave ${0.2 + Math.random() * 0.3}s ease-in-out infinite alternate` 
                        }}
                     ></div>
                 ))}
             </div>
         )}
      </div>

      {/* 6. 底部装饰文字 */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-50">
          <div className="flex items-center gap-2 text-[#D4AF37]/60 text-[8px] font-mono tracking-[0.2em]">
              <Cpu className="w-3 h-3" />
              <span>ELENA_AI_MODEL_V4.2</span>
          </div>
      </div>

    </div>
  );
};

export default ElenaCharacter3D;
