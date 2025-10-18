// src/components/quiz/AnswerOption.tsx
// 回答選択肢用のコンポーネント - Component for an answer option

import React from 'react';
import { useQuizStore } from '@/stores/quiz-store';

interface AnswerOptionProps {
  optionText: string;
  optionId: string;
}

/**
 * 単一の回答選択肢を表示するボタンコンポーネント
 * A button component to display a single answer option.
 * @param {AnswerOptionProps} props - The props for the component.
 * @returns {JSX.Element}
 */
export default function AnswerOption({ optionText, optionId }: AnswerOptionProps): React.JSX.Element {
  const { answerQuestion, selectedAnswer, showFeedback, feedback } = useQuizStore();

  // Determine the style based on selection and feedback status
  let buttonStyle = "w-full p-3 my-2 rounded-lg text-left text-white transition-colors duration-200 ";
  
  if (showFeedback && selectedAnswer === optionId) {
    // If feedback is shown and this option was selected
    if (feedback === '正解！') {
      // Correct answer
      buttonStyle += "bg-green-600"; 
    } else {
      // Incorrect answer
      buttonStyle += "bg-red-600";
    }
  } else {
    // Default style
    buttonStyle += "bg-gray-700 hover:bg-blue-600";
  }

  return (
    <button
      className={buttonStyle}
      onClick={() => answerQuestion(optionId)}
    >
      {optionText}
    </button>
  );
}
