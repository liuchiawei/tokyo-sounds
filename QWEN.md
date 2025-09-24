# Tokyo Sounds - R3F Development Rules & Plan

## Core Rules

1. **Work only with existing files and folders** - Never modify files that don't exist in the current project structure
2. **Create new folders and files only when necessary** - Follow established patterns in the project
3. **Professional approach** - Clean, maintainable, well-documented code
4. **One task at a time** - Complete one task before moving to the next
5. **Wait for approval** - Stop after each task until instructed to continue

## Project Structure Reference

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

## Development Plan (Checklist)

- [x] **Task 1**: Set up R3F dependencies - ✅ COMPLETED
- [x] **Task 2**: Replace placeholder canvas component with basic R3F implementation - ✅ COMPLETED
- [ ] **Task 3**: Create state management for scenes and audio using Zustand
- [ ] **Task 4**: Implement scene data structure and loading
- [ ] **Task 5**: Add audio integration with Howler.js
- [ ] **Task 6**: Implement interaction system (click detection, selection)
- [ ] **Task 7**: Create UI components for scene selection
- [ ] **Task 8**: Implement modals (ScenePreviewModal, BuildingInfoModal)
- [ ] **Task 9**: Add performance optimizations
- [ ] **Task 10**: Polish and testing

## Current Status

- Ready to begin Task 3: State management
- Awaiting instruction to proceed with next task
