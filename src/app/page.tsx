'use client';

import ThreeDCanvas from "@/components/layout/3D-canvas";
import AudioPlayer from "@/components/layout/audio-player";
import StageSidebar from "@/components/quiz/StageSidebar";
import VisualSceneAnalyzer from "@/components/VisualSceneAnalyzer";
import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row justify-center items-center bg-gradient-to-br from-gray-900 to-black text-white relative">
      <div className="w-full md:w-1/4 h-[90vh] p-2">
        <StageSidebar />
      </div>
      <div className="w-full md:w-3/4 flex flex-col md:flex-row gap-2 p-2">
        <div className="w-full md:w-2/3 h-[90vh]">
          <ThreeDCanvas />
        </div>
        <div className="w-full md:w-1/3 h-[90vh]">
          <AudioPlayer />
        </div>
      </div>
      
      {/* Visual Scene Analyzer with toggle functionality */}
      <VisualSceneAnalyzer 
        isOpen={isOpen} 
        toggleOpen={toggleOpen} 
      />
    </main>
  );
}
