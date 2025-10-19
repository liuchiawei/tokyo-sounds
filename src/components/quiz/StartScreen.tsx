// src/components/quiz/StartScreen.tsx
// クイズ開始画面用のコンポーネント - Component for the quiz start screen

import React from 'react';
import { useQuizStore } from '@/stores/quiz-store';

interface StartScreenProps {
  landmarkName: string;
}

/**
 * クイズの開始画面を表示するコンポーネント - Displays the start screen for a quiz, including the landmark name and a start button
 * @param {StartScreenProps} props - The props for the component
 * @returns {JSX.Element}
 */
export default function StartScreen({ landmarkName }: StartScreenProps): React.JSX.Element {
  const { startGame } = useQuizStore();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white">クイズ開始！</h2>
      <p className="mt-2 text-lg text-gray-300">以下の場所に関するクイズを開始します:</p>
      <p className="mt-1 text-xl font-bold text-blue-400">{landmarkName}</p>
      <button
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition-colors duration-200"
        onClick={() => startGame(landmarkName.toLowerCase())}
      >
        クイズを開始
      </button>
    </div>
  );
}
