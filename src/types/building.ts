// ビルディングの型定義 - Building type definitions

export interface Building {
  id: string;                        // ビルID - Building ID
  name: string;                      // ビル名 - Building name
  position: [number, number, number]; // 位置 [x, y, z] - Position [x, y, z]
  description: string;               // 説明 - Description
  type: string;                      // ビルの種類 (住宅、商業施設など) - Building type (residential, commercial, etc.)
  height: number;                    // 高さ - Height
  floors: number;                    // 階数 - Number of floors
  landmark: boolean;                 // ランドマークかどうか - Whether it's a landmark
  thumbnail?: string;                // サムネイル画像パス (オプショナル) - Thumbnail image path (optional)
}

export interface BuildingWithPosition extends Building {
  cameraPosition: [number, number, number]; // カメラ位置 - Camera position
  targetPosition: [number, number, number]; // 注視点 - Look-at point
  zoomLevel?: number;                 // ズームレベル - Zoom level
}