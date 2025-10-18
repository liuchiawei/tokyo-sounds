// src/components/quiz/QuizGame.tsx
// クイズゲームのメインコンポーネント - Main component for the Quiz Game

import React from 'react';

/**
 * クイズゲームのメインコンテナ
 * Main container for the quiz game UI, designed to fit within the side panel.
 * @returns {JSX.Element}
 */
export default function QuizGame(): React.JSX.Element {
  return (
    <div className="w-full border-t-2 border-gray-700 pt-4 mt-4">
      {/* 
        This container will conditionally render child components like:
        - <StartScreen />
        - <QuestionDisplay />
        The logic will be driven by the Zustand store from Task 4.
      */}
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold">Quiz Game</h1>
        <p className="mt-2 text-sm">Component placeholder. The quiz will appear here.</p>
      </div>
    </div>
  );
}
