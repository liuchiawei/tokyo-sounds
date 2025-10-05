"use client";

// React Three Fiber と Drei コンポーネント - React Three Fiber and Drei components for 3D rendering and helpers
import { Canvas } from "@react-three/fiber";
import { Stage, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useMemo } from "react";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";
import { Model } from "../Model"; // GLBモデルコンポーネントをインポート - Import the auto-generated Model component
import { useErrorBoundary } from "use-error-boundary";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// camera-controls ライブラリのインポート - Import camera-controls library
import CameraControls from "camera-controls";

// Install the THREE reference for camera-controls
CameraControls.install({ THREE: require("three") });

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

// CameraControlsWrapper: 高度なカメラ操作のためのコンポーネント - Component for advanced camera controls
// このコンポーネントはカメラの操作性を制御します - This component controls camera manipulation
function CameraControlsWrapper() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<CameraControls | null>(null);

  useEffect(() => {
    if (!camera || !gl.domElement) return;

    // Initialize camera controls - カメラコントロールの初期化
    const controls = new CameraControls(camera, gl.domElement);

    // Distance configuration - 距離設定（カメラがオブジェクトに近づく/遠ざかる距離制限）
    controls.minDistance = 10; // Minimum distance of camera (minimum proximity to objects, adjusted for large city model)
    controls.maxDistance = 4000; // Maximum distance of camera (maximum distance from objects, increased for large city model)

    // Smoothness configuration - 滑らかさの設定（カメラ移動の慣性効果）
    controls.smoothTime = 0.5; // Smoothness of inertia effect when moving freely (自由移動時の慣性効果の滑らかさ)
    controls.draggingSmoothTime = 0.2; // Smoothness during dragging (ドラッグ時の滑らかさ)

    // Rotation limits configuration - 回転制限の設定（カメラが回転できる角度の制限）
    controls.minPolarAngle = Math.PI / 6; // Minimum vertical rotation angle (to prevent going under ground) - 垂直回転の最小角度（地面以下に潜らないように）
    controls.maxPolarAngle = Math.PI / 2; // Maximum vertical rotation angle (to horizontal) - 垂直回転の最大角度（水平方向まで）

    // Mouse interaction configuration - マウス操作設定（左クリック・右クリックでの操作方法）
    controls.mouseButtons.left = CameraControls.ACTION.ROTATE; // Left click and drag: Rotate camera - 左クリックドラッグ：カメラ回転
    controls.mouseButtons.right = CameraControls.ACTION.TRUCK; // Right click and drag: Pan camera - 右クリックドラッグ：カメラ平行移動

    // Touch interaction configuration - タッチ操作設定（スマートフォン・タブレットでの操作方法）
    controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE; // One finger drag: Rotate camera - 1本指ドラッグ：カメラ回転
    controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK; // Two fingers: Zoom and pan - 2本指：ズームと平行移動

    // Auto-rotation configuration - 自動回転設定
    controls.enableAutoRotation = true; // Enable auto-rotation (自動回転を有効化)
    controls.autoRotationSpeed = 0.5; // Auto-rotation speed (自動回転速度)

    // Rotation sensitivity configuration - 回転感度設定（マウスやタッチ操作の感度調整）
    controls.azimuthRotateSpeed = 1.0; // Horizontal rotation speed (horizontal rotation sensitivity) - 水平回転速度（左右回転の感度）
    controls.polarRotateSpeed = 1.0; // Vertical rotation speed (vertical rotation sensitivity) - 垂直回転速度（上下回転の感度）
    controls.dollySpeed = 1.0; // Zoom speed (zoom sensitivity) - ズーム速度（ズーム操作の感度）

    controlsRef.current = controls;

    // Cleanup function - クリーンアップ関数（コンポーネントアンマウント時のリソース解放）
    return () => {
      if (controlsRef.current) {
        controlsRef.current.dispose(); // Release camera control resources (カメラコントロールのリソースを解放)
      }
    };
  }, [camera, gl]);

  // Update controls on each frame - フレームごとにコントロールを更新（滑らかなアニメーションのため）
  useFrame((_, delta) => {
    if (controlsRef.current) {
      const hasControlsUpdated = controlsRef.current.update(delta); // Update position and rotation (位置と回転を更新)
      // Optional: trigger other updates when camera moves (カメラ移動時の追加処理をここに記述可能)
    }
  });

  return null; // This component doesn't render any visible elements (このコンポーネントは可視要素をレンダリングしない)
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
    const fov = camera.fov * (Math.PI / 180); // Convert to radians
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
    if (typeof window !== "undefined" && (window as any).cameraControls) {
      const controls = (window as any).cameraControls;
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
        className="w-full h-full bg-gray-900" // Bloom とのコントラスト向上のための暗い背景 - Darker background for better contrast with Bloom
        style={{ minHeight: "500px", height: "70vh" }}
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
            {/* Stage コンポーネントはモデルの中央寄せ・スケーリングと照明を担当 - Stage component centers and scales the model, adds shadows and lighting */}
            <Stage
              environment={null}
              intensity={1} // 照明の強度 - Light intensity
              castShadow={false} // 影のキャスト無効化 - Disable shadow casting
              shadows={false} // 影の無効化 - Disable shadows
              adjustCamera={2.5} // カメラの調整 - Adjusts camera to better fit the model in view
            >
              <Model /> {/* GLBモデルの表示 - Display the GLB model */}
              <ModelBounds />{" "}
              {/* モデル全体を表示するためのカメラ調整 - Camera adjustment to view entire model */}
            </Stage>
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
      </div>
    </ErrorBoundary>
  );
}
