# Tokyo Sounds - R3F Development Rules & Plan

## Core Rules

1. **Work only with existing files and folders** - Never modify files that don't exist in the current project structure
2. **Create new folders and files only when necessary** - Follow established patterns in the project
3. **Professional approach** - Clean, maintainable, well-documented code
4. **One task at a time** - Complete one task before moving to the next
5. **Wait for approval** - Stop after each task until instructed to continue
6. **Use pnpm as the package manager** for all dependency installations
7. **Integration of actual 3D models (GLB files)** - Replace primitive-based landmarks with real 3D assets
8. **Code documentation in Japanese** - Add Japanese comments for team understanding
   - 例: // シーン管理のための Zustand ストア - Zustand store for scene management
9. **Deep Research Before Implementation** - For each and every task, conduct thorough research to be 100% certain about implementation from the internet and the whole project before proceeding

## Project Structure Reference

```
tokyo-sounds/
├── public/
│   ├── 3dtest.glb        # 3D model for initial testing
│   ├── file.svg
│   ├── globe.svg
│   ├── models/           # 3D model files (GLB/GLTF)
│   │   ├── skytree.glb
│   │   ├── tokyo-tower.glb
│   │   ├── shibuya-crossing.glb
│   │   └── tokyo-station.glb
│   ├── ui/               # UI assets (thumbnails, etc.)
│   │   ├── thumbs/
│   │   │   ├── skytree.png
│   │   │   ├── tower.png
│   │   │   └── crossing.png
│   ├── audio/            # Audio files for the experience
│   │   ├── city_day_loop.mp3
│   │   ├── skytree_announcer.mp3
│   │   └── shibuya_bustle.mp3
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
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
│   ├── lib/
│   │   └── utils.ts
│   ├── stores/           # Zustand stores for state management
│   │   └── use-scene-store.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── scene.ts
│   │   └── building.ts
│   └── assets/           # Additional assets (data schemas, etc.)
│       ├── scenes.json
│       ├── buildings.json
│       └── sounds.json
```

## Development Plan (Checklist)

- [x] **Task 1**: Set up R3F dependencies with GLB model loading - COMPLETED
- [x] **Task 2**: Replace placeholder canvas component with actual 3D models (GLB files) - COMPLETED
- [x] **Task 3**: Implement CameraControls for advanced camera manipulation
- [ ] **Task 7**: Develop click/drag-to-go feature for camera movement
- [ ] **Task 8**: Create interactive hotspots for guided tours
- [ ] **Task 9**: Implement camera presets for each landmark
- [ ] **Task 10**: Add smooth transitions between camera positions
- [ ] **Task 11**: Develop adaptive controls based on distance
- [ ] **Task 14**: Implement collision detection for camera
- [ ] **Task 15**: Develop focus system for object interaction
- [ ] **Task 16**: Create cinematic camera paths
- [ ] **Task 17**: Set up multi-camera system with different perspectives
- [ ] **Task 18**: Add depth of field effects
- [ ] **Task 19**: Implement time-of-day camera settings
- [ ] **Task 21**: Optimize for mobile devices
- [ ] **Task 23**: Implement performance optimizations (LOD, frustum culling)
- [ ] **Task 24**: Create state management for scenes and audio using Zustand
- [ ] **Task 25**: Implement scene data structure and loading
- [ ] **Task 26**: Add audio integration with Howler.js
- [ ] **Task 27**: Implement interaction system (click detection, selection)
- [ ] **Task 28**: Create UI components for scene selection
- [ ] **Task 29**: Implement modals (ScenePreviewModal, BuildingInfoModal)
- [ ] **Task 30**: Polish and testing

## Current Status

- Ready to begin Task 3: CameraShake effect for immersive experience
- Awaiting instruction to proceed with implementation

- Step 1:
  ( npx gltfjsx /public/3dtest.glb --output src/components/Model.tsx --typescript ) to transfer from 3D to JSX

  Deep Research: Advanced Camera Controls Improvements

  1. Enhanced Camera Movement Features

  Smooth Transitions & Animation

  - Easing Functions: Implement cubic, exponential, or elastic
    easing for natural camera movements
  - Spline Interpolation: Use Catmull-Rom or Bézier curves for
    smooth path following
  - Dynamic Speed Control: Adjust movement speed based on
    distance and scene complexity

  Intelligent Camera Behaviors

  - Auto-Framing: Automatically adjust camera to keep subjects in
    frame
  - Obstacle Avoidance: Navigate around buildings and terrain
    during movement
  - Context-Aware Transitions: Adapt camera movements based on
    current scene

  2. Advanced User Interaction

  Gesture Controls

  - Multi-Touch Navigation: Pinch, rotate, and swipe gestures for
    mobile devices
  - Pointer Lock Support: First-person navigation for immersive
    exploration

  Keyboard Controls

- Gamepad Support: Controller navigation for console-style
  interaction

  Adaptive Behavior

  - Proximity-Based Adjustments: Modify camera behavior based on
    distance to objects
  - Time-of-Day Settings: Adjust camera for different lighting
    conditions
  - User Preference Learning: Remember and adapt to individual
    user preferences

  4. Performance Optimization

  Efficient Rendering

  - Level of Detail (LOD): Adjust model detail based on camera
    distance
  - Frustum Culling: Only render objects within camera view
  - Occlusion Culling: Hide objects obscured by other elements

  Resource Management

  - Memory Optimization: Efficiently manage GPU memory during
    transitions
  - Adaptive Quality: Dynamically adjust rendering quality based
    on performance

  5. Immersive Experience Features

  Environmental Effects

  - Depth of Field: Simulate camera focus for cinematic effects
  - Motion Blur: Add realism during camera movements
  - Dynamic Lighting: Adjust lighting based on camera position
    and time

  Audio Integration

  - Spatial Audio: 3D sound that changes with camera orientation
  - Ambient Soundscapes: Environmental audio that shifts with
    location
  - Narrative Audio: Voiceovers that sync with camera movements

  7. Social & Sharing Features

  Collaborative Exploration

  - Multi-User Sessions: Shared camera control with friends
  - Guided Tours: Expert-led virtual walkthroughs
  - User-Created Paths: Share custom camera routes with community

  Content Creation

  - Screenshot Mode: Professional capture tools with overlays
  - Video Recording: Capture exploration sessions
  - Export Options: Save camera paths for later use

  Tokyo Sounds experience by providing more sophisticated camera
  controls, intelligent behaviors, and immersive features that
  respond to user interaction and environmental context.
