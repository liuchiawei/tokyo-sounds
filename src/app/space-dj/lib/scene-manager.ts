/**
 * Three.js Scene Manager for Tokyo Sounds 3D Universe
 * Handles scene setup, rendering, and visual elements
 */

import * as THREE from 'three';
import type { MappedLocation } from './location-mapper';

export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private locationMeshes: Map<string, THREE.Mesh> = new Map();
  private starfield: THREE.Points | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000814); // Deep space blue
    this.scene.fog = new THREE.Fog(0x000814, 50, 200); // Distance fog

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      container.clientWidth / container.clientHeight,
      0.1, // Near plane
      1000 // Far plane
    );
    this.camera.position.set(0, 5, 50);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Add scene elements
    this.addStarfield();
    this.addLights();
    this.addGrid();

    // Handle window resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Create a starfield background
   */
  private addStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    // Generate random stars
    for (let i = 0; i < 10000; i++) {
      // Random position in a large sphere
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      vertices.push(x, y, z);

      // Random star color (white to slight blue/yellow tint)
      const colorChoice = Math.random();
      if (colorChoice > 0.95) {
        colors.push(0.7, 0.8, 1.0); // Blue tint
      } else if (colorChoice > 0.9) {
        colors.push(1.0, 0.9, 0.7); // Yellow tint
      } else {
        colors.push(1.0, 1.0, 1.0); // White
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  /**
   * Add lighting to the scene
   */
  private addLights() {
    // Ambient light for overall illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    // Point light at origin (representing user)
    const userLight = new THREE.PointLight(0xffffff, 1, 100);
    userLight.position.set(0, 0, 0);
    this.scene.add(userLight);

    // Directional light for depth
    const directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(10, 50, 10);
    directional.castShadow = true;
    this.scene.add(directional);
  }

  /**
   * Add a subtle grid for spatial reference
   */
  private addGrid() {
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    gridHelper.position.y = -0.1;
    this.scene.add(gridHelper);
  }

  /**
   * Add Tokyo location spheres to the scene
   */
  addLocationSpheres(locations: MappedLocation[]) {
    const categoryColors: Record<string, number> = {
      district: 0xa855f7, // Purple
      station: 0x3b82f6, // Blue
      park: 0x22c55e, // Green
      entertainment: 0xec4899, // Pink
      temple: 0xfbbf24, // Yellow
      commercial: 0xf97316, // Orange
    };

    locations.forEach((location) => {
      const color = categoryColors[location.category] || 0xffffff;

      // Create sphere geometry (shared for performance)
      const geometry = new THREE.SphereGeometry(2, 32, 32);

      // Create material
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.7,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(location.position);
      sphere.castShadow = true;
      sphere.receiveShadow = true;

      // Store location data
      sphere.userData = {
        locationId: location.id,
        locationName: location.name,
        category: location.category,
        prompts: location.prompts,
      };

      // Add outer glow
      const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      sphere.add(glow);

      // Add to scene and tracking
      this.scene.add(sphere);
      this.locationMeshes.set(location.id, sphere);

      // Add label (CSS2DObject would be better for production)
      this.addLocationLabel(sphere, location.name);
    });
  }

  /**
   * Add text label to location sphere
   */
  private addLocationLabel(sphere: THREE.Mesh, text: string) {
    // Create canvas for text texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'Bold 24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    const label = new THREE.Sprite(labelMaterial);
    label.scale.set(8, 2, 1);
    label.position.y = 3.5;
    sphere.add(label);
  }

  /**
   * Update location visual highlights based on proximity
   */
  updateLocationHighlights(highlightedIds: Set<string>, weights: Map<string, number>) {
    this.locationMeshes.forEach((mesh, id) => {
      const material = mesh.material as THREE.MeshStandardMaterial;

      if (highlightedIds.has(id)) {
        // Get weight for this location
        const weight = weights.get(id) || 0;

        // Increase emissive intensity based on weight
        material.emissiveIntensity = 0.3 + weight * 0.7;

        // Pulse the glow sphere
        const glow = mesh.children[0] as THREE.Mesh;
        if (glow && glow.material instanceof THREE.MeshBasicMaterial) {
          glow.material.opacity = 0.15 + weight * 0.3;
        }

        // Scale slightly based on weight
        const scale = 1 + weight * 0.2;
        mesh.scale.setScalar(scale);
      } else {
        // Reset to default
        material.emissiveIntensity = 0.1;
        mesh.scale.setScalar(1);

        const glow = mesh.children[0] as THREE.Mesh;
        if (glow && glow.material instanceof THREE.MeshBasicMaterial) {
          glow.material.opacity = 0.1;
        }
      }
    });
  }

  /**
   * Add a visual marker for the user position (optional)
   */
  addUserMarker() {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.name = 'userMarker';

    // Add a light at user position
    const light = new THREE.PointLight(0xff0000, 0.5, 20);
    marker.add(light);

    return marker;
  }

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  private handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Get all location meshes
   */
  getLocationMeshes(): Map<string, THREE.Mesh> {
    return this.locationMeshes;
  }

  /**
   * Clean up resources
   */
  dispose() {
    window.removeEventListener('resize', this.handleResize);

    // Dispose geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        } else if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        }
      }
    });

    // Dispose renderer
    this.renderer.dispose();

    // Remove canvas from DOM
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
