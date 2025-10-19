// src/components/quiz/QuizGame.tsx
// クイズゲームのメインコンポーネント - Main component for the Quiz Game

import React, { useEffect } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import QuestionDisplay from './QuestionDisplay';
import AnswerOption from './AnswerOption';
import { CheckCircle, ArrowRightCircle } from 'lucide-react';

/**
 * クイズゲームのメインコンポーネント - Main container for the quiz game UI, designed to fit within the side panel
 * @returns {JSX.Element}
 */
export default function QuizGame(): React.JSX.Element {
  const { gameStarted, gameCompleted, currentStage, currentQuestions, currentQuestionIndex, showFeedback, score, readyForNextLocation, proceedToNextLocation, answerQuestion, currentLocationIndex } = useQuizStore();

  // キーボードイベントを処理 - Handle keyboard events
  useEffect(() => {
    // 回答選択用のキーボードイベントリスナーを設定 - Set up keyboard event listener for answer selection
    const handleKeyDown = (e: KeyboardEvent) => {
      // 回答選択は1-4キーで行う - Answer selection using keys 1-4
      if (e.key >= '1' && e.key <= '4' && !showFeedback) {
        const optionIndex = parseInt(e.key) - 1; // Convert to 0-based index
        const currentQuestion = currentQuestions[currentQuestionIndex];
        if (currentQuestion && optionIndex < currentQuestion.options.length) {
          answerQuestion(currentQuestion.options[optionIndex].id);
        }
      }
    };

    // イベントリスナーを追加 - Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // クリーンアップ関数でイベントリスナーを削除 - Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, currentQuestions, showFeedback, answerQuestion]);

  // ゲームがまだ開始されていない場合、説明メッセージを表示 - If the game hasn't started yet, show an instructional message
  if (!gameStarted) {
    return (
      <div className="w-full text-center p-4">
        <div className="mb-6 p-5 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-700/50 shadow-xl">
          <h1 className="text-2xl font-bold text-blue-300 mb-2">東京サウンド クイズ</h1>
          <div className="text-sm text-blue-200 mt-2">東京のランドマークを探検して、クイズで学びましょう！</div>
          <div className="text-sm mt-2 text-blue-300 font-medium">キー 1-4 で回答を選択してください</div>
        </div>
        <div className="text-gray-300 p-4 rounded-xl bg-gray-800/30">
          <p className="mb-3">3Dシーン内の任意のランドマークをクリックしてクイズを開始してください。</p>
          <div className="mt-4 text-blue-400">
            <p>モデル内の建物や店舗、その他のランドマークをクリックしてみてください。</p>
          </div>
        </div>
      </div>
    );
  }

  // ゲームが完了した場合、完了メッセージを表示 - If the game is completed, show the completion message
  if (gameCompleted) {
    return (
      <div className="w-full text-center p-4">
        <div className="mb-8 p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-700/50 shadow-xl">
          <h1 className="text-3xl font-bold text-green-400 mb-4">🎉 クイズ完了！ 🎉</h1>
          <p className="text-xl text-white mb-4">お疲れ様でした！</p>
          <p className="text-2xl font-bold text-blue-300 mt-4">最終スコア: <span className="font-mono bg-blue-900/50 px-3 py-1 rounded-full">[{score}/100]</span></p>
        </div>
        <button
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-lg"
          onClick={() => {
            useQuizStore.getState().resetGame();
          }}
        >
          クイズをリセット
        </button>
      </div>
    );
  }

  // 現在のロケーションのすべての質問が完了し、まだ次のロケーションに進んでいない場合 - If user has completed all questions at current location but not yet proceeded
  if (readyForNextLocation) {
    const locationSequence = ['東京', '渋谷', '新宿', '浅草'];
    const isLastLocationInStage = currentLocationIndex === locationSequence.length - 1;

    let nextStepLabel = "次のロケーション";
    let nextStepValue = "";

    if (isLastLocationInStage) {
      if (currentStage < 5) {
        nextStepLabel = "次のステージ";
        nextStepValue = `レベル ${currentStage + 1}`;
      } else {
        nextStepLabel = "ゲーム";
        nextStepValue = "完了";
      }
    } else {
      nextStepValue = locationSequence[currentLocationIndex + 1];
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-sm p-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 transform animate-slide-up">
          
          {/* Header with Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/30">
              <CheckCircle size={32} className="text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200 mb-2">
            ロケーションクリア
          </h1>
          
          <p className="text-base text-slate-400 mb-6">
            あなたはこのエリアをマスターしました。
          </p>
          
          {/* Stats/Info */}
          <div className="my-6 px-4 py-3 bg-slate-700/20 rounded-lg border border-slate-600/30 flex justify-around items-center">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase">スコア</p>
              <p className="text-xl font-bold text-emerald-400">{score}</p>
            </div>
            <div className="border-l border-slate-600/30 h-8"></div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase">{nextStepLabel}</p>
              <p className="text-xl font-bold text-blue-400">{nextStepValue}</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:scale-105 flex items-center justify-center"
            onClick={proceedToNextLocation}
          >
            <ArrowRightCircle size={20} className="mr-2" />
            進む
          </button>
        </div>
      </div>
    );
  }

  // それ以外の場合は、現在の質問と回答オプションを表示 - Otherwise, show the current question and answer options
  const currentQuestion = currentQuestions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="text-white text-center py-8">
        <div className="animate-pulse">問題を読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-1">
      {/* スコアとステージ表示 - Score and stage display */}
      <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-blue-300">
            ステージ: <span className="font-mono bg-blue-900/50 px-2 py-0.5 rounded">レベル {currentStage}</span>
          </div>
          <div className="text-sm font-medium text-blue-300">
            スコア: <span className="font-mono bg-blue-900/50 px-2 py-0.5 rounded">[{score}/100]</span>
          </div>
        </div>
      </div>
      
      {/* 質問表示 - Question display */}
      <div className="mt-4">
        <QuestionDisplay />
      </div>
      
      {/* フィードバック表示 - Feedback message when showing feedback */}
      {showFeedback && (
        <div className={`mt-3 p-2.5 rounded-lg text-center font-bold text-sm ${useQuizStore.getState().feedback === '正解！' ? 'bg-gradient-to-r from-green-800/60 to-emerald-800/60 text-green-300 border border-green-600/50' : 'bg-gradient-to-r from-red-800/60 to-rose-800/60 text-red-300 border border-red-600/50'}`}>
          {useQuizStore.getState().feedback}
        </div>
      )}
      
      {/* 回答オプション - Answer options */}
      <div className="flex-1 space-y-2 py-3 my-3">
        {currentQuestion.options.map((option, index) => (
          <AnswerOption 
            key={option.id} 
            optionId={option.id} 
            optionText={`${index + 1}. ${option.text}`} 
          />
        ))}
      </div>
      
      {/* 進行状況インジケーター - Progress indicator */}
      <div className="text-xs text-gray-400 text-center p-2 bg-gray-800/40 rounded">
        問 {currentQuestionIndex + 1}/{currentQuestions.length} | {Math.round(((currentQuestionIndex + 1) / currentQuestions.length) * 100)}% ロケーション内
      </div>
    </div>
  );
}
