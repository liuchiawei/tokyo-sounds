# Tokyo Sounds Development Standards & Task 2.1 Implementation Plan

## Core Rules & Requirements

### 1. Certainty Protocol

- **No Uncertain Implementation**: Every step must be 100% certain before proceeding
- **Deep Research Required**: If any uncertainty arises, conduct comprehensive research before implementation
- **Verification**: Test all implementations in development environment before marking as complete

### 2. Type Safety & Compatibility

- **No Type Errors**: Strict TypeScript compliance required
- **Next.js 15.5.3 Compatibility**: All implementations must align with latest Next.js standards
- **React 19 Compatibility**: Ensure all code works with React 19 features
- **R3F v9.3.0 Compatibility**: Proper version compatibility with React Three Fiber 9

### 3. Code Quality Standards

- **Japanese & English Comments**: All code must include both Japanese and English comments
- **Code Documentation**: Full JSDoc/TSDoc for all functions, components, and interfaces
- **Error Handling**: Proper error boundaries and loading states
- **Performance**: Follow R3F performance best practices

---

## Task 2.1: GLB Model Loading Implementation Plan - ✅ COMPLETED

### Summary
- Used gltfjsx to generate a Model.tsx component from the 3dtest.glb file
- Created proper TypeScript definitions for GLB nodes and materials in model.d.ts
- Integrated useGLTF with Suspense for proper loading states
- Verified SSR safety with dynamic imports

---

## Task 2.2: Raycasting & Mesh Event Binding - IN PROGRESS

### Core Rules & Requirements

#### 1. Certainty Protocol

- **No uncertain code**: verify every R3F API against official docs before coding
- **Local testing required** before marking complete

#### 2. Type Safety & Compatibility

- **Next.js 15.5.3, React 19.1.0, @react-three/fiber 9.3.0, @react-three/drei 10.7.6, @react-three/postprocessing 3.0.4**
- **Strict TypeScript**: no `any`, all types declared

#### 3. Code Quality Standards

- **Japanese & English comments** for every function, component, and hook
- **JSDoc/TSDoc** on all public interfaces
- **Error boundaries and Suspense** for robust loading
- **Performance**: mutate refs inside useFrame, no state updates per frame

### 2.2.1: Configure <Canvas> in Canvas.tsx

#### Research & Preparation

- [ ] Confirm <Canvas> props from R3F 9.3.0 docs
- [ ] Verify Next.js client component pattern ("use client")

#### Implementation Steps

```tsx
// src/components/Canvas.tsx
"use client"; // Next.js client component
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, Stage } from "@react-three/drei";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import Model from "./Model";

/**
 * CanvasWrapper component initializes the R3F canvas.
 * Renders lighting, controls, post-processing, and the 3D model.
 * 3Dキャンバスを初期化するコンポーネント。
 * ライティング、コントロール、ポストプロセッシング、3Dモデルをレンダリングします。
 */
export default function CanvasWrapper() {
  return (
    <R3FCanvas
      shadows // シャドウを有効化 / Enable shadows
      dpr={[1, 2]} // デバイスピクセル比 / Device pixel ratio
      camera={{
        fov: 45,
        near: 0.1,
        far: 1000,
        position: [10, 10, 10],
      }} // カメラ初期設定 / Initial camera settings
    >
      <ambientLight intensity={0.5} /> {/* 環境光 / Ambient light */}
      <directionalLight position={[10, 10, 5]} castShadow /> {/* メインライト / Directional light */}
      <Suspense fallback={null}>
        <Stage adjustCamera={0.1} intensity={0.8} environment="city">
          <Model />
        </Stage>
      </Suspense>
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} /> {/* カメラ操作制限 / Camera control limits */}
      <EffectComposer>
        <Outline
          selection={[]} // 後で動的に設定 / Will update on hover
          edgeStrength={2.5}
          visibleEdgeColor={0x00ff88}
        />
      </EffectComposer>
    </R3FCanvas>
  );
}
```

### 2.2.2: Traverse nodes to Collect Clickable Mesh Refs

#### Research & Preparation

- [ ] Confirm useGLTF return type (from our generated GLTFResult)
- [ ] Review official R3F guide on primitive usage

#### Implementation Steps

