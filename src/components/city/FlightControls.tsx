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

interface FlightControlsProps {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  speed?: number;
  config?: Partial<FlightConfig>;
  onSpeedChange?: (speed: number) => void;
  onModeChange?: (mode: MovementMode) => void;
}

export function FlightControls({
  cameraRef,
  speed: baseSpeed = BASE_SPEED,
  config,
  onSpeedChange,
  onModeChange,
}: FlightControlsProps) {
  const { camera } = useThree();

  const { update } = useFlight({
    camera,
    config: { baseSpeed, ...config },
    onSpeedChange,
    onModeChange,
  });

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);

  useFrame((_, delta) => {
    update(delta);
    cameraRef.current = camera;
  });

  return null;
}

export type { MovementMode, FlightConfig, FlyToTarget };
export { BASE_SPEED, isGyroscopeAvailable, requestGyroscopePermission };
