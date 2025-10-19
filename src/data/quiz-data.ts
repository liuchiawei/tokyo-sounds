// src/data/quiz-data.ts
// クイズゲームのデータ - Quiz game data
// 場所ベースのアプローチに従った簡略化された構造 - Simplified structure following location-based approach within each stage

import { QuizQuestion } from '../types/quiz';

// ステージと場所ごとに整理された質問 - Questions organized by stage and location with increasing difficulty
// 各ステージは12問（4か所×3問） - Each stage has 4 locations with 3 questions each (12 questions per stage)
export const stageBasedQuestions: Record<number, Record<string, QuizQuestion[]>> = {
  1: { // Stage 1 (Beginner) questions
    'tokyo': [
      {
        id: 'stage1-tokyo-q1',
        text: '[東京] 東京都の総人口はおおよそ何人ですか？',
        location: 'tokyo',
        options: [
          { id: 's1-t1-opt1', text: '約1000万人', isCorrect: false },
          { id: 's1-t1-opt2', text: '約1400万人', isCorrect: true },
          { id: 's1-t1-opt3', text: '約1800万人', isCorrect: false },
          { id: 's1-t1-opt4', text: '約2000万人', isCorrect: false }
        ]
      },
      {
        id: 'stage1-tokyo-q2',
        text: '[東京] 東京都庁舎の高さは約何メートルですか？',
        location: 'tokyo',
        options: [
          { id: 's1-t2-opt1', text: '180メートル', isCorrect: false },
          { id: 's1-t2-opt2', text: '200メートル', isCorrect: false },
          { id: 's1-t2-opt3', text: '243メートル', isCorrect: true },
          { id: 's1-t2-opt4', text: '260メートル', isCorrect: false }
        ]
      },
      {
        id: 'stage1-tokyo-q3',
        text: '[東京] 東京都の面積は約何平方キロメートルですか？',
        location: 'tokyo',
        options: [
          { id: 's1-t3-opt1', text: '約1,700平方キロメートル', isCorrect: false },
          { id: 's1-t3-opt2', text: '約2,100平方キロメートル', isCorrect: true },
          { id: 's1-t3-opt3', text: '約2,500平方キロメートル', isCorrect: false },
          { id: 's1-t3-opt4', text: '約2,800平方キロメートル', isCorrect: false }
        ]
      }
    ],
    'shibuya': [
      {
        id: 'stage1-shibuya-q1',
        text: '[渋谷] 渋谷スクランブル交差点の1日に通過する歩行者数はどれくらいですか？',
        location: 'shibuya',
        options: [
          { id: 's1-s1-opt1', text: '約100万人', isCorrect: false },
          { id: 's1-s1-opt2', text: '約200万人', isCorrect: false },
          { id: 's1-s1-opt3', text: '約300万人', isCorrect: true },
          { id: 's1-s1-opt4', text: '約500万人', isCorrect: false }
        ]
      },
      {
        id: 'stage1-shibuya-q2',
        text: '[渋谷] 忠犬ハチ公像はどの駅の前におかれていますか？',
        location: 'shibuya',
        options: [
          { id: 's1-s2-opt1', text: '新宿駅', isCorrect: false },
          { id: 's1-s2-opt2', text: '原宿駅', isCorrect: false },
          { id: 's1-s2-opt3', text: '渋谷駅', isCorrect: true },
          { id: 's1-s2-opt4', text: '表参道駅', isCorrect: false }
        ]
      },
      {
        id: 'stage1-shibuya-q3',
        text: '[渋谷] SHIBUYA SCRAMBLE SQUAREの開業年はいつですか？',
        location: 'shibuya',
        options: [
          { id: 's1-s3-opt1', text: '2018年', isCorrect: false },
          { id: 's1-s3-opt2', text: '2019年', isCorrect: true },
          { id: 's1-s3-opt3', text: '2020年', isCorrect: false },
          { id: 's1-s3-opt4', text: '2021年', isCorrect: false }
        ]
      }
    ],
    'shinjuku': [
      {
        id: 'stage1-shinjuku-q1',
        text: '[新宿] 新宿駅は世界で最も利用者数が多い駅の一つですが、1日に平均何人が利用しますか？',
        location: 'shinjuku',
        options: [
          { id: 's1-sk1-opt1', text: '約100万人', isCorrect: false },
          { id: 's1-sk1-opt2', text: '約200万人', isCorrect: false },
          { id: 's1-sk1-opt3', text: '約350万人', isCorrect: true },
          { id: 's1-sk1-opt4', text: '約500万人', isCorrect: false }
        ]
      },
      {
        id: 'stage1-shinjuku-q2',
        text: '[新宿] 東京都内で最も高い建築物である東京都庁が立地する区はどこですか？',
        location: 'shinjuku',
        options: [
          { id: 's1-sk2-opt1', text: '千代田区', isCorrect: false },
          { id: 's1-sk2-opt2', text: '港区', isCorrect: false },
          { id: 's1-sk2-opt3', text: '新宿区', isCorrect: true },
          { id: 's1-sk2-opt4', text: '中央区', isCorrect: false }
        ]
      },
      {
        id: 'stage1-shinjuku-q3',
        text: '[新宿] 新宿に位置する日本最大級の高層複合商業施設「新宿ミライナタワー」の開業年はいつですか？',
        location: 'shinjuku',
        options: [
          { id: 's1-sk3-opt1', text: '2010年', isCorrect: false },
          { id: 's1-sk3-opt2', text: '2011年', isCorrect: false },
          { id: 's1-sk3-opt3', text: '2012年', isCorrect: true },
          { id: 's1-sk3-opt4', text: '2013年', isCorrect: false }
        ]
      }
    ],
    'asakusa': [
      {
        id: 'stage1-asakusa-q1',
        text: '[浅草] 浅草寺の正式名称は何ですか？',
        location: 'asakusa',
        options: [
          { id: 's1-a1-opt1', text: '観音院浅草寺', isCorrect: false },
          { id: 's1-a1-opt2', text: '金龍山浅草寺', isCorrect: true },
          { id: 's1-a1-opt3', text: '浅草観音寺', isCorrect: false },
          { id: 's1-a1-opt4', text: '雷門山浅草寺', isCorrect: false }
        ]
      },
      {
        id: 'stage1-asakusa-q2',
        text: '[浅草] 浅草寺の仁王門の正式名称は何ですか？',
        location: 'asakusa',
        options: [
          { id: 's1-a2-opt1', text: '風神門', isCorrect: false },
          { id: 's1-a2-opt2', text: '雷門', isCorrect: true },
          { id: 's1-a2-opt3', text: '不動門', isCorrect: false },
          { id: 's1-a2-opt4', text: '金龍門', isCorrect: false }
        ]
      },
      {
        id: 'stage1-asakusa-q3',
        text: '[浅草] 浅草寺の周辺にある伝統的な参道の通り名は何ですか？',
        location: 'asakusa',
        options: [
          { id: 's1-a3-opt1', text: '仲見世通', isCorrect: true },
          { id: 's1-a3-opt2', text: '雷門通り', isCorrect: false },
          { id: 's1-a3-opt3', text: '浅草商店街', isCorrect: false },
          { id: 's1-a3-opt4', text: '観音通り', isCorrect: false }
        ]
      }
    ]
  },
  2: { // Stage 2 (Intermediate) questions
    'tokyo': [
      {
        id: 'stage2-tokyo-q1',
        text: '[東京] 東京都23区の面積が最も広い区はどこですか？',
        location: 'tokyo',
        options: [
          { id: 's2-t1-opt1', text: '杉並区', isCorrect: false },
          { id: 's2-t1-opt2', text: '世田谷区', isCorrect: true },
          { id: 's2-t1-opt3', text: '練馬区', isCorrect: false },
          { id: 's2-t1-opt4', text: '中野区', isCorrect: false }
        ]
      },
      {
        id: 'stage2-tokyo-q2',
        text: '[東京] 東京都の1月平均気温は約何度ですか？',
        location: 'tokyo',
        options: [
          { id: 's2-t2-opt1', text: '0度', isCorrect: false },
          { id: 's2-t2-opt2', text: '2度', isCorrect: false },
          { id: 's2-t2-opt3', text: '5度', isCorrect: true },
          { id: 's2-t2-opt4', text: '8度', isCorrect: false }
        ]
      },
      {
        id: 'stage2-tokyo-q3',
        text: '[東京] 東京23区の中で最も人口が少ない区はどこですか？',
        location: 'tokyo',
        options: [
          { id: 's2-t3-opt1', text: '瑞穂', isCorrect: false },
          { id: 's2-t3-opt2', text: '青梅', isCorrect: false },
          { id: 's2-t3-opt3', text: '武蔵村山', isCorrect: false },
          { id: 's2-t3-opt4', text: '島添村', isCorrect: false }
        ]
      }
    ],
    'shibuya': [
      {
        id: 'stage2-shibuya-q1',
        text: '[渋谷] 渋谷区が制定した年はいつですか？',
        location: 'shibuya',
        options: [
          { id: 's2-s1-opt1', text: '1878年', isCorrect: true },
          { id: 's2-s1-opt2', text: '1889年', isCorrect: false },
          { id: 's2-s1-opt3', text: '1902年', isCorrect: false },
          { id: 's2-s1-opt4', text: '1920年', isCorrect: false }
        ]
      },
      {
        id: 'stage2-shibuya-q2',
        text: '[渋谷] 渋谷駅の1日平均乗降人員数（2019年）はおよそ何人ですか？',
        location: 'shibuya',
        options: [
          { id: 's2-s2-opt1', text: '約200万人', isCorrect: false },
          { id: 's2-s2-opt2', text: '約250万人', isCorrect: true },
          { id: 's2-s2-opt3', text: '約300万人', isCorrect: false },
          { id: 's2-s2-opt4', text: '約350万人', isCorrect: false }
        ]
      },
      {
        id: 'stage2-shibuya-q3',
        text: '[渋谷] 渋谷スクランブル交差点に設置された「Hachiko Statue」の忠犬ハチ公像の銅は誰の設計ですか？',
        location: 'shibuya',
        options: [
          { id: 's2-s3-opt1', text: '佐藤進', isCorrect: false },
          { id: 's2-s3-opt2', text: '安藤昌彦', isCorrect: false },
          { id: 's2-s3-opt3', text: '清水安三', isCorrect: false },
          { id: 's2-s3-opt4', text: '及川芳秋', isCorrect: true }
        ]
      }
    ],
    'shinjuku': [
      {
        id: 'stage2-shinjuku-q1',
        text: '[新宿] 新宿駅の1日平均乗降人員数は世界で何位ですか？',
        location: 'shinjuku',
        options: [
          { id: 's2-sk1-opt1', text: '1位', isCorrect: true },
          { id: 's2-sk1-opt2', text: '2位', isCorrect: false },
          { id: 's2-sk1-opt3', text: '5位', isCorrect: false },
          { id: 's2-sk1-opt4', text: '10位', isCorrect: false }
        ]
      },
      {
        id: 'stage2-shinjuku-q2',
        text: '[新宿] 新宿副都心開発事業の開始年はいつですか？',
        location: 'shinjuku',
        options: [
          { id: 's2-sk2-opt1', text: '1945年', isCorrect: false },
          { id: 's2-sk2-opt2', text: '1958年', isCorrect: false },
          { id: 's2-sk2-opt3', text: '1965年', isCorrect: true },
          { id: 's2-sk2-opt4', text: '1972年', isCorrect: false }
        ]
      },
      {
        id: 'stage2-shinjuku-q3',
        text: '[新宿] 2002年に完成した新宿アイランドタワーの高さは約何メートルですか？',
        location: 'shinjuku',
        options: [
          { id: 's2-sk3-opt1', text: '180メートル', isCorrect: false },
          { id: 's2-sk3-opt2', text: '200メートル', isCorrect: false },
          { id: 's2-sk3-opt3', text: '225メートル', isCorrect: true },
          { id: 's2-sk3-opt4', text: '250メートル', isCorrect: false }
        ]
      }
    ],
    'asakusa': [
      {
        id: 'stage2-asakusa-q1',
        text: '[浅草] 浅草寺が建立された年はいつですか？',
        location: 'asakusa',
        options: [
          { id: 's2-a1-opt1', text: '590年', isCorrect: false },
          { id: 's2-a1-opt2', text: '628年', isCorrect: true },
          { id: 's2-a1-opt3', text: '645年', isCorrect: false },
          { id: 's2-a1-opt4', text: '680年', isCorrect: false }
        ]
      },
      {
        id: 'stage2-asakusa-q2',
        text: '[浅草] 浅草寺の本堂が焼失した大火はいつの年ですか？',
        location: 'asakusa',
        options: [
          { id: 's2-a2-opt1', text: '1657年', isCorrect: false },
          { id: 's2-a2-opt2', text: '1923年', isCorrect: false },
          { id: 's2-a2-opt3', text: '1945年', isCorrect: true },
          { id: 's2-a2-opt4', text: '1955年', isCorrect: false }
        ]
      },
      {
        id: 'stage2-asakusa-q3',
        text: '[浅草] 深川めし発祥の地として知られている場所は浅草のどの地域ですか？',
        location: 'asakusa',
        options: [
          { id: 's2-a3-opt1', text: '浅草寺境内', isCorrect: false },
          { id: 's2-a3-opt2', text: '雷門前', isCorrect: false },
          { id: 's2-a3-opt3', text: '三社祭の通り', isCorrect: false },
          { id: 's2-a3-opt4', text: '両国', isCorrect: true }
        ]
      }
    ]
  },
  3: { // Stage 3 (Advanced) questions
    'tokyo': [
      {
        id: 'stage3-tokyo-q1',
        text: '[東京] 江戸時代から東京に伝わる「下町」と「山の手」の境界線はどこですか？',
        location: 'tokyo',
        options: [
          { id: 's3-t1-opt1', text: '隅田川', isCorrect: false },
          { id: 's3-t1-opt2', text: '神田川', isCorrect: true },
          { id: 's3-t1-opt3', text: '皇居', isCorrect: false },
          { id: 's3-t1-opt4', text: 'JR山手線', isCorrect: false }
        ]
      },
      {
        id: 'stage3-tokyo-q2',
        text: '[東京] 東京府が東京市と合併し、東京都が発足した年はいつですか？',
        location: 'tokyo',
        options: [
          { id: 's3-t2-opt1', text: '1923年', isCorrect: false },
          { id: 's3-t2-opt2', text: '1943年', isCorrect: true },
          { id: 's3-t2-opt3', text: '1953年', isCorrect: false },
          { id: 's3-t2-opt4', text: '1964年', isCorrect: false }
        ]
      },
      {
        id: 'stage3-tokyo-q3',
        text: '[東京] 東京23区の中心となる経緯度はどこですか？',
        location: 'tokyo',
        options: [
          { id: 's3-t3-opt1', text: '皇居', isCorrect: true },
          { id: 's3-t3-opt2', text: '東京駅', isCorrect: false },
          { id: 's3-t3-opt3', text: '国会議事堂', isCorrect: false },
          { id: 's3-t3-opt4', text: '東京スカイツリー', isCorrect: false }
        ]
      }
    ],
    'shibuya': [
      {
        id: 'stage3-shibuya-q1',
        text: '[渋谷] 渋谷スクランブル交差点の4つの角にある建物の用途として最も正確なのはどれですか？',
        location: 'shibuya',
        options: [
          { id: 's3-s1-opt1', text: '飲食店、ホテル、映画館、オフィス', isCorrect: false },
          { id: 's3-s1-opt2', text: 'オフィス、商業施設、映画館、飲食店', isCorrect: false },
          { id: 's3-s1-opt3', text: '映画館、商業施設、交通センター、オフィス', isCorrect: true },
          { id: 's3-s1-opt4', text: '商業施設、劇場、ホテル、住宅', isCorrect: false }
        ]
      },
      {
        id: 'stage3-shibuya-q2',
        text: '[渋谷] 渋谷の都市再開発における「ストリートレベル」設計の概念が初めて導入されたプロジェクトはどれですか？',
        location: 'shibuya',
        options: [
          { id: 's3-s2-opt1', text: '渋谷ヒカリエ', isCorrect: false },
          { id: 's3-s2-opt2', text: 'SHIBUYA SCRAMBLE SQUARE', isCorrect: false },
          { id: 's3-s2-opt3', text: '渋谷センター街', isCorrect: false },
          { id: 's3-s2-opt4', text: 'ヒカリエ以前の渋谷駅周辺', isCorrect: true }
        ]
      },
      {
        id: 'stage3-shibuya-q3',
        text: '[渋谷] 渋谷駅の複数の鉄道会社が乗り入れるようになった経緯において、最初に乗り入れた会社はどれですか？',
        location: 'shibuya',
        options: [
          { id: 's3-s3-opt1', text: '京王電鉄', isCorrect: false },
          { id: 's3-s3-opt2', text: '東急電鉄', isCorrect: true },
          { id: 's3-s3-opt3', text: 'JR東日本', isCorrect: false },
          { id: 's3-s3-opt4', text: '東京メトロ', isCorrect: false }
        ]
      }
    ],
    'shinjuku': [
      {
        id: 'stage3-shinjuku-q1',
        text: '[新宿] 1991年に完成した東京都庁舎の設計者として有名なのは谁ですか？',
        location: 'shinjuku',
        options: [
          { id: 's3-sk1-opt1', text: '安藤忠雄', isCorrect: false },
          { id: 's3-sk1-opt2', text: '菊竹清訓', isCorrect: false },
          { id: 's3-sk1-opt3', text: '丹下健三', isCorrect: true },
          { id: 's3-sk1-opt4', text: '黒川紀章', isCorrect: false }
        ]
      },
      {
        id: 'stage3-shinjuku-q2',
        text: '[新宿] 新宿副都心の都市計画における「新宿副都心構想」が策定された年はいつですか？',
        location: 'shinjuku',
        options: [
          { id: 's3-sk2-opt1', text: '1958年', isCorrect: false },
          { id: 's3-sk2-opt2', text: '1965年', isCorrect: true },
          { id: 's3-sk2-opt3', text: '1972年', isCorrect: false },
          { id: 's3-sk2-opt4', text: '1980年', isCorrect: false }
        ]
      },
      {
        id: 'stage3-shinjuku-q3',
        text: '[新宿] 新宿駅西口の高層ビル街の開発が急速に進んだのはどの時期ですか？',
        location: 'shinjuku',
        options: [
          { id: 's3-sk3-opt1', text: '1950年代', isCorrect: false },
          { id: 's3-sk3-opt2', text: '1960年代', isCorrect: false },
          { id: 's3-sk3-opt3', text: '1970年代', isCorrect: true },
          { id: 's3-sk3-opt4', text: '1980年代', isCorrect: false }
        ]
      }
    ],
    'asakusa': [
      {
        id: 'stage3-asakusa-q1',
        text: '[浅草] 浅草寺が「金竜山浅草寺」と改称したのはどのような理由ですか？',
        location: 'asakusa',
        options: [
          { id: 's3-a1-opt1', text: '金竜という伝説があるため', isCorrect: false },
          { id: 's3-a1-opt2', text: '寺宝に金竜があったため', isCorrect: false },
          { id: 's3-a1-opt3', text: '創建伝説に基づく名称', isCorrect: true },
          { id: 's3-a1-opt4', text: '天皇からの勅願による', isCorrect: false }
        ]
      },
      {
        id: 'stage3-asakusa-q2',
        text: '[浅草] 浅草寺の観音堂が再建されたのは関東大震災後何年後ですか？',
        location: 'asakusa',
        options: [
          { id: 's3-a2-opt1', text: '1925年（2年後）', isCorrect: false },
          { id: 's3-a2-opt2', text: '1932年（9年後）', isCorrect: false },
          { id: 's3-a2-opt3', text: '1958年（35年後）', isCorrect: true },
          { id: 's3-a2-opt4', text: '1964年（41年後）', isCorrect: false }
        ]
      },
      {
        id: 'stage3-asakusa-q3',
        text: '[浅草] 浅草の「三社祭」には何社の神社が関係していますか？',
        location: 'asakusa',
        options: [
          { id: 's3-a3-opt1', text: '1社', isCorrect: false },
          { id: 's3-a3-opt2', text: '2社', isCorrect: false },
          { id: 's3-a3-opt3', text: '3社', isCorrect: true },
          { id: 's3-a3-opt4', text: '4社', isCorrect: false }
        ]
      }
    ]
  },
  4: { // Stage 4 (Expert) questions
    'tokyo': [
      {
        id: 'stage4-tokyo-q1',
        text: '[東京] 江戸時代、現在の東京都23区に相当する地域の人口はおおよそ何人でしたか？',
        location: 'tokyo',
        options: [
          { id: 's4-t1-opt1', text: '約50万人', isCorrect: false },
          { id: 's4-t1-opt2', text: '約100万人', isCorrect: true },
          { id: 's4-t1-opt3', text: '約150万人', isCorrect: false },
          { id: 's4-t1-opt4', text: '約200万人', isCorrect: false }
        ]
      },
      {
        id: 'stage4-tokyo-q2',
        text: '[東京] 東京府から東京都へ改称され、東京都制が施行された具体的な日付は？',
        location: 'tokyo',
        options: [
          { id: 's4-t2-opt1', text: '1943年7月1日', isCorrect: true },
          { id: 's4-t2-opt2', text: '1943年8月1日', isCorrect: false },
          { id: 's4-t2-opt3', text: '1943年9月1日', isCorrect: false },
          { id: 's4-t2-opt4', text: '1943年10月1日', isCorrect: false }
        ]
      },
      {
        id: 'stage4-tokyo-q3',
        text: '[東京] 東京の緯度経度が基準となっている「東京座標系」はいつまで使用されましたか？',
        location: 'tokyo',
        options: [
          { id: 's4-t3-opt1', text: '1980年代', isCorrect: false },
          { id: 's4-t3-opt2', text: '1990年代', isCorrect: false },
          { id: 's4-t3-opt3', text: '2000年代', isCorrect: true },
          { id: 's4-t3-opt4', text: '2010年代', isCorrect: false }
        ]
      }
    ],
    'shibuya': [
      {
        id: 'stage4-shibuya-q1',
        text: '[渋谷] 渋谷スクランブル交差点の交通整理における「スクランブル方式」が導入されたのは何年ですか？',
        location: 'shibuya',
        options: [
          { id: 's4-s1-opt1', text: '1970年', isCorrect: false },
          { id: 's4-s1-opt2', text: '1974年', isCorrect: true },
          { id: 's4-s1-opt3', text: '1978年', isCorrect: false },
          { id: 's4-s1-opt4', text: '1982年', isCorrect: false }
        ]
      },
      {
        id: 'stage4-shibuya-q2',
        text: '[渋谷] 渋谷駅の「ハチ公口」の名称が正式に決定したのは何年ですか？',
        location: 'shibuya',
        options: [
          { id: 's4-s2-opt1', text: '1930年', isCorrect: false },
          { id: 's4-s2-opt2', text: '1948年', isCorrect: false },
          { id: 's4-s2-opt3', text: '1970年', isCorrect: false },
          { id: 's4-s2-opt4', text: '1989年', isCorrect: true }
        ]
      },
      {
        id: 'stage4-shibuya-q3',
        text: '[渋谷] 渋谷駅周辺再開発における「アーバンコード」の概念が取り入れられたのはどのプロジェクトですか？',
        location: 'shibuya',
        options: [
          { id: 's4-s3-opt1', text: '渋谷ヒカリエ', isCorrect: false },
          { id: 's4-s3-opt2', text: 'セルリアンタワー', isCorrect: true },
          { id: 's4-s3-opt3', text: 'SHIBUYA SCRAMBLE SQUARE', isCorrect: false },
          { id: 's4-s3-opt4', text: '渋谷センター街', isCorrect: false }
        ]
      }
    ],
    'shinjuku': [
      {
        id: 'stage4-shinjuku-q1',
        text: '[新宿] 東京都庁舎の設計で、丹下健三が意図した都市計画的な象徴性とは何ですか？',
        location: 'shinjuku',
        options: [
          { id: 's4-sk1-opt1', text: '官庁街を示す象徴', isCorrect: false },
          { id: 's4-sk1-opt2', text: '東京の新しい顔としての象徴', isCorrect: true },
          { id: 's4-sk1-opt3', text: '高層建築の安全性の象徴', isCorrect: false },
          { id: 's4-sk1-opt4', text: '国際都市としての象徴', isCorrect: false }
        ]
      },
      {
        id: 'stage4-shinjuku-q2',
        text: '[新宿] 新宿副都心の開発で最初に建設され、副都心の象徴となった超高層ビルはどれですか？',
        location: 'shinjuku',
        options: [
          { id: 's4-sk2-opt1', text: '新宿パークタワー', isCorrect: false },
          { id: 's4-sk2-opt2', text: '住友不動産新宿タワー', isCorrect: false },
          { id: 's4-sk2-opt3', text: '新宿センタービル', isCorrect: false },
          { id: 's4-sk2-opt4', text: '東京都庁舎', isCorrect: true }
        ]
      },
      {
        id: 'stage4-shinjuku-q3',
        text: '[新宿] 新宿駅西口の高層ビル開発において、都市計画法が改正されたきっかけとなったのは何ですか？',
        location: 'shinjuku',
        options: [
          { id: 's4-sk3-opt1', text: '大規模開発への住民反対運動', isCorrect: false },
          { id: 's4-sk3-opt2', text: '超高層建築の景観問題', isCorrect: false },
          { id: 's4-sk3-opt3', text: '都市計画と交通政策の矛盾', isCorrect: true },
          { id: 's4-sk3-opt4', text: '地震安全性の問題', isCorrect: false }
        ]
      }
    ],
    'asakusa': [
      {
        id: 'stage4-asakusa-q1',
        text: '[浅草] 浅草寺の創建に関わった三兄弟の名前は？',
        location: 'asakusa',
        options: [
          { id: 's4-a1-opt1', text: '陳、趙、張', isCorrect: false },
          { id: 's4-a1-opt2', text: '本田、平、寺島', isCorrect: false },
          { id: 's4-a1-opt3', text: '檜前浜成、檜前竹成、檜前田来', isCorrect: true },
          { id: 's4-a1-opt4', text: '源、平、藤原', isCorrect: false }
        ]
      },
      {
        id: 'stage4-asakusa-q2',
        text: '[浅草] 浅草の「観音堂」が「本堂」と改称されたのは何年ですか？',
        location: 'asakusa',
        options: [
          { id: 's4-a2-opt1', text: '1649年', isCorrect: false },
          { id: 's4-a2-opt2', text: '1958年', isCorrect: true },
          { id: 's4-a2-opt3', text: '1965年', isCorrect: false },
          { id: 's4-a2-opt4', text: '1975年', isCorrect: false }
        ]
      },
      {
        id: 'stage4-asakusa-q3',
        text: '[浅草] 浅草寺と隣接する浅草神社は、何を祭神としていますか？',
        location: 'asakusa',
        options: [
          { id: 's4-a3-opt1', text: '神武天皇', isCorrect: false },
          { id: 's4-a3-opt2', text: '三名の創建者', isCorrect: true },
          { id: 's4-a3-opt3', text: '聖徳太子', isCorrect: false },
          { id: 's4-a3-opt4', text: '弁財天', isCorrect: false }
        ]
      }
    ]
  },
  5: { // Stage 5 (Master) questions
    'tokyo': [
      {
        id: 'stage5-tokyo-q1',
        text: '[東京] 江戸時代の「江戸四十八所」の巡礼地は現在のどの地域に該当しますか？',
        location: 'tokyo',
        options: [
          { id: 's5-t1-opt1', text: '現在の23区全体', isCorrect: false },
          { id: 's5-t1-opt2', text: '主に台東区・墨田区', isCorrect: true },
          { id: 's5-t1-opt3', text: '主に中央区・千代田区', isCorrect: false },
          { id: 's5-t1-opt4', text: '主に港区・品川区', isCorrect: false }
        ]
      },
      {
        id: 'stage5-tokyo-q2',
        text: '[東京] 明治時代における「東京15区」が制定されたのは何年ですか？',
        location: 'tokyo',
        options: [
          { id: 's5-t2-opt1', text: '1878年', isCorrect: true },
          { id: 's5-t2-opt2', text: '1889年', isCorrect: false },
          { id: 's5-t2-opt3', text: '1908年', isCorrect: false },
          { id: 's5-t2-opt4', text: '1920年', isCorrect: false }
        ]
      },
      {
        id: 'stage5-tokyo-q3',
        text: '[東京] 現在の東京都23区が成立したのは何年で、何区制から何区制への変更でしたか？',
        location: 'tokyo',
        options: [
          { id: 's5-t3-opt1', text: '1947年、35区から23区', isCorrect: true },
          { id: 's5-t3-opt2', text: '1943年、22区から23区', isCorrect: false },
          { id: 's5-t3-opt3', text: '1963年、30区から23区', isCorrect: false },
          { id: 's5-t3-opt4', text: '1955年、25区から23区', isCorrect: false }
        ]
      }
    ],
    'shibuya': [
      {
        id: 'stage5-shibuya-q1',
        text: '[渋谷] 渋谷スクランブル交差点の設計理念における「非階層的公共空間」の概念を提唱したのは誰ですか？',
        location: 'shibuya',
        options: [
          { id: 's5-s1-opt1', text: '丹下健三', isCorrect: false },
          { id: 's5-s1-opt2', text: '磯崎新', isCorrect: false },
          { id: 's5-s1-opt3', text: '黒川紀章', isCorrect: false },
          { id: 's5-s1-opt4', text: '大高雅男', isCorrect: true }
        ]
      },
      {
        id: 'stage5-shibuya-q2',
        text: '[渋谷] 渋谷駅の東西自由通路の設計で採用された「アーバンストラテジー」という都市戦略の目的は何ですか？',
        location: 'shibuya',
        options: [
          { id: 's5-s2-opt1', text: '交通の混雑解消', isCorrect: false },
          { id: 's5-s2-opt2', text: '商業空間の拡大', isCorrect: false },
          { id: 's5-s2-opt3', text: '都市の歩行者軸形成', isCorrect: true },
          { id: 's5-s2-opt4', text: '災害時の避難路確保', isCorrect: false }
        ]
      },
      {
        id: 'stage5-shibuya-q3',
        text: '[渋谷] 渋谷駅周辺の再開発において、都市デザインの手法として「イベント型都市計画」とは何を指しますか？',
        location: 'shibuya',
        options: [
          { id: 's5-s3-opt1', text: '文化イベントを主とした開発', isCorrect: false },
          { id: 's5-s3-opt2', text: '開発段階で市民参加イベント', isCorrect: false },
          { id: 's5-s3-opt3', text: '開発プロセスをイベントとして公開', isCorrect: true },
          { id: 's5-s3-opt4', text: '定期的なパフォーマンスの場の確保', isCorrect: false }
        ]
      }
    ],
    'shinjuku': [
      {
        id: 'stage5-shinjuku-q1',
        text: '[新宿] 東京都庁舎の設計における「メタボリズム建築」の理念とは何ですか？',
        location: 'shinjuku',
        options: [
          { id: 's5-sk1-opt1', text: '都市の成長・変化を表現', isCorrect: true },
          { id: 's5-sk1-opt2', text: '伝統建築との融合', isCorrect: false },
          { id: 's5-sk1-opt3', text: 'エネルギー効率の最大化', isCorrect: false },
          { id: 's5-sk1-opt4', text: '高層建築の安全性', isCorrect: false }
        ]
      },
      {
        id: 'stage5-shinjuku-q2',
        text: '[新宿] 新宿副都心開発における都市計画上の「副都心構想」の理念を最も正確に表現しているのはどれですか？',
        location: 'shinjuku',
        options: [
          { id: 's5-sk2-opt1', text: '官公庁の分散配置', isCorrect: false },
          { id: 's5-sk2-opt2', text: '多極都市構造の形成', isCorrect: true },
          { id: 's5-sk2-opt3', text: '住宅地の再配置', isCorrect: false },
          { id: 's5-sk2-opt4', text: '交通結節点の強化', isCorrect: false }
        ]
      },
      {
        id: 'stage5-shinjuku-q3',
        text: '[新宿] 新宿駅西口の高層建築群における「都市の垂直性」とはどのような概念ですか？',
        location: 'shinjuku',
        options: [
          { id: 's5-sk3-opt1', text: '建物の高さの競争', isCorrect: false },
          { id: 's5-sk3-opt2', text: '地上と地下の統合的利用', isCorrect: false },
          { id: 's5-sk3-opt3', text: '立体的な都市空間の構築', isCorrect: true },
          { id: 's5-sk3-opt4', text: '垂直交通の整備', isCorrect: false }
        ]
      }
    ],
    'asakusa': [
      {
        id: 'stage5-asakusa-q1',
        text: '[浅草] 慶長年間に浅草寺の本堂が再建された際の「浅草寺本堂再建記」に記されている設計思想とは？',
        location: 'asakusa',
        options: [
          { id: 's5-a1-opt1', text: '信仰心の具現', isCorrect: false },
          { id: 's5-a1-opt2', text: '伝統の継承', isCorrect: false },
          { id: 's5-a1-opt3', text: '都市景観の調和', isCorrect: false },
          { id: 's5-a1-opt4', text: '災害耐性の確保', isCorrect: true }
        ]
      },
      {
        id: 'stage5-asakusa-q2',
        text: '[浅草] 浅草寺の「観音霊場」としての位置づけが江戸時代に確立された理由は何ですか？',
        location: 'asakusa',
        options: [
          { id: 's5-a2-opt1', text: '将軍の信仰対象', isCorrect: false },
          { id: 's5-a2-opt2', text: '庶民信仰の中心', isCorrect: true },
          { id: 's5-a2-opt3', text: '外交政策の一部', isCorrect: false },
          { id: 's5-a2-opt4', text: '経済利益の追求', isCorrect: false }
        ]
      },
      {
        id: 'stage5-asakusa-q3',
        text: '[浅草] 明治時代に「浅草寺」の土地が国家から寺に返還された際、最も影響を与えた思想的背景は何ですか？',
        location: 'asakusa',
        options: [
          { id: 's5-a3-opt1', text: '神仏分離令の見直し', isCorrect: false },
          { id: 's5-a3-opt2', text: '宗教の自由保障', isCorrect: true },
          { id: 's5-a3-opt3', text: '伝統文化保護', isCorrect: false },
          { id: 's5-a3-opt4', text: '文化財保護法の制定', isCorrect: false }
        ]
      }
    ]
  }
};

