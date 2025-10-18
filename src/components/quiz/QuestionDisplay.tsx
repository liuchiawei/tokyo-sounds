// src/components/quiz/QuestionDisplay.tsx
// 質問表示用のコンポーネント - Component for displaying a question

import React from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { QuizQuestion } from '@/types/quiz';

/**
 * 質問のテキストを表示するコンポーネント
 * A component to display the text of the current quiz question.
 * @returns {JSX.Element}
 */
export default function QuestionDisplay(): React.JSX.Element {
  const { currentQuestions, currentQuestionIndex } = useQuizStore();
  
  // Get the current question
  const currentQuestion: QuizQuestion | undefined = currentQuestions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div className="text-white">問題を読み込み中...</div>; // Loading message if question is not available
  }
  
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-blue-300 mb-1">
        Question {currentQuestionIndex + 1} of {currentQuestions.length}
      </div>
      <h2 className="text-lg font-semibold text-white">{currentQuestion.text}</h2>
    </div>
  );
}
