// src/components/quiz/AnswerOption.tsx
// 回答選択肢用のコンポーネント - Component for an answer option

import React from 'react';

interface AnswerOptionProps {
  optionText: string;
  // onClick will be added in a later task
  // onClick: () => void; 
}

/**
 * 単一の回答選択肢を表示するボタンコンポーネント
 * A button component to display a single answer option.
 * @param {AnswerOptionProps} props - The props for the component.
 * @returns {JSX.Element}
 */
export default function AnswerOption({ optionText }: AnswerOptionProps): React.JSX.Element {
  return (
    <button
      className="w-full p-3 my-2 bg-gray-700 hover:bg-blue-600 rounded-lg text-left text-white transition-colors duration-200"
      // onClick={onClick} // To be implemented in Task 6
    >
      {optionText}
    </button>
  );
}