// Mapping from 3D model names to location keys
const locationNameMap: Record<string, string> = {
  'House': 'tokyo',      // Tokyo location (House)
  'Apartment': 'shibuya', // Shibuya location (Apartment)
  'Building': 'shinjuku', // Shinjuku location (Building)
  'Shop': 'asakusa'       // Asakusa location (Shop)
};

// This mapping will help in retrieving questions based on the stage and location
export const getQuestionsForStageAndLocation = (stage: number, location: string): QuizQuestion[] => {
  // Map the 3D model name to the appropriate location key
  const mappedLocation = locationNameMap[location] || location;
  
  // Get questions appropriate for the specified stage and location
  // If stage or location not found, default to stage 1, tokyo
  const stageQuestions = stageBasedQuestions[stage] || stageBasedQuestions[1];
  return stageQuestions[mappedLocation] || stageQuestions['tokyo'];
};

// Get all questions for a specific stage
export const getAllQuestionsForStage = (stage: number): [string, QuizQuestion[]][] => {
  const stageData = stageBasedQuestions[stage] || stageBasedQuestions[1];
  return Object.entries(stageData);
};

// Get points value for a specific stage (higher stages give more points)
// Distribute total 100 points across all 60 questions (12 questions × 5 stages)
// To ensure fair scoring, we'll use points that sum to 100 across all questions
export const getPointsForStage = (stage: number): number => {
  // Stage 1: 12 questions × 1 point = 12 points max
  // Stage 2: 12 questions × 1 point = 12 points max
  // Stage 3: 12 questions × 2 points = 24 points max
  // Stage 4: 12 questions × 2 points = 24 points max
  // Stage 5: 12 questions × 3 points = 36 points max
  // Total: 108 points max (close to 100, with rounding)
  const stagePoints = [0, 1, 1, 2, 2, 3]; // Index 0 is unused
  return stagePoints[stage] || stagePoints[1]; // Default to stage 1 points
};

// Get the maximum possible score to calculate progress
export const getMaxPossibleScore = (): number => {
  // 12 questions × Stage 1 (1pt each) = 12
  // 12 questions × Stage 2 (1pt each) = 12
  // 12 questions × Stage 3 (2pt each) = 24
  // 12 questions × Stage 4 (2pt each) = 24
  // 12 questions × Stage 5 (3pt each) = 36
  // Total = 108
  return 108;
};