import { Badge } from '../types/quiz';

// 東京サウンドズクイズで利用可能なすべてのバッジを定義
export const BADGES: Badge[] = [
  {
    id: 'station-commuter',
    name: '駅の利用者',
    description: '東京の地区を案内し始めています',
    icon: '🚂', // 電車の絵文字
    minScore: 0,
    maxScore: 25,
    color: 'from-gray-600 to-gray-800' // 低達成度用グレー
  },
  {
    id: 'city-hopper',
    name: '街の探索者',
    description: '複数の東京の街を把握してきています',
    icon: '🚇', // 地下鉄・メトロの絵文字
    minScore: 26,
    maxScore: 50,
    color: 'from-blue-500 to-blue-700' // 中程度達成度用ブルー
  },
  {
    id: 'metro-explorer',
    name: 'メトロ探検家',
    description: '東京のランドマークと文化に精通しています',
    icon: '🏙️', // 街の絵文字
    minScore: 51,
    maxScore: 75,
    color: 'from-green-500 to-green-700' // 良好な達成度用グリーン
  },
  {
    id: 'urban-navigator',
    name: '都市ナビゲーター',
    description: '東京の隠れた名所を発見する達人',
    icon: '🧭', // コンパスの絵文字
    minScore: 76,
    maxScore: 89,
    color: 'from-indigo-500 to-indigo-700' // 高達成度用インディゴ
  },
  {
    id: 'sound-seeker',
    name: 'サウンド探求者',
    description: '東京のサウンドスケープの達人',
    icon: '🔊', // 音量の絵文字
    minScore: 90,
    maxScore: 99,
    color: 'from-amber-500 to-amber-700' // 非常に良い達成度用アンバー
  },
  {
    id: 'tokyo-sound-master',
    name: '東京サウンドマスター',
    description: '究極の東京探検家とオーディオ専門家',
    icon: '🏆', // トロフィーの絵文字
    minScore: 100,
    maxScore: 100,
    color: 'from-yellow-400 to-yellow-600' // 完璧な達成度用イエロー/ゴールド
  }
];

// スコアに基づいて獲得するバッジを判定する関数
export const getBadgeByScore = (score: number): Badge => {
  // スコア範囲に一致するバッジを探す
  for (const badge of BADGES) {
    if (score >= badge.minScore && score <= badge.maxScore) {
      return badge;
    }
  }
  
  // バッジが一致しない場合（適切な範囲では発生しないはず）、最初のバッジを返す
  return BADGES[0];
};