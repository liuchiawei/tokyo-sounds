"use client";

// React Three Fiber と Drei コンポーネント - React Three Fiber and Drei components for 3D rendering and helpers
import { Canvas } from "@react-three/fiber";
import { Stage, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { CudecityTest02Model } from "../CudecityTest02Model"; // GLBモデルコンポーネントをインポート - Import the auto-generated Model component
import { useErrorBoundary } from "use-error-boundary";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Zustandストアのインポート - Import Zustand store

// CameraControlsWrapperコンポーネントのインポート - Import CameraControlsWrapper component
import CameraControlsWrapper from "../CameraControlsWrapper";

// LandmarkSelectorコンポーネントのインポート - Import LandmarkSelector component
import LandmarkSelector from "../ui/landmark-selector";

// モデルロード用のシンプルなプレースホルダー - Simple placeholder for model loading
const Loader = () => null;

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

// メインキャンVASコンポーネント - Main canvas component
export default function ThreeDCanvas() {
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
          camera={{
            fov: 45,
            far: 5000,
            near: 0.1,
            position: [-72, 1450, 670],
          }} // カメラ設定の最適化 - Optimized camera settings for better model visibility (FOV increased, position adjusted for large city model)
          gl={{
            antialias: true, // アンチエイリアス有効化 - Enable antialiasing
            alpha: true, // 透明度有効化 - Enable transparency
            powerPreference: "high-performance", // パフォーマンス優先 - Prefer high performance
          }}
          fallback={<WebGLFallback />} // WebGL非対応時のフォールバック - Fallback for unsupported WebGL
        >
          <Suspense fallback={<Loader />}>
            <Physics debug>
              {/* Stage コンポーネントはモデルの中央寄せ・スケーリングと照明を担当 - Stage component centers and scales the model, adds shadows and lighting */}
              <Stage
                environment={null}
                intensity={1} // 照明の強度 - Light intensity
                castShadow={false} // 影のキャスト無効化 - Disable shadow casting
                shadows={false} // 影の無効化 - Disable shadows
                adjustCamera={false} // カメラの調整 - Adjusts camera to better fit the model in view
              >
                <CudecityTest02Model />{" "}
                {/* GLBモデルの表示 - Display the GLB model */}
                {/* モデル全体を表示するためのカメラ調整 - Camera adjustment to view entire model */}
              </Stage>
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
