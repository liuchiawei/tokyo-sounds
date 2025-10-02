import { GLTF } from 'three-stdlib'
import * as THREE from 'three'

// GLBモデルの型定義 - Type definitions for the GLB model
export type GLTFResult = GLTF & {
  nodes: {
    // 3Dモデルのノード定義 - Node definitions for 3D model elements
    CAR_03_1_World_ap_0: THREE.Mesh
    Car_08_4_World_ap8_0: THREE.Mesh
  }
  materials: {
    // 3Dモデルのマテリアル定義 - Material definitions for 3D model elements  
    World_ap: THREE.MeshStandardMaterial
    ['World_ap.8']: THREE.MeshStandardMaterial
    [key: string]: THREE.Material
  }
  animations: THREE.AnimationClip[]
}

// 建物データの型定義 - Type definition for building data
export interface BuildingData {
  id: string
  nameJP: string
  nameEN: string
  thumbnail?: string
  modelMesh: string  // モデル内のメッシュ名 - Name of the mesh in the model
  shortDescJP: string
  shortDescEN: string
  fullDescJP: string
  fullDescEN: string
  height?: number  // 高さ (メートル) - Height in meters
  year?: number    // 建設年 - Construction year
  audioSrc?: string // 音声ファイルのパス - Path to audio file
  position?: [number, number, number] // 3D空間内の位置 - Position in 3D space
  scale?: number // スケール - Scale factor
  rotation?: [number, number, number] // 回転 - Rotation values
}