
import React, { useRef, useEffect, useState } from 'react';
import { Wifi, Activity } from 'lucide-react';

interface ElenaLiveAvatarProps {
  isSpeaking: boolean;
  lang: 'zh' | 'en';
  fallbackImageUrl?: string;
}

const ElenaLiveAvatar: React.FC<ElenaLiveAvatarProps> = ({ 
  isSpeaking, 
  lang, 
  fallbackImageUrl 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for interactivity
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Handle Parallax Input
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let clientX, clientY;
      
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      // Calculate normalized position (-1 to 1)
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;
      
      setMousePos({ 
        x: Math.max(-1, Math.min(1, x)), 
        y: Math.max(-1, Math.min(1, y)) 
      });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  // Animation Loop (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let blinkState = 0; // 0: open, 1: closing, 2: closed, 3: opening
    let blinkTimer = 0;
    let nextBlinkTime = Math.random() * 200 + 100; // Random blink interval
    let time = 0;
    
    // Config
    const primaryColor = '#D4AF37'; // Gold
    const glowColor = '#06b6d4'; // Cyan
    
    const render = () => {
      time++;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // --- 1. Parallax Offset Calculation ---
      // Smooth interpolation for mouse follow
      const targetX = mousePos.x * 15;
      const targetY = mousePos.y * 10;
      
      // Basic breathing (Sine wave)
      const breathY = Math.sin(time * 0.05) * 5;
      
      // Speaking head bob
      const speakBob = isSpeaking ? Math.sin(time * 0.5) * 3 : 0;

      const centerX = width / 2 + targetX;
      const centerY = height / 2 + targetY + breathY + speakBob;
      const scale = isSpeaking ? 1.02 + Math.sin(time * 0.2) * 0.01 : 1;

      // --- 2. Draw "Digital Soul" Avatar (Geometric Style) ---
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);

      // A. Halo / Interface Ring (Behind)
      ctx.beginPath();
      ctx.arc(0, 0, 140, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 + Math.sin(time * 0.02) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 20]);
      ctx.rotate(time * 0.005);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.rotate(-time * 0.005); // Reset rotation

      // B. Head Shape (Cyber Skull)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Dark slate background
      ctx.beginPath();
      ctx.ellipse(0, 0, 90, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wireframe overlay
      ctx.strokeStyle = `rgba(212, 175, 55, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // C. Eyes Logic (Blinking)
      blinkTimer++;
      let eyeOpenness = 1.0;
      
      if (blinkState === 0 && blinkTimer > nextBlinkTime) {
          blinkState = 1; // Start closing
      } else if (blinkState === 1) {
          eyeOpenness -= 0.15;
          if (eyeOpenness <= 0.1) { eyeOpenness = 0.1; blinkState = 2; }
      } else if (blinkState === 2) {
          eyeOpenness = 0.1;
          blinkState = 3; // Start opening immediately
      } else if (blinkState === 3) {
          eyeOpenness += 0.15;
          if (eyeOpenness >= 1.0) { 
              eyeOpenness = 1.0; 
              blinkState = 0; 
              blinkTimer = 0;
              nextBlinkTime = Math.random() * 200 + 100; // Reset timer
          }
      }

      // Draw Eyes
      const eyeY = -15;
      const eyeXOffset = 35;
      const eyeW = 25;
      const eyeH = 18 * eyeOpenness; // Animated height

      // Left Eye
      ctx.shadowBlur = 15;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.ellipse(-eyeXOffset, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(eyeXOffset, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // D. Mouth Logic (Speaking)
      let mouthH = 2;
      let mouthW = 20;
      if (isSpeaking) {
          // Rapid movement for speech
          mouthH = 5 + Math.abs(Math.sin(time * 0.5)) * 15;
          mouthW = 25 + Math.sin(time * 0.2) * 5;
      }

      const mouthY = 50;
      
      ctx.fillStyle = primaryColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = primaryColor;
      ctx.beginPath();
      // Draw a digital waveform style mouth
      if (isSpeaking) {
           // Draw multiple bars
           const bars = 5;
           const spacing = 6;
           const startX = -(bars * spacing) / 2;
           for(let i=0; i<bars; i++) {
               const h = mouthH * (Math.random() * 0.5 + 0.5);
               ctx.fillRect(startX + i * spacing, mouthY - h/2, 4, h);
           }
      } else {
           // Idle mouth line
           ctx.fillRect(-10, mouthY, 20, 2);
      }
      ctx.shadowBlur = 0;

      ctx.restore();
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, mousePos]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
        
        {/* Layer 1: Fallback Image (Background - heavily blurred for atmosphere) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
            {fallbackImageUrl && <img src={fallbackImageUrl} className="w-full h-full object-cover blur-md scale-110" alt="Atmosphere" />}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
        </div>

        {/* Layer 2: Live Canvas Avatar */}
        <canvas 
            ref={canvasRef} 
            width={400} 
            height={400} 
            className="relative z-10 w-full max-w-[400px] h-auto object-contain drop-shadow-2xl"
        />

        {/* Layer 3: HUD Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 ${isSpeaking ? 'bg-amber-950/80 border-amber-500 text-amber-400' : 'bg-slate-900/60 border-slate-700 text-slate-500'}`}>
                {isSpeaking ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Wifi className="w-3.5 h-3.5" />}
                <span className="text-[9px] font-bold font-mono tracking-widest">
                    {isSpeaking ? 'VOICE_TX' : 'ONLINE'}
                </span>
            </div>
             <div className="flex items-center gap-1 bg-black/60 backdrop-blur border border-white/5 px-2 py-1 rounded">
                <span className={`text-[9px] font-bold ${lang === 'en' ? 'text-white' : 'text-slate-600'}`}>EN</span>
                <div className="w-[1px] h-2 bg-white/20"></div>
                <span className={`text-[9px] font-bold ${lang === 'zh' ? 'text-cyan-400' : 'text-slate-600'}`}>ZH</span>
            </div>
        </div>

        {/* Layer 4: Scanlines */}
        <div className="absolute inset-0 z-30 pointer-events-none opacity-20 bg-[url('https://transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
    </div>
  );
};

export default ElenaLiveAvatar;
