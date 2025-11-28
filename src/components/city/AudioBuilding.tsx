"use client";

/**
 * AudioBuilding Component
 * A colored building that plays spatial audio from lib/audio
 */

import { useRef, useEffect, useState, useContext, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AudioSessionContext, useSpatial, useSpatialMode } from "@/hooks/useAudio";

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
  audioFile,
  listenerRef,
  sharedContext,
}: AudioBuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const session = useContext(AudioSessionContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCulled, setIsCulled] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const gainNodeId = `gain_building_${index}`;
  const playerNodeId = `player_building_${index}`;

  const { mode } = useSpatialMode(gainNodeId);

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

  useFrame((state) => {
    if (!meshRef.current) return;

    if (session) {
      const binding = session.getSpatialBinding(gainNodeId);
      if (binding) {
        setIsCulled(binding.isCulled);
      }

      const level = session.getAudioLevel(gainNodeId);
      setAudioLevel(level);
    }

    const time = state.clock.elapsedTime;
    const pulseFactor = Math.sin(time * 2 + index) * 0.5 + 0.5;
    const baseIntensity = isCulled ? 0.2 : 0.6;
    const levelBoost = audioLevel * 2;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material.emissiveIntensity !== undefined) {
      material.emissiveIntensity = baseIntensity + pulseFactor * 0.3 + levelBoost;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.95}
        />
      </mesh>

      <pointLight
        position={[position[0], position[1] + height / 2 + 10, position[2]]}
        intensity={isCulled ? 0.5 : 2}
        color={color}
        distance={150}
        decay={2}
      />

      <mesh
        position={[position[0], 2, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[width * 0.8, width * 1.2, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isCulled ? 0.2 : 0.8 + audioLevel}
          transparent
          opacity={0.6}
        />
      </mesh>

      <mesh
        position={[position[0], position[1] + height / 2, position[2]]}
      >
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isPlaying ? (isCulled ? 0.5 : 1.5) : 0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {isPlaying && !isCulled && (
        <>
          {[1, 2, 3].map((ring) => (
            <mesh
              key={ring}
              position={[position[0], position[1], position[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry
                args={[
                  20 + ring * 15 + audioLevel * 10,
                  22 + ring * 15 + audioLevel * 10,
                  32
                ]}
              />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.15 - ring * 0.04 + audioLevel * 0.1}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

