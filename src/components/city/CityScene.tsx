"use client";

/**
 * CityScene Component
 * Dense procedural city with 4 plates, audio buildings, and skyscrapers
 */

import { useRef, useEffect, useMemo, useContext } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AudioSessionContext } from "@/hooks/useAudio";
import { AudioBuilding } from "./AudioBuilding";
import { CityLyriaAudio, type PlateDebugInfo } from "./CityLyriaAudio";

interface AudioFileInfo {
  name: string;
  url: string;
}

interface CitySceneProps {
  audioFiles: AudioFileInfo[];
  sharedContext: AudioContext | null;
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  generativeEnabled: boolean;
  apiKey: string;
  onGenerativeDebugUpdate?: (plates: PlateDebugInfo[]) => void;
}

const PLATE_SIZE = 500;
const PLATE_GAP = 30;
const BUILDING_COLORS = [
  "#00ffff",
  "#ff00ff",
  "#ffaa00",
  "#00ff88",
  "#ff6b6b",
  "#6b5bff",
];

interface BuildingData {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  isSkyscraper: boolean;
}

function generateBuildingsForPlate(
  plateIndex: number,
  plateX: number,
  plateZ: number,
  seed: number
): BuildingData[] {
  const buildings: BuildingData[] = [];
  const rng = mulberry32(seed + plateIndex * 1000);

  const gridSize = 16;
  const cellSize = (PLATE_SIZE - 40) / gridSize;
  const startX = plateX - PLATE_SIZE / 2 + 20;
  const startZ = plateZ - PLATE_SIZE / 2 + 20;

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gz = 0; gz < gridSize; gz++) {
      if (rng() < 0.08) continue;

      const x = startX + gx * cellSize + cellSize / 2 + (rng() - 0.5) * cellSize * 0.3;
      const z = startZ + gz * cellSize + cellSize / 2 + (rng() - 0.5) * cellSize * 0.3;

      const centerDist = Math.sqrt(
        Math.pow(gx - gridSize / 2, 2) + Math.pow(gz - gridSize / 2, 2)
      ) / (gridSize / 2);

      const skyscraperChance = Math.max(0.05, 0.35 - centerDist * 0.3);
      const isSkyscraper = rng() < skyscraperChance;

      let height: number;
      let width: number;
      let depth: number;

      if (isSkyscraper) {
        height = 100 + rng() * 200 + (1 - centerDist) * 100;
        width = 12 + rng() * 18;
        depth = 12 + rng() * 18;
      } else {
        height = 10 + rng() * 40 + (1 - centerDist) * 20;
        width = 8 + rng() * 20;
        depth = 8 + rng() * 20;
      }

      buildings.push({
        position: [x, height / 2, z],
        height,
        width,
        depth,
        isSkyscraper,
      });
    }
  }

  return buildings;
}

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const windowTextureCache = new Map<string, { window: THREE.CanvasTexture; emissive: THREE.CanvasTexture }>();

function getOrCreateWindowTexture(variant: number, isSkyscraper: boolean): { window: THREE.CanvasTexture; emissive: THREE.CanvasTexture } {
  const key = `${variant}-${isSkyscraper}`;
  if (windowTextureCache.has(key)) {
    return windowTextureCache.get(key)!;
  }

  const seededRandom = mulberry32(variant * 1000);

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  const emissiveCanvas = document.createElement("canvas");
  emissiveCanvas.width = 64;
  emissiveCanvas.height = 128;
  const emissiveCtx = emissiveCanvas.getContext("2d")!;

  ctx.fillStyle = isSkyscraper ? "#0a0a1a" : "#1a1a2e";
  ctx.fillRect(0, 0, 64, 128);
  emissiveCtx.fillStyle = "#000000";
  emissiveCtx.fillRect(0, 0, 64, 128);

  const rows = 16;
  const cols = 4;
  const windowWidth = 12;
  const windowHeight = 6;
  const gapX = (64 - cols * windowWidth) / (cols + 1);
  const gapY = (128 - rows * windowHeight) / (rows + 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const litChance = isSkyscraper ? 0.5 : 0.35;
      const lit = seededRandom() < litChance;
      const x = gapX + c * (windowWidth + gapX);
      const y = gapY + r * (windowHeight + gapY);

      if (lit) {
        const warmth = seededRandom();
        const colorType = seededRandom();
        let r_val: number, g_val: number, b_val: number;

        if (colorType < 0.6) {
          r_val = 255;
          g_val = Math.floor(160 + warmth * 60);
          b_val = Math.floor(40 + warmth * 30);
        } else if (colorType < 0.85) {
          r_val = Math.floor(240 + warmth * 15);
          g_val = Math.floor(230 + warmth * 20);
          b_val = Math.floor(180 + warmth * 50);
        } else {
          r_val = Math.floor(200 + warmth * 40);
          g_val = Math.floor(210 + warmth * 40);
          b_val = Math.floor(230 + warmth * 25);
        }

        const colorStr = `rgb(${r_val}, ${g_val}, ${b_val})`;
        ctx.fillStyle = colorStr;
        ctx.fillRect(x, y, windowWidth, windowHeight);
        emissiveCtx.fillStyle = colorStr;
        emissiveCtx.fillRect(x, y, windowWidth, windowHeight);
      } else {
        ctx.fillStyle = "#050510";
        ctx.fillRect(x, y, windowWidth, windowHeight);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const emissive = new THREE.CanvasTexture(emissiveCanvas);
  emissive.wrapS = THREE.RepeatWrapping;
  emissive.wrapT = THREE.RepeatWrapping;

  const result = { window: texture, emissive };
  windowTextureCache.set(key, result);
  return result;
}

function Building({ position, height, width, depth, isSkyscraper }: BuildingData) {
  const variant = Math.floor(Math.abs(position[0] + position[2])) % 8;
  const { window: windowTexture, emissive: emissiveTexture } = useMemo(
    () => getOrCreateWindowTexture(variant, isSkyscraper),
    [variant, isSkyscraper]
  );

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: windowTexture.clone(),
      emissiveMap: emissiveTexture.clone(),
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: isSkyscraper ? 0.8 : 0.5,
      color: new THREE.Color(isSkyscraper ? "#1a1a2c" : "#2a2a3c"),
      roughness: 0.8,
      metalness: 0.1,
    });
    mat.map!.repeat.set(Math.ceil(width / 15), Math.ceil(height / 30));
    mat.emissiveMap!.repeat.set(Math.ceil(width / 15), Math.ceil(height / 30));
    return mat;
  }, [windowTexture, emissiveTexture, width, height, isSkyscraper]);

  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Plate({
  position,
  index,
}: {
  position: [number, number, number];
  index: number;
}) {
  const colors = ["#0a0a1a", "#0a1020", "#100a20", "#0a0a1a"];
  const emissiveColors = ["#0088ff", "#00ff88", "#ff8800", "#ff0088"];

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PLATE_SIZE, PLATE_SIZE]} />
        <meshBasicMaterial color={colors[index]} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[PLATE_SIZE * 0.47, PLATE_SIZE * 0.49, 32]} />
        <meshBasicMaterial
          color={emissiveColors[index]}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

