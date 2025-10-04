"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import AudioPlayer from "@/components/layout/audio-player";

// SSR互換のために動的にインポートされるキャンバスコンポーネント - Canvas component dynamically imported for SSR compatibility
const DynamicCanvas = dynamic(
  () => import('@/components/layout/canvas'),
  { 
    ssr: false, // サーバーサイドレンダリングを無効化 - Disable server-side rendering
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-900 to-gray-900" style={{ minHeight: "500px", height: "70vh" }}>
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-lg">3Dモデルを読み込み中...</p>
          <p className="text-sm opacity-75">しばらくお待ちください</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col md:flex-row justify-center items-center">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-900 to-gray-900" style={{ minHeight: "500px", height: "70vh" }}>
          <div className="text-center text-white">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-lg">3Dモデルを読み込み中...</p>
            <p className="text-sm opacity-75">しばらくお待ちください</p>
          </div>
        </div>
      }>
        <DynamicCanvas />
      </Suspense>
      <AudioPlayer />
    </main>
  );
}