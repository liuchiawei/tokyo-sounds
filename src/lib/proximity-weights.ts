/**
 * Proximity Weight Calculator
 * Calculates weighted prompts based on camera distance to buildings
 */

import type { Object3D, Scene, Vector3, Vector3Tuple } from "three";
import { Box3, Sphere, Vector3 as ThreeVector3 } from "three";
import { BUILDING_PROMPTS, PROXIMITY_CONFIG } from "@/config/building-prompts";

export interface WeightedPrompt {
  text: string;
  weight: number;
}

export interface BuildingWeight {
  id: string;
  name: string;
  distance: number;
  surfaceDistance: number;
  weight: number;
  prompt: string;
}

const runtimePositions = new Map<string, Vector3Tuple>();
const runtimeRadii = new Map<string, number>();

BUILDING_PROMPTS.forEach(b => {
  runtimePositions.set(b.id, b.position);
  runtimeRadii.set(b.id, 0);
});

const scratch = new ThreeVector3();
const scratchBox = new Box3();
const scratchSphere = new Sphere();

const positionsEqual = (a: Vector3Tuple, b: Vector3Tuple, epsilon = 1e-3) =>
  Math.abs(a[0] - b[0]) < epsilon &&
  Math.abs(a[1] - b[1]) < epsilon &&
  Math.abs(a[2] - b[2]) < epsilon;

export function refreshBuildingPositionsFromScene(scene: Scene): boolean {
  let updated = false;

  const findTarget = (building: (typeof BUILDING_PROMPTS)[number]): Object3D | null => {
    const byName = scene.getObjectByName(building.meshName);
    if (byName) return byName;

    const byId = scene.getObjectByProperty("userData.lyriaId", building.id);
    if (byId) return byId;
    const byNameProp = scene.getObjectByProperty("userData.lyriaName", building.name);
    if (byNameProp) return byNameProp;
    const byMeshProp = scene.getObjectByProperty("userData.lyriaMesh", building.meshName);
    if (byMeshProp) return byMeshProp;

    return null;
  };

  for (const building of BUILDING_PROMPTS) {
    const target = findTarget(building);
    if (!target) continue;

    target.updateWorldMatrix(true, false);
    target.getWorldPosition(scratch);
    const worldPos: Vector3Tuple = [scratch.x, scratch.y, scratch.z];

    scratchBox.setFromObject(target);
    scratchBox.getBoundingSphere(scratchSphere);
    const radius = scratchSphere.radius || 0;

    const prevPos = runtimePositions.get(building.id);
    const prevRadius = runtimeRadii.get(building.id);
    
    if (!prevPos || !positionsEqual(prevPos, worldPos, 0.1) || Math.abs((prevRadius || 0) - radius) > 0.1) {
      console.log(`Building moved: ${building.id} to ${worldPos.map(v => v.toFixed(2))}`);
      runtimePositions.set(building.id, worldPos);
      runtimeRadii.set(building.id, radius);
      updated = true;
    }
  }

  return updated;
}

export const buildingAnchorsResolved = () =>
  runtimePositions.size === BUILDING_PROMPTS.length;

const getEffectiveBuildings = () =>
  BUILDING_PROMPTS.map((building) => ({
    ...building,
    position: runtimePositions.get(building.id) ?? building.position,
    radius: runtimeRadii.get(building.id) ?? 0,
  }));

export function calculateDistance(
  point1: Vector3 | Vector3Tuple,
  point2: Vector3 | Vector3Tuple
): number {
  const [x1, y1, z1] = Array.isArray(point1)
    ? point1
    : [point1.x, point1.y, point1.z];
  const [x2, y2, z2] = Array.isArray(point2)
    ? point2
    : [point2.x, point2.y, point2.z];

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function distanceToWeight(
  distance: number,
  fullDistance: number = PROXIMITY_CONFIG.FULL_INFLUENCE_DISTANCE,
  zeroDistance: number = PROXIMITY_CONFIG.NO_INFLUENCE_DISTANCE
): number {
  if (distance <= fullDistance) return 1.0;
  if (distance >= zeroDistance) return 0.0;

  const range = zeroDistance - fullDistance;
  const normalizedDistance = (distance - fullDistance) / range;
  return 1.0 - normalizedDistance;
}

export function calculateBuildingWeights(
  cameraPosition: Vector3 | Vector3Tuple
): BuildingWeight[] {
  const buildings = getEffectiveBuildings();

  return buildings.map((building) => {
    const distance = calculateDistance(cameraPosition, building.position);
    const surfaceDistance = Math.max(0, distance - building.radius);
    const weight = distanceToWeight(surfaceDistance);

    return {
      id: building.id,
      name: building.name,
      distance,
      surfaceDistance,
      weight,
      prompt: building.prompt
    };
  }).sort((a, b) => b.weight - a.weight); // Sort by weight descending
}

export function getWeightedPromptsForLyria(
  cameraPosition: Vector3 | Vector3Tuple
): WeightedPrompt[] {
  const buildingWeights = calculateBuildingWeights(cameraPosition);

  const activeBuildings = buildingWeights
    .filter((b) => b.weight >= PROXIMITY_CONFIG.MIN_WEIGHT_THRESHOLD)
    .slice(0, PROXIMITY_CONFIG.MAX_ACTIVE_PROMPTS);

  const totalWeight = activeBuildings.reduce((sum, b) => sum + b.weight, 0);

  if (totalWeight === 0) {
    return [];
  }

  return activeBuildings.map((building) => ({
    text: building.prompt,
    weight: building.weight
  }));
}

export function hasSignificantChange(
  previous: WeightedPrompt[],
  current: WeightedPrompt[],
  threshold: number = 0.1
): boolean {
  if (previous.length !== current.length) return true;

  for (let i = 0; i < current.length; i++) {
    const prevWeight = previous[i]?.weight ?? 0;
    const currWeight = current[i]?.weight ?? 0;

    if (Math.abs(currWeight - prevWeight) > threshold) {
      return true;
    }

    if (previous[i]?.text !== current[i]?.text) {
      return true;
    }
  }

  return false;
}
