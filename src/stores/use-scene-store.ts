// シーン管理のための Zustand ストア - Zustand store for scene management
import { create } from 'zustand';
import { Scene, SceneState, CameraPosition, Building } from '../types/scene';

// 初期シーンデータ - Initial scene data
const initialScenes: Scene[] = [
  {
    id: 'tokyo-overview',
    name: '東京概要', // Tokyo Overview
    description: '東京の象徴的な地区のパノラマビュー', // Panoramic views of Tokyo's most iconic districts
    thumbnail: '/ui/thumbs/tokyo-overview.png',
    cameraPositions: [
      {
        position: [0, 400, 0],
        target: [0, 0, 0],
        fov: 45,
        name: '東京の展望', // Tokyo Metropolitan View
        description: '東京のスカイラインと都市のレイアウトの広範な概要', // A sweeping overview of Tokyo's skyline and urban layout
        modalContent: {
          title: '東京の展望',
          description: '東京のスカイラインと都市のレイアウトの広範な概要',
          details: '東京は世界最大の都市圏の一つで、約1400万人の人口を擁する日本の首都です。このビューからは、東京の多様な地区と建築物の配置を一望できます。'
        }
      },
      {
        position: [0, 100, 0],
        target: [500, 0, 0], // Looking toward the eastern part of the model (positive X) - モデルの東側（正のX）を向いています
        fov: 50,
        name: '東京東部の展望', // Eastern Tokyo Perspective
        description: '東京の東部都市地区を紹介するビュー', // View showcasing Tokyo's eastern urban district
        modalContent: {
          title: '東京東部の展望',
          description: '東京の東部都市地区を紹介するビュー',
          details: '東京の東部は、江戸時代から続く歴史的な地区と現代的な高層ビルが混在するエリアです。浅草、上野、両国などの伝統的な地区が含まれます。'
        }
      },
      {
        position: [0, 100, 0],
        target: [-500, 0, 0], // Looking toward the western part of the model (negative X) - モデルの西部（負のX）を向いています
        fov: 45,
        name: '東京西部のパノラマ', // Western Tokyo Panorama
        description: '東京西部地区のパノラマビュー' // Panoramic view of Tokyo's western districts
      }
    ]
  },
  {
    id: 'shibuya-crossing',
    name: '渋谷スクランブル交差点', // Shibuya Crossing
    description: '世界一混雑する歩道交差点を探索', // Explore the world's busiest pedestrian crossing
    thumbnail: '/ui/thumbs/shibuya-crossing.png',
    cameraPositions: [
      {
        position: [-245, 120, -445], // Very close to the ground, street level - 地面に非常に近く、ストリートレベル
        target: [-540, -110, -440], // Looking slightly up and ahead at street level - ストリートレベルで少し上を向いて前方を見ています
        fov: 60,
        name: '渋谷スクランブル交差点 ストリートビュー', // Shibuya Crossing Street View
        description: '忠犬ハチ公像のある象徴的なスクランブル交差点の地上レベルビュー', // Ground-level view of the iconic scramble crossing with Hachiko statue
        modalContent: {
          title: '渋谷スクランブル交差点',
          description: '世界一混雑する歩道交差点',
          details: '渋谷スクランブル交差点は、1回の信号で約3000人が横断する世界一混雑する歩道交差点です。忠犬ハチ公像は待ち合わせの定番スポットとして知られています。'
        }
      },
      {
        position: [-400, 800, -500], // From a nearby building/roof top - 近くの建物/屋上から
        target: [-549, -127, -453], // Looking toward the intersection - 交差点に向かって
        fov: 50,
        name: '渋谷スクランブル交差点 屋上ビュー', // Shibuya Crossing Rooftop View
        description: '隣接する建物から交差点越しに見るビュー' // View from an adjacent building looking across to the crossing
      },
      {
        position: [-300, 30, -200], // Far away view showing the whole area - 全域を示す遠くからのビュー
        target: [-549, -127, -453], // Looking toward the intersection from distance - 距離をおいて交差点を見ています
        fov: 35,
        name: '渋谷スクランブル交差点 遠景ビュー', // Shibuya Crossing Distant View
        description: '交差点と周囲のエリアを示す遠景ビュー' // Distant view showing the crossing and surrounding area
      }
    ]
  },
  {
    id: 'tokyo-tower',
    name: '東京タワー', // Tokyo Tower
    description: '東京の象徴的な通信塔を体験', // Experience Tokyo's iconic communications tower
    thumbnail: '/ui/thumbs/tokyo-tower.png',
    cameraPositions: [
      {
        position: [-858, -30, -700], // Near the tall house structure - 高い建物構造の近く
        target: [-858, 30, -550],
        fov: 40,
        name: '東京タワーの足元から', // Tokyo Tower from Foot
        description: '芝公園から見る東京タワーのビュー' // View of Tokyo Tower from the foot in Shiba Park
      },
      {
        position: [-900, 10, -600], // From the north side of the tall house - 高い建物の北側から
        target: [-858, 50, -550], // Looking at the tall building - 高い建物を見ています
        fov: 50,
        name: '東京タワー 北側から', // Tokyo Tower from North
        description: '遠くに皇居を望む北側からのビュー' // View from the north side with the Imperial Palace in the distance
      },
      {
        position: [-800, 30, -650], // Approach view of the tall house - 高い建物に近づくビュー
        target: [-858, 60, -550], // Looking at the tall building - 高い建物を見ています
        fov: 45,
        name: '東京タワー 近づく', // Tokyo Tower Approach
        description: 'タワーの特徴的な赤白カラーを示す近づくビュー' // Approach view showing the tower's distinctive red-white coloration
      }
    ]
  },
  {
    id: 'shinjuku',
    name: '新宿', // Shinjuku
    description: '東京のにぎやかなエンターテインメントとビジネス地区を探索', // Explore Tokyo's bustling entertainment and business district
    thumbnail: '/ui/thumbs/shinjuku.png',
    cameraPositions: [
      {
        position: [-950, -60, -1000], // At the commercial district with the shop - 店のある商業地区に
        target: [-900, -40, -900], // Looking at the commercial area - 商業地区を見ています
        fov: 55,
        name: '新宿駅前', // Shinjuku Station Front
        description: 'にぎやかな新宿駅エリアのストリートレベルビュー' // Street-level view of the busy Shinjuku Station area
      },
      {
        position: [-920, 10, -950], // Mid-level view of commercial area - 商業地区の中間レベルのビュー
        target: [-900, -10, -900], // Focus on the shop and surrounding area - 店と周囲のエリアに焦点を当てています
        fov: 50,
        name: '新宿街中ビュー', // Shinjuku Urban View
        description: '新宿の密集した高層都市環境を示す中間レベルのビュー' // Mid-level view showing Shinjuku's dense urban high-rise environment
      },
      {
        position: [-850, 20, -970], // From the east of the commercial area - 商業地区の東側から
        target: [-900, 0, -900], // Looking toward the commercial district - 商業地区に向かって
        fov: 45,
        name: '新宿 東側から', // Shinjuku from East
        description: '商業地区をハイライトする東側からのビュー' // View from the east side highlighting the commercial district
      }
    ]
  },
  {
    id: 'roppongi',
    name: '六本木', // Roppongi
    description: '東京の国際的なエンターテインメント地区を体験', // Experience Tokyo's international entertainment district
    thumbnail: '/ui/thumbs/roppongi.png',
    cameraPositions: [
      {
        position: [100, 40, -1000], // In the park area with trees and benches - 木とベンチのある公園エリアに
        target: [150, 0, -900], // Looking toward the green area - 緑地に向かって
        fov: 60,
        name: '六本木ヒルズビュー', // Roppongi Hills View
        description: '六本木ヒルズと周囲のエンターテインメント地区のビュー' // View of Roppongi Hills and the surrounding entertainment district
      },
      {
        position: [50, -50, -900], // At the central area with trees - 木のある中央エリアに
        target: [100, 0, -900], // Looking at the park area - 公園エリアを見ています
        fov: 50,
        name: '六本木交差点', // Roppongi Intersection
        description: 'ナイトライフ施設のある六本木の主要交差点のビュー' // View of the main intersection in Roppongi with its nightlife venues
      },
      {
        position: [200, 30, -900], // In the green area with trees and benches - 木とベンチのある緑地に
        target: [150, 0, -900], // Looking at the park features - 公園の特徴を見ています
        fov: 55,
        name: '六本木アート地区', // Roppongi Art District
        description: '多数の美術館と国際的な雰囲気をハイライトするビュー' // View highlighting the many art galleries and international flair
      }
    ]
  }
];

