// src/data/quiz-data.ts
// クイズゲームのデータ - Quiz game data
import { QuizStage, QuizQuestion } from '../types/quiz';

// クイズのサンプルデータ - Sample quiz data

// Tokyo landmark-specific questions
const rainbowBridgeQuestions: QuizQuestion[] = [
  {
    id: 'rb-1',
    text: 'レインボーブリッジの正式名称は何ですか？',
    location: 'rainbow-bridge',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'rb-1-opt1', text: '首都高速11号台場線・東京港連絡橋', isCorrect: true },
      { id: 'rb-1-opt2', text: '東京湾横断橋', isCorrect: false },
      { id: 'rb-1-opt3', text: '東京湾架空橋', isCorrect: false },
      { id: 'rb-1-opt4', text: 'お台場大橋', isCorrect: false }
    ]
  },
  {
    id: 'rb-2',
    text: 'レインボーブリッジの全長は約何メートルですか？',
    location: 'rainbow-bridge',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'rb-2-opt1', text: '650メートル', isCorrect: false },
      { id: 'rb-2-opt2', text: '798メートル', isCorrect: true },
      { id: 'rb-2-opt3', text: '910メートル', isCorrect: false },
      { id: 'rb-2-opt4', text: '1120メートル', isCorrect: false }
    ]
  },
  {
    id: 'rb-3',
    text: 'レインボーブリッジの開通年はいつですか？',
    location: 'rainbow-bridge',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'rb-3-opt1', text: '1989年', isCorrect: false },
      { id: 'rb-3-opt2', text: '1993年', isCorrect: true },
      { id: 'rb-3-opt3', text: '1997年', isCorrect: false },
      { id: 'rb-3-opt4', text: '2001年', isCorrect: false }
    ]
  }
];

const tokyoTowerQuestions: QuizQuestion[] = [
  {
    id: 'tt-1',
    text: '東京タワーの高さは約何メートルですか？',
    location: 'tokyo-tower',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'tt-1-opt1', text: '333メートル', isCorrect: true },
      { id: 'tt-1-opt2', text: '350メートル', isCorrect: false },
      { id: 'tt-1-opt3', text: '315メートル', isCorrect: false },
      { id: 'tt-1-opt4', text: '365メートル', isCorrect: false }
    ]
  },
  {
    id: 'tt-2',
    text: '東京タワーの建設が完了したのは何年ですか？',
    location: 'tokyo-tower',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'tt-2-opt1', text: '1957年', isCorrect: false },
      { id: 'tt-2-opt2', text: '1958年', isCorrect: true },
      { id: 'tt-2-opt3', text: '1960年', isCorrect: false },
      { id: 'tt-2-opt4', text: '1962年', isCorrect: false }
    ]
  }
];

const shibuyaCrossingQuestions: QuizQuestion[] = [
  {
    id: 'sc-1',
    text: '渋谷スクランブル交差点の象徴的な像は何ですか？',
    location: 'shibuya-crossing',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'sc-1-opt1', text: '忠犬ハチ公像', isCorrect: true },
      { id: 'sc-1-opt2', text: '渋谷人像', isCorrect: false },
      { id: 'sc-1-opt3', text: '忠犬八公像', isCorrect: false },
      { id: 'sc-1-opt4', text: '忠犬ハチ公銅像', isCorrect: false }
    ]
  },
  {
    id: 'sc-2',
    text: '渋谷スクランブル交差点はどの駅の前にありますか？',
    location: 'shibuya-crossing',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'sc-2-opt1', text: '新宿駅', isCorrect: false },
      { id: 'sc-2-opt2', text: '渋谷駅', isCorrect: true },
      { id: 'sc-2-opt3', text: '原宿駅', isCorrect: false },
      { id: 'sc-2-opt4', text: '代官山駅', isCorrect: false }
    ]
  }
];

const shinjukuQuestions: QuizQuestion[] = [
  {
    id: 'sj-1',
    text: '日本の最も利用者数が多い駅はどこですか？',
    location: 'shinjuku',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'sj-1-opt1', text: '東京駅', isCorrect: false },
      { id: 'sj-1-opt2', text: '新宿駅', isCorrect: true },
      { id: 'sj-1-opt3', text: '渋谷駅', isCorrect: false },
      { id: 'sj-1-opt4', text: '池袋駅', isCorrect: false }
    ]
  },
  {
    id: 'sj-2',
    text: '新宿歌舞伎町はどの区にありますか？',
    location: 'shinjuku',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'sj-2-opt1', text: '千代田区', isCorrect: false },
      { id: 'sj-2-opt2', text: '文京区', isCorrect: false },
      { id: 'sj-2-opt3', text: '新宿区', isCorrect: true },
      { id: 'sj-2-opt4', text: '港区', isCorrect: false }
    ]
  }
];

