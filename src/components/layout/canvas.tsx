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
    <group ref={groupRef}>
      {/* Minimal lighting as specified in the plan */}
      <ambientLight intensity={0.4} />
      {/* Using the correct JSX properties for hemisphere light */}
      <hemisphereLight args={["#b0c4de", "#2c3e50", 0.3]} />

      {/* Ground plane - placeholder for Tokyo diorama */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} /> {/* Reduced size for better focus */}
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Placeholder Tokyo building - simple geometric representation */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#3498db" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Additional simple building to represent Tokyo cityscape */}
      <mesh position={[-2, 0.5, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[1.5, 1.5, 1.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 3, 16]} />
        <meshStandardMaterial color="#9b59b6" roughness={0.7} metalness={0.3} />
      </mesh>
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
        camera={{ position: [8, 8, 8], fov: 25 }} // Closer camera for better fill
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#e0e0e0']} />
        <Suspense fallback={<SceneLoader />}>
          <TokyoScene />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </R3FCanvas>
    </div>
  );
}
