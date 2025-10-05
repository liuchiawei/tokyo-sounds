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
- [ ] **Task 3**: Create state management for scenes and audio using Zustand
- [ ] **Task 4**: Implement scene data structure and loading
- [ ] **Task 5**: Add audio integration with Howler.js
- [ ] **Task 6**: Implement interaction system (click detection, selection)
- [ ] **Task 7**: Create UI components for scene selection
- [ ] **Task 8**: Implement modals (ScenePreviewModal, BuildingInfoModal)
- [ ] **Task 9**: Add performance optimizations
- [ ] **Task 10**: Polish and testing

## Current Status

- Ready to begin Task 1: R3F setup with GLB model loading
- Awaiting actual 3D models and instruction to proceed with implementation

- Step 1:
  ( npx gltfjsx /public/3dtest.glb --output src/components/Model.tsx --typescript ) to transfer from 3D to JSX
