// src/data/quiz-data.ts
// クイズゲームのデータ - Quiz game data
import { QuizStage } from '../types/quiz';

// クイズのサンプルデータ - Sample quiz data
export const quizStages: QuizStage[] = [
  {
    id: 'stage-1',
    number: 1,
    name: '東京湾岸エリア',
    description: '東京湾岸エリアの基本的なランドマークについての質問',
    location: 'rainbow-bridge',
    questions: [
      {
        id: 'q1-1',
        text: '東京湾岸エリアで最も有名なランドマークは何ですか？',
        location: 'rainbow-bridge',
        difficulty: 1,
        points: 10,
        options: [
          { id: 'q1-1-opt1', text: 'レインボーブリッジ', isCorrect: true },
          { id: 'q1-1-opt2', text: 'お台場海浜公園', isCorrect: false },
          { id: 'q1-1-opt3', text: 'フジテレビ本社ビル', isCorrect: false },
          { id: 'q1-1-opt4', text: '東京ビッグサイト', isCorrect: false }
        ]
      },
      {
        id: 'q1-2',
        text: 'レインボーブリッジが開通したのは何年ですか？',
        location: 'rainbow-bridge',
        difficulty: 1,
        points: 10,
        options: [
          { id: 'q1-2-opt1', text: '1989年', isCorrect: false },
          { id: 'q1-2-opt2', text: '1993年', isCorrect: true },
          { id: 'q1-2-opt3', text: '1997年', isCorrect: false },
          { id: 'q1-2-opt4', text: '2001年', isCorrect: false }
        ]
      },
      {
        id: 'q1-3',
        text: 'レインボーブリッジの正式名称は何ですか？',
        location: 'rainbow-bridge',
        difficulty: 1,
        points: 10,
        options: [
          { id: 'q1-3-opt1', text: '東京港横断橋', isCorrect: false },
          { id: 'q1-3-opt2', text: '首都高速11号台場線・東京港連絡橋', isCorrect: true },
          { id: 'q1-3-opt3', text: 'ベイブリッジ', isCorrect: false },
          { id: 'q1-3-opt4', text: '東京湾アクアライン', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'stage-2',
    number: 2,
    name: '新宿・渋谷エリア',
    description: '東京のビジネス・エンターテインメントエリアに関する質問',
    location: 'shinjuku-shibuya-area',
    questions: [
      {
        id: 'q2-1',
        text: '日本の最も利用者数が多い駅はどこですか？',
        location: 'shinjuku',
        difficulty: 2,
        points: 20,
        options: [
          { id: 'q2-1-opt1', text: '東京駅', isCorrect: false },
          { id: 'q2-1-opt2', text: '品川駅', isCorrect: false },
          { id: 'q2-1-opt3', text: '新宿駅', isCorrect: true },
          { id: 'q2-1-opt4', text: '池袋駅', isCorrect: false }
        ]
      },
      {
        id: 'q2-2',
        text: '渋谷スクランブル交差点の象徴的な像は何ですか？',
        location: 'shibuya-crossing',
        difficulty: 2,
        points: 20,
        options: [
          { id: 'q2-2-opt1', text: '忠犬ハチ公像', isCorrect: true },
          { id: 'q2-2-opt2', text: 'タカノヒトミ像', isCorrect: false },
          { id: 'q2-2-opt3', text: 'カブキザ像', isCorrect: false },
          { id: 'q2-2-opt4', text: '歌舞伎十八番像', isCorrect: false }
        ]
      },
      {
        id: 'q2-3',
        text: '新宿歌舞伎町が位置するのはどの区ですか？',
        location: 'shinjuku',
        difficulty: 2,
        points: 20,
        options: [
          { id: 'q2-3-opt1', text: '千代田区', isCorrect: false },
          { id: 'q2-3-opt2', text: '港区', isCorrect: false },
          { id: 'q2-3-opt3', text: '渋谷区', isCorrect: false },
          { id: 'q2-3-opt4', text: '新宿区', isCorrect: true }
        ]
      }
    ]
  },
  {
    id: 'stage-3',
    number: 3,
    name: '銀座・皇居エリア',
    description: '東京の高級ショッピング・政治エリアに関する質問',
    location: 'imperial-palace',
    questions: [
      {
        id: 'q3-1',
        text: '皇居の東側にある庭園の名前は？',
        location: 'imperial-palace',
        difficulty: 3,
        points: 30,
        options: [
          { id: 'q3-1-opt1', text: '新宿御苑', isCorrect: false },
          { id: 'q3-1-opt2', text: '上野恩賜公園', isCorrect: false },
          { id: 'q3-1-opt3', text: '皇居東御苑', isCorrect: true },
          { id: 'q3-1-opt4', text: '日比谷公園', isCorrect: false }
        ]
      },
      {
        id: 'q3-2',
        text: '銀座で最も古い百貨店はどれですか？',
        location: 'imperial-palace',
        difficulty: 3,
        points: 30,
        options: [
          { id: 'q3-2-opt1', text: '松屋', isCorrect: false },
          { id: 'q3-2-opt2', text: '三越', isCorrect: true },
          { id: 'q3-2-opt3', text: '高島屋', isCorrect: false },
          { id: 'q3-2-opt4', text: '阪急', isCorrect: false }
        ]
      },
      {
        id: 'q3-3',
        text: '皇居の敷地面積は約何平方キロメートルですか？',
        location: 'imperial-palace',
        difficulty: 3,
        points: 30,
        options: [
          { id: 'q3-3-opt1', text: '1.1平方キロメートル', isCorrect: false },
          { id: 'q3-3-opt2', text: '2.3平方キロメートル', isCorrect: false },
          { id: 'q3-3-opt3', text: '3.7平方キロメートル', isCorrect: true },
          { id: 'q3-3-opt4', text: '5.2平方キロメートル', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'stage-4',
    number: 4,
    name: '浅草・上野エリア',
    description: '東京の伝統・文化エリアに関する応用的な質問',
    location: 'asakusa',
    questions: [
      {
        id: 'q4-1',
        text: '浅草寺の正式名称は何ですか？',
        location: 'asakusa',
        difficulty: 4,
        points: 40,
        options: [
          { id: 'q4-1-opt1', text: '金龍山浅草寺', isCorrect: true },
          { id: 'q4-1-opt2', text: '観音山浅草寺', isCorrect: false },
          { id: 'q4-1-opt3', text: '浅草観音寺', isCorrect: false },
          { id: 'q4-1-opt4', text: '雷門山浅草寺', isCorrect: false }
        ]
      },
      {
        id: 'q4-2',
        text: '上野恩賜公園内にある美術館のうち最も歴史が古いのは？',
        location: 'asakusa',
        difficulty: 4,
        points: 40,
        options: [
          { id: 'q4-2-opt1', text: '東京都美術館', isCorrect: true },
          { id: 'q4-2-opt2', text: '国立西洋美術館', isCorrect: false },
          { id: 'q4-2-opt3', text: '東京国立近代美術館', isCorrect: false },
          { id: 'q4-2-opt4', text: '上野の森美術館', isCorrect: false }
        ]
      },
      {
        id: 'q4-3',
        text: '浅草寺の仁王門の正式名称は何ですか？',
        location: 'asakusa',
        difficulty: 4,
        points: 40,
        options: [
          { id: 'q4-3-opt1', text: '風神門', isCorrect: false },
          { id: 'q4-3-opt2', text: '雷門', isCorrect: true },
          { id: 'q4-3-opt3', text: '不動門', isCorrect: false },
          { id: 'q4-3-opt4', text: '金龍門', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'stage-5',
    number: 5,
    name: '東京スカイツリー・スカイツリータウン',
    description: '東京の最新のランドマークに関する専門的な質問',
    location: 'tokyo-skytree',
    questions: [
      {
        id: 'q5-1',
        text: '東京スカイツリーの高さは正確に何メートルですか？',
        location: 'tokyo-skytree',
        difficulty: 5,
        points: 50,
        options: [
          { id: 'q5-1-opt1', text: '628メートル', isCorrect: false },
          { id: 'q5-1-opt2', text: '634メートル', isCorrect: true },
          { id: 'q5-1-opt3', text: '645メートル', isCorrect: false },
          { id: 'q5-1-opt4', text: '655メートル', isCorrect: false }
        ]
      },
      {
        id: 'q5-2',
        text: '東京スカイツリー建設の主な目的はどれですか？',
        location: 'tokyo-skytree',
        difficulty: 5,
        points: 50,
        options: [
          { id: 'q5-2-opt1', text: '東京オリエンタル美術館の建設', isCorrect: false },
          { id: 'q5-2-opt2', text: '防災拠点の整備', isCorrect: false },
          { id: 'q5-2-opt3', text: '民放テレビのデジタル放送に対応するため', isCorrect: true },
          { id: 'q5-2-opt4', text: '観光資源の創出', isCorrect: false }
        ]
      },
      {
        id: 'q5-3',
        text: '東京スカイツリーはどのような構造設計で建設されていますか？',
        location: 'tokyo-skytree',
        difficulty: 5,
        points: 50,
        options: [
          { id: 'q5-3-opt1', text: '耐震構造', isCorrect: false },
          { id: 'q5-3-opt2', text: '免震構造', isCorrect: false },
          { id: 'q5-3-opt3', text: '制振構造', isCorrect: false },
          { id: 'q5-3-opt4', text: '新三脚構造', isCorrect: true }
        ]
      }
    ]
  }
];