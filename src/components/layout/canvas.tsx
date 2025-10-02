"use client";

// React Three Fiber and Drei components for 3D rendering and helpers
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";
import { ModelWithEffects } from "@/components/ModelWrapper"; // カスタムモデルコンポーネントをインポート - Import custom model component
import { ErrorBoundary } from "react-error-boundary"; // エラーバウンダリー - Error boundary for handling errors

// 3Dキャンバスのローディング表示 - 3D canvas loading display
const Loader = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-900 to-gray-900">
    <div className="text-center text-white">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
      <p className="text-lg">3Dモデルを読み込み中...</p>
      <p className="text-sm opacity-75">しばらくお待ちください</p>
    </div>
  </div>
);

// エラー表示 - Error display component
const ErrorDisplay = ({ error }: { error: Error }) => (
  <div className="w-full h-full flex justify-center items-center bg-gradient-to-b from-gray-800 to-gray-900 text-red-400">
    <div className="text-center">
      <p className="text-xl font-bold mb-2">エラーが発生しました</p>
      <p className="text-base mb-4">{error.message}</p>
      <p className="text-sm opacity-80">ページを再読み込みしてください</p>
    </div>
  </div>
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
        camera={{ fov: 15, position: [100, 50, 90] }} //  x, y , z カメラを近づけてズームイン - Zoom in by bringing camera closer
      >
        <ErrorBoundary FallbackComponent={ErrorDisplay}>
          <Suspense fallback={<Loader />}>
            <ModelWithEffects />
          </Suspense>
        </ErrorBoundary>
      </R3FCanvas>
    </div>
  );
}
