// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Torus, Sparkles, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Character3DProps {
  isSpeaking: boolean;
  emotion?: 'neutral' | 'tease' | 'happy' | 'serious';
  onReady?: () => void;
}

/**
 * ElenaAvatar: 一个赛博朋克风格的抽象数字生命体
 */
const ElenaAvatar: React.FC<{ isSpeaking: boolean; emotion: string }> = ({ isSpeaking, emotion }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const glassesRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1) * 0.1 - 0.5;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }

    if (headRef.current) {
        if (isSpeaking) {
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, Math.sin(t * 15) * 0.1, 0.1);
        } else {
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.05);
        }
    }

    if (mouthRef.current) {
      const targetScaleY = isSpeaking ? 0.5 + Math.abs(Math.sin(t * 20)) * 2 : 0.1;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetScaleY, 0.2);
      mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, isSpeaking ? 1.2 : 1, 0.1);
    }

    if (ringsRef.current) {
        ringsRef.current.rotation.z = -t * 0.2;
        ringsRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    }
  });

  const goldColor = new THREE.Color("#D4AF37");
  const glowColor = new THREE.Color("#FFD700");
  const cyberBlack = new THREE.Color("#020617");

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={headRef} position={[0, 1.2, 0]}>
          <icosahedronGeometry args={[0.8, 1]} />
          <MeshDistortMaterial 
             color={goldColor} 
             envMapIntensity={1} 
             metalness={0.9} 
             roughness={0.2} 
             distort={0.3} 
             speed={1.5}
          />
          <mesh ref={mouthRef} position={[0, -0.4, 0.6]} rotation={[0,0,0]}>
             <boxGeometry args={[0.3, 0.1, 0.1]} />
             <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={isSpeaking ? 2 : 0} />
          </mesh>
          <group ref={glassesRef} position={[0, 0.1, 0.7]}>
             <mesh>
                <boxGeometry args={[1.2, 0.3, 0.1]} />
                <meshPhysicalMaterial 
                    color="black" 
                    transparent 
                    opacity={0.8} 
                    roughness={0} 
                    metalness={0.8} 
                    clearcoat={1}
                />
             </mesh>
             <mesh position={[0, 0, 0.06]}>
                 <boxGeometry args={[0.1, 0.05, 0.01]} />
                 <meshBasicMaterial color="cyan" />
             </mesh>
          </group>
        </mesh>
        <Cylinder args={[0.3, 0.5, 1, 32]} position={[0, 0.2, 0]}>
           <meshStandardMaterial color={cyberBlack} metalness={0.8} roughness={0.2} />
        </Cylinder>
        <mesh position={[0, -1, 0]}>
             <cylinderGeometry args={[0.1, 1.5, 2, 6]} />
             <meshStandardMaterial color={cyberBlack} metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.5, 0.8]} rotation={[0,0,0.1]}>
             <boxGeometry args={[0.1, 1, 0.05]} />
             <meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.5, -0.8]} rotation={[0,0,-0.1]}>
             <boxGeometry args={[0.1, 1, 0.05]} />
             <meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={0.5} />
        </mesh>
        <group ref={ringsRef} position={[0, 1.2, 0]}>
            <Torus args={[1.4, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="cyan" transparent opacity={0.3} />
            </Torus>
            <Torus args={[1.6, 0.01, 16, 100]} rotation={[Math.PI / 2.2, 0, 0]}>
                <meshBasicMaterial color={goldColor} transparent opacity={0.2} />
            </Torus>
        </group>
      </Float>
      <Sparkles count={50} scale={6} size={2} speed={0.4} opacity={0.5} color={goldColor} />
    </group>
  );
};

const Character3D: React.FC<Character3DProps> = (props) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
        <spotLight position={[-5, 5, 5]} intensity={0.8} color="cyan" angle={0.5} penumbra={1} />
        <directionalLight position={[0, 5, 5]} intensity={1.5} />
        <ElenaAvatar {...props} emotion={props.emotion || 'neutral'} />
      </Canvas>
    </div>
  );
};

export default Character3D;