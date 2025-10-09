// シーンの型定義 - Scene type definitions
// シーン管理のための Zustand ストア - Zustand store for scene management

export interface CameraPosition {
  position: [number, number, number];  // カメラ位置 [x, y, z] - Camera position [x, y, z]
  target: [number, number, number];    // 注視点 [x, y, z] - Look-at point [x, y, z]
  fov?: number;                       // 画角 (オプショナル) - Field of view (optional)
  name: string;                       // ランドマーク名 - Landmark name
  description: string;                // 説明 - Description
}

export interface Scene {
  id: string;                         // シーンID - Scene ID
  name: string;                      // シーン名 - Scene name
  description: string;               // シーンの説明 - Scene description
  cameraPositions: CameraPosition[];  // カメラ位置の配列 - Array of camera positions
  thumbnail?: string;                // サムネイル画像パス (オプショナル) - Thumbnail image path (optional)
}

export interface SceneState {
  currentScene: Scene | null;        // 現在のシーン - Current scene
  currentLandmark: CameraPosition | null; // 現在のランドマーク - Current landmark
  allScenes: Scene[];                // すべてのシーン - All scenes
  isLoading: boolean;                // ロード中フラグ - Loading flag
  error: string | null;              // エラーメッセージ - Error message
  setCurrentScene: (scene: Scene) => void;  // 現在のシーンを設定 - Set current scene
  setCurrentLandmark: (landmark: CameraPosition) => void; // 現在のランドマークを設定 - Set current landmark
  moveCameraToLandmark: (landmark: CameraPosition) => void; // カメラをランドマークに移動 - Move camera to landmark
  loadScenes: () => Promise<void>;   // シーンをロード - Load scenes
}