// src/components/quiz/QuizGame.tsx
// クイズゲームのメインコンポーネント - Main component for the Quiz Game

import React from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import QuestionDisplay from './QuestionDisplay';
import AnswerOption from './AnswerOption';

/**
 * クイズゲームのメインコンテナ
 * Main container for the quiz game UI, designed to fit within the side panel.
 * @returns {JSX.Element}
 */
export default function QuizGame(): React.JSX.Element {
  const { gameStarted, gameCompleted, currentStage, currentQuestions, currentQuestionIndex, showFeedback, score, readyForNextLocation, proceedToNextLocation } = useQuizStore();

  // If the game hasn't started yet, show an instructional message
  if (!gameStarted) {
    return (
      <div className="w-full text-center">
        <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
          <h1 className="text-xl font-bold text-blue-300">Tokyo Sounds Quiz</h1>
          <div className="text-sm text-blue-200 mt-1">Explore Tokyo landmarks and learn through quizzes!</div>
        </div>
        <div className="text-gray-300">
          <p>Click on any landmark in the 3D scene to start the quiz.</p>
          <div className="mt-4 text-blue-400">
            <p>Try clicking on buildings, shops, or other landmarks in the model.</p>
          </div>
        </div>
      </div>
    );
  }

  // If the game is completed, show the completion message
  if (gameCompleted) {
    return (
      <div className="w-full text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-400">🎉 クイズ完了！ 🎉</h1>
          <p className="text-lg text-white mt-2">お疲れ様でした！</p>
          <p className="text-xl font-semibold text-blue-300 mt-4">最終スコア: <span className="font-mono">{score}</span></p>
        </div>
        <button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition-colors duration-200"
          onClick={() => {
            useQuizStore.getState().resetGame();
          }}
        >
          クイズをリセット
        </button>
      </div>
    );
  }

  // If user has completed all questions at current location but not yet proceeded
  if (readyForNextLocation) {
    return (
      <div className="w-full text-center">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-green-400">📍 現在のロケーション完了！</h1>
          <p className="text-lg text-white mt-2">お疲れ様でした！</p>
          <p className="text-blue-300 mt-4">次のロケーションに進みましょう</p>
        </div>
        <button
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors duration-200"
          onClick={proceedToNextLocation}
        >
          次のロケーションに進む
        </button>
      </div>
    );
  }

  // Otherwise, show the current question and answer options
  const currentQuestion = currentQuestions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div className="text-white">問題を読み込み中...</div>;
  }

  return (
    <div className="w-full">
      {/* Score and stage display */}
      <div className="mb-4 p-2 bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-blue-300">
            ステージ: <span className="font-mono">Level {currentStage}</span>
          </div>
          <div className="text-sm font-medium text-blue-300">
            スコア: <span className="font-mono">{score}</span>
          </div>
        </div>
      </div>
      
      {/* Question display */}
      <QuestionDisplay />
      
      {/* Feedback message when showing feedback */}
      {showFeedback && (
        <div className={`mb-3 p-3 rounded-lg text-center font-bold ${useQuizStore.getState().feedback === '正解！' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
          {useQuizStore.getState().feedback}
        </div>
      )}
      
      {/* Answer options */}
      <div className="space-y-2">
        {currentQuestion.options.map((option) => (
          <AnswerOption 
            key={option.id} 
            optionId={option.id} 
            optionText={option.text} 
          />
        ))}
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        Question {currentQuestionIndex + 1} of {currentQuestions.length}
      </div>
    </div>
  );
}
