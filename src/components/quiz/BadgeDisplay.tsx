// src/components/quiz/BadgeDisplay.tsx
// バッジ表示用のコンポーネント

import React from 'react';
import { Badge } from '@/types/quiz';

interface BadgeDisplayProps {
  badge: Badge;
}

/**
 * 単一のバッジを表示するコンポーネント
 * @param {BadgeDisplayProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element}
 */
export default function BadgeDisplay({ badge }: BadgeDisplayProps): React.JSX.Element {
  return (
    <div className={`p-4 bg-gradient-to-br ${badge.color} rounded-xl border border-slate-700/50 shadow-lg flex flex-col items-center transition-transform duration-300 hover:scale-105 max-w-[220px]`}>
      <div className="text-4xl mb-2">{badge.icon}</div>
      <h3 className="text-lg font-bold text-white mb-1 text-center">{badge.name}</h3>
      <p className="text-slate-200 text-xs text-center">{badge.description}</p>
      <div className="mt-2 text-xs text-slate-300 bg-slate-900/50 px-2 py-0.5 rounded-full">
        {badge.minScore}-{badge.maxScore} ポイント
      </div>
    </div>
  );
}