const imperialPalaceQuestions: QuizQuestion[] = [
  {
    id: 'ip-1',
    text: '皇居の東側にある庭園の名前は？',
    location: 'imperial-palace',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'ip-1-opt1', text: '日比谷公園', isCorrect: false },
      { id: 'ip-1-opt2', text: '皇居東御苑', isCorrect: true },
      { id: 'ip-1-opt3', text: '千鳥ヶ淵', isCorrect: false },
      { id: 'ip-1-opt4', text: '北の丸公園', isCorrect: false }
    ]
  },
  {
    id: 'ip-2',
    text: '皇居の敷地面積は約何平方キロメートルですか？',
    location: 'imperial-palace',
    difficulty: 3,
    points: 20,
    options: [
      { id: 'ip-2-opt1', text: '2.3平方キロメートル', isCorrect: false },
      { id: 'ip-2-opt2', text: '3.7平方キロメートル', isCorrect: true },
      { id: 'ip-2-opt3', text: '4.1平方キロメートル', isCorrect: false },
      { id: 'ip-2-opt4', text: '5.2平方キロメートル', isCorrect: false }
    ]
  }
];

const asakusaQuestions: QuizQuestion[] = [
  {
    id: 'as-1',
    text: '浅草寺の正式名称は何ですか？',
    location: 'asakusa',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'as-1-opt1', text: '金龍山浅草寺', isCorrect: true },
      { id: 'as-1-opt2', text: '観音山浅草寺', isCorrect: false },
      { id: 'as-1-opt3', text: '浅草観音寺', isCorrect: false },
      { id: 'as-1-opt4', text: '雷門山浅草寺', isCorrect: false }
    ]
  },
  {
    id: 'as-2',
    text: '浅草寺の仁王門の正式名称は何ですか？',
    location: 'asakusa',
    difficulty: 3,
    points: 20,
    options: [
      { id: 'as-2-opt1', text: '風神門', isCorrect: false },
      { id: 'as-2-opt2', text: '雷門', isCorrect: true },
      { id: 'as-2-opt3', text: '不動門', isCorrect: false },
      { id: 'as-2-opt4', text: '金龍門', isCorrect: false }
    ]
  }
];

const tokyoSkytreeQuestions: QuizQuestion[] = [
  {
    id: 'ts-1',
    text: '東京スカイツリーの高さは正確に何メートルですか？',
    location: 'tokyo-skytree',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'ts-1-opt1', text: '628メートル', isCorrect: false },
      { id: 'ts-1-opt2', text: '634メートル', isCorrect: true },
      { id: 'ts-1-opt3', text: '645メートル', isCorrect: false },
      { id: 'ts-1-opt4', text: '655メートル', isCorrect: false }
    ]
  },
  {
    id: 'ts-2',
    text: '東京スカイツリーが完成したのは何年ですか？',
    location: 'tokyo-skytree',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'ts-2-opt1', text: '2010年', isCorrect: false },
      { id: 'ts-2-opt2', text: '2011年', isCorrect: false },
      { id: 'ts-2-opt3', text: '2012年', isCorrect: true },
      { id: 'ts-2-opt4', text: '2013年', isCorrect: false }
    ]
  }
];

const houseQuestions: QuizQuestion[] = [
  {
    id: 'h-1',
    text: '日本の伝統的な住宅形式は何ですか？',
    location: 'house',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'h-1-opt1', text: 'マンション', isCorrect: false },
      { id: 'h-1-opt2', text: 'アパート', isCorrect: false },
      { id: 'h-1-opt3', text: '和風住宅', isCorrect: true },
      { id: 'h-1-opt4', text: 'タウンハウス', isCorrect: false }
    ]
  },
  {
    id: 'h-2',
    text: '日本の住宅の特徴的な床は何ですか？',
    location: 'house',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'h-2-opt1', text: '畳', isCorrect: true },
      { id: 'h-2-opt2', text: 'カーペット', isCorrect: false },
      { id: 'h-2-opt3', text: 'フローリング', isCorrect: false },
      { id: 'h-2-opt4', text: 'タイル', isCorrect: false }
    ]
  }
];

const shopQuestions: QuizQuestion[] = [
  {
    id: 'sh-1',
    text: '日本の繁華街でよく見られる小型商業店舗の形式は何ですか？',
    location: 'shop',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'sh-1-opt1', text: 'ショッピングモール', isCorrect: false },
      { id: 'sh-1-opt2', text: 'デパート', isCorrect: false },
      { id: 'sh-1-opt3', text: '立ち飲み屋', isCorrect: false },
      { id: 'sh-1-opt4', text: 'ショッピングストリート', isCorrect: true }
    ]
  },
  {
    id: 'sh-2',
    text: '日本の商店街の特徴は何ですか？',
    location: 'shop',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'sh-2-opt1', text: '一棟建ての建物が多い', isCorrect: false },
      { id: 'sh-2-opt2', text: '露天商が中心', isCorrect: false },
      { id: 'sh-2-opt3', text: '歩行者天国が多い', isCorrect: false },
      { id: 'sh-2-opt4', text: '屋根付きのアーケードがある', isCorrect: true }
    ]
  }
];

