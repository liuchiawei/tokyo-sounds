"use client";

// React Three Fiber と Drei コンポーネント - React Three Fiber and Drei components for 3D rendering and helpers
import { Canvas, useFrame } from "@react-three/fiber";
import { Stage, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { Model } from "../Model"; // GLBモデルコンポーネントをインポート - Import the auto-generated Model component
import { useErrorBoundary } from "use-error-boundary";
import { useThree } from "@react-three/fiber";
import { useAudioSessionContext } from "@/hooks/useAudio";
import * as THREE from "three";

// Zustandストアのインポート - Import Zustand store

// CameraControlsWrapperコンポーネントのインポート - Import CameraControlsWrapper component
import CameraControlsWrapper from "../CameraControlsWrapper";

// LandmarkSelectorコンポーネントのインポート - Import LandmarkSelector component
import LandmarkSelector from "../ui/landmark-selector";

// モデルロード用のシンプルなプレースホルダー - Simple placeholder for model loading
const Loader = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="hotpink" />
  </mesh>
);

// WebGLサポートがない場合のフォールバック - Fallback for unsupported WebGL
const WebGLFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-900">
    <div className="text-white text-center p-8 max-w-md">
      <h2 className="text-2xl font-bold mb-4">
        WebGL がサポートされていません
      </h2>
      <p className="mb-4">
        3Dエクスペリエンスを表示するために必要なWebGLがブラウザでサポートされていません。
      </p>
      <p>
        お使いのブラウザを更新するか、Chrome、Firefox、EdgeなどのWebGL対応ブラウザをご使用ください。
      </p>
    </div>
  </div>
);

function Scene({ sharedContext }: { sharedContext: AudioContext | null }) {
  const { camera, scene } = useThree();
  const session = useAudioSessionContext();
  const listenerRef = useRef<THREE.AudioListener | null>(null);

  useEffect(() => {
    if (camera && sharedContext && !listenerRef.current) {
      const listener = new THREE.AudioListener();
      listenerRef.current = listener;
      camera.add(listener);
    }

    return () => {
      if (listenerRef.current && camera && listenerRef.current.parent === camera) {
        camera.remove(listenerRef.current);
      }
    };
  }, [camera, sharedContext]);

  useFrame(() => {
    if (!camera || !listenerRef.current) return;

    // if the listener is orphaned, re-attach it to the camera
    if (listenerRef.current.parent !== camera) {
      camera.add(listenerRef.current);
    }

    // update listener matrix world
    listenerRef.current.updateMatrixWorld(false);

    // if they exist, update audio bindings
    if (session) {
      const bindings = (session as any).spatialBindings;
      if (bindings instanceof Map && bindings.size > 0) {
        bindings.forEach((binding: any) => {
          if (binding.audio) {
            binding.audio.updateMatrixWorld(false);
          }
        });
      }
    }
  });

  return (
    <>
      <Stage
        environment={null}
        intensity={1}
        castShadow={false}
        shadows={false}
        adjustCamera={2.5}
      >
        <Model listenerRef={listenerRef as React.RefObject<THREE.AudioListener>} />
        <ModelBounds />
      </Stage>
    </>
  );
}

// ModelBounds: モデルの境界を計算してカメラを自動調整するコンポーネント - Component to calculate model bounds and auto-adjust camera
function ModelBounds() {
  const { camera } = useThree();
  const gltf = useGLTF("/3dtest.glb");

  // Calculate the bounding box of the model
  useEffect(() => {
    if (!gltf || !gltf.scene || !camera) return;

    // Create a bounding box from the model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Calculate appropriate distance based on the size of the model
    const maxDim = Math.max(size.x, size.y, size.z);

    // Check if camera is a PerspectiveCamera (which has fov) rather than OrthographicCamera
    let fov = Math.PI / 4; // Default to 45 degrees if not a PerspectiveCamera
    if ("fov" in camera) {
      fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180); // Convert to radians
    }

    const desiredDistance = maxDim / (2 * Math.tan(fov / 2));
    const distance = desiredDistance * 1.5; // Add some padding

    // Position the camera at the calculated distance from the center
    const direction = new THREE.Vector3(2, 1, 2).normalize(); // Default viewing direction
    const cameraPosition = center
      .clone()
      .add(direction.multiplyScalar(distance));

    // Set the camera position and look at the center
    camera.position.copy(cameraPosition);
    camera.lookAt(center);

    // Update CameraControls if available
    if (typeof window !== "undefined" && window.cameraControls) {
      const controls = window.cameraControls;
      if (controls && typeof controls.setLookAt === "function") {
        controls.setLookAt(
          cameraPosition.x,
          cameraPosition.y,
          cameraPosition.z,
          center.x,
          center.y,
          center.z,
          true // Use transition
        );
      }
    }
  }, [gltf, camera]);

  return null; // This component doesn't render any visible elements
}

