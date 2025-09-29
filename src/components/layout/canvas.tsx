"use client";

// React Three Fiberを使用 - Using React Three Fiber
import { Canvas as R3FCanvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

// GLBモデルをロードして表示するコンポーネント - Component to load and display GLB model
const Model = ({ url, onModelLoad }) => {
  // useGLTFフックでGLBモデルを読み込む - Load GLB model using useGLTF hook
  const gltf = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (meshRef.current) {
      // 問題点: 以前のコードでは、バウンディングボックス計算後に位置を調整していましたが、
      // この方法では、バウンディングボックスがスケーリング前のサイズに基づいて計算されてしまいます。
      // To fix this, we need to calculate the bounding box of the unscaled model first,
      // then apply position and scale adjustments.

      // 1. モデルの元の境界ボックスを計算 (スケーリング前) - Calculate original bounding box before scaling
      const originalBox = new THREE.Box3().setFromObject(gltf.scene);
      const originalSize = originalBox.getSize(new THREE.Vector3());
      const originalCenter = originalBox.getCenter(new THREE.Vector3());

      // 2. モデルの位置を原点に調整 - Adjust position so the model is centered at origin
      gltf.scene.position.x -= originalCenter.x;
      gltf.scene.position.y -= originalCenter.y;
      gltf.scene.position.z -= originalCenter.z;

      // 3. 更新されたバウンディングボックスを取得 - Get updated bounding box after position adjustment
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // 4. 合理的なスケールファクターを計算 - Calculate reasonable scale factor
      // スケールファクターを計算: モデルの最大次元がviewSizeの範囲に収まるように - Calculate scale factor so max dimension fits in viewSize
      const viewSize = 5; // モデルの最大寸法が5ユニット以内になるように - Model max dimension should be within 5 units
      const scaleFactor = viewSize / maxDim;

      // 5. モデルを適切なサイズにスケーリング - Scale the model to appropriate size
      gltf.scene.scale.setScalar(scaleFactor);

      // 6. 親コンポーネントにバウンディング情報を渡す - Pass bounding info to parent component
      if (onModelLoad) {
        // 最終的なバウンディングボックスを計算 (スケーリングと位置調整後) - Calculate final bounding box after scaling and positioning
        const finalBox = new THREE.Box3().setFromObject(gltf.scene);
        const finalSize = finalBox.getSize(new THREE.Vector3());
        const finalCenter = finalBox.getCenter(new THREE.Vector3());

        onModelLoad({
          center: finalCenter,
          size: finalSize,
          maxDim: Math.max(finalSize.x, finalSize.y, finalSize.z),
          scaleFactor,
        });
      }
    }
  }, [gltf.scene, onModelLoad]);

  // モデルが正しく読み込まれた場合、sceneをprimitiveとしてレンダリング - Render scene as primitive if model loads successfully
  return <primitive ref={meshRef} object={gltf.scene} dispose={null} />;
};

// モデルロード用の表示コンポーネント - Component for model loading display
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
      className="w-full h-full bg-gray-100"
      style={{ minHeight: "500px", height: "70vh" }}
    >
      <R3FCanvas
        shadows
        frameloop="always" // Change to always for consistent rendering
        camera={{ position: [800, 2000, 800], fov: 50, near: 0.1, far: 100000 }} // Adjusted camera position for a better initial view
      >
        {/* 背景色の設定 - Set background color */}
        <color attach="background" args={["#eeeeee"]} />

        {/* 照明を改善 - Improve lighting based on the reference code */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={<Loader />}>
          <Model url="/3dtest.glb" onModelLoad={() => {}} />
        </Suspense>

        {/* OrbitControlsを直接使用 - Use OrbitControls directly */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true} // 滑らかな動き - Smooth movement
        />
      </R3FCanvas>
    </div>
  );
}
