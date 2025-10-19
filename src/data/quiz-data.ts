// src/data/quiz-data.ts
// クイズゲームのデータ - Quiz game data
// Simplified structure following location-based approach within each stage

import { QuizQuestion } from '../types/quiz';

// Questions organized by location for Stage 1
// Each location has exactly 3 questions as requested
export const stage1LocationQuestions: Record<string, QuizQuestion[]> = {
  'tokyo': [ // Tokyo location (House) questions
    {
      id: 'tokyo-q1',
      text: '[東京] 東京都の総人口はおおよそ何人ですか？',
      location: 'tokyo',
      options: [
        { id: 't-q1-opt1', text: '約1000万人', isCorrect: false },
        { id: 't-q1-opt2', text: '約1400万人', isCorrect: true },
        { id: 't-q1-opt3', text: '約1800万人', isCorrect: false },
        { id: 't-q1-opt4', text: '約2000万人', isCorrect: false }
      ]
    },
    {
      id: 'tokyo-q2',
      text: '[東京] 東京都庁舎の高さは約何メートルですか？',
      location: 'tokyo',
      options: [
        { id: 't-q2-opt1', text: '180メートル', isCorrect: false },
        { id: 't-q2-opt2', text: '200メートル', isCorrect: false },
        { id: 't-q2-opt3', text: '243メートル', isCorrect: true },
        { id: 't-q2-opt4', text: '260メートル', isCorrect: false }
      ]
    },
    {
      id: 'tokyo-q3',
      text: '[東京] 東京都の面積は約何平方キロメートルですか？',
      location: 'tokyo',
      options: [
        { id: 't-q3-opt1', text: '約1,700平方キロメートル', isCorrect: false },
        { id: 't-q3-opt2', text: '約2,100平方キロメートル', isCorrect: true },
        { id: 't-q3-opt3', text: '約2,500平方キロメートル', isCorrect: false },
        { id: 't-q3-opt4', text: '約2,800平方キロメートル', isCorrect: false }
      ]
    }
  ],
  'shibuya': [ // Shibuya location (Apartment) questions
    {
      id: 'shibuya-q1',
      text: '[渋谷] 渋谷スクランブル交差点の1日に通過する歩行者数はどれくらいですか？',
      location: 'shibuya',
      options: [
        { id: 's-q1-opt1', text: '約100万人', isCorrect: false },
        { id: 's-q1-opt2', text: '約200万人', isCorrect: false },
        { id: 's-q1-opt3', text: '約300万人', isCorrect: true },
        { id: 's-q1-opt4', text: '約500万人', isCorrect: false }
      ]
    },
    {
      id: 'shibuya-q2',
      text: '[渋谷] 忠犬ハチ公像はどの駅の前におかれていますか？',
      location: 'shibuya',
      options: [
        { id: 's-q2-opt1', text: '新宿駅', isCorrect: false },
        { id: 's-q2-opt2', text: '原宿駅', isCorrect: false },
        { id: 's-q2-opt3', text: '渋谷駅', isCorrect: true },
        { id: 's-q2-opt4', text: '表参道駅', isCorrect: false }
      ]
    },
    {
      id: 'shibuya-q3',
      text: '[渋谷] SHIBUYA SCRAMBLE SQUAREの開業年はいつですか？',
      location: 'shibuya',
      options: [
        { id: 's-q3-opt1', text: '2018年', isCorrect: false },
        { id: 's-q3-opt2', text: '2019年', isCorrect: true },
        { id: 's-q3-opt3', text: '2020年', isCorrect: false },
        { id: 's-q3-opt4', text: '2021年', isCorrect: false }
      ]
    }
  ],
  'shinjuku': [ // Shinjuku location (Building) questions
    {
      id: 'shinjuku-q1',
      text: '[新宿] 新宿駅は世界で最も利用者数が多い駅の一つですが、1日に平均何人が利用しますか？',
      location: 'shinjuku',
      options: [
        { id: 'sk-q1-opt1', text: '約100万人', isCorrect: false },
        { id: 'sk-q1-opt2', text: '約200万人', isCorrect: false },
        { id: 'sk-q1-opt3', text: '約350万人', isCorrect: true },
        { id: 'sk-q1-opt4', text: '約500万人', isCorrect: false }
      ]
    },
    {
      id: 'shinjuku-q2',
      text: '[新宿] 東京都内で最も高い建築物である東京都庁が立地する区はどこですか？',
      location: 'shinjuku',
      options: [
        { id: 'sk-q2-opt1', text: '千代田区', isCorrect: false },
        { id: 'sk-q2-opt2', text: '港区', isCorrect: false },
        { id: 'sk-q2-opt3', text: '新宿区', isCorrect: true },
        { id: 'sk-q2-opt4', text: '中央区', isCorrect: false }
      ]
    },
    {
      id: 'shinjuku-q3',
      text: '[新宿] 新宿に位置する日本最大級の高層複合商業施設「新宿ミライナタワー」の開業年はいつですか？',
      location: 'shinjuku',
      options: [
        { id: 'sk-q3-opt1', text: '2010年', isCorrect: false },
        { id: 'sk-q3-opt2', text: '2011年', isCorrect: false },
        { id: 'sk-q3-opt3', text: '2012年', isCorrect: true },
        { id: 'sk-q3-opt4', text: '2013年', isCorrect: false }
      ]
    }
  ],
  'asakusa': [ // Asakusa location (Shop) questions
    {
      id: 'asakusa-q1',
      text: '[浅草] 浅草寺の正式名称は何ですか？',
      location: 'asakusa',
      options: [
        { id: 'a-q1-opt1', text: '観音院浅草寺', isCorrect: false },
        { id: 'a-q1-opt2', text: '金龍山浅草寺', isCorrect: true },
        { id: 'a-q1-opt3', text: '浅草観音寺', isCorrect: false },
        { id: 'a-q1-opt4', text: '雷門山浅草寺', isCorrect: false }
      ]
    },
    {
      id: 'asakusa-q2',
      text: '[浅草] 浅草寺の仁王門の正式名称は何ですか？',
      location: 'asakusa',
      options: [
        { id: 'a-q2-opt1', text: '風神門', isCorrect: false },
        { id: 'a-q2-opt2', text: '雷門', isCorrect: true },
        { id: 'a-q2-opt3', text: '不動門', isCorrect: false },
        { id: 'a-q2-opt4', text: '金龍門', isCorrect: false }
      ]
    },
    {
      id: 'asakusa-q3',
      text: '[浅草] 浅草寺の周辺にある伝統的な参道の通り名は何ですか？',
      location: 'asakusa',
      options: [
        { id: 'a-q3-opt1', text: '仲見世通', isCorrect: true },
        { id: 'a-q3-opt2', text: '雷門通り', isCorrect: false },
        { id: 'a-q3-opt3', text: '浅草商店街', isCorrect: false },
        { id: 'a-q3-opt4', text: '観音通り', isCorrect: false }
      ]
    }
  ]
};

// Mapping from 3D model names to location keys
const locationNameMap: Record<string, string> = {
  'House': 'tokyo',      // Tokyo location (House)
  'Apartment': 'shibuya', // Shibuya location (Apartment)
  'Building': 'shinjuku', // Shinjuku location (Building)
  'Shop': 'asakusa'       // Asakusa location (Shop)
};

// This mapping will help in retrieving questions based on the location
export const getQuestionsForLocation = (location: string): QuizQuestion[] => {
  // Map the 3D model name to the appropriate location key
  const mappedLocation = locationNameMap[location] || location;
  return stage1LocationQuestions[mappedLocation] || stage1LocationQuestions['tokyo']; // Default to Tokyo if location not found
};