"use client";

import { Canvas as R3FCanvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import TokyoParticles from "./tokyo-particles";

// GLBモデルを読み込むコンポーネント
const GLBModel = () => {
  const { scene } = useGLTF('/3dtest.glb');
  const groupRef = useRef<THREE.Group>(null);

  // Add subtle animation if needed for demand-based rendering
  useFrame(() => {
    // This can be used for animations that trigger invalidate()
  });

  // モデルのバウンディングボックスを計算して中央に配置
  useEffect(() => {
    if (scene && groupRef.current) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      console.log('Model bounding box center:', center);
      console.log('Model bounding box size:', size);
      
      // モデルを中央に配置
      scene.position.sub(center);
      
      // モデルが適切なサイズになるようにスケール調整
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 5; // 目標サイズ
      const scale = targetSize / maxDimension;
      scene.scale.setScalar(scale);
      
      console.log('Applied scale:', scale);
    }
  }, [scene]);

  // デバッグ用：モデルの読み込み状況を確認
  console.log('GLB Model loaded:', scene);
  console.log('Model children:', scene.children);
  console.log('Model position:', scene.position);
  console.log('Model scale:', scene.scale);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// ライティングと環境設定のコンポーネント
const SceneEnvironment = () => {
  return (
    <>
      {/* Improved lighting for better model visibility */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <hemisphereLight args={["#aaccff", "#334455", 0.5]} />
      
      {/* Directional light for more defined shadows */}
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={1.5} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Ground plane for shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
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
        camera={{ position: [5, 5, 5], fov: 50, near: 0.1, far: 100 }} // モデルが見やすい位置に調整
        style={{ width: '100%', height: '100%' }}
      >
        {/* Neutral background for better model visibility */}
        <color attach="background" args={['#eeeeee']} />
        <fogExp2 attach="fog" args={['#eeeeee', 0.01]} />
        <Suspense fallback={<SceneLoader />}>
          <SceneEnvironment />
          <GLBModel />
          <TokyoParticles />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </R3FCanvas>
    </div>
  );
}
