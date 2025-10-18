// src/components/quiz/QuestionDisplay.tsx
// 質問表示用のコンポーネント - Component for displaying a question

import React from 'react';

interface QuestionDisplayProps {
  questionText: string;
}

/**
 * 質問のテキストを表示するコンポーネント
 * A component to display the text of the current quiz question.
 * @param {QuestionDisplayProps} props - The props for the component.
 * @returns {JSX.Element}
 */
export default function QuestionDisplay({ questionText }: QuestionDisplayProps): React.JSX.Element {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{questionText}</h2>
    </div>
  );
}
