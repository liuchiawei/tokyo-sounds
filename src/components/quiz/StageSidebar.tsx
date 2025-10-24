'use client';
// src/components/quiz/StageSidebar.tsx
// ステージサイドバー表示用のコンポーネント - Component for displaying the stage sidebar

import React from "react";
import { useQuizStore } from "@/stores/quiz-store";
import { Swords, BarChart3, Star, ChevronRight } from "lucide-react";

interface StageSidebarProps {
  // ステージサイドバーに必要なプロパティを追加 - Add any props that the StageSidebar component might need
  // 現在は空 - Currently empty as the component will get all necessary data from the store
  [key: string]: any; // Allow any properties to satisfy the linter rule
}

/**
 * ステージサイドバーを表示するコンポーネント - A component to display the sidebar with stages and their status
 * @param {StageSidebarProps} props - The props for the component
 * @returns {JSX.Element}
 */
export default function StageSidebar({}: StageSidebarProps): React.JSX.Element {
  const { gameStarted, gameCompleted, score, currentStage, answeredQuestions } = useQuizStore();

  // 回答された全質問数に基づいた全体の進捗を計算（全60問のうち） - Calculate overall progress based on total questions answered (out of 60 total questions)
  // 各ステージには12問、5ステージ = 合計60問 - Each stage has 12 questions, 5 stages = 60 total questions
  const totalQuestions = 60; 
  const questionsAnswered = answeredQuestions.length;
  const progressPercentage = Math.min(100, Math.round((questionsAnswered / totalQuestions) * 100));

  // 難易度インジケーター付きのステージラベル - Stage labels with difficulty indicators
  const stages = [
    { number: 1, label: "初心者", color: "bg-blue-500", gradient: "from-blue-700/40 to-blue-900/40" },
    { number: 2, label: "中級者", color: "bg-green-500", gradient: "from-green-700/40 to-green-900/40" },
    { number: 3, label: "上級者", color: "bg-yellow-500", gradient: "from-yellow-700/40 to-yellow-900/40" },
    { number: 4, label: "エキスパート", color: "bg-orange-500", gradient: "from-orange-700/40 to-orange-900/40" },
    { number: 5, label: "マスター", color: "bg-red-500", gradient: "from-red-700/40 to-red-900/40" },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700/50">
      {/* Header with title, current stage and score */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl w-10 h-10 flex items-center justify-center text-lg mr-4 shadow-lg">
            <Swords size={24} />
          </span>
          東京クイズ
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="text-sm text-slate-300 bg-slate-800/60 p-2 rounded-lg flex items-center">
            <BarChart3 size={18} className="mr-2 text-blue-400" />
            <div>
              <div className="text-slate-400">ステージ</div>
              <div className="font-bold text-blue-300">レベル {currentStage}</div>
            </div>
          </div>
          <div className="text-sm text-slate-300 bg-slate-800/60 p-2 rounded-lg flex items-center">
            <Star size={18} className="mr-2 text-emerald-400" />
            <div>
              <div className="text-slate-400">スコア</div>
              <div className="font-bold text-emerald-400">[{score}/100]</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-5 py-3 border-b border-slate-700 bg-slate-800/40">
        <div className="flex justify-between text-sm text-slate-300 mb-2">
          <span className="font-semibold">全体の進捗</span>
          <span className="font-bold text-blue-300">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-md"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-slate-400 text-center">
          {questionsAnswered} / {totalQuestions} 問が回答済み
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex-1 p-3 bg-gradient-to-b from-slate-900/30 to-slate-950/40">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-300 mb-1 px-1">ステージ</h3>
          {stages.map((stage) => {
            const isCurrent = stage.number === currentStage;
            const isCompleted = stage.number < currentStage;
            
            return (
              <div 
                key={stage.number}
                className={`p-1 rounded-xl transition-all duration-300 border ${ 
                  isCurrent 
                    ? "bg-gradient-to-br from-blue-800/50 to-indigo-800/50 border-blue-500/60 shadow-lg shadow-blue-500/20" 
                    : isCompleted
                      ? "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/60"
                      : "bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/40"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${stage.color} shadow-md ${isCurrent ? 'animate-pulse' : ''}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className={`font-bold ${isCurrent ? 'text-blue-200' : isCompleted ? 'text-slate-200' : 'text-slate-300'}`}>
                        ステージ {stage.number}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ 
                        isCurrent ? 'bg-blue-900/70 text-blue-200' : 
                        isCompleted ? 'bg-slate-700/80 text-slate-200' : 
                        'bg-slate-800/70 text-slate-400'
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                    {isCurrent && (
                      <div className="mt-2 text-xs text-blue-300 flex items-center">
                        <ChevronRight size={16} className="mr-1" />
                        現在のステージ
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion indicator */}
      <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700">
        <div className="text-center">
          <div className="text-slate-300 font-medium">東京クイズ</div>
          <div className={`text-xs mt-1.5 px-3 py-1.5 rounded-full inline-block ${ 
            gameStarted && !gameCompleted ? "bg-amber-900/50 text-amber-300" : 
            gameCompleted ? "bg-emerald-900/50 text-emerald-300" : "bg-slate-700/50 text-slate-300"
          }`}> 
            {gameStarted && !gameCompleted ? "進行中" : 
             gameCompleted ? "完了" : "準備完了"}
          </div>
        </div>
      </div>
    </div>
  );
}