// メインキャンVASコンポーネント - Main canvas component
export default function ThreeDCanvas({ sharedContext }: { sharedContext: AudioContext | null }) {
  const { ErrorBoundary, didCatch, error } = useErrorBoundary();

  // 3Dキャンバスエラー時のフォールバック - Error fallback for 3D canvas
  const CanvasErrorFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-white text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">3Dシーンの読み込みエラー</h2>
        <p className="mb-4">
          {error?.message ||
            "3Dエクスペリエンスの読み込み中にエラーが発生しました。"}
        </p>
        <p>ページを再読み込みするか、別のブラウザをお試しください。</p>
      </div>
    </div>
  );

  if (didCatch) {
    return <CanvasErrorFallback />;
  }

  return (
    <ErrorBoundary>
      <div
        className="w-full h-full bg-gray-900 flex items-center justify-center" // Bloom とのコントラスト向上のための暗い背景 - Darker background for better contrast with Bloom
        style={{ minHeight: "500px", height: "100%" }}
      >
        <Canvas
          shadows // 影の有効化 - Enable shadows
          dpr={[1, 1.5]} // パフォーマンス向上のためのDPR調整 - Slightly reduced max DPR for better performance
          camera={{ fov: 45, far: 5000, near: 0.1, position: [0, 50, 100] }} // カメラ設定の最適化 - Optimized camera settings for better model visibility (FOV increased, position adjusted for large city model)
          gl={{
            antialias: true, // アンチエイリアス有効化 - Enable antialiasing
            alpha: true, // 透明度有効化 - Enable transparency
            powerPreference: "high-performance", // パフォーマンス優先 - Prefer high performance
          }}
          fallback={<WebGLFallback />} // WebGL非対応時のフォールバック - Fallback for unsupported WebGL
        >
          <Suspense fallback={<Loader />}>
            <Physics debug>
              <Scene sharedContext={sharedContext} />
            </Physics>
          </Suspense>

          {/* CameraControls: カメラ操作のための高度なコントロール - Advanced camera controls for camera interaction */}
          <CameraControlsWrapper />

          {/* 環境: 現実的な照明と反射 - Environment for realistic lighting and reflections */}
          <Environment preset="city" background blur={0.7} />

          {/* 映画のような外観のためのポストプロセッシング効果 - Post-processing effects for a more cinematic look */}
          <EffectComposer multisampling={0}>
            <N8AO
              quality="medium" // "low", "medium", "high", "ultra" - レンダリング品質
              aoRadius={0.5} // アンビエントオクルージョンの半径 - Ambient occlusion radius
              intensity={2} // AO強度 - AO intensity
              color="black" // AOカラー - AO color
            />
            <Bloom
              intensity={0.25} // 控えめな発光効果 - Reduced intensity for a subtle, professional glow
              luminanceThreshold={0.6} // 明るいエリアのみに影響 - Higher threshold to only affect brighter areas
              luminanceSmoothing={0.9} // 明るさのスムージング - Brightness smoothing
              height={300} // ブルーム効果の高さ - Bloom effect height
            />
          </EffectComposer>
        </Canvas>
        <LandmarkSelector />
      </div>
    </ErrorBoundary>
  );
}
