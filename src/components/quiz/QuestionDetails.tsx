// src/components/quiz/QuestionDetails.tsx
// クイズの質問詳細を表示するコンポーネント - Component for displaying question details after answering

import React from 'react';
import Image from 'next/image';
import { QuizQuestion } from '@/types/quiz';
import { useQuizStore } from '@/stores/quiz-store';
import { Info, Image as ImageIcon, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface QuestionDetailsProps {
  question: QuizQuestion;
  selectedOptionId: string;
}

/**
 * 質問の詳細を表示するコンポーネント - Component to display question details after answering
 * @param {QuestionDetailsProps} props - The props for the component
 * @returns {JSX.Element}
 */
export default function QuestionDetails({ question, selectedOptionId }: QuestionDetailsProps): React.JSX.Element {
  const { goToNextQuestion } = useQuizStore();
  
  // Find the selected option and correct option
  const selectedOption = question.options.find(option => option.id === selectedOptionId);
  const correctOption = question.options.find(option => option.isCorrect);

  // Determine if the selected answer is correct
  const isCorrect = selectedOption?.isCorrect || false;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Header with status indicator */}
      <div className={`p-4 border-b ${isCorrect ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isCorrect ? (
              <CheckCircle className="text-green-400" size={24} />
            ) : (
              <XCircle className="text-red-400" size={24} />
            )}
          </div>
          <div className="ml-3">
            <h2 className="text-xl font-bold text-white">
              {isCorrect ? '正解！' : '不正解'}
            </h2>
            <p className="text-slate-300 text-sm">
              {isCorrect ? '素晴らしいです！' : '次は正解を目指しましょう'}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Question text */}
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">問題:</h3>
          <p className="text-white p-3 bg-slate-700/40 rounded-lg border border-slate-600">
            {question.text}
          </p>
        </div>

        {/* Image section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <ImageIcon className="mr-2 text-slate-400" size={18} />
            関連画像
          </h3>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {question.image ? (
              <Image 
                src={question.image} 
                alt="Question related image"
                className="w-full h-40 object-cover"
                width={400}
                height={160}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  // For Next.js Image, we need to handle fallback differently
                  // We'll set a state value to show fallback, but that would require more changes
                  // For now, we'll just let it show the broken image icon if there's an issue
                }}
                unoptimized={true} // Since we're using dynamic image paths, we set unoptimized to true
              />
            ) : (
              <div className="bg-slate-700 border border-slate-600 w-full h-40 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon size={32} className="mx-auto text-slate-500" />
                  <p className="text-sm text-slate-400 mt-2">画像が見つかりません</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison of answers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selected answer */}
          <div className={`p-3 rounded-lg border ${isCorrect ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center">
              {isCorrect ? (
                <CheckCircle className="mr-2 text-green-400" size={16} />
              ) : (
                <XCircle className="mr-2 text-red-400" size={16} />
              )}
              あなたの回答
            </h4>
            <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {selectedOption?.text}
            </p>
          </div>
          
          {/* Correct answer */}
          <div className="p-3 bg-blue-900/10 rounded-lg border border-blue-500/50">
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center">
              <CheckCircle className="mr-2 text-blue-400" size={16} />
              正しい答え
            </h4>
            <p className="font-medium text-blue-300">{correctOption?.text}</p>
          </div>
        </div>

        {/* Explanation section */}
        <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
          <h4 className="font-semibold text-slate-300 mb-2 flex items-center">
            <Info className="mr-2 text-blue-400" size={16} />
            解説
          </h4>
          <p className="text-slate-200">
            {question.text}に関する質問の正解は「{correctOption?.text}」です。
            {isCorrect 
              ? ' あなたの答えは正解でした！素晴らしいです！' 
              : ` 次回は「${correctOption?.text}」を選んでみてください。`}
          </p>
        </div>

        {/* Interesting facts section */}
        <div className="p-3 bg-amber-900/10 rounded-lg border border-amber-700/50">
          <h4 className="font-semibold text-slate-300 mb-2 flex items-center">
            <Info className="mr-2 text-amber-400" size={16} />
            興味深い豆知識
          </h4>
          <p className="text-slate-200">
            {question.interestingFacts || 'この質問に関する豆知識は現在ありません。'}
          </p>
        </div>
      </div>

      {/* Continue button at the bottom */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={goToNextQuestion}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center"
        >
          <RotateCcw className="mr-2" size={18} />
          次の問題へ進む
        </button>
      </div>
    </div>
  );
}