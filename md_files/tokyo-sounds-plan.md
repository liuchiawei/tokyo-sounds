# Tokyo Sounds Development Plan

**Technology Stack**: Next.js (v15.x), React 19, TypeScript, React Three Fiber (R3F), @react-three/drei, Howler.js, Radix UI, TailwindCSS

## Phase Structure

1. **Foundation & Setup**
2. **3D Model Interaction**
3. **Tooltip & Modal System**
4. **Audio Integration**
5. **Visual Effects & Polish**
6. **Testing & Deployment**

---

## Phase 1: Foundation & Setup

### Task 1.1: Project Initialization

- 1.1.1: Bootstrap Next.js with TypeScript (`npx create-next-app@latest --ts`)
- 1.1.2: Install dependencies:
  - `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
  - `howler`, `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, `clsx`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`
- 1.1.3: Configure TailwindCSS and PostCSS
- 1.1.4: Configure TS paths in `tsconfig.json` for `@/components`, `@/lib`, `@/hooks`

---

## Phase 2: 3D Model Interaction

### Task 2.1: GLB Model Loading

- 2.1.1: Use `gltfjsx` to generate `src/components/Model.tsx`
- 2.1.2: Typings: Generate `.d.ts` for GLB nodes and materials
- 2.1.3: Integrate `useGLTF` from `@react-three/drei` with suspense
- 2.1.4: Verify SSR safety with dynamic import and `ssr: false`

### Task 2.2: Raycasting & Mesh Event Binding

- 2.2.1: In `Canvas.tsx`, configure `<Canvas camera={...} shadows dpr={[1,2]}>
- 2.2.2: Traverse `nodes` to collect clickable mesh refs
- 2.2.3: Implement `onPointerOver`, `onPointerOut`, `onClick` on individual meshes
- 2.2.4: Use `useFrame` for hover effect animations (scale/rotation)

### Task 2.3: State Management

- 2.3.1: Create React Context (`InteractionContext`) for selected building and hover state
- 2.3.2: Provide context at `pages/_app.tsx` wrapping `<Canvas />`
- 2.3.3: Custom hook `useInteraction()` returning `{ hoveredId, selectedId, setHovered, setSelected }`
- 2.3.4: Persist selection state in URL query params for deep linking

---

## Phase 3: Tooltip & Modal System

### Task 3.1: Tooltip Component

- 3.1.1: Create `BuildingTooltip.tsx` using `Html` from `@react-three/drei` with TypeScript props
- 3.1.2: Style tooltip in Tailwind: semi-transparent dark background, blur, rounded corners
- 3.1.3: Position tooltip using event intersection point and camera
- 3.1.4: Debounce hover state with custom hook for stable tooltip display

### Task 3.2: Modal Component

- 3.2.1: Implement Radix UI Dialog in `BuildingModal.tsx` with TypeScript
- 3.2.2: Modal layout: header (JP name), 3D model preview (`<Canvas>` mini view), description, facts list, audio controls
- 3.2.3: Animate open/close with `framer-motion` or Radix transitions
- 3.2.4: Accessibility: focus trap, keyboard navigation, ARIA labels

### Task 3.3: Content Data Structure

- 3.3.1: Define `BuildingData` TS interface in `src/lib/types.ts`
- 3.3.2: Create `src/data/buildings.ts` exporting `Record<string, BuildingData>`
- 3.3.3: Include fields: `id`, `nameJP`, `thumbnail`, `modelMesh`, `shortDescJP`, `fullDescJP`, `height`, `year`, `audioSrc`
- 3.3.4: Type-check usage in tooltip and modal components

---

## Phase 4: Audio Integration

### Task 4.1: AudioPlayer Enhancement

- 4.1.1: Convert `AudioPlayer.tsx` to TypeScript with props for `src`, `autoPlay`, `onEnd`
- 4.1.2: Integrate Howler.js with hooks: `useHowl(src, { volume, loop })`
- 4.1.3: Preload all landmark narrations on initial load or on hover
- 4.1.4: Expose controls: play, pause, seek, volume slider

### Task 4.2: Synchronization

- 4.2.1: On `setSelected`, auto-play corresponding narration
- 4.2.2: Display playback progress bar in modal
- 4.2.3: Crossfade between narrations using Howler's fade API
- 4.2.4: Clean up Howl instances on modal close to free memory

---

## Phase 5: Visual Effects & Polish

### Task 5.1: Post-Processing Effects

- 5.1.1: Add `EffectComposer` in `Canvas.tsx` with selective `Outline` for hovered meshes
- 5.1.2: Add `SelectiveBloom` for selected meshes to emphasize active landmark
- 5.1.3: Tune `edgeStrength`, `luminanceThreshold`, and `radius` for visual coherence
- 5.1.4: Ensure SSR-friendly setup with dynamic import if needed

### Task 5.2: Camera & Controls

- 5.2.1: Configure `OrbitControls` with limits: no panning, zoom limits, damping
- 5.2.2: Programmatic camera transitions on selection using `useFrame` and `lerp`
- 5.2.3: Disable controls during transitions for consistency
- 5.2.4: Reset camera on modal close or background click

### Task 5.3: Loading & Error Handling

- 5.3.1: Global `<Suspense fallback={<Loader />}>` in `Canvas.tsx`
- 5.3.2: Error boundary around GLTF loading with user-friendly message in Japanese
- 5.3.3: Lazy-load non-critical assets (images, secondary models)
- 5.3.4: Fallback thumbnail for missing images

---

## Phase 6: Testing & Deployment

### Task 6.1: Testing

- 6.1.1: Unit tests for custom hooks and context using Jest and React Testing Library
- 6.1.2: Integration tests for tooltip and modal interactions with Cypress
- 6.1.3: Performance tests using `r3f-perf` and Lighthouse audits
- 6.1.4: Accessibility testing with Axe and manual ARIA checks

### Task 6.2: Optimization

- 6.2.1: Tree-shake imports: only import used Three.js modules
- 6.2.2: Enable HTTP/2 and Brotli on CDN for GLB and audio assets
- 6.2.3: Configure Next.js Image Optimization for thumbnails
- 6.2.4: Implement LOD switching for large models if needed

### Task 6.3: Deployment

- 6.3.1: Configure Vercel for Next.js deployment, enable Edge Functions for SSR
- 6.3.2: Add environment variables for analytics and monitoring
- 6.3.3: Set up Sentry for error tracking with Japanese locale
- 6.3.4: Final smoke test in staging before production

---

**Estimated Timeline**: ~6–8 weeks total

**Deliverables**:

- Type-safe Next.js codebase with modular R3F components
- Interactive 3D Tokyo cityscape with hover tooltips and detail modals
- Professional Japanese narration playback
- Polished visual effects and responsive design
- Comprehensive tests and production deployment pipeline
