# Tokyo Diorama (R3F) — Professional Delivery Plan (Full MD)

> **Purpose**: A complete, step‑by‑step blueprint to build an isometric, audio‑rich Tokyo diorama website using React Three Fiber (R3F). This plan is designed for a small team (5–8) and guarantees a working result by moving in clearly scoped phases with acceptance criteria, test plans, and risk controls.

---

## Table of Contents

1. [Project Vision & Non‑Goals](#project-vision--non-goals)
2. [Baseline & Tech Stack](#baseline--tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Data & Asset Schemas](#data--asset-schemas)
5. [UX Flows & UI Components](#ux-flows--ui-components)
   - [Popup Modals (Spec)](#popup-modals-spec)
6. [Phased Roadmap (with Deliverables)](#phased-roadmap-with-deliverables)
7. [Work Breakdown Structure (WBS)](#work-breakdown-structure-wbs)
8. [Testing Strategy](#testing-strategy)
9. [Performance Budget & Optimizations](#performance-budget--optimizations)
10. [Accessibility & Internationalization](#accessibility--internationalization)
11. [DevOps, Environments & Deployment](#devops-environments--deployment)
12. [Risk Register & Mitigations](#risk-register--mitigations)
13. [Acceptance Criteria (Go/No‑Go)](#acceptance-criteria-gonogo)
14. [Appendices (Commands, References)](#appendices-commands-references)

---

## Project Vision & Non‑Goals

**Vision**: A smooth, isometric **Tokyo soundscape** that lets users pick iconic scenes (Skytree, Tokyo Tower, Shibuya Crossing, etc.), explore a pixel‑styled diorama, and hear layered ambience & SFX, with minimal UI friction and mobile support.

**Non‑Goals** (to keep scope realistic):

- Full photorealistic PBR rendering.
- Procedural city generation.
- MMO‑scale crowds or physics simulation.
- Offline PWA audio caching for all scenes (can be a later improvement).

**Success Metrics**:

- First contentful render < **1.5s** on desktop, < **3s** on mid‑range mobile.
- TTI (interactive) < **3s** desktop / < **5s** mobile.
- 60 FPS desktop target; ≥ 30 FPS mobile.
- Scene switch < **1.5s** perceived (loading + audio crossfade).

---

## Baseline & Tech Stack

**Core**

- React 19 + Next.js 15 (App Router / Turbopack)
- `@react-three/fiber` (R3F), `three`
- `@react-three/drei` helpers
- Zustand (global state)
- Tailwind v4 (+ shadcn/ui components if desired)

**Why this stack**

- React 19 concurrency + server features (Next 15) for fast delivery.
- R3F gives declarative 3D + robust event system.
- Drei reduces boilerplate (cameras, loaders, audio, environment).
- Zustand is tiny and perfect for scene & UI state.

**Node & Package Manager**

- Node ≥ 18
- `pnpm` recommended

> **Note:** We keep R3F rendering in a client component while the side‑panel UI can leverage server components if needed for content.

---

## Architecture Overview

```
tokyo-sounds/
├── .gitignore
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── audio-player.tsx
│   │   │   ├── canvas.tsx
│   │   │   └── footer.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       └── tooltip.tsx
│   ├── hooks/
│   │   └── use-mobile.ts
│   └── lib/
│       └── utils.ts
└── tsconfig.json

```

**Rendering model**

- `<Canvas frameloop="demand" dpr={[1,1]} linear flat>` for pixel‑accurate look.
- Orthographic camera with isometric rotation.
- Minimal lighting (ambient/hemi only) or entirely baked light.
- Instancing for repeated props.
- Audio graph with master/ambience/FX gains.

---

## Data & Asset Schemas

**`scenes.json`** (one entry per scene tile in UI):

```json
[
  {
    "id": "skytree",
    "label": "TOKYO SKYTREE",
    "thumb": "/ui/thumbs/skytree.png",
    "focus": [5, 0, 5],
    "panOffset": [0, 0, 0],
    "models": [
      { "id": "skytree", "glb": "/models/skytree.glb", "pos": [5, 0, 5] },
      { "id": "shops", "glb": "/models/shops.glb", "pos": [0, 0, 0] }
    ],
    "instanced": {
      "trees": { "count": 120, "seed": 42, "area": [20, 0, 20] },
      "lamps": { "count": 45, "seed": 9, "area": [18, 0, 18] }
    },
    "audioPack": ["amb_city_day", "announcer_skytree"],
    "palette": "day",
    "weather": ["clear", "rain"],
    "timeOfDay": ["day", "night"]
  }
]
```

**`buildings.json`** (info card + modal content):

```json
[
  {
    "id": "skytree",
    "title": "Tokyo Skytree",
    "facts": [
      { "label": "Height", "value": "634m" },
      { "label": "Opened", "value": "2012" },
      { "label": "Location", "value": "Sumida, Tokyo" }
    ],
    "description": "A television broadcasting tower and landmark.",
    "learnMoreUrl": "https://www.tokyo-skytree.jp/"
  }
]
```

**`sounds.json`** (bus routing):

```json
{
  "buses": ["master", "ambience", "fx"],
  "packs": {
    "amb_city_day": [
      {
        "url": "/audio/city_day_loop.mp3",
        "bus": "ambience",
        "loop": true,
        "gain": 0.7
      }
    ],
    "announcer_skytree": [
      {
        "url": "/audio/skytree_announcer.mp3",
        "bus": "fx",
        "loop": true,
        "gain": 0.4
      }
    ]
  }
}
```

**Textures (pixel look)**

- PNG, nearest filtering, no mipmaps, atlas where possible.
- Dimensions power‑of‑two preferred (512/1024).

---

## UX Flows & UI Components

### Primary flows

1. **Landing** → shows diorama + side panel.
2. **User clicks a Scene Tile** → **Scene Preview Modal** opens (see below).
3. **User confirms “Load Scene”** → swap models & audio pack; close modal.
4. **User clicks building** → highlight + **Building Info Modal**.
5. **User presses “Start Experience”** → resume AudioContext and unmute buses.
6. Volume slider adjusts master gain in real time.

### Core components

- **SidePanel**: holds ScenePicker, Volume, StartCTA, and persistent **InfoCard** area.
- **ScenePicker**: grid of scene tiles (lazy‑load thumbnails).
- **Volume**: slider 0–100 (maps to [0–1] gain).
- **StartCTA**: prominent button; disabled once started.
- **InfoCard**: shows selection summary; “Learn More” opens **Building Info Modal**.
- **Modals** (see spec below).

---

## Popup Modals (Spec)

### 1) `ScenePreviewModal`

**When**: user clicks a scene tile.  
**Purpose**: reduce misclicks and provide context before heavy loads.

**Content**:

- Title + short description.
- Thumbnail or tiny preview (optional mini‑Canvas).
- Controls:
  - Primary: **Load Scene** (triggers scene switch & audio crossfade).
  - Secondary: **Cancel**.
- Optional toggle: “Start Experience (audio) immediately after load”.

**Behavior**:

- **Open** on tile click.
- **Confirm** → call `setScene(sceneId)` and close; if toggle on, call `resumeAudio()` after the scene is ready.
- **Focus management**: trap focus; return focus to triggering tile on close.
- **Keyboard**: `Enter` = confirm, `Esc` = close.
- **ARIA**: `role="dialog"`, labelled by modal title, `aria-modal="true"`.
- **Mobile**: full‑screen sheet with large buttons.

**State**:

```ts
type ScenePreviewState = {
  open: boolean;
  sceneId?: string;
  startAudioAfterLoad: boolean;
};
```

### 2) `BuildingInfoModal`

**When**: user clicks a building in the diorama or presses “Learn More”.  
**Content**:

- Title, image (or static render), facts list, description, external link.
- Controls: **Close**, **Open Link** (opens new tab).  
  **Behavior**:
- **Open** with selected building’s data; close on overlay/ESC.
- **Focus management** + **ARIA** identical to the preview modal.
- **Mobile**: scrollable sheet.  
  **State**:

```ts
type BuildingInfoState = {
  open: boolean;
  buildingId?: string;
};
```

**Implementation**:

- Use a headless modal (e.g., shadcn/ui Dialog or Headless UI) with Tailwind for styling.
- Do **not** render modals inside the Canvas; keep them in React DOM.

---

## Phased Roadmap (with Deliverables)

### Phase 0 — Foundations (✓ you said this is done)

**Deliverables**: repo, Next 15 app, lint/prettier, Tailwind, pnpm, baseline dev script.

### Phase 1 — Core 3D Engine

- Setup `<Canvas>` (client) with `frameloop="demand"`, `linear`, `flat`, `dpr={[1,1]}`.
- Orthographic **isometric** camera (`IsoCamera`).
- Minimal light.
- Placeholder ground + one test building.  
  **Done when**: Canvas renders consistently and `invalidate()` is called by interactions only.

### Phase 2 — Asset Pipeline

- Decide GLB export rules (scale, axes, tri count caps).
- Create `gltfjsx` command to convert GLB → typed components.
- Load two hero buildings (Skytree, 109).  
  **Done when**: Both load with correct materials; textures use nearest filtering.

### Phase 3 — Interaction

- Pointer hover/selection with `e.stopPropagation()` controlling occlusion.
- `onPointerMissed` to clear selection.  
  **Done when**: Hover highlight & clicking opens `BuildingInfoModal` with real data.

### Phase 4 — UI System

- Side panel with ScenePicker, Volume, StartCTA.
- Implement **`ScenePreviewModal`** flow.  
  **Done when**: Clicking a scene opens modal; confirming loads scene & updates audio pack.

### Phase 5 — Dynamic Diorama

- Weather (clear/rain), time‑of‑day (day/night) via texture/material swap.
- Instanced props (trees/lamps).
- Optional: animated traffic on splines.  
  **Done when**: Scene toggles work without FPS drops; instancing confirmed.

### Phase 6 — Audio Experience

- Audio buses (master/ambience/fx).
- Packs per scene and **crossfade** on scene change.
- CTA to resume AudioContext.  
  **Done when**: No audio plays before CTA; volume slider affects master in real time.

### Phase 7 — Optimization

- Mesh/material reuse.
- Texture atlases.
- Conditional `frameloop="always"` only when animating.  
  **Done when**: Perf budget is met (see below).

### Phase 8 — Polish & Release

- Loading screen with progress.
- Camera tween on scene switch (focus point).
- QA (mobile/desktop), deploy to Vercel, final content pass.  
  **Done when**: All acceptance criteria pass.

---

## Work Breakdown Structure (WBS)

**1. Project Setup (0.5 wk)**  
1.1 Repo, CI (lint, build)  
1.2 Tailwind & shadcn/ui install  
1.3 Routing skeleton

**2. 3D Core (1 wk)**  
2.1 CanvasRoot & IsoCamera  
2.2 Ground plane + grid  
2.3 Lighting pass

**3. Assets (1 wk)**  
3.1 GLB export templates, naming, units  
3.2 `gltfjsx` script & docs  
3.3 Import two landmark models

**4. Interaction (0.5 wk)**  
4.1 Hover highlight, selection state  
4.2 BuildingInfoModal (content from `buildings.json`)

**5. UI System (1 wk)**  
5.1 SidePanel layout  
5.2 ScenePicker grid + tiles  
5.3 ScenePreviewModal (confirm load)

**6. Audio (0.5–1 wk)**  
6.1 Buses & gain nodes  
6.2 Packs per scene + crossfade  
6.3 StartCTA (user gesture)

**7. Dynamic Diorama (1 wk)**  
7.1 Weather/time toggles  
7.2 Instanced props  
7.3 Optional traffic

**8. Performance & QA (0.5–1 wk)**  
8.1 Texture atlas + material merge  
8.2 Frameloop strategy + profiling  
8.3 Device QA & fixes

**9. Polish & Deploy (0.5 wk)**  
9.1 Loading screen  
9.2 Camera tweens  
9.3 Vercel deploy

_Total: ~6–7 weeks part‑time, ~3–4 weeks full‑time._

---

## Testing Strategy

**Unit/Logic**

- Zustand store: actions (`setScene`, `selectBuilding`, `setVolume`, modal open/close).
- Helpers (audio crossfade durations, instance placement).

**Component**

- ScenePicker → opens ScenePreviewModal on click; confirm triggers `setScene`.
- StartCTA → resumes audio only on click.
- BuildingInfoModal → opens with correct building info; closes on Esc/overlay.

**E2E (Playwright)**

- Load → first paint < budget.
- Scene switch with modal → loads models; audio crossfade occurs.
- Mobile viewport → modals convert to full‑screen sheets; focus trap works.
- Keyboard a11y → `Enter` confirm, `Esc` closes.

**Visual Regression**

- Pixel style requires strict images: set deterministic camera and compare screenshots.

---

## Performance Budget & Optimizations

**Budgets**

- Models: ≤ **50k tris** per scene (ideally 15–30k).
- Textures: ≤ **10 MB** total loaded per scene.
- Audio: ≤ **3 MB** per pack (looped, compressed).

**Levers**

- `frameloop="demand"`; call `invalidate()` on state changes or anim loops.
- **InstancedMesh** for trees/lamps.
- Nearest filtering; no mipmaps to save memory (pixel aesthetic).
- Single directional/ambient light or full baked textures.
- Merge draw calls where possible (shared materials).
- Defer non‑critical models with Suspense chunking.

---

## Accessibility & Internationalization

- **Modals**: focus trap, labelled title, keyboard support, `aria-modal`.
- Buttons: visible focus rings (Tailwind), large tap targets.
- Volume slider: keyboard arrows + screen reader labels.
- Language strings: extract UI text to `locales/ja.json` and `locales/en.json` for future i18n.

---

## DevOps, Environments & Deployment

- **Envs**: dev (local), preview (PR deploys), prod (main).
- **Preview URLs** for stakeholders after each milestone.
- **Deployment**: Vercel with static asset serving (models, textures, audio in `/public`).
- **CI**: ESLint + typecheck + Playwright smoke.

---

## Risk Register & Mitigations

| Risk                       |   Impact | Likelihood | Mitigation                                      |
| -------------------------- | -------: | :--------: | ----------------------------------------------- |
| Models too heavy           | FPS drop |    Med     | Enforce tri budget & review GLB per PR          |
| Audio autoplay blocked     | No sound |    High    | Gate via StartCTA; resume AudioContext on click |
| Mobile memory limits       |  Crashes |    Low     | Lazy‑load packs; cap concurrent audio sources   |
| Picking errors (occlusion) |  UX bugs |    Med     | Use `stopPropagation`; large ground catch‑mesh  |
| Team unfamiliar with R3F   |   Delays |    Med     | Keep Canvas minimal, use Drei, add code docs    |

---

## Acceptance Criteria (Go/No‑Go)

- ✅ Scenes can be selected via **ScenePreviewModal**; confirm loads within budget.
- ✅ Clicking buildings opens **BuildingInfoModal** with correct info & deep link.
- ✅ StartCTA required for any audio; volume slider works.
- ✅ Desktop 60 fps / Mobile 30 fps on mid‑range hardware.
- ✅ All E2E tests pass; a11y checks on modals and sliders pass.

---

## Appendices (Commands, References)

### Install (pnpm)

```bash
pnpm add three @react-three/fiber @react-three/drei zustand
pnpm add -D @types/three
```

### Script: GLTF → JSX (dev aid)

```bash
# Generate component from GLB
npx gltfjsx ./public/models/skytree.glb --transform --types
```

### State shape (Zustand)

```ts
type SceneId = "skytree" | "tower" | "crossing" | string;
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
};
```

### Modal triggers (events → actions)

- Scene tile click → `openScenePreview(sceneId)`
- Confirm in modal → `setScene(sceneId)` → `closeScenePreview()`
- Building click → `openBuildingInfo(buildingId)`
- “Learn More” → external link (new tab)

---

**This plan is intentionally “code‑light” and “process‑heavy.”** If you want, the next step is to generate a **starter repository** with empty files and TODO comments for each component above, plus a modal wired to a fake scene so your team can click through everything on Day 1.
