"use client";

// React Three Fiber and Drei components for 3D rendering and helpers
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";

// GLBモデルをロードして表示するコンポーネント - Component to load and display GLB model
const Model = () => {
  // useGLTFフックでGLBモデルを読み込む - Load GLB model using useGLTF hook
  const { scene } = useGLTF("/3dtest.glb");
  // The <Stage> component will automatically scale and center the model
  return <primitive object={scene} dispose={null} />;
};

// モデルロード用のシンプルなプレースホルダー - Simple placeholder for model loading
const Loader = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="hotpink" />
  </mesh>
);

// メインキャンバスコンポーネント - Main canvas component
export default function Canvas() {
  return (
    <div
      className="w-full h-full bg-gray-900" // Darker background for better contrast with Bloom
      style={{ minHeight: "500px", height: "70vh" }}
    >
      <R3FCanvas
        shadows
        dpr={[1, 2]} // Adjust pixel ratio for performance/quality
        camera={{ fov: 15 }} // Stage will set position, but we can set FOV
      >
        <Suspense fallback={<Loader />}>
          {/* Stage component centers and scales the model, adds shadows and lighting */}
          <Stage
            environment={null}
            intensity={1}
            contactShadow={false}
            shadowBias={-0.0015}
          >
            <Model />
          </Stage>
        </Suspense>

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
        <EffectComposer multisample={0}>
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
      </R3FCanvas>
    </div>
  );
}
