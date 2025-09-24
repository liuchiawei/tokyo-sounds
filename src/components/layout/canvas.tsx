"use client";

import { Canvas as R3FCanvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import TokyoParticles from "./tokyo-particles";

// Tokyo-themed scene component with recognizable landmarks
const TokyoScene = () => {
  const groupRef = useRef<any>(null);

  // Add subtle animation if needed for demand-based rendering
  useFrame(() => {
    // This can be used for animations that trigger invalidate()
  });

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={1.1}>
      {/* Improved lighting for Tokyo atmosphere */}
      <ambientLight intensity={0.4} color="#f0f0f0" />
      <hemisphereLight args={["#aaccff", "#334455", 0.5]} />
      
      {/* Directional light for more defined shadows - simulating Tokyo's varied lighting */}
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={0.7} 
        color="#fefee8" // Warm Tokyo daylight tone
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Tokyo Skytree - recognizable landmark */}
      <group position={[2.2, 0, -2.2]}>
        {/* Skytree base structure */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.25, 5, 3]} /> {/* Three legs structure */}
          <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Skytree body */}
        <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.18, 3, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Skytree top */}
        <mesh position={[0, 6.2, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.15, 0.4, 16]} />
          <meshStandardMaterial color="#08aeea" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      
      {/* Tokyo Tower - iconic landmark */}
      <group position={[-2.2, 0, 2.2]}>
        {/* Tower base */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.3, 1.6, 4]} />
          <meshStandardMaterial color="#f8d568" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Tower body */}
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.15, 4, 4]} />
          <meshStandardMaterial color="#e53a40" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Tower observation decks */}
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0.3} />
        </mesh>
      </group>
      
      {/* Tokyo Station style building */}
      <group position={[0, 0, -2.5]}>
        {/* Main building */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.6, 1.0]} />
          <meshStandardMaterial color="#c78d5d" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Central dome */}
        <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.7, 0.8, 16]} />
          <meshStandardMaterial color="#c78d5d" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Clock tower */}
        <mesh position={[0, 2.6, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color="#a36b38" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Clock face */}
        <mesh position={[0, 2.7, 0.46]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.1} />
        </mesh>
      </group>
      
      {/* Shibuya Crossing style intersection */}
      <group position={[-2.0, -0.48, -0.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial color="#333333" roughness={0.9} metalness={0.1} />
        </mesh>
        {/* Crosswalk lines */}
        <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 0.1]} />
          <meshStandardMaterial color="#fefefe" roughness={0.9} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[1.4, 0.1]} />
          <meshStandardMaterial color="#fefefe" roughness={0.9} metalness={0.1} />
        </mesh>
      </group>
      
      {/* Traditional temple (Senso-ji style) */}
      <group position={[2.0, 0, 0.8]}>
        {/* Main structure */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 1.6, 0.8]} />
          <meshStandardMaterial color="#c19a6b" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.1, 1.2]} />
          <meshStandardMaterial color="#d32f2f" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Torii gate */}
        <group position={[0, 0.3, 0.6]}>
          {/* Vertical posts */}
          <mesh position={[-0.4, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#d32f2f" roughness={0.7} metalness={0.3} />
          </mesh>
          <mesh position={[0.4, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#d32f2f" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Horizontal bar */}
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.15, 0.1]} />
            <meshStandardMaterial color="#d32f2f" roughness={0.7} metalness={0.3} />
          </mesh>
        </group>
      </group>
      
      {/* Modern commercial building */}
      <group position={[0.8, 0, 1.8]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 3.0, 1.0]} />
          <meshStandardMaterial color="#b0c4de" roughness={0.2} metalness={0.8} 
                                transparent opacity={0.7} /> {/* Glass effect */}
        </mesh>
        {/* Neon sign effect - simplified */}
        <mesh position={[0, 2.5, 0.51]}>
          <planeGeometry args={[1.0, 0.3]} />
          <meshStandardMaterial color="#ff2a6d" emissive="#ff2a6d" emissiveIntensity={2} 
                                transparent opacity={0.8} /> {/* Neon effect */}
        </mesh>
      </group>
      
      {/* Ground plane - Tokyo street */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#696969" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Tokyo atmosphere elements */}
      <fog attach="fog" args={['#c0c0c0', 8, 18]} />
    </group>
  );
};

// Loading fallback component
const SceneLoader = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="hotpink" />
  </mesh>
);

export default function Canvas() {
  return (
    <div 
      className="w-full bg-gray-100" 
      style={{ minHeight: '480px', height: '70vh', display: 'flex' }}
    >
      <R3FCanvas 
        shadows
        frameloop="demand" // As specified in Phase 1
        linear // As specified in Phase 1
        flat // As specified in Phase 1
        dpr={[1, 1]} // As specified in Phase 1
        camera={{ position: [7, 7, 7], fov: 45, near: 0.1, far: 50 }} // Optimized for better scene fill
        style={{ width: '100%', height: '100%' }}
      >
        {/* Tokyo sky background - more atmospheric */}
        <color attach="background" args={['#87CEEB']} />
        <fogExp2 attach="fog" args={['#87CEEB', 0.025]} />
        <Suspense fallback={<SceneLoader />}>
          <TokyoScene />
          <TokyoParticles />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </R3FCanvas>
    </div>
  );
}