// 建物データ - Building data
const buildings: Building[] = [
  {
    id: 'tokyo-tower',
    name: '東京タワー',
    description: '東京の象徴的な通信塔',
    type: 'landmark',
    modalContent: {
      title: '東京タワー',
      description: '東京の象徴的な赤白の通信塔',
      details: '1958年に完成した東京タワーは、高さ333メートルの電波塔です。東京のランドマークとして親しまれ、展望台からは東京の美しい景色を一望できます。',
      history: '1958年12月23日に完成。設計は内藤多仲。当初はテレビ・ラジオの電波塔として建設されました。',
      features: ['展望台', '電波塔', '夜景スポット', '東京のシンボル']
    }
  },
  {
    id: 'roppongi-hills',
    name: '六本木ヒルズ',
    description: '六本木の高層複合施設',
    type: 'commercial',
    modalContent: {
      title: '六本木ヒルズ',
      description: '六本木の高層複合施設',
      details: '六本木ヒルズは、オフィス、住宅、商業施設、文化施設が一体となった複合都市です。森タワーを中心に、美術館や映画館、レストランなどが集まっています。',
      history: '2003年に開業。森ビルが開発した六本木地区の再開発プロジェクトの中心施設です。',
      features: ['森タワー', '森美術館', '六本木ヒルズアリーナ', '展望台', 'ショッピングモール']
    }
  },
  {
    id: 'shinjuku-station',
    name: '新宿駅ビル',
    description: '世界一乗降客数の多い駅',
    type: 'station',
    modalContent: {
      title: '新宿駅',
      description: '世界一乗降客数の多い駅',
      details: '新宿駅は1日の乗降客数が約350万人を超える世界一混雑する駅です。JR東日本、小田急、京王、都営地下鉄、東京メトロの5つの鉄道会社が乗り入れています。',
      history: '1885年に甲武鉄道の新宿駅として開業。その後、複数の路線が乗り入れ、現在の巨大なターミナル駅となりました。',
      features: ['世界一の乗降客数', '5つの鉄道会社', '地下街', '商業施設', 'バスターミナル']
    }
  },
  {
    id: 'shibuya-crossing-area',
    name: '渋谷スクランブル交差点',
    description: '世界一混雑する歩道交差点',
    type: 'landmark',
    modalContent: {
      title: '渋谷スクランブル交差点',
      description: '世界一混雑する歩道交差点',
      details: '渋谷スクランブル交差点は、1回の信号で約3000人が横断する世界一混雑する歩道交差点です。忠犬ハチ公像は待ち合わせの定番スポットとして知られています。',
      history: '1973年に現在の形に整備されました。忠犬ハチ公像は1934年に建立され、戦争中に一時撤去されましたが、1948年に再建されました。',
      features: ['世界一の歩行者数', '忠犬ハチ公像', '待ち合わせスポット', '夜景スポット', 'ショッピングエリア']
    }
  },
  {
    id: 'roppongi-park',
    name: '六本木公園',
    description: '六本木の緑豊かな公園',
    type: 'park',
    modalContent: {
      title: '六本木公園',
      description: '六本木の緑豊かな公園',
      details: '六本木公園は、都市部にありながら豊かな緑に囲まれた憩いの空間です。ベンチや遊具があり、地域住民の憩いの場として親しまれています。',
      history: '六本木地区の再開発に伴い整備された都市公園です。',
      features: ['緑豊かな環境', 'ベンチ', '遊具', '憩いの空間', '都市のオアシス']
    }
  },
  {
    id: 'shinjuku-park',
    name: '新宿公園',
    description: '新宿の都市公園',
    type: 'park',
    modalContent: {
      title: '新宿公園',
      description: '新宿の都市公園',
      details: '新宿の商業地区に位置する都市公園です。高層ビルに囲まれた中で、緑豊かな空間を提供しています。',
      history: '新宿地区の都市計画に基づいて整備された公園です。',
      features: ['都市の緑地', 'ベンチ', '憩いの空間', '商業地区のオアシス']
    }
  }
];

