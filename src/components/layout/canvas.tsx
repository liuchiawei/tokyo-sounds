"use client";

import { Canvas as R3FCanvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";

// Tokyo-themed scene component for Phase 1
const TokyoScene = () => {
  const groupRef = useRef<any>(null);

  // Add subtle animation if needed for demand-based rendering
  useFrame(() => {
    // This can be used for animations that trigger invalidate()
  });

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={1.1}>
      {/* Minimal lighting as specified in the plan */}
      <ambientLight intensity={0.5} />
      {/* Using the correct JSX properties for hemisphere light */}
      <hemisphereLight args={["#b0c4de", "#2c3e50", 0.4]} />
      
      {/* Directional light for more defined shadows */}
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ground plane - placeholder for Tokyo diorama */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, 6]} /> {/* Further reduced size for better focus */}
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Central Tokyo building - simple geometric representation */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2, 1.6]} />
        <meshStandardMaterial color="#3498db" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Additional simple building to represent Tokyo cityscape */}
      <mesh position={[-1.5, 0.5, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[1.2, 1.4, 1.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 2.8, 16]} />
        <meshStandardMaterial color="#9b59b6" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Additional buildings to create city feel */}
      <mesh position={[-1.0, 0.7, 1.3]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.4, 0.7]} />
        <meshStandardMaterial color="#2ecc71" roughness={0.7} metalness={0.3} />
      </mesh>
      
      <mesh position={[1.4, 0.5, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#f1c40f" roughness={0.7} metalness={0.3} />
      </mesh>
      
      <mesh position={[-1.3, 1.0, 0.7]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 2.0, 0.6]} />
        <meshStandardMaterial color="#1abc9c" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Tokyo atmosphere elements - subtle fog effect */}
      <fog attach="fog" args={['#e0e0e0', 10, 20]} />
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
        camera={{ position: [6, 6, 6], fov: 40, near: 0.1, far: 50 }} // Optimized for better scene fill
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#e0e0e0']} />
        <Suspense fallback={<SceneLoader />}>
          <TokyoScene />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2.5}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </R3FCanvas>
    </div>
  );
}
