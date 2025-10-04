/*
3Dモデルラッパー: 3D Model Wrapper
GLBモデルのロード状態を管理し、サスペンド境界を提供するコンポーネント - 
Component that manages GLB model loading state and provides suspense boundaries

ローディング表示とエラー処理を実装 - Implements loading display and error handling
*/

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Stage } from "@react-three/drei";
import { Suspense } from "react";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";
import { Model } from "./Model"; // GLBモデルコンポーネントをインポート - Import GLB model component
import { ErrorBoundary } from "react-error-boundary"; // エラーバウンダリー - Error boundary

// ローディング表示 - Loading display component
const Loader = () => (
  <mesh>
    {/* 単純なローディング表示 - Simple loading indicator */}
    <boxGeometry args={[0.1, 0.1, 0.1]} />
    <meshStandardMaterial color="white" transparent opacity={0.01} />
  </mesh>
);

// エラー表示 - Error display component
const ErrorDisplay = ({ error }: { error: Error }) => (
  <group>
    <mesh>
      <boxGeometry args={[0.01, 0.01, 0.01]} />
      <meshStandardMaterial color="red" transparent opacity={0.01} />
    </mesh>
  </group>
);

// 軽量な3Dモデルラッパー - Lightweight 3D model wrapper component
export const ModelWrapper: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorDisplay}>
      <Suspense fallback={<Loader />}>
        <Model />
      </Suspense>
    </ErrorBoundary>
  );
};

// モデルとエフェクトを含むコンポーネント - Component with model and effects
export const ModelWithEffects: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      {/* Stage component centers and scales the model, adds shadows and lighting - Use small margin for tighter zoom */}
      <Stage
        environment={null}
        intensity={1}
        castShadow={true}
        shadows="contact"
        bias={-0.0015}
        normalBias={-0.0015}
        size={10}
        adjustCamera={1} // 小さなマージンでズームイン - Small margin for zoomed-in view
        offset={0.0015}
        normalOffset={0.0015}
        normalScale={1}
      >
        <ModelWrapper />
      </Stage>

      {/* OrbitControls for camera interaction */}
      <OrbitControls
        makeDefault // Ensures this is the default controller
        autoRotate // Gently rotate the scene
        autoRotateSpeed={0.5}
        enableZoom={true}
        enablePan={true}
        minPolarAngle={Math.PI / 4} // Limit vertical rotation
        maxPolarAngle={Math.PI / 2}
      />

      {/* Environment for realistic lighting and reflections */}
      <Environment preset="city" background blur={0.7} />

      {/* Post-processing effects for a more cinematic look */}
      <EffectComposer multisampling={0}>
        <N8AO
          quality="medium" // "low", "medium", "high", "ultra"
          aoRadius={0.5}
          intensity={2}
          color="black"
        />
        <Bloom
          intensity={0.25} // Reduced intensity for a subtle, professional glow
          luminanceThreshold={0.6} // Higher threshold to only affect brighter areas
          luminanceSmoothing={0.9}
          height={300}
        />
      </EffectComposer>
    </Suspense>
  );
};
