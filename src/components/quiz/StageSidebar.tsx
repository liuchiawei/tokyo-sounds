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
  const { stages, currentStage, gameStarted, gameCompleted, score } = useQuizStore();

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header with title and current score */}
      <div className="p-4 bg-gray-900/50 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
            {currentStage + 1}
          </span>
          Quiz Stages
        </h2>
        <div className="mt-2 text-sm text-blue-300">
          <span className="font-semibold">Score: </span>
          <span className="font-mono">{score}</span>
        </div>
      </div>

      {/* Stages list */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {stages.map((stage, index) => {
            // Determine the style based on the stage status
            let containerStyle = "flex items-center p-2 rounded-lg transition-all duration-200 ";
            let indicatorStyle = "w-3 h-3 rounded-full mr-3 ";
            let textStyle = "text-sm font-medium truncate ";
            
            if (index === currentStage && gameStarted) {
              // Current stage when the game is started
              containerStyle += "bg-blue-900/30 border border-blue-700/50";
              indicatorStyle += "bg-blue-500 animate-pulse";
              textStyle += "text-blue-300";
            } else if (index < currentStage) {
              // Completed stages
              containerStyle += "bg-green-900/20";
              indicatorStyle += "bg-green-500";
              textStyle += "text-green-300";
            } else if (index > currentStage) {
              // Future stages
              containerStyle += "bg-gray-700/30";
              indicatorStyle += "bg-gray-600";
              textStyle += "text-gray-400";
            } else {
              // Current stage before game starts
              containerStyle += "bg-gray-700/50";
              indicatorStyle += "bg-gray-500";
              textStyle += "text-gray-300";
            }

            return (
              <div 
                key={stage.id}
                className={containerStyle}
              >
                <div className={indicatorStyle}></div>
                <div className="flex-1 min-w-0">
                  <div className={textStyle}>
                    <span className="font-bold">Stage {index + 1}:</span> {stage.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game completion indicator */}
      {gameCompleted && (
        <div className="p-3 bg-gradient-to-r from-green-800/50 to-emerald-800/50 border-t border-green-700/50">
          <div className="text-center">
            <div className="text-green-400 font-bold">🎉 ゲーム完了！ 🎉</div>
            <div className="text-xs text-green-300/80 mt-1">お疲れ様でした！</div>
          </div>
        </div>
      )}
    </div>
  );
}
