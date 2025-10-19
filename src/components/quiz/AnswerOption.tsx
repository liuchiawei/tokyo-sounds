// src/components/quiz/AnswerOption.tsx
// 回答選択肢用のコンポーネント - Component for an answer option

import React from 'react';
import { useQuizStore } from '@/stores/quiz-store';

interface AnswerOptionProps {
  optionText: string;
  optionId: string;
}

/**
 * 単一の回答選択肢を表示するボタンコンポーネント - A button component to display a single answer option
 * @param {AnswerOptionProps} props - The props for the component
 * @returns {JSX.Element}
 */
export default function AnswerOption({ optionText, optionId }: AnswerOptionProps): React.JSX.Element {
  const { answerQuestion, selectedAnswer, showFeedback, feedback } = useQuizStore();

  // 選択とフィードバック状態に基づいてスタイルを決定 - Determine the style based on selection and feedback status
  const getButtonClass = () => {
    if (showFeedback && selectedAnswer === optionId) {
      // フィードバックが表示されており、このオプションが選択されている場合 - If feedback is shown and this option was selected
      if (feedback === '正解！') {
        // 正解 - Correct answer
        return "w-full p-3 my-1 rounded-xl text-left text-white transition-all duration-300 bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/20";
      } else {
        // 不正解 - Incorrect answer
        return "w-full p-3 my-1 rounded-xl text-left text-white transition-all duration-300 bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/20";
      }
    } else {
      // ホバー効果付きのデフォルトスタイル - Default style with hover effects
      return "w-full p-3 my-1 rounded-xl text-left text-white transition-all duration-300 bg-gray-700 hover:bg-blue-600 hover:scale-[1.02] border border-gray-600 hover:border-blue-500 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30";
    }
  };

  return (
    <button
      className={getButtonClass()}
      onClick={() => answerQuestion(optionId)}
      disabled={showFeedback} // 回答が選択された後にボタンを無効化 - Disable buttons after answer is selected
    >
      <span className="text-sm">{optionText}</span>
    </button>
  );
}
