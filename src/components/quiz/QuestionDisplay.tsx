// src/components/quiz/QuestionDisplay.tsx
// 質問表示用のコンポーネント - Component for displaying a question

import React from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { locationSequence } from '@/stores/quiz-store'; // Import locationSequence directly
import { QuizQuestion } from '@/types/quiz';

/**
 * 質問のテキストを表示するコンポーネント - A component to display the text of the current quiz question
 * @returns {JSX.Element}
 */
export default function QuestionDisplay(): React.JSX.Element {
  const { currentQuestions, currentQuestionIndex, currentLocationIndex } = useQuizStore();
  
  // 現在の質問を取得 - Get the current question
  const currentQuestion: QuizQuestion | undefined = currentQuestions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="text-white text-center py-6">
        <div className="animate-pulse">問題を読み込み中...</div> {/* 質問が利用できない場合のロード中メッセージ - Loading message if question is not available */}
      </div>
    );
  }
  
  return (
    <div className="mb-3">
      {/* 質問番号とロケーション表示 - Question number and location display */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-400">
          質問 {currentQuestionIndex + 1} / {currentQuestions.length}
        </span>
        <span className="text-xs font-medium bg-slate-700/60 text-slate-300 px-2 py-1 rounded">
          ロケーション {locationSequence[currentLocationIndex]}
        </span>
      </div>
      <div className="text-white p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <h2 className="text-base font-medium leading-relaxed">
          {currentQuestion.text}
        </h2>
      </div>
    </div>
  );
}
