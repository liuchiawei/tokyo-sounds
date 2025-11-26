/**
 * Proximity Calculator for Tokyo Sounds 3D Universe
 * Calculates audio weights based on distance to locations
 */

import * as THREE from "three";
import type { MappedLocation } from "./location-mapper";
import type { TokyoPrompt } from "./gemini-client";

const PROXIMITY_RADIUS = 50; // Maximum distance to consider
const MAX_PROMPTS = 10; // Maximum number of prompts to send
const MIN_WEIGHT = 0.1; // Minimum weight for a prompt
const FALLOFF_TYPE: "linear" | "exponential" | "inverse-square" = "exponential";

export interface ProximityResult {
  prompts: TokyoPrompt[];
  highlightedLocations: Set<string>;
  nearestLocation: MappedLocation | null;
  distanceToNearest: number;
}

export class ProximityCalculator {
  private proximityRadius: number;
  private maxPrompts: number;
  private minWeight: number;

  constructor(
    proximityRadius: number = PROXIMITY_RADIUS,
    maxPrompts: number = MAX_PROMPTS,
    minWeight: number = MIN_WEIGHT
  ) {
    this.proximityRadius = proximityRadius;
    this.maxPrompts = maxPrompts;
    this.minWeight = minWeight;
  }

  /**
   * 計算基於使用者位置的權重 prompts
   * 將 3D 座標轉換為距離，再轉換為權重
   */
  calculate(
    userPosition: THREE.Vector3,
    locations: MappedLocation[]
  ): ProximityResult {
    // 計算使用者位置到每個位置的距離
    const distances = locations.map((location) => ({
      location,
      distance: userPosition.distanceTo(location.position),
    }));

    // 按距離排序（最近的在前）
    distances.sort((a, b) => a.distance - b.distance);

    // 找到最近的位置
    const nearestLocation = distances[0]?.location || null;
    const distanceToNearest = distances[0]?.distance || 0;

    // 過濾出在影響範圍內的位置
    const nearby = distances.filter((d) => d.distance < this.proximityRadius);

    // 計算權重並創建 prompts
    const prompts: TokyoPrompt[] = [];
    const locationWeights = new Map<string, number>();

    nearby.forEach(({ location, distance }) => {
      // 根據距離計算權重（指數衰減）
      const weight = this.calculateWeight(distance);

      // 只添加權重大於最小閾值的 prompts
      if (weight >= this.minWeight) {
        // 為該位置的每個 prompt 添加計算出的權重
        location.prompts.forEach((promptText) => {
          prompts.push({
            text: promptText,
            weight: weight,
          });
        });

        // 記錄位置權重用於高亮顯示
        locationWeights.set(location.id, weight);
      }
    });

    // 按權重排序並限制數量
    prompts.sort((a, b) => b.weight - a.weight);
    const limitedPrompts = prompts.slice(0, this.maxPrompts);

    // 獲取需要高亮的位置 ID
    const highlightedLocations = new Set(
      nearby
        .filter((d) => this.calculateWeight(d.distance) >= this.minWeight)
        .map((d) => d.location.id)
    );

    return {
      prompts: limitedPrompts,
      highlightedLocations,
      nearestLocation,
      distanceToNearest,
    };
  }

  /**
   * Calculate weight based on distance using selected falloff type
   */
  private calculateWeight(distance: number): number {
    switch (FALLOFF_TYPE) {
      case "linear":
        return this.calculateWeightLinear(distance);
      case "exponential":
        return this.calculateWeightExponential(distance);
      case "inverse-square":
        return this.calculateWeightInverseSquare(distance);
      default:
        return this.calculateWeightLinear(distance);
    }
  }

  /**
   * Linear falloff: weight decreases linearly with distance
   * weight = 1 - (distance / radius)
   */
  private calculateWeightLinear(distance: number): number {
    if (distance >= this.proximityRadius) return 0;
    const normalizedDistance = distance / this.proximityRadius;
    return Math.max(0, 1 - normalizedDistance);
  }

  /**
   * Exponential falloff: weight decreases exponentially with distance
   * weight = e^(-distance / scale)
   * More gradual falloff, better for smooth transitions
   */
  private calculateWeightExponential(distance: number): number {
    const scale = this.proximityRadius / 3; // Scale factor for exponential curve
    const weight = Math.exp(-distance / scale);
    return Math.max(0, Math.min(1, weight));
  }

  /**
   * Inverse square falloff: weight = 1 / (1 + distance^2)
   * Very strong at close range, drops off quickly
   */
  private calculateWeightInverseSquare(distance: number): number {
    const normalizedDistance = distance / (this.proximityRadius / 10);
    const weight = 1 / (1 + normalizedDistance * normalizedDistance);
    return Math.max(0, Math.min(1, weight));
  }

  /**
   * Get all locations within proximity radius
   */
  getLocationsInRange(
    userPosition: THREE.Vector3,
    locations: MappedLocation[]
  ): MappedLocation[] {
    return locations.filter(
      (location) =>
        userPosition.distanceTo(location.position) < this.proximityRadius
    );
  }

  /**
   * Find the N closest locations
   */
  findClosestLocations(
    userPosition: THREE.Vector3,
    locations: MappedLocation[],
    count: number = 5
  ): Array<{ location: MappedLocation; distance: number }> {
    const distances = locations.map((location) => ({
      location,
      distance: userPosition.distanceTo(location.position),
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, count);
  }

  /**
   * Calculate weight for a specific location
   */
  getWeightForLocation(
    userPosition: THREE.Vector3,
    location: MappedLocation
  ): number {
    const distance = userPosition.distanceTo(location.position);
    return this.calculateWeight(distance);
  }

  /**
   * Get weight map for all locations (for visualization)
   */
  getWeightMap(
    userPosition: THREE.Vector3,
    locations: MappedLocation[]
  ): Map<string, number> {
    const weightMap = new Map<string, number>();

    locations.forEach((location) => {
      const distance = userPosition.distanceTo(location.position);
      const weight = this.calculateWeight(distance);

      if (weight >= this.minWeight) {
        weightMap.set(location.id, weight);
      }
    });

    return weightMap;
  }

  /**
   * Update configuration
   */
  updateConfig(config: {
    proximityRadius?: number;
    maxPrompts?: number;
    minWeight?: number;
  }) {
    if (config.proximityRadius !== undefined) {
      this.proximityRadius = config.proximityRadius;
    }
    if (config.maxPrompts !== undefined) {
      this.maxPrompts = config.maxPrompts;
    }
    if (config.minWeight !== undefined) {
      this.minWeight = config.minWeight;
    }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      proximityRadius: this.proximityRadius,
      maxPrompts: this.maxPrompts,
      minWeight: this.minWeight,
      falloffType: FALLOFF_TYPE,
    };
  }
}

/**
 * Visualize weight falloff curve (for debugging/tuning)
 */
export function generateFalloffCurve(
  calculator: ProximityCalculator,
  steps: number = 100
): Array<{ distance: number; weight: number }> {
  const config = calculator.getConfig();
  const curve: Array<{ distance: number; weight: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const distance = (i / steps) * config.proximityRadius;
    const weight = calculator.getWeightForLocation(new THREE.Vector3(0, 0, 0), {
      id: "test",
      name: "Test",
      position: new THREE.Vector3(distance, 0, 0),
      prompts: [],
      category: "test",
      originalLocation: {
        name: "Test",
        lat: 0,
        lng: 0,
        category: "district",
        prompts: [],
      },
    } as MappedLocation);

    curve.push({ distance, weight });
  }

  return curve;
}
