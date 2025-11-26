/**
 * Position Tracker for Tokyo Sounds
 * Tracks user position changes and triggers updates at intervals
 */

import * as THREE from 'three';

export interface PositionChangeCallback {
  (newPosition: THREE.Vector3, oldPosition: THREE.Vector3): void;
}

export class PositionTracker {
  private lastPosition: THREE.Vector3;
  private lastUpdateTime: number = 0;
  private updateInterval: number; // milliseconds
  private minDistanceThreshold: number; // minimum distance to trigger update
  private onPositionChange?: PositionChangeCallback;

  constructor(
    initialPosition: THREE.Vector3,
    updateInterval: number = 10000, // 10 seconds default
    minDistanceThreshold: number = 5.0 // 5 units minimum movement
  ) {
    this.lastPosition = initialPosition.clone();
    this.updateInterval = updateInterval;
    this.minDistanceThreshold = minDistanceThreshold;
  }

  /**
   * Check if position has changed significantly
   */
  checkPosition(currentPosition: THREE.Vector3): boolean {
    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - this.lastUpdateTime;

    // Only check at specified intervals
    if (timeSinceLastUpdate < this.updateInterval) {
      return false;
    }

    // Calculate distance moved
    const distanceMoved = currentPosition.distanceTo(this.lastPosition);

    // Check if movement is significant
    if (distanceMoved >= this.minDistanceThreshold) {
      const oldPosition = this.lastPosition.clone();

      // Update tracking
      this.lastPosition.copy(currentPosition);
      this.lastUpdateTime = currentTime;

      // Trigger callback
      if (this.onPositionChange) {
        this.onPositionChange(currentPosition, oldPosition);
      }

      return true;
    }

    // Update time even if no significant movement
    this.lastUpdateTime = currentTime;
    return false;
  }

  /**
   * Set callback for position changes
   */
  setOnPositionChange(callback: PositionChangeCallback) {
    this.onPositionChange = callback;
  }

  /**
   * Force an immediate update
   */
  forceUpdate(currentPosition: THREE.Vector3) {
    const oldPosition = this.lastPosition.clone();
    this.lastPosition.copy(currentPosition);
    this.lastUpdateTime = Date.now();

    if (this.onPositionChange) {
      this.onPositionChange(currentPosition, oldPosition);
    }
  }

  /**
   * Get distance moved since last update
   */
  getDistanceMoved(currentPosition: THREE.Vector3): number {
    return currentPosition.distanceTo(this.lastPosition);
  }

  /**
   * Get time since last update
   */
  getTimeSinceLastUpdate(): number {
    return Date.now() - this.lastUpdateTime;
  }

  /**
   * Reset tracker
   */
  reset(newPosition: THREE.Vector3) {
    this.lastPosition.copy(newPosition);
    this.lastUpdateTime = Date.now();
  }

  /**
   * Update configuration
   */
  updateConfig(config: {
    updateInterval?: number;
    minDistanceThreshold?: number;
  }) {
    if (config.updateInterval !== undefined) {
      this.updateInterval = config.updateInterval;
    }
    if (config.minDistanceThreshold !== undefined) {
      this.minDistanceThreshold = config.minDistanceThreshold;
    }
  }
}
