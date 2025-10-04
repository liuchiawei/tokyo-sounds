/*
ダイナミックキャンバス: Dynamic Canvas
サーバーサイドレンダリング(SSR)との互換性を確保するためのR3Fキャンバスの動的インポートコンポーネント - 
Dynamic import component for R3F Canvas to ensure compatibility with server-side rendering (SSR)

このコンポーネントはクライアントサイドでのみロードされます - This component is loaded only on the client side
*/

import Canvas from "./canvas";

// SSR互換のダイナミックキャンバスコンポーネント - SSR-compatible dynamic canvas component
export default function DynamicCanvas() {
  return <Canvas />;
}