const buildingQuestions: QuizQuestion[] = [
  {
    id: 'b-1',
    text: '東京で最も高い建築物はどれですか？',
    location: 'building',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'b-1-opt1', text: '東京タワー', isCorrect: false },
      { id: 'b-1-opt2', text: '東京スカイツリー', isCorrect: true },
      { id: 'b-1-opt3', text: '霞が関ビル', isCorrect: false },
      { id: 'b-1-opt4', text: '六本木ヒルズ', isCorrect: false }
    ]
  },
  {
    id: 'b-2',
    text: '日本のオフィスビルに特徴的な共通スペースは何ですか？',
    location: 'building',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'b-2-opt1', text: '中庭', isCorrect: false },
      { id: 'b-2-opt2', text: 'ターミナル', isCorrect: false },
      { id: 'b-2-opt3', text: 'フロア', isCorrect: false },
      { id: 'b-2-opt4', text: '空中庭園', isCorrect: true }
    ]
  }
];

const apartmentQuestions: QuizQuestion[] = [
  {
    id: 'a-1',
    text: '東京の集合住宅の一般的な形態は何ですか？',
    location: 'apartment',
    difficulty: 1,
    points: 10,
    options: [
      { id: 'a-1-opt1', text: '戸建て', isCorrect: false },
      { id: 'a-1-opt2', text: 'マンション', isCorrect: true },
      { id: 'a-1-opt3', text: 'テラスハウス', isCorrect: false },
      { id: 'a-1-opt4', text: 'ロフト', isCorrect: false }
    ]
  },
  {
    id: 'a-2',
    text: '日本のアパートメントに特徴的な設備は何か？',
    location: 'apartment',
    difficulty: 2,
    points: 15,
    options: [
      { id: 'a-2-opt1', text: '暖房システム', isCorrect: false },
      { id: 'a-2-opt2', text: '風呂釜', isCorrect: false },
      { id: 'a-2-opt3', text: 'ユニットバス', isCorrect: true },
      { id: 'a-2-opt4', text: 'キッチン', isCorrect: false }
    ]
  }
];

// Mapping of 3D model object names to their specific questions
export const landmarkSpecificQuestions: Record<string, QuizQuestion[]> = {
  'rainbow-bridge': rainbowBridgeQuestions,
  'tokyo-tower': tokyoTowerQuestions,
  'shibuya-crossing': shibuyaCrossingQuestions,
  'shinjuku': shinjukuQuestions,
  'imperial-palace': imperialPalaceQuestions,
  'asakusa': asakusaQuestions,
  'tokyo-skytree': tokyoSkytreeQuestions,
  'house': houseQuestions,
  'shop': shopQuestions,
  'building': buildingQuestions,
  'apartment': apartmentQuestions,
  // 3D Model specific node names (for direct mesh interactions)
  'House_World_ap_0': houseQuestions,       // Represents a house in the 3D model
  'House_2_World_ap_0': apartmentQuestions, // Represents an apartment in the 3D model
  'House_3_World_ap_0': buildingQuestions,  // Represents a building in the 3D model
  'Shop_World_ap_0': shopQuestions,         // Represents a shop in the 3D model
  // Simplified names used in InteractiveMesh components
  'House': houseQuestions,
  'Apartment': apartmentQuestions,
  'Building': buildingQuestions,
  'Shop': shopQuestions,
};

// Default stages for the quiz system
export const quizStages: QuizStage[] = [
  {
    id: 'stage-1',
    number: 1,
    name: '東京湾岸エリア',
    description: '東京湾岸エリアの基本的なランドマークについての質問',
    location: 'rainbow-bridge',
    questions: rainbowBridgeQuestions
  },
  {
    id: 'stage-2',
    number: 2,
    name: '新宿・渋谷エリア',
    description: '東京のビジネス・エンターテインメントエリアに関する質問',
    location: 'shinjuku-shibuya-area',
    questions: [...shinjukuQuestions, ...shibuyaCrossingQuestions]
  },
  {
    id: 'stage-3',
    number: 3,
    name: '銀座・皇居エリア',
    description: '東京の高級ショッピング・政治エリアに関する質問',
    location: 'imperial-palace',
    questions: imperialPalaceQuestions
  },
  {
    id: 'stage-4',
    number: 4,
    name: '浅草・上野エリア',
    description: '東京の伝統・文化エリアに関する応用的な質問',
    location: 'asakusa',
    questions: asakusaQuestions
  },
  {
    id: 'stage-5',
    number: 5,
    name: '東京スカイツリー・スカイツリータウン',
    description: '東京の最新のランドマークに関する専門的な質問',
    location: 'tokyo-skytree',
    questions: tokyoSkytreeQuestions
  }
];