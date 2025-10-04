/**
 * @file This file contains the data and categorization for all interactive objects in the city model.
 * @file このファイルには、都市モデル内のすべてのインタラクティブオブジェクトのデータと分類が含まれています。
 */

/**
 * @typedef {Object} ObjectData
 * @property {string} nameJP - The Japanese name of the object.
 * @property {string} shortDescJP - A short Japanese description.
 * @property {string} category - The category of the object (e.g., 'building', 'vehicle').
 * @property {string} audioSrc - The path to the associated audio file.
 */

/**
 * A record mapping mesh names to their detailed data.
 * メッシュ名を詳細データにマッピングするレコード。
 * @type {Record<string, ObjectData>}
 */
export const objectData = {
  "House_World_ap_0": {
    nameJP: "住宅A",
    shortDescJP: "典型的な日本の住宅。2階建てで、小さな庭付き。",
    category: "building",
    audioSrc: "/audio/residential-ambience.mp3"
  },
  "Shop_World_ap_0": {
    nameJP: "商店",
    shortDescJP: "地域の小さな商店。日用品や食料品を販売。",
    category: "building", 
    audioSrc: "/audio/shop-ambience.mp3"
  },
  "CAR_03_1_World_ap_0": {
    nameJP: "青い車",
    shortDescJP: "街を走る青いコンパクトカー。",
    category: "vehicle",
    audioSrc: "/audio/car-engine.mp3"
  },
  "traffic_light_World_ap_0": {
    nameJP: "信号機",
    shortDescJP: "交通を制御する信号機。安全な街づくりに欠かせない。",
    category: "infrastructure",
    audioSrc: "/audio/traffic-sounds.mp3"
  }
  // NOTE: More detailed object data can be added here as needed.
  // 注：必要に応じて、より詳細なオブジェクトデータをここに追加できます。
};

/**
 * An object containing arrays of mesh names, categorized for interaction.
 * インタラクションのために分類されたメッシュ名の配列を含むオブジェクト。
 */
export const interactiveObjects = {
  // 建物 - Buildings
  buildings: [
    "House_World_ap_0",
    "House_2_World_ap_0",
    "House_3_World_ap_0",
    "Shop_World_ap_0"
  ],
  
  // 車両 - Vehicles
  vehicles: [
    "CAR_03_1_World_ap_0",
    "CAR_03_World_ap_0",
    "Car_04_World_ap_0",
    "CAR_03_2_World_ap_0",
    "Car_04_1_World_ap_0",
    "Car_04_2_World_ap_0",
    "Car_04_3_World_ap_0",
    "Car_04_4_World_ap_0",
    "Car_08_4_World_ap8_0",
    "Car_08_3_World_ap9_0",
    "Car_04_1_2_World_ap_0",
    "Car_08_2_World_ap11_0",
    "CAR_03_1_2_World_ap_0",
    "CAR_03_2_2_World_ap_0",
    "Car_04_2_2_World_ap_0",
    "Car_08_1_World_ap15_0",
    "Car_08_World_ap16_0",
    "Car_08_5_World_ap17_0",
    "CAR_03_2_3_World_ap_0",
    "Car_08_6_World_ap19_0",
    "CAR_03_3_World_ap_0"
  ],
  
  // インフラ - Infrastructure
  infrastructure: [
    "traffic_light_World_ap_0",
    "Light_3_World_ap_0",
    "Light_2_World_ap_0",
    "Light_1_World_ap_0",
    "Light_World_ap_0",
    "traffic_light_1_World_ap_0",
    "traffic_light_2_World_ap_0",
    "Light_3_2_World_ap_0",
    "Light_2_2_World_ap_0",
    "Light_1_2_World_ap_0",
    "Light_2_3_World_ap_0",
    "Light_3_3_World_ap_0",
    "Light_2_4_World_ap_0",
    "Light_1_3_World_ap_0",
    "Light_3_4_World_ap_0",
    "Light_4_World_ap_0",
    "Light_5_World_ap_0",
    "Light_3_5_World_ap_0",
    "Light_2_5_World_ap_0",
    "Light_4_2_World_ap_0",
    "traffic_light_2_2_World_ap_0",
    "traffic_light_1_2_World_ap_0",
    "traffic_light_2_3_World_ap_0",
    "ROAD_World_ap_0",
    "ROAD_Lines_12_World_ap_0"
  ],
  
  // 自然 - Nature
  nature: [
    "Bushes_3_World_ap_0",
    "Bushes_3_2_World_ap_0",
    "Firtree_47_World_ap_0",
    "Firtree_3_World_ap_0",
    "Firtree_2_World_ap_0",
    "Firtree_1_World_ap_0",
    "Firtree_World_ap_0",
    "Firtree_4_World_ap_0",
    "Firtree_47_2_World_ap_0",
    "Firtree_3_2_World_ap_0",
    "Firtree_2_2_World_ap_0",
    "Firtree_1_2_World_ap_0",
    "Firtree_2_3_World_ap_0",
    "Firtree_4_2_World_ap_0",
    "Bushes_15_World_ap_0",
    "Bushes_2_World_ap_0",
    "Bushes_2_2_World_ap_0",
    "Tree_1_World_ap_0",
    "Tree_2_World_ap_0",
    "Tree_3_World_ap_0",
    "Bushes_15_2_World_ap_0",
    "Bushes_2_3_World_ap_0",
    "Bushes_4_World_ap_0",
    "Tree_1_2_World_ap_0",
    "Tree_2_2_World_ap_0",
    "Tree_3_2_World_ap_0"
  ],

  // 家具とその他 - Furniture and Other
  furniture: [
    "Floor_4_World_ap_0",
    "Floor_World_ap_0",
    "Bed_World_ap_0",
    "Bed_2_World_ap_0",
    "Bench_1_World_ap_0",
    "Floor_4_2_World_ap_0",
    "Floor_2_World_ap_0",
    "Cube_7_World_ap_0",
    "Bench_World_ap_0",
    "Muff_1_World_ap_0",
    "Muff_World_ap_0",
    "Floor_4_3_World_ap_0",
    "Floor_3_World_ap_0",
    "Cube_7_2_World_ap_0",
    "Bench_2_World_ap_0",
    "Behch_World_ap_0", // Typo in model? Assumed to be a bench.
    "Trash_World_ap_0",
    "Trash_2_World_ap_0",
    "Floor_4_4_World_ap_0",
    "Floor_4_5_World_ap_0",
    "Bed_3_World_ap_0",
    "Bed_4_World_ap_0",
    "Floor_6_World_ap_0"
  ]
};