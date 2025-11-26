/**
 * Location Mapper for Tokyo Sounds 3D Universe
 * Maps Tokyo locations to 3D space coordinates
 */

import * as THREE from 'three';
import { TOKYO_LOCATIONS, type TokyoLocation } from './tokyo-data';

export interface MappedLocation {
  id: string;
  name: string;
  position: THREE.Vector3;
  prompts: string[];
  category: string;
  originalLocation: TokyoLocation;
}

export type LayoutMode = 'grid' | 'geographic' | 'clustered';

export class LocationMapper {
  private locations: MappedLocation[] = [];
  private layoutMode: LayoutMode;

  constructor(layoutMode: LayoutMode = 'clustered') {
    this.layoutMode = layoutMode;
    this.mapLocationsTo3D();
  }

  /**
   * Map all Tokyo locations to 3D space
   */
  private mapLocationsTo3D() {
    switch (this.layoutMode) {
      case 'grid':
        this.mapAsGrid();
        break;
      case 'geographic':
        this.mapByGeography();
        break;
      case 'clustered':
        this.mapByClusters();
        break;
    }
  }

  /**
   * Layout 1: Simple grid layout
   * Organized and easy to navigate
   */
  private mapAsGrid() {
    const locationEntries = Object.entries(TOKYO_LOCATIONS);
    const gridSize = Math.ceil(Math.sqrt(locationEntries.length));
    const spacing = 20;

    locationEntries.forEach(([id, location], index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const x = (col - gridSize / 2) * spacing;
      const y = 0;
      const z = (row - gridSize / 2) * spacing;

      this.locations.push({
        id,
        name: location.name,
        position: new THREE.Vector3(x, y, z),
        prompts: location.prompts,
        category: location.category,
        originalLocation: location,
      });
    });
  }

  /**
   * Layout 2: Geographic layout based on actual lat/lng
   * Most realistic representation of Tokyo
   */
  private mapByGeography() {
    const scale = 200; // Scale factor for better spacing
    const centerLat = 35.6762; // Tokyo center
    const centerLng = 139.6503;

    this.locations = [];
    for (const [id, location] of Object.entries(TOKYO_LOCATIONS)) {
      // Convert lat/lng to 3D coordinates
      const x = (location.lng - centerLng) * scale;
      const z = -(location.lat - centerLat) * scale; // Negative for correct orientation
      const y = 0;

      this.locations.push({
        id,
        name: location.name,
        position: new THREE.Vector3(x, y, z),
        prompts: location.prompts,
        category: location.category,
        originalLocation: location,
      });
    }
  }

  /**
   * Layout 3: Clustered by category
   * Groups similar locations together in 3D space
   */
  private mapByClusters() {
    // Define cluster centers for each category
    const categoryPositions: Record<string, THREE.Vector3> = {
      district: new THREE.Vector3(30, 0, 30),
      station: new THREE.Vector3(-30, 0, 30),
      park: new THREE.Vector3(30, 0, -30),
      entertainment: new THREE.Vector3(-30, 0, -30),
      temple: new THREE.Vector3(0, 0, 45),
      commercial: new THREE.Vector3(45, 0, 0),
    };

    // Track how many locations we've placed in each category
    const categoryCounters: Record<string, number> = {};

    this.locations = [];
    for (const [id, location] of Object.entries(TOKYO_LOCATIONS)) {
      const category = location.category;
      const centerPos = categoryPositions[category] || new THREE.Vector3(0, 0, 0);

      // Initialize counter for this category
      if (!categoryCounters[category]) {
        categoryCounters[category] = 0;
      }

      // Create a spiral pattern within each cluster
      const count = categoryCounters[category];
      const angle = count * (Math.PI * 2) / 5; // 5 locations per ring
      const radius = 5 + Math.floor(count / 5) * 8; // Expand rings outward

      const offsetX = Math.cos(angle) * radius;
      const offsetZ = Math.sin(angle) * radius;
      const offsetY = (Math.random() - 0.5) * 3; // Small vertical variation

      const position = centerPos.clone().add(
        new THREE.Vector3(offsetX, offsetY, offsetZ)
      );

      this.locations.push({
        id,
        name: location.name,
        position,
        prompts: location.prompts,
        category: location.category,
        originalLocation: location,
      });

      categoryCounters[category]++;
    }
  }

  /**
   * Get all mapped locations
   */
  getLocations(): MappedLocation[] {
    return this.locations;
  }

  /**
   * Find a specific location by ID
   */
  getLocationById(id: string): MappedLocation | undefined {
    return this.locations.find((loc) => loc.id === id);
  }

  /**
   * Get locations by category
   */
  getLocationsByCategory(category: string): MappedLocation[] {
    return this.locations.filter((loc) => loc.category === category);
  }

  /**
   * Find the closest location to a given position
   */
  findClosestLocation(position: THREE.Vector3): MappedLocation | null {
    if (this.locations.length === 0) return null;

    let closest = this.locations[0];
    let minDistance = position.distanceTo(closest.position);

    for (const location of this.locations) {
      const distance = position.distanceTo(location.position);
      if (distance < minDistance) {
        minDistance = distance;
        closest = location;
      }
    }

    return closest;
  }

  /**
   * Get bounds of all locations (useful for camera setup)
   */
  getBounds(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    this.locations.forEach((location) => {
      min.min(location.position);
      max.max(location.position);
    });

    return { min, max };
  }

  /**
   * Get center point of all locations
   */
  getCenter(): THREE.Vector3 {
    const center = new THREE.Vector3();

    this.locations.forEach((location) => {
      center.add(location.position);
    });

    center.divideScalar(this.locations.length || 1);
    return center;
  }

  /**
   * Change layout mode and remap
   */
  setLayoutMode(mode: LayoutMode) {
    this.layoutMode = mode;
    this.locations = [];
    this.mapLocationsTo3D();
  }
}
