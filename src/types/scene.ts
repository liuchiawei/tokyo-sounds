// シーン管理のための型定義 - Type definitions for scene management

// 建物の型定義 - Building type definition
export interface Building {
  id: string;                        // 建物の一意ID - Unique building ID
  name: string;                      // 建物名 - Building name
  description: string;               // 建物の説明 - Building description
  type: 'landmark' | 'station' | 'commercial' | 'residential' | 'park' | 'other'; // 建物タイプ - Building type
  modalContent: {                    // モーダル表示用のコンテンツ - Modal content
    title: string;                   // モーダルタイトル - Modal title
    description: string;             // モーダル説明 - Modal description
    image?: string;                  // モーダル画像 - Modal image
    details?: string;                // 詳細情報 - Additional details
    history?: string;                // 歴史情報 - Historical information
    features?: string[];             // 特徴 - Features
  };
}

// カメラ位置の型定義 - Camera position type definition
export interface CameraPosition {
  position: [number, number, number]; // カメラの位置 - Camera position [x, y, z]
  target: [number, number, number];   // カメラが向くターゲット - Camera target [x, y, z]
  fov: number;                       // 視野角 - Field of view
  name: string;                      // ビューポイント名 - Viewpoint name
  description: string;               // ビューポイントの説明 - Viewpoint description
  modalContent?: {                   // モーダル表示用のコンテンツ - Modal content
    title: string;                   // モーダルタイトル - Modal title
    description: string;             // モーダル説明 - Modal description
    image?: string;                  // モーダル画像 - Modal image
    details?: string;                // 詳細情報 - Additional details
  };
}

// シーンの型定義 - Scene type definition
export interface Scene {
  id: string;                        // シーンの一意ID - Unique scene ID
  name: string;                      // シーン名 - Scene name
  description: string;               // シーンの説明 - Scene description
  thumbnail: string;                 // サムネイル画像のパス - Thumbnail image path
  cameraPositions: CameraPosition[]; // カメラ位置の配列 - Array of camera positions
}

// タイトル表示状態の型定義 - Title display state type definition
export interface TitleState {
  isVisible: boolean;                // タイトルが表示されているか - Whether title is visible
  position: [number, number, number] | null; // タイトルの位置 - Title position
  title: string | null;              // タイトルテキスト - Title text
}

// シーン状態の型定義 - Scene state type definition
export interface SceneState {
  currentScene: Scene | null;        // 現在のシーン - Current scene
  currentLandmark: CameraPosition | null; // 現在のランドマーク - Current landmark
  allScenes: Scene[];                // 全てのシーン - All scenes
  isLoading: boolean;                // 読み込み中フラグ - Loading flag
  error: string | null;              // エラーメッセージ - Error message
  
  // タイトル表示状態 - Title display state
  title: TitleState;                 // タイトル表示状態 - Title display state
  
  // アクション関数 - Action functions
  setCurrentScene: (scene: Scene) => void;                    // 現在のシーンを設定 - Set current scene
  setCurrentLandmark: (landmark: CameraPosition) => void;     // 現在のランドマークを設定 - Set current landmark
  moveCameraToLandmark: (landmark: CameraPosition) => void;   // カメラをランドマークに移動 - Move camera to landmark
  loadScenes: () => Promise<void>;                            // シーンを読み込み - Load scenes
  
  // タイトル表示関連のアクション - Title display actions
  showTitle: (position: [number, number, number], title: string) => void; // タイトルを表示 - Show title
  hideTitle: () => void;                                       // タイトルを非表示 - Hide title
  
  // 建物関連のアクション - Building actions
  getBuildingById: (id: string) => Building | undefined;       // IDで建物を取得 - Get building by ID
  getAllBuildings: () => Building[];                           // 全建物を取得 - Get all buildings
}