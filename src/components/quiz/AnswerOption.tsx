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
  const { answerQuestion, selectedAnswer, showFeedback, feedback, showQuestionDetails } = useQuizStore();

  // 選択とフィードバック状態に基づいてスタイルを決定 - Determine the style based on selection and feedback status
  const getButtonClass = () => {
    if (showFeedback && selectedAnswer === optionId) {
      // フィードバックが表示されており、このオプションが選択されている場合 - If feedback is shown and this option was selected
      if (feedback === '正解！') {
        // 正解 - Correct answer
        return "w-full py-2.5 px-3 my-1 rounded-lg text-left text-white transition-all duration-200 bg-green-600/80 border border-green-500/70";
      } else {
        // 不正解 - Incorrect answer
        return "w-full py-2.5 px-3 my-1 rounded-lg text-left text-white transition-all duration-200 bg-red-600/80 border border-red-500/70";
      }
    } else {
      // ホバー効果付きのデフォルトスタイル - Default style with hover effects
      return "w-full py-2.5 px-3 my-1 rounded-lg text-left text-white transition-all duration-200 bg-slate-700/70 border border-slate-600 hover:bg-blue-600/80 hover:border-blue-500";
    }
  };

  return (
    <button
      className={getButtonClass()}
      onClick={() => answerQuestion(optionId)}
      disabled={showFeedback || showQuestionDetails} // 回答が選択された後にボタンを無効化 - Disable buttons after answer is selected or question details are shown
    >
      <span className="text-sm">{optionText}</span>
    </button>
  );
}
