"use client";

/**
 * AudioBuilding Component
 * A colored building that plays spatial audio from lib/audio
 */

import { useRef, useEffect, useState, useContext, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AudioSessionContext, useSpatial } from "@/hooks/useAudio";

interface AudioFileInfo {
  name: string;
  url: string;
}

interface AudioBuildingProps {
  index: number;
  position: [number, number, number];
  color: string;
  audioFile: AudioFileInfo;
  listenerRef: React.RefObject<THREE.AudioListener>;
  sharedContext: AudioContext | null;
}

export function AudioBuilding({
  index,
  position,
  color,
  listenerRef,
  sharedContext,
}: AudioBuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const session = useContext(AudioSessionContext);
  const [isPlaying, setIsPlaying] = useState(false);

  const gainNodeId = `gain_building_${index}`;
  const playerNodeId = `player_building_${index}`;

  const height = 60 + index * 30;
  const width = 25 + (index % 3) * 10;
  const depth = 25 + ((index + 1) % 3) * 10;

  const spatialOpts = useMemo(() => ({
    mode: "live" as const,
    refDistance: 20,
    rolloffFactor: 1.5,
    maxDistance: 500,
    distanceModel: "inverse" as const,
    cullDistance: 600,
    resumeDistance: 500,
    enableCulling: true,
    enableLevelMeter: true,
  }), []);

  useSpatial(
    gainNodeId,
    meshRef as React.RefObject<THREE.Object3D>,
    listenerRef,
    spatialOpts,
    []
  );

  useEffect(() => {
    if (!session || isPlaying) return;

    const startAudio = async () => {
      try {
        if (sharedContext && sharedContext.state === "suspended") {
          await sharedContext.resume();
        }

        const player = session.getNode(playerNodeId);
        if (player) {
          try {
            player.raw().start("+0");
            setIsPlaying(true);
          } catch (err) {
            console.warn(`Failed to start player ${playerNodeId}:`, err);
          }
        }
      } catch (err) {
        console.error("Error starting audio:", err);
      }
    };

    const timer = setTimeout(startAudio, 500 + index * 200);
    return () => clearTimeout(timer);
  }, [session, sharedContext, playerNodeId, isPlaying, index]);

  const culledRef = useRef(false);
  const levelRef = useRef(0);
  const frameCountRef = useRef(0);

  useFrame((state) => {
    frameCountRef.current++;
    if (frameCountRef.current % 3 !== 0) return; // skip 2 out of 3 frames
    
    if (!meshRef.current) return;

    if (session) {
      const binding = session.getSpatialBinding(gainNodeId);
      if (binding) {
        culledRef.current = binding.isCulled;
      }
      levelRef.current = session.getAudioLevel(gainNodeId);
    }

    const time = state.clock.elapsedTime;
    const pulseFactor = Math.sin(time * 2 + index) * 0.5 + 0.5;
    const baseIntensity = culledRef.current ? 0.2 : 0.6;
    const levelBoost = levelRef.current * 2;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material.emissiveIntensity !== undefined) {
      material.emissiveIntensity = baseIntensity + pulseFactor * 0.3 + levelBoost;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      <mesh
        ref={ringRef}
        position={[position[0], 2, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[width * 0.8, width * 1.2, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      <mesh
        ref={sphereRef}
        position={[position[0], position[1] + height / 2, position[2]]}
      >
        <sphereGeometry args={[3, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

