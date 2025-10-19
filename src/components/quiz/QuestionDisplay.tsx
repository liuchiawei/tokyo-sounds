// src/components/quiz/QuestionDisplay.tsx
// 質問表示用のコンポーネント - Component for displaying a question

import React from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { QuizQuestion } from '@/types/quiz';

/**
 * 質問のテキストを表示するコンポーネント - A component to display the text of the current quiz question
 * @returns {JSX.Element}
 */
export default function QuestionDisplay(): React.JSX.Element {
  const { currentQuestions, currentQuestionIndex } = useQuizStore();
  
  // 現在の質問を取得 - Get the current question
  const currentQuestion: QuizQuestion | undefined = currentQuestions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="text-white text-center py-8">
        <div className="animate-pulse">問題を読み込み中...</div> {/* 質問が利用できない場合のロード中メッセージ - Loading message if question is not available */}
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      {/* 質問番号とステージ表示 - Question number and stage display */}
      <div className="text-xs font-medium text-blue-300 mb-2 flex justify-between items-center">
        <span>質問 {currentQuestionIndex + 1} / {currentQuestions.length}</span>
        <span className="text-xs bg-blue-900/50 px-1.5 py-0.5 rounded">ステージ {useQuizStore.getState().currentStage}</span>
      </div>
      <h2 className="text-lg font-semibold text-white bg-gray-800/70 p-4 rounded-xl border border-gray-700 shadow-inner">
        {currentQuestion.text}
      </h2>
    </div>
  );
}
