# React Three Fiber (R3F) — A Full-System Deep Dive

> **Goal** — Give you a complete working mental model of R3F: how it renders, how JSX maps to Three.js, life cycle + events, hooks, performance, color/WebGPU, TypeScript, and advanced usage. Keep this open while you build.

---

## Table of Contents
1. [What R3F Is](#what-r3f-is)
2. [How It Works (Under the Hood)](#how-it-works-under-the-hood)
3. [JSX → Three.js: Objects, Args, Attach, Primitive, Extend](#jsx--threejs-objects-args-attach-primitive-extend)
4. [Canvas: The Runtime Shell](#canvas-the-runtime-shell)
   - [Key Props](#key-props)
   - [Defaults (what Canvas creates for you)](#defaults-what-canvas-creates-for-you)
   - [WebGPU Mode](#webgpu-mode)
   - [Custom Roots & Tree‑shaking](#custom-roots--tree-shaking)
   - [Error & Fallback Strategies](#error--fallback-strategies)
5. [Events & Interaction](#events--interaction)
   - [Event Types & Payload](#event-types--payload)
   - [Propagation & Occlusion in 3D](#propagation--occlusion-in-3d)
   - [Pointer Capture](#pointer-capture)
   - [Custom Event Manager, eventSource & eventPrefix](#custom-event-manager-eventsource--eventprefix)
   - [Forcing Raycasts without Interaction](#forcing-raycasts-without-interaction)
6. [Hooks (State, Frame Loop, Loading, Graph)](#hooks-state-frame-loop-loading-graph)
   - [`useThree()`](#usethree)
   - [`useFrame(cb, priority?)`](#useframecb-priority)
   - [`useLoader()` + caching & GLTF niceties](#useloader--caching--gltf-niceties)
   - [`useGraph()`](#usegraph)
7. [Performance Playbook](#performance-playbook)
   - [On‑Demand Rendering & `invalidate()`](#on-demand-rendering--invalidate)
   - [Reuse, Instancing, LOD, Progressive Loading](#reuse-instancing-lod-progressive-loading)
   - [Avoiding React State Bottlenecks in Loops](#avoiding-react-state-bottlenecks-in-loops)
   - [Adaptive Quality & Concurrency](#adaptive-quality--concurrency)
8. [Color Management & Tone Mapping](#color-management--tone-mapping)
9. [TypeScript & Catalog Types](#typescript--catalog-types)
10. [Ecosystem You’ll Actually Use](#ecosystem-youll-actually-use)
11. [Common Pitfalls & Debugging](#common-pitfalls--debugging)
12. [Mini Recipes](#mini-recipes)

---

## 1) What R3F Is
- **R3F is a React renderer for Three.js**. You write declarative JSX; R3F maps it to real Three objects, syncs props efficiently, and lets components participate in React’s ecosystem (Suspense, transitions, state, etc.).
- **No feature loss**: everything you can do in Three.js, you can do in R3F; the library just expresses Three in JSX.
- **Version pairing**: `@react-three/fiber@8` ↔ React 18; `@react-three/fiber@9` ↔ React 19.

## 2) How It Works (Under the Hood)
- R3F plugs into React’s reconciler like `react-dom`, but targets **Three’s scene graph** instead of the DOM.
- On mount/update/unmount, it **constructs/updates/disposes** Three objects. Changes propagate **outside React** in a shared render loop, so there isn’t a “DOM diff” cost per frame.
- The **state store** (exposed via `useThree`) tracks renderer (`gl`), scene, camera, pointer, raycaster, size/viewport, XR interface, and utility setters (e.g. `setDpr`, `invalidate`, `setFrameloop`).

## 3) JSX → Three.js: Objects, Args, Attach, Primitive, Extend

### Declaring objects
Prefer declarative props over `new`-ing objects inline. R3F turns JSX into Three instances and keeps them in sync.

### Constructor arguments with `args`
Any Three class constructor parameters go into an **array**: `args={[...]}`. Changing `args` replaces the instance (because the underlying Three object must be reconstructed).

```tsx
<boxGeometry args={[1, 1, 1]} />
```

### Shorthand setters & dash‑case deep props
If a property has `.set(...)`, you can pass the corresponding tuple or string:

```tsx
<mesh position={[1, 2, 3]} rotation={[Math.PI/2, 0, 0]}>
  <meshStandardMaterial color="hotpink" />
</mesh>
```
For nested properties, use **dash‑case**:

```tsx
<directionalLight shadow-mapSize={[1024,1024]} />
<mesh rotation-x={Math.PI/2} />
```

### Attaching non‑scene objects (`attach`)
Materials, geometries, attributes, etc. **attach** to a parent. R3F auto‑attaches materials to `material` and geometries to `geometry`, but you can attach arbitrarily deep:

```tsx
<mesh>
  <bufferGeometry>
    <bufferAttribute attach="attributes-position" args={[array, 3]} />
  </bufferGeometry>
</mesh>
```

### Bringing existing Three objects: `<primitive object={...} />`
Use `<primitive>` to insert an existing `Object3D` into the graph. Don’t add the **same** object in multiple places (clone if needed). R3F won’t auto‑dispose primitives; you own their lifecycle.

### Extending the JSX catalog (`extend`)
Register external Three classes (e.g. controls from `three-stdlib`) so you can declare them as JSX elements. With TypeScript, augment `ThreeElements` (see §9).

### Disposal
Unmounting triggers `object.dispose()` (if present) for you. If you manage shared/global assets manually, disable auto‑disposal on a subtree with `dispose={null}`.


## 4) Canvas: The Runtime Shell
The `<Canvas/>` component bootstraps the renderer, scene, camera, event layer, and the render loop. It’s the usual entry point.

### Key Props
- **`gl`** — Configure or replace the renderer. Accepts an object of constructor props, a factory `(props) => new WebGLRenderer(props)`, or an **async** factory for WebGPU (see below).
- **`camera` / `scene`** — Pass props to the default camera/scene or provide your own instances.
- **`shadows`** — `true` (PCFSoft) or `'basic' | 'percentage' | 'soft' | 'variance'`.
- **`raycaster`** — Configure default raycaster.
- **`frameloop`** — `'always' | 'demand' | 'never'` for render cadence control.
- **`resize`** — Options passed to the internal resize observer.
- **`orthographic`** — Use an orthographic default camera.
- **`dpr`** — Device pixel ratio number or range `[min, max]`.
- **Color flags** — `legacy`, `linear`, `flat` (see §8 for color/tone mapping).
- **`events` / `eventSource` / `eventPrefix`** — Swap event manager, connect to a different DOM node, or change pointer coordinate basis.
- **`onPointerMissed`** — Fires on canvas clicks that miss all targets.

### Defaults (what Canvas creates for you)
- WebGLRenderer with sensible defaults (antialias, alpha, high‑performance), **SRGB output** + **ACES Filmic tone mapping**.
- A default Perspective (or Orthographic) camera, a Scene, a Raycaster, and (if `shadows`) a PCFSoft shadow map.

### WebGPU Mode
Modern Three ships a **WebGPURenderer** that requires async init. Provide `gl={async (props) => { const r = new THREE.WebGPURenderer(props); await r.init(); return r; }}` and register the **webgpu** classes into the catalog (`extend(THREE)`).

### Custom Roots & Tree‑shaking
You can bypass `<Canvas/>` and render into an existing `<canvas>` via `createRoot(canvas)`. Then **you** handle resizing and (optionally) inject the event manager. From v8+, R3F doesn’t auto‑register the Three namespace; use `extend(...)` (or the official Babel plugin) to tree‑shake what you need.

### Error & Fallback Strategies
Supply a `fallback` element to `<Canvas>` for systems without WebGL, and guard against context loss with an error boundary around the canvas. Aim for a visual fallback that resembles the 3D result when possible.


## 5) Events & Interaction
R3F wires a **3D‑aware pointer event system** on top of Three’s raycaster.

### Event Types & Payload
You can attach `onClick`, `onPointerOver/Out/Enter/Leave`, `onPointerDown/Up/Move`, `onContextMenu`, `onDoubleClick`, `onWheel`, and `onUpdate` directly to hit‑testable objects (meshes, lines, etc.). Handlers receive DOM info **plus** Three’s intersection data (`object`, `eventObject`, `point`, `distance`, `intersections`, `ray`, `camera`, etc.). Use `onPointerMissed` on `<Canvas/>` for scene‑level misses.

### Propagation & Occlusion in 3D
Propagation isn’t strictly DOM‑like because **occlusion** matters. The nearest hit receives the event first; bubbling continues up its parents, then to the next farthest hit object. Calling `e.stopPropagation()` stops bubbling **and** prevents delivery to objects **behind** the current hit. For an object to block through‑clicks, give it a handler that calls `stopPropagation()` — even if you don’t otherwise handle the event.

### Pointer Capture
Use `e.target.setPointerCapture(e.pointerId)` / `releasePointerCapture` to keep receiving subsequent pointer events. Because R3F delivers events to all intersects, capture semantics differ slightly from DOM: captured targets are **added** to delivery after the hit set; you can still `stopPropagation()` as needed.

### Custom Event Manager, `eventSource` & `eventPrefix`
Provide a custom `events={(state)=>({...})}` factory on `<Canvas/>` to override hit filtering or pointer → raycaster mapping. Or attach to an external DOM **event source** (e.g., a parent that also contains overlays). Switch pointer coordinate basis via `eventPrefix="client"` to use `clientX/Y` instead of `offsetX/Y`.

### Forcing Raycasts without Interaction
By default R3F only raycasts during user interaction. If the camera moves and you want hover states to follow, call `useThree(state => state.events.update())` to force a raycast (e.g., inside `useFrame` when the camera matrix changes).


## 6) Hooks (State, Frame Loop, Loading, Graph)

### `useThree()`
Returns the renderer (`gl`), `scene`, `camera`, `raycaster`, `pointer`, `clock`, booleans for color/tone flags, `frameloop`, `size`, **viewport metrics**, XR interface, and a set of **imperative helpers**: `set`, `get`, `invalidate`, `advance`, `setSize`, `setDpr`, `setFrameloop`, `setEvents`, and `events.connect(...)`. You can **select** slices, e.g. `useThree(s => s.camera)`, to avoid needless re-renders.

### `useFrame(cb, priority?)`
Subscribe to the shared render loop. Keep work tiny, avoid `setState` inside (mutate refs instead), and use `delta` to stay refresh‑rate independent. Supplying a **positive** priority (e.g., `1`) **takes over** rendering — you must call `gl.render(...)` yourself (useful for effect composers or rendering overlays in a specific order). Negative priorities only order callbacks.

### `useLoader()` — caching, extensions, multiples, progress
- Suspense‑aware asset loading for any Three loader (GLTF/OBJ/Texture/Font/etc.).
- Global **cache** keyed by URL(s); `useLoader.preload(...)` to warm it.
- Configure loaders via an extension callback (e.g., DRACO/KTX2), or pass a **loader instance** you created (v9) to centralize pooling and setup.
- **GLTF convenience**: if a loader result has `.scene`, R3F builds `{nodes, materials}` maps so you can address parts directly — great with GLTF‑JSX codegen.

### `useGraph()`
Given any `Object3D`, returns memoized `{nodes, materials}` like the GLTF convenience above.


## 7) Performance Playbook

### On‑Demand Rendering & `invalidate()`
Switch `<Canvas frameloop="demand"/>` to render **only** when something changes. When using imperative controls or other systems that mutate without React’s knowledge, call `invalidate()` (e.g., on `controls` change events). `invalidate()` schedules a frame; multiple calls within a tick coalesce.

### Reuse, Instancing, LOD, Progressive Loading
- **Reuse** geometries and materials (global singletons or memoized) to reduce compilation and memory pressure.
- **Instancing** reduces draw calls dramatically when rendering many similar meshes (hundreds of thousands in one draw).
- Use **LOD** (e.g., drei’s `<Detailed/>`) to swap in lower‑res models far from the camera.
- **Progressive loading** with nested `<Suspense>` for fast first paint → swap to high quality later.

### Avoiding React State Bottlenecks in Loops
- Don’t `setState` inside `useFrame`/fast events; **mutate refs** and use `delta` instead.
- Avoid mounting/unmounting whole subtrees during gameplay — consider toggling `visible`.
- Reuse temp objects to keep the GC quiet; don’t `new` vectors every frame.
- Prefer `useLoader` over ad‑hoc loaders to benefit from caching.

### Adaptive Quality & Concurrency
- React’s concurrent features (`startTransition`/`useTransition`) help defer heavy updates and keep fps stable.
- R3F exposes a **performance** controller in state; use it to adapt pixel ratio or skip expensive effects during movement.


## 8) Color Management & Tone Mapping
- **Defaults**: renderer uses **SRGB output** and **ACES Filmic tone mapping**. This gives a good photographic baseline. Set `flat` on `<Canvas/>` to switch to `NoToneMapping`, or `linear` to opt out of automatic sRGB conversions. `legacy` toggles Three’s legacy color management behavior.
- Since v9, **built‑in materials** handle color‑texture color‑space automatically like vanilla Three. For **custom shaders/materials**, mark color textures as `texture.colorSpace = THREE.SRGBColorSpace`.


## 9) TypeScript & Catalog Types
- Type `useRef` targets explicitly: `const ref = useRef<Mesh>(null!)`.
- To declare third‑party classes as JSX elements, extend the **catalog**:
  - either augment `ThreeElements` with `ThreeElement<typeof MyClass>`; or
  - use the **factory** signature `const MyElement = extend(MyClass)` to infer types locally and avoid namespace bleed.
- R3F v9 renames `Props` → `CanvasProps`, and introduces dynamic JSX typing: instead of `MeshProps`, use `ThreeElements['mesh']`.


## 10) Ecosystem You’ll Actually Use
- **@react-three/drei** — controls, staging, environments, text, HTML overlays, LOD helpers, gizmos, audio, loaders, performance widgets, and more.
- **@pmndrs/xr** — drop‑in AR/VR with `<XR>` wrappers and helpers for controllers, hands, teleport, object detection, etc.
- **React‑Postprocessing** (pmndrs) — effect composer and a large catalog of post‑FX components (bloom, SSAO, etc.).


## 11) Common Pitfalls & Debugging
- **Creating objects in render** (materials, geometries, lights) forces recompilation. Share or memoize.
- **setState in fast loops** causes jank — mutate refs.
- **GC churn** from per‑frame allocations — reuse vectors/matrices.
- **Mount/unmount churn** — prefer `visible` or portals.
- **Forgetting `dispose={null}`** when you manage global/shared assets.


## 12) Mini Recipes

### A. Minimal Starter
```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function SpinningBox() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => (ref.current.rotation.y += dt))
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial color="#ff7a7a" />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas shadows dpr={[1,2]} frameloop="always">
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 5, 2]} castShadow />
      <SpinningBox />
    </Canvas>
  )
}
```

### B. Demand‑Driven Scene + Controls
```tsx
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'

function DemandControls() {
  const controls = useRef<any>(null)
  const { invalidate } = useThree()
  useEffect(() => {
    const c = controls.current
    c?.addEventListener('change', invalidate)
    return () => c?.removeEventListener('change', invalidate)
  }, [])
  return <OrbitControls ref={controls} />
}

export default () => (
  <Canvas frameloop="demand">
    <DemandControls />
    {/* ... */}
  </Canvas>
)
```

### C. Blocking Through‑Clicks
```tsx
<mesh onPointerOver={(e) => e.stopPropagation()}>
  {/* this mesh now occludes events from objects behind it */}
</mesh>
```

### D. WebGPU Renderer
```tsx
import * as THREE from 'three/webgpu'
import { Canvas, extend } from '@react-three/fiber'

extend(THREE as any)

export default () => (
  <Canvas gl={async (props) => { const r = new THREE.WebGPURenderer(props as any); await r.init(); return r; }}>
    <mesh>
      <meshBasicNodeMaterial />
      <boxGeometry />
    </mesh>
  </Canvas>
)
```

### E. Type‑Safe Extend
```ts
import { extend, type ThreeElement } from '@react-three/fiber'
import { GridHelper } from 'three'

class CustomElement extends GridHelper {}

declare module '@react-three/fiber' {
  interface ThreeElements {
    customElement: ThreeElement<typeof CustomElement>
  }
}

extend({ CustomElement })
```

---

## 13) Advanced Patterns and Techniques

### Next.js Integration
When using R3F with Next.js, you need to handle server-side rendering properly. Use dynamic imports with `ssr: false` to prevent server-side rendering of 3D content, which requires a browser environment.

```jsx
import dynamic from 'next/dynamic'

const Scene = dynamic(
  () => import('../components/Scene'),
  { ssr: false }
)

export default function Page() {
  return (
    <div>
      <Scene />
    </div>
  )
}
```

### State Management with Zustand
For complex scene state management, Zustand is a popular choice. Here's how to set up a store for managing R3F scene state:

```ts
import { create } from 'zustand'
import { SceneId } from './types' // your scene type definitions

type AppState = {
  sceneId: SceneId;
  isStarted: boolean;
  selection?: string | null;
  hoverId?: string | null;
  volume: number; // 0..1
  modals: {
    scenePreview: {
      open: boolean;
      sceneId?: SceneId;
      startAudioAfterLoad: boolean;
    };
    buildingInfo: { open: boolean; buildingId?: string };
  };
  // Actions
  setScene: (id: SceneId) => void;
  setStarted: (started: boolean) => void;
  setSelection: (selection: string | null) => void;
  setHover: (hoverId: string | null) => void;
  setVolume: (volume: number) => void;
  openScenePreview: (sceneId: SceneId) => void;
  closeScenePreview: () => void;
  openBuildingInfo: (buildingId: string) => void;
  closeBuildingInfo: () => void;
};

export const useStore = create<AppState>((set) => ({
  sceneId: 'skytree',
  isStarted: false,
  selection: null,
  hoverId: null,
  volume: 0.7,
  modals: {
    scenePreview: { open: false, startAudioAfterLoad: false },
    buildingInfo: { open: false }
  },
  setScene: (sceneId) => set({ sceneId }),
  setStarted: (isStarted) => set({ isStarted }),
  setSelection: (selection) => set({ selection }),
  setHover: (hoverId) => set({ hoverId }),
  setVolume: (volume) => set({ volume }),
  openScenePreview: (sceneId) => set((state) => ({
    modals: { ...state.modals, scenePreview: { ...state.modals.scenePreview, open: true, sceneId } }
  })),
  closeScenePreview: () => set((state) => ({
    modals: { ...state.modals, scenePreview: { ...state.modals.scenePreview, open: false, sceneId: undefined } }
  })),
  openBuildingInfo: (buildingId) => set((state) => ({
    modals: { ...state.modals, buildingInfo: { ...state.modals.buildingInfo, open: true, buildingId } }
  })),
  closeBuildingInfo: () => set((state) => ({
    modals: { ...state.modals, buildingInfo: { ...state.modals.buildingInfo, open: false, buildingId: undefined } }
  }))
}));
```

### GLTF/GLB Model Loading and Usage
For loading 3D models in GLTF/GLB format, R3F provides the `useLoader` hook. The `gltfjsx` tool can convert GLTF models to JSX components, making them easier to work with in React components. Here's how to load and use GLTF models with proper error handling and optimization techniques. Also, it's important to understand the use of `Suspense` for handling loading states properly:


```jsx
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Suspense } from 'react'
import { Html, useProgress } from '@react-three/drei'

// Create a loading indicator component
function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}

// Component to load and display a 3D model
function Model({ url, position = [0, 0, 0] }) {
  const { scene } = useLoader(GLTFLoader, url)
  return <primitive object={scene} position={position} />
}

// Usage in JSX with proper loading handling
<Suspense fallback={<Loader />}>
  <Model url="/models/skytree.glb" position={[0, 0, 0]} />
</Suspense>
```

### Audio Integration
R3F can be integrated with audio libraries like Howler.js to create immersive 3D audio experiences. The `@react-three/drei` library includes a `PositionalAudio` component for spatial audio. Here's how to implement 3D positional audio in your R3F application:


```jsx
import { PositionalAudio } from '@react-three/drei'
import { useRef } from 'react'

function AudioModel({ url, position, loop = true, ...props }) {
  const audio = useRef();

  return (
    <mesh position={position}>
      {/* Your 3D object */}
      <positionalAudio
        ref={audio}
        url={url}
        loop={loop}
        autoplay={true}
        distance={10} // Maximum distance where audio can be heard
        rolloffFactor={2} // How quickly the volume decreases with distance
        {...props}
      />
    </mesh>
  );
}
```

### Performance Optimization Techniques
R3F provides several ways to optimize performance, particularly when dealing with large scenes or many objects. These include using instanced rendering, reusing geometries and materials, and implementing demand-driven rendering:


- **Instanced Meshes**: For rendering many similar objects, use instanced rendering to dramatically reduce draw calls
- **Geometry and Material Reuse**: Share geometries and materials across multiple objects to reduce memory usage and compilation time
- **Demand-driven rendering**: Use `frameloop="demand"` and call `invalidate()` only when necessary to reduce unnecessary renders
- **Proper disposal**: Use `dispose={null}` for shared assets to prevent auto-disposal

```jsx
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'

// Example of instanced rendering
function InstancedBoxes({ count = 100 }) {
  const meshRef = useRef()
  const { width, height } = useThree(state => state.size)
  
  // Generate random positions
  const positions = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push(
        (Math.random() - 0.5) * width,
        Math.random() * 2,
        (Math.random() - 0.5) * height
      )
    }
    return new Float32Array(temp)
  }, [count, width, height])

  useFrame(() => {
    // Animate the boxes
    meshRef.current.rotation.x += 0.01
    meshRef.current.rotation.y += 0.01
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="orange" />
      {positions.map((_, i) => (
        <position
          key={i}
          attach={`instanceMatrix`} // This would require a custom implementation
          value={new THREE.Matrix4().setPosition(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])}
        />
      ))}
    </instancedMesh>
  )
}
```

### Error Boundaries for R3F
Since 3D rendering can fail due to various reasons (missing WebGL support, shader compilation errors, etc.), it's good practice to implement error boundaries around your 3D canvas:


```jsx
import { Canvas } from '@react-three/fiber'
import { ErrorBoundary } from 'react-error-boundary'

function R3FScene() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div role="alert">
          <p>Something went wrong with the 3D scene:</p>
          <pre>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <Canvas>
        {/* Your 3D scene content */}
        <ambientLight intensity={0.5} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </ErrorBoundary>
  )
}
```

---

### Final Notes
- Keep **Canvas** lean and declarative.
- Prefer **demand** frameloop for static scenes + call **invalidate()** when something changes outside React.
- Reuse everything you can (materials, geometries, textures, loader results).
- Rely on **drei**/**xr** for production‑ready helpers; build only what you must.
- Always use **Suspense** with fallbacks for loading states when using `useLoader` or dynamic imports.
- Implement proper error boundaries for robustness against WebGL failures or shader compilation errors.
- Use **Zustand** or similar state management libraries for complex scene states beyond local component state.

