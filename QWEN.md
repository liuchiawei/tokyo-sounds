# Tokyo Sounds - Advanced Spatial Audio Implementation

## Project Overview

This project implements a sophisticated spatial audio system for the Tokyo Sounds application using React, Three.js, and Tone.js. The system provides immersive audio experiences with spatial positioning based on camera/object positions in the 3D environment.

## Core Objective

Implement a dual-path audio system:

1. **Live Path**: Tone.js → Web Audio API → MediaStream Bridge → Three.js PositionalAudio
2. **Committed Path**: Rendered Audio Buffer → PositionalAudio

## Key Components

1. **GraphSpec**: Defines the audio processing graph with nodes (Player, Filter, Reverb, Gain), connections, and parameters
2. **AudioSession**: Main interface managing the audio graph and spatial bindings
3. **useAudio hooks**: React hooks for controlling audio parameters and spatial binding modes
4. **MediaStream Bridge**: Connects Tone.js context with Three.js context for spatial audio

## Development Rules

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

## Development Plan (Checklist)

- [] **Task 1**: Analyze existing files and prepare for implementation - COMPLETED
- [ ] **Task 2**: Implement advanced audio context system with spatial capabilities
- [ ] **Task 3**: Update Model.tsx to use advanced audio hooks (useSpatial, useParam, etc.)
- [ ] **Task 4**: Create GraphSpec for each 3D object with appropriate audio processing nodes
- [ ] **Task 5**: Implement spatial binding for all interactive objects in the scene
- [ ] **Task 6**: Add live parameter controls for audio processing
- [ ] **Task 7**: Implement committed/preview functionality for audio
- [ ] **Task 8**: Add audio state management for different interaction modes
- [ ] **Task 9**: Implement error handling and fallbacks for audio system
- [ ] **Task 10**: Update UI to reflect spatial audio controls and states
- [ ] **Task 11**: Perform comprehensive type checking and testing
- [ ] **Task 12**: Add Japanese documentation and comments for new functionality
- [ ] **Task 13**: Final integration testing and performance optimization
- [ ] **Task 14**: Code review and final validation

## Current Status

- Ready to begin Task 2: Implement advanced audio context system with spatial capabilities
- Awaiting instruction to proceed with implementation