export const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: initialScenes[0],
  currentLandmark: initialScenes[0].cameraPositions[0],
  allScenes: initialScenes,
  isLoading: false,
  error: null,
  
  // タイトル表示状態 - Title display state
  title: {
    isVisible: false,
    position: null,
    title: null,
  },
  
  // 現在のシーンを設定 - Set current scene
  setCurrentScene: (scene) => set({ currentScene: scene }),
  
  // 現在のランドマークを設定 - Set current landmark
  setCurrentLandmark: (landmark) => set({ currentLandmark: landmark }),
  
  // ランドマークにカメラを移動 - Move camera to landmark
  moveCameraToLandmark: (landmark) => {
    // This function will be called to move the camera to a specific landmark
    // この関数はカメラを特定のランドマークに移動させるために呼び出されます
    set({ currentLandmark: landmark });
    
    // Get the global camera controls instance
    // グローバルなカメラコントロールインスタンスを取得
    const cameraControls = (window as any).cameraControls as any;
    
    if (cameraControls) {
      // Extract position and target from landmark
      // ランドマークから位置とターゲットを抽出
      const [posX, posY, posZ] = landmark.position;
      const [targetX, targetY, targetZ] = landmark.target;
      
      // Animate to the new position and target
      // 新しい位置とターゲットにアニメーション
      cameraControls.setLookAt(
        posX, posY, posZ,     // New camera position - 新しいカメラ位置
        targetX, targetY, targetZ,  // New target - 新しいターゲット
        true  // Enable smooth transition - スムーズなトランジションを有効化
      );
    }
  },
  
  // シーンを読み込む - Load scenes
  loadScenes: async () => {
    try {
      set({ isLoading: true, error: null });
      // In a real implementation, this would fetch scene data from an API or JSON file
      // 実装では、APIまたはJSONファイルからシーンデータを取得します
      // For now, we'll use the initial data
      // 今のところ、初期データを使用します
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network request - ネットワークリクエストをシミュレート
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'シーンの読み込みに失敗しました' }); // Failed to load scenes
    }
  },
  
  // タイトルを表示 - Show title
  showTitle: (position, title) => {
    console.log('showTitle called:', { position, title });
    set({ 
      title: { 
        isVisible: true, 
        position, 
        title 
      } 
    });
  },
  
  // タイトルを非表示 - Hide title
  hideTitle: () => set({ 
    title: { 
      isVisible: false, 
      position: null, 
      title: null 
    } 
  }),
  
  // 建物データを取得 - Get building data
  getBuildingById: (id: string) => buildings.find(building => building.id === id),
  
  // 全建物データを取得 - Get all building data
  getAllBuildings: () => buildings
}));

// デバッグ用にグローバルに公開 - Expose globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__ZUSTAND_STORE__ = useSceneStore;
}