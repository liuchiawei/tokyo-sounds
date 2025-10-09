# React Three Fiber (R3F) — フルシステム深掘り解説

> **目標** — R3Fの完全な動作するメンタルモデルを提供します：レンダリング方法、JSXがThree.jsにマッピングされる方法、ライフサイクル + イベント、フック、パフォーマンス、カラー/WebGPU、TypeScript、高度な使用方法。構築中はこれを開いておいてください。

---

## 目次
1. [R3Fとは何か](#r3fとは何か)
2. [動作原理（内部構造）](#動作原理内部構造)
3. [JSX → Three.js: オブジェクト、Args、Attach、Primitive、Extend](#jsx--threejs-オブジェクトargsattachprimitiveextend)
4. [Canvas: ランタイムシェル](#canvas-ランタイムシェル)
   - [主要プロパティ](#主要プロパティ)
   - [デフォルト（Canvasが作成するもの）](#デフォルトcanvasが作成するもの)
   - [WebGPUモード](#webgpuモード)
   - [カスタムルートとTree-shaking](#カスタムルートとtree-shaking)
   - [エラーとフォールバック戦略](#エラーとフォールバック戦略)
5. [イベントとインタラクション](#イベントとインタラクション)
   - [イベントタイプとペイロード](#イベントタイプとペイロード)
   - [3Dでの伝播とオクルージョン](#3dでの伝播とオクルージョン)
   - [ポインターキャプチャ](#ポインターキャプチャ)
   - [カスタムイベントマネージャー、eventSource & eventPrefix](#カスタムイベントマネージャーeventsource--eventprefix)
   - [インタラクションなしでのレイキャスト強制](#インタラクションなしでのレイキャスト強制)
6. [フック（状態、フレームループ、読み込み、グラフ）](#フック状態フレームループ読み込みグラフ)
   - [`useThree()`](#usethree)
   - [`useFrame(cb, priority?)`](#useframecb-priority)
   - [`useLoader()` + キャッシュとGLTFの利便性](#useloader--キャッシュとgltfの利便性)
   - [`useGraph()`](#usegraph)
7. [パフォーマンスプレイブック](#パフォーマンスプレイブック)
   - [オンデマンドレンダリングと`invalidate()`](#オンデマンドレンダリングとinvalidate)
   - [再利用、インスタンシング、LOD、プログレッシブ読み込み](#再利用インスタンシングlodプログレッシブ読み込み)
   - [ループでのReact状態ボトルネック回避](#ループでのreact状態ボトルネック回避)
   - [適応品質と並行性](#適応品質と並行性)
8. [カラーマネジメントとトーンマッピング](#カラーマネジメントとトーンマッピング)
9. [TypeScriptとカタログタイプ](#typescriptとカタログタイプ)
10. [実際に使用するエコシステム](#実際に使用するエコシステム)
11. [よくある落とし穴とデバッグ](#よくある落とし穴とデバッグ)
12. [ミニレシピ](#ミニレシピ)

---

## 1) R3Fとは何か
- **R3FはThree.js用のReactレンダラーです**。宣言的JSXを記述し、R3Fがそれを実際のThreeオブジェクトにマッピングし、プロパティを効率的に同期し、コンポーネントがReactのエコシステム（Suspense、トランジション、状態など）に参加できるようにします。
- **機能損失なし**: Three.jsでできることはすべてR3Fでできます。ライブラリは単にThreeをJSXで表現しているだけです。
- **バージョンペアリング**: `@react-three/fiber@8` ↔ React 18; `@react-three/fiber@9` ↔ React 19。

## 2) 動作原理（内部構造）
- R3Fは`react-dom`のようにReactのレコンシラーに接続しますが、DOMの代わりに**Threeのシーングラフ**をターゲットにします。
- マウント/更新/アンマウント時に、Threeオブジェクトを**構築/更新/破棄**します。変更は共有レンダーループで**Reactの外部**に伝播するため、フレームごとの「DOM diff」コストはありません。
- **状態ストア**（`useThree`で公開）は、レンダラー（`gl`）、シーン、カメラ、ポインター、レイキャスター、サイズ/ビューポート、XRインターフェース、ユーティリティセッター（例：`setDpr`、`invalidate`、`setFrameloop`）を追跡します。

## 3) JSX → Three.js: オブジェクト、Args、Attach、Primitive、Extend

### オブジェクトの宣言
インラインで`new`するよりも宣言的プロパティを優先します。R3FはJSXをThreeインスタンスに変換し、同期を保ちます。

### `args`でのコンストラクター引数
Threeクラスのコンストラクターパラメータは**配列**に入れます：`args={[...]}`。`args`を変更するとインスタンスが置き換わります（基盤のThreeオブジェクトが再構築される必要があるため）。

```tsx
<boxGeometry args={[1, 1, 1]} />
```

### 短縮セッターとダッシュケースの深いプロパティ
プロパティに`.set(...)`がある場合、対応するタプルまたは文字列を渡せます：

```tsx
<mesh position={[1, 2, 3]} rotation={[Math.PI/2, 0, 0]}>
  <meshStandardMaterial color="hotpink" />
</mesh>
```
ネストしたプロパティには**ダッシュケース**を使用：

```tsx
<directionalLight shadow-mapSize={[1024,1024]} />
<mesh rotation-x={Math.PI/2} />
```

### 非シーンオブジェクトのアタッチ（`attach`）
マテリアル、ジオメトリ、属性などは親に**アタッチ**されます。R3Fはマテリアルを`material`に、ジオメトリを`geometry`に自動アタッチしますが、任意の深さでアタッチできます：

```tsx
<mesh>
  <bufferGeometry>
    <bufferAttribute attach="attributes-position" args={[array, 3]} />
  </bufferGeometry>
</mesh>
```

### 既存のThreeオブジェクトの持ち込み：`<primitive object={...} />`
既存の`Object3D`をグラフに挿入するには`<primitive>`を使用します。**同じ**オブジェクトを複数の場所に追加しないでください（必要に応じてクローン）。R3Fはプリミティブを自動破棄しません；ライフサイクルはあなたが管理します。

### JSXカタログの拡張（`extend`）
外部のThreeクラス（例：`three-stdlib`からのコントロール）を登録して、JSX要素として宣言できるようにします。TypeScriptでは、`ThreeElements`を拡張します（§9参照）。

### 破棄
アンマウント時に`object.dispose()`（存在する場合）が自動的に呼び出されます。共有/グローバルアセットを手動で管理する場合は、`dispose={null}`でサブツリーの自動破棄を無効にします。


## 4) Canvas: ランタイムシェル
`<Canvas/>`コンポーネントは、レンダラー、シーン、カメラ、イベントレイヤー、レンダーループをブートストラップします。通常のエントリーポイントです。

### 主要プロパティ
- **`gl`** — レンダラーを設定または置換。コンストラクタープロパティのオブジェクト、ファクトリー`(props) => new WebGLRenderer(props)`、またはWebGPU用の**非同期**ファクトリーを受け入れます（下記参照）。
- **`camera` / `scene`** — デフォルトカメラ/シーンにプロパティを渡すか、独自のインスタンスを提供。
- **`shadows`** — `true`（PCFSoft）または`'basic' | 'percentage' | 'soft' | 'variance'`。
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

### 最終ノート
- **Canvas**をリーンで宣言的に保つ。
- 静的シーンには**demand**フレームループを優先し、Reactの外部で何かが変更された時に**invalidate()**を呼び出す。
- 可能な限りすべてを再利用する（マテリアル、ジオメトリ、テクスチャ、ローダー結果）。
- 本番対応のヘルパーには**drei**/**xr**に依存し、必要なもののみを構築する。

