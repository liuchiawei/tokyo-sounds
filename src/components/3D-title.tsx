"use client";

import { Text, Html } from "@react-three/drei";

interface Title3DProps {
  position: [number, number, number];
  title: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Title3D({
  position,
  title,
  isVisible,
  onClose,
}: Title3DProps) {
  console.log('Title3D render:', { isVisible, position, title });
  
  if (!isVisible) {
    console.log('Title3D: not visible, returning null');
    return null;
  }

  console.log('Title3D: rendering Text component');

  return (
    <group position={position}>
      {/* 背景の四角形 */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial color="red" transparent opacity={0.8} />
      </mesh>
      
      {/* 枠線 */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[8.2, 2.2]} />
        <meshBasicMaterial color="yellow" transparent opacity={0.9} />
      </mesh>
      
      {/* テキスト */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={7}
        textAlign="center"
      >
        {title}
      </Text>
      
      {/* 閉じるボタン（3D） */}
      <mesh position={[3.5, 0.8, 0.1]} onClick={onClose}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="red" />
      </mesh>
      
      {/* 閉じるボタンのテキスト */}
      <Text
        position={[3.5, 0.8, 0.2]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ×
      </Text>
    </group>
  );
}
