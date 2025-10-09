/*
 * 高度なカメラ操作のためのコンポーネント - Component for advanced camera controls
 * このコンポーネントはカメラの操作性を制御します - This component controls camera manipulation
 
 */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// camera-controls ライブラリのインポート - Import camera-controls library
import CameraControls from "camera-controls";

// Install the THREE reference for camera-controls
CameraControls.install({ THREE: require("three") });

// CameraControlsWrapper: 高度なカメラ操作のためのコンポーネント - Component for advanced camera controls
// このコンポーネントはカメラの操作性を制御します - This component controls camera manipulation
export default function CameraControlsWrapper() {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef<CameraControls | null>(null);

  useEffect(() => {
    if (!camera || !gl.domElement) return;

    // Initialize camera controls - カメラコントロールの初期化
    const controls = new CameraControls(camera, gl.domElement);
    controlsRef.current = controls;

    // Distance configuration - 距離設定（カメラがオブジェクトに近づく/遠ざかる距離制限）
    controls.minDistance = 2; // Minimum distance of camera (minimum proximity to objects, reduced to allow closer inspection of model details)
    controls.maxDistance = 4000; // Maximum distance of camera (maximum distance from objects, increased for large city model and better zoom out)

    // Smoothness configuration - 滑らかさの設定（カメラ移動の慣性効果）
    controls.dampingFactor = 0.05; // Smoothing for rotation, zoom, and truck/pedestal movements (回転・ズーム・平行移動のスムージング)
    controls.draggingDampingFactor = 0.075; // Smoothing specifically for drag interactions (ドラッグ操作のスムージング)
    controls.smoothTime = 0.3; // Smoothness of inertia effect when moving freely (自由移動時の慣性効果の滑らかさ)
    controls.draggingSmoothTime = 0.15; // Smoothness during dragging (ドラッグ時の滑らかさ)

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
    // controls.enableAutoRotation = true; // Enable auto-rotation (自動回転を有効化)
    // controls.autoRotationSpeed = 0.5; // Auto-rotation speed (自動回転速度)

    // Rotation and zoom sensitivity configuration - 回転とズーム感度設定（マウスやタッチ操作の感度調整）
    controls.azimuthRotateSpeed = 1.0; // Horizontal rotation speed (horizontal rotation sensitivity) - 水平回転速度（左右回転の感度）
    controls.polarRotateSpeed = 1.0; // Vertical rotation speed (vertical rotation sensitivity) - 垂直回転速度（上下回転の感度）
    controls.dollySpeed = 1.0; // Zoom speed (zoom sensitivity) - ズーム速度（ズーム操作の感度）

    // Additional zoom settings for balanced zoom experience
    controls.dollyToCursor = true; // Zoom toward cursor position (カーソル位置に向かってズーム)
    controls.infinityDolly = false; // Don't allow zoom to infinity (無限遠までズームしない)

    // --- CLICK-TO-MOVE LOGIC START ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleDoubleClick = (event: MouseEvent) => {
      // Calculate normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0 && controlsRef.current) {
        const clickedPoint = intersects[0].point;
        const currentPosition = new THREE.Vector3();
        controlsRef.current.getPosition(currentPosition);

        // Calculate a new position halfway between the camera and the clicked point
        const newPosition = new THREE.Vector3().lerpVectors(
          currentPosition,
          clickedPoint,
          0.5
        );

        // Move camera
        controlsRef.current.setLookAt(
          newPosition.x,
          newPosition.y,
          newPosition.z,
          clickedPoint.x,
          clickedPoint.y,
          clickedPoint.z,
          true // Enable smooth transition
        );
      }
    };

    gl.domElement.addEventListener("dblclick", handleDoubleClick);
    // --- CLICK-TO-MOVE LOGIC END ---

    // Make controls globally accessible for programmatic movement
    (window as any).cameraControls = controls;

    // Cleanup function - クリーンアップ関数（コンポーネントアンマウント時のリソース解放）
    return () => {
      gl.domElement.removeEventListener("dblclick", handleDoubleClick);
      if (controlsRef.current) {
        controlsRef.current.dispose(); // Release camera control resources (カメラコントロールのリソースを解放)
        (window as any).cameraControls = null;
      }
    };
  }, [camera, gl, scene]);

  // Update controls on each frame - フレームごとにコントロールを更新（滑らかなアニメーションのため）
  useFrame((_, delta) => {
    if (controlsRef.current) {
      const hasControlsUpdated = controlsRef.current.update(delta); // Update position and rotation (位置と回転を更新)
      // Optional: trigger other updates when camera moves (カメラ移動時の追加処理をここに記述可能)
    }
  });

  return null; // This component doesn't render any visible elements (このコンポーネントは可視要素をレンダリングしない)
}