export function CityScene({
  audioFiles,
  sharedContext,
  cameraRef,
  generativeEnabled,
  apiKey,
  onGenerativeDebugUpdate,
}: CitySceneProps) {
  const { camera } = useThree();
  const session = useContext(AudioSessionContext);
  const listenerRef = useRef<THREE.AudioListener | null>(null);

  const platePositions: [number, number, number][] = useMemo(() => {
    const offset = (PLATE_SIZE + PLATE_GAP) / 2;
    return [
      [-offset, 0, -offset],
      [offset, 0, -offset],
      [-offset, 0, offset],
      [offset, 0, offset],
    ];
  }, []);

  const allBuildings = useMemo(() => {
    const seed = 12345;
    return platePositions.flatMap((pos, plateIdx) =>
      generateBuildingsForPlate(plateIdx, pos[0], pos[2], seed)
    );
  }, [platePositions]);

  const audioBuildingPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = audioFiles.length;

    const spread = PLATE_SIZE * 0.7;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.PI / 6;
      const radius = spread + (i % 2) * 80;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 80 + (i * 40);
      positions.push([x, height / 2, z]);
    }

    return positions;
  }, [audioFiles.length]);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);

  useEffect(() => {
    if (camera && sharedContext && !listenerRef.current) {
      const listener = new THREE.AudioListener();
      listenerRef.current = listener;
      camera.add(listener);
    }

    return () => {
      if (listenerRef.current && camera && listenerRef.current.parent === camera) {
        camera.remove(listenerRef.current);
      }
    };
  }, [camera, sharedContext]);

  return (
    <>
      <ambientLight intensity={0.15} color="#334466" />
      <directionalLight position={[200, 400, 200]} intensity={0.3} color="#ffffff" />
      <hemisphereLight args={["#334488", "#0a0a1a", 0.3]} />

      {platePositions.map((pos, idx) => (
        <Plate
          key={`plate-${idx}`}
          position={pos}
          index={idx}
        />
      ))}

      {generativeEnabled && apiKey && (
        <CityLyriaAudio
          apiKey={apiKey}
          enabled={generativeEnabled}
          volume={0.5}
          platePositions={platePositions}
          onDebugUpdate={onGenerativeDebugUpdate}
        />
      )}

      {allBuildings.map((building, idx) => (
        <Building
          key={`building-${idx}`}
          {...building}
        />
      ))}

      {audioFiles.map((file, idx) => (
        <AudioBuilding
          key={`audio-building-${idx}`}
          index={idx}
          position={audioBuildingPositions[idx]}
          color={BUILDING_COLORS[idx % BUILDING_COLORS.length]}
          audioFile={file}
          listenerRef={listenerRef as React.RefObject<THREE.AudioListener>}
          sharedContext={sharedContext}
        />
      ))}

      <gridHelper
        args={[PLATE_SIZE * 2 + PLATE_GAP, 50, "#151530", "#0a0a20"]}
        position={[0, 0.5, 0]}
      />
    </>
  );
}
