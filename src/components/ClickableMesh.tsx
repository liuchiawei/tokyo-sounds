"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ClickableMeshProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  name?: string;
}

export function ClickableMesh({
  geometry,
  material,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  onHover,
  name,
}: ClickableMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { raycaster, mouse, camera, gl } = useThree();

  console.log('ClickableMesh rendered:', name, 'onClick function:', !!onClick);

  useFrame(() => {
    if (!meshRef.current) return;

    // ホバー効果
    if (hovered) {
      meshRef.current.scale.setScalar(1.1);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });

  const handleClick = (event: any) => {
    console.log('=== ClickableMesh onClick triggered ===');
    console.log('Name:', name);
    console.log('onClick function exists:', !!onClick);
    console.log('Event type:', event.type);
    console.log('Event target:', event.target);
    
    // イベントの伝播を停止
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    
    // デフォルトの動作を防止
    if (event.preventDefault && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    
    if (onClick) {
      console.log('Calling onClick handler');
      try {
        onClick();
        console.log('onClick handler completed successfully');
      } catch (error) {
        console.error('Error in onClick handler:', error);
      }
    } else {
      console.log('No onClick handler provided');
    }
    console.log('=== ClickableMesh onClick end ===');
  };

  const handlePointerOver = (event: React.PointerEvent) => {
    console.log('ClickableMesh hovered:', name);
    event.stopPropagation();
    setHovered(true);
    if (onHover) {
      onHover(true);
    }
    gl.domElement.style.cursor = "pointer";
  };

  const handlePointerOut = (event: React.PointerEvent) => {
    event.stopPropagation();
    setHovered(false);
    if (onHover) {
      onHover(false);
    }
    gl.domElement.style.cursor = "auto";
  };

  const handlePointerDown = (event: any) => {
    console.log('=== ClickableMesh pointer down ===');
    console.log('Name:', name);
    console.log('onClick function exists:', !!onClick);
    console.log('Event type:', event.type);
    console.log('Event target:', event.target);
    event.stopPropagation();
    if (event.preventDefault && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (onClick) {
      console.log('Calling onClick handler from pointer down');
      try {
        onClick();
        console.log('onClick handler completed successfully from pointer down');
      } catch (error) {
        console.error('Error in onClick handler from pointer down:', error);
      }
    } else {
      console.log('No onClick handler provided for pointer down');
    }
    console.log('=== ClickableMesh pointer down end ===');
  };

  const handlePointerUp = (event: any) => {
    console.log('=== ClickableMesh pointer up ===');
    console.log('Name:', name);
    console.log('onClick function exists:', !!onClick);
    console.log('Event type:', event.type);
    console.log('Event target:', event.target);
    event.stopPropagation();
    if (event.preventDefault && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (onClick) {
      console.log('Calling onClick handler from pointer up');
      try {
        onClick();
        console.log('onClick handler completed successfully from pointer up');
      } catch (error) {
        console.error('Error in onClick handler from pointer up:', error);
      }
    } else {
      console.log('No onClick handler provided for pointer up');
    }
    console.log('=== ClickableMesh pointer up end ===');
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMissed={() => console.log('Pointer missed:', name)}
      name={name}
      userData={{ clickable: true, name }}
    />
  );
}

