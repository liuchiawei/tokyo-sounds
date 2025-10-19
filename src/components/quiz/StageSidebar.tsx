"use client";
// src/components/quiz/StageSidebar.tsx
// ステージサイドバー表示用のコンポーネント - Component for displaying the stage sidebar

import React from "react";
import { useQuizStore } from "@/stores/quiz-store";

interface StageSidebarProps {
  // Add any props that the StageSidebar component might need
  // Currently empty as the component will get all necessary data from the store
}

/**
 * ステージサイドバーを表示するコンポーネント
 * A component to display the sidebar with stages and their status.
 * @param {StageSidebarProps} props - The props for the component.
 * @returns {JSX.Element}
 */
export default function StageSidebar({}: StageSidebarProps): React.JSX.Element {
  const { gameStarted, gameCompleted, score, currentStage } = useQuizStore();

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header with title, current stage and score */}
      <div className="p-4 bg-gray-900/50 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
            ?
          </span>
          Tokyo Quiz
        </h2>
        <div className="mt-2 text-sm text-blue-300">
          <div className="font-semibold">Stage: <span className="font-mono">Level {currentStage}</span></div>
          <div className="font-semibold">Score: <span className="font-mono">{score}</span></div>
        </div>
      </div>

      {/* Simple content */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-sm text-gray-300">Tokyo Exploration</div>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-sm text-gray-300">Learning Experience</div>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-sm text-gray-300">Quiz Mode</div>
          </div>
        </div>
      </div>

      {/* Simple completion indicator */}
      <div className="p-3 bg-gradient-to-r from-blue-800/50 to-indigo-800/50 border-t border-blue-700/50">
        <div className="text-center">
          <div className="text-blue-400 font-bold">Tokyo Quiz</div>
          <div className="text-xs text-blue-300/80 mt-1">
            {gameStarted && !gameCompleted ? "In Progress" : 
             gameCompleted ? "Completed" : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
}
