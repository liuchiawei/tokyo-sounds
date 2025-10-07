// シーン管理のための Zustand ストア - Zustand store for scene management
import { create } from 'zustand';
import { Scene, SceneState, CameraPosition } from '../types/scene';

// 初期シーンデータ - Initial scene data
const initialScenes: Scene[] = [
  {
    id: 'tokyo-city-overview',
    name: 'Tokyo City Overview',
    description: 'A panoramic view of the Tokyo city model',
    thumbnail: '/ui/thumbs/city-overview.png',
    cameraPositions: [
      {
        position: [0, 50, 100],
        target: [0, 0, 0],
        fov: 45,
        name: 'City Center Overview',
        description: 'A wide view of the city center area'
      },
      {
        position: [-500, 1000, 1600],
        target: [-400, 0, 400],
        fov: 40,
        name: 'Northern District',
        description: 'View of the northern part of the city'
      },
      {
        position: [-400, 1000, 200],
        target: [400, 0, -400],
        fov: 40,
        name: 'Southern District',
        description: 'View of the southern part of the city'
      }
    ]
  },
  {
    id: 'central-tokyo',
    name: 'Central Tokyo',
    description: 'Focus on the central area of Tokyo',
    thumbnail: '/ui/thumbs/central-tokyo.png',
    cameraPositions: [
      {
        position: [200, 25, 200],
        target: [150, 0, 150],
        fov: 50,
        name: 'Central Plaza',
        description: 'A central plaza with surrounding buildings'
      },
      {
        position: [-100, 30, -100],
        target: [-50, 0, -50],
        fov: 45,
        name: 'West District',
        description: 'Western part of the central area'
      }
    ]
  },
  {
    id: 'building-views',
    name: 'Building Top Views',
    description: 'Views from above prominent buildings in the city',
    thumbnail: '/ui/thumbs/building-views.png',
    cameraPositions: [
      {
        position: [-858.07, 150, 24.514], // Above the first main grouping area
        target: [-858.07, 0, 24.514],
        fov: 50,
        name: 'Central Building View',
        description: 'Top-down view of the central building area'
      },
      {
        position: [84.723, 200, 8.453], // Above the third group (House_2 area)
        target: [84.723, 0, 8.453],
        fov: 45,
        name: 'East District View',
        description: 'Overlooking the eastern district from a high vantage point'
      },
      {
        position: [-938.463, 180, -995.244], // Above the fourth group (House_3 area)
        target: [-938.463, 0, -995.244],
        fov: 50,
        name: 'West District View',
        description: 'Top-down view of the western district'
      }
    ]
  },
  {
    id: 'tokyo-details',
    name: 'Tokyo Details',
    description: 'Close-up views of Tokyo city elements',
    thumbnail: '/ui/thumbs/details.png',
    cameraPositions: [
      {
        position: [22.131, 25, -475.071], // Above CAR_03_1 location
        target: [22.131, 0, -475.071],
        fov: 60,
        name: 'Central Intersection View',
        description: 'Aerial view of the central intersection with traffic'
      },
      {
        position: [-281.155, 25, 108.452], // Above CAR_03 location
        target: [-281.155, 0, 108.452],
        fov: 60,
        name: 'North Traffic View',
        description: 'View of the northern road with vehicles'
      },
      {
        position: [0, 200, 200], // High above the main city area
        target: [0, 0, 0],
        fov: 55,
        name: 'Metropolitan View',
        description: 'High altitude view of the entire metropolitan area'
      },
      {
        position: [-6.17, 120, 785.616], // Above the Car_08_World_ap16 (central area)
        target: [-6.17, 0, 785.616],
        fov: 50,
        name: 'Downtown View',
        description: 'View of the downtown district'
      }
    ]
  },
  {
    id: 'tokyo-infrastructure',
    name: 'Tokyo Infrastructure',
    description: 'Views of Tokyo transportation and infrastructure',
    thumbnail: '/ui/thumbs/infrastructure.png',
    cameraPositions: [
      {
        position: [-549.038, 100, -453.774], // Above the road infrastructure
        target: [-549.038, 0, -453.774],
        fov: 50,
        name: 'Expressway View',
        description: 'View of the highway infrastructure'
      },
      {
        position: [-878.585, 80, -92.938], // Above traffic_light_2_2 location
        target: [-878.585, 0, -92.938],
        fov: 60,
        name: 'Traffic Junction',
        description: 'Detailed view of a traffic junction'
      },
      {
        position: [474.599, 100, -256.178], // Above traffic_light_World_ap_0 location
        target: [474.599, 0, -256.178],
        fov: 55,
        name: 'Main Intersection',
        description: 'View of a main intersection with traffic lights'
      }
    ]
  }
];

export const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: initialScenes[0],
  currentLandmark: initialScenes[0].cameraPositions[0],
  allScenes: initialScenes,
  isLoading: false,
  error: null,
  
  setCurrentScene: (scene) => set({ currentScene: scene }),
  
  setCurrentLandmark: (landmark) => set({ currentLandmark: landmark }),
  
  moveCameraToLandmark: (landmark) => {
    // This function will be called to move the camera to a specific landmark
    set({ currentLandmark: landmark });
    
    // Get the global camera controls instance
    const cameraControls = (window as any).cameraControls as any;
    
    if (cameraControls) {
      // Extract position and target from landmark
      const [posX, posY, posZ] = landmark.position;
      const [targetX, targetY, targetZ] = landmark.target;
      
      // Animate to the new position and target
      cameraControls.setLookAt(
        posX, posY, posZ,     // New camera position
        targetX, targetY, targetZ,  // New target
        true  // Enable smooth transition
      );
    }
  },
  
  loadScenes: async () => {
    try {
      set({ isLoading: true, error: null });
      // In a real implementation, this would fetch scene data from an API or JSON file
      // For now, we'll use the initial data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network request
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to load scenes' });
    }
  }
}));