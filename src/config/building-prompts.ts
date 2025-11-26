/**
 * Building Prompt Configuration
 * Maps each building in the Tokyo scene to a musical prompt for Lyria RealTime API
 */

import type { Vector3Tuple } from "three";

export interface BuildingPrompt {
  id: string;
  name: string;
  /** Mesh name inside the GLB scene so we can query runtime world positions */
  meshName: string;
  position: Vector3Tuple;
  prompt: string;
  description: string;
}

/**
 * Musical prompts for each building in the scene
 * Positions match those defined in Model.tsx
 */
export const BUILDING_PROMPTS: BuildingPrompt[] = [
  {
    id: "house",
    name: "House",
    meshName: "House_World_ap_0",
    position: [-714.491, 50.72, 24.514], // world coords with parent rotation/offset applied
    prompt: "Traditional Japanese melody with koto and shakuhachi flute, peaceful garden ambiance, gentle wind chimes",
    description: "Traditional Japanese residential atmosphere"
  },
  {
    id: "apartment",
    name: "Apartment",
    meshName: "House_2_World_ap_0",
    position: [216.305, -136.604, 130.338],
    prompt: "Modern lo-fi beats with soft piano, urban atmosphere, gentle rain sounds, chill hip-hop rhythms",
    description: "Contemporary urban dwelling vibes"
  },
  {
    id: "building",
    name: "Building",
    meshName: "House_3_World_ap_0",
    position: [-4.799, -82.684, -964.365],
    prompt: "Minimal techno with deep bass, sparse percussion, electronic ambiance, futuristic synth pads",
    description: "Modern office/commercial district energy"
  },
  {
    id: "shop",
    name: "Shop",
    meshName: "Shop_World_ap_0",
    position: [-1061.798, -125.275, -929.908],
    prompt: "Upbeat city pop with retro synthesizers, funky bass lines, 80s Japanese pop vibes, energetic drums",
    description: "Vibrant shopping district atmosphere"
  }
];

/**
 * Distance thresholds for proximity-based weighting
 * Based on existing spatial audio parameters in useAudio.ts
 */
export const PROXIMITY_CONFIG = {
  /** Distance at which building has full influence (1.0 weight) */
  FULL_INFLUENCE_DISTANCE: 200,

  /** Distance at which building has no influence (0.0 weight) */
  NO_INFLUENCE_DISTANCE: 400,

  /** Minimum weight threshold to include in weighted prompts */
  MIN_WEIGHT_THRESHOLD: 0.01,

  /** Maximum number of simultaneous building prompts to blend */
  MAX_ACTIVE_PROMPTS: 4
} as const;
