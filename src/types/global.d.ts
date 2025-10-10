// ウィンドウオブジェクトにカスタムプロパティを追加 - Adding custom property to window object
import type CameraControls from "camera-controls";

declare global {
  interface Window {
    cameraControls?: CameraControls | null;
  }
}

export {};