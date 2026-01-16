// @ts-nocheck
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Cylinder, Box, Torus, Sparkles, Float, MeshDistortMaterial, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Wifi, Activity } from 'lucide-react';

interface ElenaAvatar3DProps {
  isSpeaking: boolean;
  lang: 'zh' | 'en';
  fallbackImageUrl?: string;
  className?: string;
}

const Eye: React.FC<{ position: [number, number, number], isBlinking: boolean }> = ({ position, isBlinking }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (mesh.current) {
       const targetScaleY = isBlinking ? 0.1 : 1.2; 
       mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScaleY, 0.4);
    }
  });

  return (
    <mesh ref={mesh} position={position} rotation={[0, 0, Math.PI / 2]}>
       <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
       <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} toneMapped={false} />
    </mesh>
  );
};

const Mouth: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
        const t = state.clock.elapsedTime;
        const targetScaleY = isSpeaking ? 0.5 + Math.abs(Math.sin(t * 15)) * 1.5 : 0.2;
        const targetScaleX = isSpeaking ? 1.0 : 0.6;
        
        mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScaleY, 0.2);
        mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScaleX, 0.2);
    }
  });

  return (
    <mesh ref={mesh} position={[0, -0.5, 0.85]}>
        <boxGeometry args={[0.5, 0.15, 0.1]} />
        <meshStandardMaterial color={isSpeaking ? "#ffaa00" : "#00ffff"} emissive={isSpeaking ? "#ffaa00" : "#00ffff"} emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
  );
};

const HeadGroup: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => {
  const group = useRef<THREE.Group>(null);
  const { viewport, mouse } = useThree();
  
  const [isBlinking, setBlinking] = useState(false);
  useEffect(() => {
    const blinkLoop = () => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
        const nextBlink = Math.random() * 3000 + 2000;
        setTimeout(blinkLoop, nextBlink);
    };
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state) => {
    if (group.current) {
        const t = state.clock.elapsedTime;
        const targetRotX = -mouse.y * 0.3; 
        const targetRotY = mouse.x * 0.4;  
        
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.1);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.1);
        group.current.position.y = Math.sin(t * 1.5) * 0.05;
        
        if (isSpeaking) {
            group.current.position.y += Math.sin(t * 12) * 0.02;
            group.current.rotation.x += Math.sin(t * 10) * 0.02;
        }
    }
  });

  return (
    <group ref={group}>
        <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial 
                color="#1a1a1a"
                roughness={0.3}
                metalness={0.9}
                envMapIntensity={1}
            />
        </mesh>
        <mesh position={[0, 0, 0]} scale={[1.02, 1.02, 1.02]}>
            <icosahedronGeometry args={[1, 2]} />
            <meshBasicMaterial color="#D4AF37" wireframe transparent opacity={0.15} />
        </mesh>
        <mesh position={[0, 0, 0.2]} scale={[0.8, 0.8, 0.9]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial 
                color="#000000"
                roughness={0}
                metalness={0.5}
                transmission={0.5}
                transparent
                opacity={0.8}
            />
        </mesh>
        <Eye position={[-0.35, 0.15, 0.85]} isBlinking={isBlinking} />
        <Eye position={[0.35, 0.15, 0.85]} isBlinking={isBlinking} />
        <Mouth isSpeaking={isSpeaking} />
        <mesh position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        <group rotation={[Math.PI / 2, 0, 0]}>
            <Torus args={[1.4, 0.02, 16, 100]}>
                 <meshBasicMaterial color="#D4AF37" transparent opacity={0.3} />
            </Torus>
             <Torus args={[1.8, 0.01, 16, 100]} rotation={[0.2, 0, 0]}>
                 <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
            </Torus>
        </group>
    </group>
  );
};

const SceneLighting: React.FC = () => {
    return (
        <>
            <ambientLight intensity={0.5} color="#ffffff" />
            <directionalLight position={[-5, 5, 5]} intensity={2} color="#D4AF37" />
            <pointLight position={[5, 0, 5]} intensity={2} color="#00ffff" distance={10} />
            <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} />
        </>
    );
};

const ElenaAvatar3D: React.FC<ElenaAvatar3DProps> = ({ 
  isSpeaking, 
  lang, 
  fallbackImageUrl, 
  className = ''
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 ${className}`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         {fallbackImageUrl && (
             <img src={fallbackImageUrl} className="w-full h-full object-cover blur-sm" alt="Elena Aura" />
         )}
         <div className="absolute inset-0 bg-black/60"></div>
      </div>
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
             <SceneLighting />
             <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                 <HeadGroup isSpeaking={isSpeaking} />
             </Float>
             <Sparkles count={40} scale={5} size={3} speed={0.4} opacity={0.5} color="#D4AF37" />
        </Canvas>
      </div>
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-2 pointer-events-none">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${isSpeaking ? 'bg-amber-950/80 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-900/60 border-slate-700 text-slate-500'}`}>
               {isSpeaking ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Wifi className="w-3.5 h-3.5" />}
               <span className="text-[10px] font-bold font-mono tracking-widest">
                   {isSpeaking ? 'VOICE_ACTIVE' : 'IDLE_MODE'}
               </span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 border border-white/5 px-2 py-1 rounded">
              <span className={`text-[9px] font-bold ${lang === 'en' ? 'text-white' : 'text-slate-600'}`}>EN</span>
              <div className="w-[1px] h-2 bg-white/20"></div>
              <span className={`text-[9px] font-bold ${lang === 'zh' ? 'text-white' : 'text-slate-600'}`}>ZH</span>
          </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
           <div className="text-[9px] text-cyan-500 font-mono tracking-[0.4em] mb-1 animate-pulse">SYSTEM ONLINE</div>
           <h2 className="text-xl font-['Cinzel'] font-bold text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">ELENA</h2>
      </div>
      <div className="absolute inset-0 z-30 pointer-events-none bg-[url('https://transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
    </div>
  );
};

export default ElenaAvatar3D;