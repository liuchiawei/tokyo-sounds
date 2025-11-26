/**
 * User Controller for Tokyo Sounds 3D Universe
 * Handles keyboard input and camera movement
 */

import * as THREE from 'three';

const MOVE_SPEED = 0.15;
const ROTATION_SPEED = 0.02;
const MOMENTUM_DECAY = 0.85; // Smooth deceleration

export class UserController {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;

  private keysPressed = new Set<string>();
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor(initialPosition?: THREE.Vector3) {
    this.position = initialPosition || new THREE.Vector3(0, 5, 50);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.velocity = new THREE.Vector3();

    // Bind event handlers
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);

    this.setupEventListeners();
  }

  /**
   * Setup keyboard event listeners
   */
  private setupEventListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown(e: KeyboardEvent) {
    // Prevent default behavior for navigation keys
    if (
      ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
        e.code
      )
    ) {
      e.preventDefault();
    }

    this.keysPressed.add(e.code);
  }

  /**
   * Handle keyup event
   */
  private handleKeyUp(e: KeyboardEvent) {
    this.keysPressed.delete(e.code);
  }

  /**
   * Update user position and rotation
   */
  update(camera: THREE.Camera) {
    this.handleMovement();
    this.handleRotation();

    // Apply momentum decay
    this.velocity.multiplyScalar(MOMENTUM_DECAY);

    // Update camera to match user position and rotation
    camera.position.copy(this.position);
    camera.rotation.copy(this.rotation);
  }

  /**
   * Handle WASD movement
   */
  private handleMovement() {
    const moveVector = new THREE.Vector3();

    // Forward/Backward (W/S)
    if (this.keysPressed.has('KeyW')) {
      moveVector.z -= MOVE_SPEED;
    }
    if (this.keysPressed.has('KeyS')) {
      moveVector.z += MOVE_SPEED;
    }

    // Left/Right (A/D)
    if (this.keysPressed.has('KeyA')) {
      moveVector.x -= MOVE_SPEED;
    }
    if (this.keysPressed.has('KeyD')) {
      moveVector.x += MOVE_SPEED;
    }

    // Up/Down (Space/Shift) - optional vertical movement
    if (this.keysPressed.has('Space')) {
      moveVector.y += MOVE_SPEED;
    }
    if (this.keysPressed.has('ShiftLeft') || this.keysPressed.has('ShiftRight')) {
      moveVector.y -= MOVE_SPEED;
    }

    // Normalize diagonal movement
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(MOVE_SPEED);

      // Apply rotation to movement vector (move in the direction camera is facing)
      moveVector.applyEuler(this.rotation);

      // Add to velocity for smooth momentum
      this.velocity.add(moveVector);
    }

    // Apply velocity to position
    this.position.add(this.velocity);
  }

  /**
   * Handle arrow key rotation
   */
  private handleRotation() {
    // Rotate up/down (Arrow Up/Down)
    if (this.keysPressed.has('ArrowUp')) {
      this.rotation.x += ROTATION_SPEED;
    }
    if (this.keysPressed.has('ArrowDown')) {
      this.rotation.x -= ROTATION_SPEED;
    }

    // Rotate left/right (Arrow Left/Right)
    if (this.keysPressed.has('ArrowLeft')) {
      this.rotation.y += ROTATION_SPEED;
    }
    if (this.keysPressed.has('ArrowRight')) {
      this.rotation.y -= ROTATION_SPEED;
    }

    // Clamp vertical rotation to prevent flipping
    const maxVerticalRotation = Math.PI / 2 - 0.1; // Leave small margin
    this.rotation.x = Math.max(
      -maxVerticalRotation,
      Math.min(maxVerticalRotation, this.rotation.x)
    );
  }

  /**
   * Get current forward direction
   */
  getForwardDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(this.rotation);
    return direction;
  }

  /**
   * Get current right direction
   */
  getRightDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(1, 0, 0);
    direction.applyEuler(this.rotation);
    return direction;
  }

  /**
   * Get current up direction
   */
  getUpDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(0, 1, 0);
    direction.applyEuler(this.rotation);
    return direction;
  }

  /**
   * Simulate key press (for virtual controls)
   * 仮想コントロール用のキー押下をシミュレート
   */
  simulateKeyPress(code: string): void {
    this.keysPressed.add(code);
  }

  /**
   * Simulate key release (for virtual controls)
   * 仮想コントロール用のキー解放をシミュレート
   */
  simulateKeyRelease(code: string): void {
    this.keysPressed.delete(code);
  }

  /**
   * Check if a specific key is pressed
   */
  isKeyPressed(code: string): boolean {
    return this.keysPressed.has(code);
  }

  /**
   * Get all currently pressed keys
   */
  getPressedKeys(): Set<string> {
    return new Set(this.keysPressed);
  }

  /**
   * Teleport to a specific position
   */
  setPosition(position: THREE.Vector3) {
    this.position.copy(position);
    this.velocity.set(0, 0, 0); // Reset velocity
  }

  /**
   * Set rotation
   */
  setRotation(rotation: THREE.Euler) {
    this.rotation.copy(rotation);
  }

  /**
   * Look at a specific point
   */
  lookAt(target: THREE.Vector3) {
    const direction = new THREE.Vector3().subVectors(target, this.position);
    direction.normalize();

    // Calculate rotation from direction
    this.rotation.y = Math.atan2(direction.x, direction.z);
    this.rotation.x = Math.asin(-direction.y);
  }

  /**
   * Smooth move to target position
   */
  moveTowards(target: THREE.Vector3, speed: number = 0.05) {
    const direction = new THREE.Vector3().subVectors(target, this.position);
    const distance = direction.length();

    if (distance > 0.1) {
      direction.normalize().multiplyScalar(speed);
      this.position.add(direction);
    }
  }

  /**
   * Reset position and rotation
   */
  reset(position?: THREE.Vector3, rotation?: THREE.Euler) {
    this.position.copy(position || new THREE.Vector3(0, 5, 50));
    this.rotation.copy(rotation || new THREE.Euler(0, 0, 0, 'YXZ'));
    this.velocity.set(0, 0, 0);
    this.keysPressed.clear();
  }

  /**
   * Clean up event listeners
   */
  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.keysPressed.clear();
  }
}
