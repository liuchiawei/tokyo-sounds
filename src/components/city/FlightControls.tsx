"use client";

/**
 * FlightControls Component
 * Wrapper around useFlight hook for easy R3F integration
 */

import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useFlight } from "@/hooks/useFlight";
import {
  BASE_SPEED,
  isGyroscopeAvailable,
  requestGyroscopePermission,
  type MovementMode,
  type FlightConfig,
  type FlyToTarget
} from "@/lib/flight";

interface GyroState {
  isActive: boolean;
  isAvailable: boolean;
  isEnabled: boolean;
  needsPermission: boolean;
}

interface FlightControlsProps {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  speed?: number;
  config?: Partial<FlightConfig>;
  onSpeedChange?: (speed: number) => void;
  onModeChange?: (mode: MovementMode) => void;
  onPointerLockChange?: (locked: boolean) => void;
  onGyroStateChange?: (state: GyroState) => void;
  gyroControlsRef?: React.MutableRefObject<{
    requestPermission: () => Promise<boolean>;
    recalibrate: () => void;
  } | null>;
}

export function FlightControls({
  cameraRef,
  speed: baseSpeed = BASE_SPEED,
  config,
  onSpeedChange,
  onModeChange,
  onPointerLockChange,
  onGyroStateChange,
  gyroControlsRef,
}: FlightControlsProps) {
  const { camera } = useThree();

  const {
    update,
    isPointerLocked,
    isGyroActive,
    isGyroAvailable,
    isGyroEnabled,
    needsGyroPermission,
    requestGyroPermission,
    recalibrateGyro,
  } = useFlight({
    camera,
    config: { baseSpeed, ...config },
    onSpeedChange,
    onModeChange,
  });

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);

  useEffect(() => {
    if (gyroControlsRef) {
      gyroControlsRef.current = {
        requestPermission: requestGyroPermission,
        recalibrate: recalibrateGyro,
      };
    }
  }, [gyroControlsRef, requestGyroPermission, recalibrateGyro]);

  useEffect(() => {
    onPointerLockChange?.(isPointerLocked);
  }, [isPointerLocked, onPointerLockChange]);

  useEffect(() => {
    onGyroStateChange?.({
      isActive: isGyroActive,
      isAvailable: isGyroAvailable,
      isEnabled: isGyroEnabled,
      needsPermission: needsGyroPermission,
    });
  }, [isGyroActive, isGyroAvailable, isGyroEnabled, needsGyroPermission, onGyroStateChange]);

  useFrame((_, delta) => {
    update(delta);
    cameraRef.current = camera;
  });

  return null;
}

export type { MovementMode, FlightConfig, FlyToTarget };
export { BASE_SPEED, isGyroscopeAvailable, requestGyroscopePermission };