```tsx
// src/components/Model.tsx
import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import type { GLTFResult } from "@/types/model";

/**
 * Model component loads the GLB and collects mesh refs.
 * 3Dモデルを読み込み、各メッシュ参照を収集します。
 */
export default function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes } = useGLTF("/3dtest.glb") as GLTFResult;
  const meshRefs = useRef<Record<string, THREE.Mesh>>({});

  useEffect(() => {
    // nodes から Mesh オブジェクトのみ抽出 / Filter mesh objects
    Object.entries(nodes).forEach(([key, object]) => {
      if (object.type === "Mesh") {
        meshRefs.current[key] = object;
      }
    });
  }, [nodes]);

  return (
    <group {...props} dispose={null}>
      {Object.entries(nodes).map(
        ([key, object]) =>
          object.type === "Mesh" && (
            <primitive
              key={key}
              object={object}
              // meshRefs に登録されたメッシュ / Referenced for events
            />
          )
      )}
    </group>
  );
}
```

### 2.2.3: Implement Pointer Events on Individual Meshes

#### Research & Preparation

- [ ] Verify R3F pointer event props: onPointerOver, onPointerOut, onClick
- [ ] Confirm best practice for stopPropagation()

#### Implementation Steps

Interaction Context (useInteraction.tsx):

```tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface InteractionContextType {
  hoveredId: string | null;
  selectedId: string | null;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
}

const InteractionContext = createContext<InteractionContextType | null>(null);

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [hoveredId, setHovered] = useState<string | null>(null);
  const [selectedId, setSelected] = useState<string | null>(null);
  return (
    <InteractionContext.Provider
      value={{ hoveredId, selectedId, setHovered, setSelected }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const ctx = useContext(InteractionContext);
  if (!ctx)
    throw new Error("useInteraction must be used within InteractionProvider");
  return ctx;
}
```

Interactive Building Component (InteractiveBuilding.tsx):

```tsx
import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { useInteraction } from "@/hooks/useInteraction";
import type { BuildingData } from "@/lib/types";

interface Props {
  id: string;
  mesh: Mesh;
  building: BuildingData;
}

/**
 * InteractiveBuilding handles hover and click events on a mesh.
 * メッシュのホバー・クリックイベントを処理します。
 */
export default function InteractiveBuilding({ id, mesh }: Props) {
  const { hoveredId, setHovered, setSelected } = useInteraction();
  const scaleRef = useRef(1);

  // ホバー時のスケールアニメーション / Hover effect animation
  useFrame((_, delta) => {
    const target = hoveredId === id ? 1.1 : 1;
    scaleRef.current += (target - scaleRef.current) * delta * 5;
    mesh.scale.setScalar(scaleRef.current);
  });

  return (
    <primitive
      object={mesh}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(id);
      }}
    />
  );
}
```

### 2.2.4: Use useFrame for Hover Effect Animations

- **Direct Ref Mutation**: scale mesh directly inside useFrame, no React state used
- **Smooth Interpolation**: LERP towards 1.1 scale on hover, back to 1 on out
- **Performance**: limit work to only hovered mesh

### Verification & Testing

- [ ] TypeScript compiles without errors
- [ ] Hover and click correctly update hoveredId and selectedId
- [ ] No SSR or hydration errors
- [ ] Performance remains stable at 60 fps desktop, 30 fps mobile

---

## Verification Checklist

### Before Marking Complete

- [ ] All code passes TypeScript compilation without errors
- [ ] Component renders correctly in development environment
- [ ] No console errors related to SSR or model loading
- [ ] Proper Japanese and English comments included
- [ ] Code follows Next.js 15 and React 19 best practices
- [ ] Performance is acceptable with the loaded model
- [ ] Suspense boundaries work correctly
- [ ] Error handling implemented for model loading failures

### Research Requirements (If Uncertain)

- If gltfjsx tool changes or has new version, research new usage patterns
- If Next.js 15 has specific requirements for R3F integration, verify compatibility
- If there are better ways to handle GLB models in current ecosystem, investigate
- If Three.js types have changed, check for updated type definitions

---

## Expected Outcome

After completing Task 2.1:

- A fully typed, SSR-safe Model component will be created from the GLB file
- TypeScript definitions will be in place for all model elements
- Suspense boundaries will handle loading states properly
- The component will be ready for interaction implementation in Task 2.2
- All code will be compatible with Next.js 15.5.3 and React 19
- Both Japanese and English comments will be present for all code

This implementation will serve as the foundation for the interactive building features in subsequent tasks.
