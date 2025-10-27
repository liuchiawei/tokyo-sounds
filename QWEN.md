<!-- # Tokyo Sounds - Advanced Spatial Audio Implementation

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
4. **MediaStream Bridge**: Connects Tone.js context with Three.js context for spatial audio -->

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

## Quiz Game Implementation Tasks

- [x] **Task 2**: Create basic quiz game data structure and sample questions
  - [x] **Subtask 2.1**: Create quiz data types and interfaces with proper TypeScript definitions
  - [x] **Subtask 2.2**: Create 5 stages with 3-4 questions each about Tokyo locations
  - [x] **Subtask 2.3**: Ensure questions increase in difficulty from Stage 1 to Stage 5
  - [x] **Subtask 2.4**: Associate each question with a specific Tokyo location/landmark
  - [x] **Subtask 2.5**: Add proper Japanese and English comments
  - [x] **Subtask 2.6**: Run TypeScript type checking to ensure no errors
  - [x] **Subtask 2.7**: Verify 100% implementation according to requirements
- [x] **Task 3**: Set up basic React components for the quiz game UI
  - [x] **Subtask 3.1**: Create main QuizGame component
  - [x] **Subtask 3.2**: Create QuestionDisplay component
  - [x] **Subtask 3.3**: Create AnswerOption component
  - [x] **Subtask 3.4**: Create StartScreen component
  - [x] **Subtask 3.5**: Add proper Japanese and English comments
  - [x] **Subtask 3.6**: Run TypeScript type checking to ensure no errors
  - [x] **Subtask 3.7**: Verify 100% implementation according to requirements
- [x] **Task 4**: Implement core game state management
  - [x] **Subtask 4.1**: Create quiz game store using Zustand
  - [x] **Subtask 4.2**: Implement state properties (currentStage, currentQuestion, score, etc.)
  - [x] **Subtask 4.3**: Add action functions (startGame, answerQuestion, nextQuestion, etc.)
  - [x] **Subtask 4.4**: Add proper Japanese and English comments
  - [x] **Subtask 4.5**: Run TypeScript type checking to ensure no errors
  - [x] **Subtask 4.6**: Verify 100% implementation according to requirements
- [x] **Task 5**: Create sidebar component showing stages
  - [x] **Subtask 5.1**: Create StageSidebar component
  - [x] **Subtask 5.2**: Implement stage indicators with visual feedback
  - [x] **Subtask 5.3**: Add styling for active/completed stages
  - [x] **Subtask 5.4**: Add proper Japanese and English comments
  - [x] **Subtask 5.5**: Run TypeScript type checking to ensure no errors
  - [x] **Subtask 5.6**: Verify 100% implementation according to requirements
- [ ] **Task 6**: Implement question display and multiple choice selection
  - [ ] **Subtask 6.1**: Create question display with proper styling
  - [ ] **Subtask 6.2**: Implement multiple choice selection with click handlers
  - [ ] **Subtask 6.3**: Add keyboard support for answer selection
  - [ ] **Subtask 6.4**: Add proper Japanese and English comments
  - [ ] **Subtask 6.5**: Run TypeScript type checking to ensure no errors
  - [ ] **Subtask 6.6**: Verify 100% implementation according to requirements
- [ ] **Task 7**: Implement visual feedback system (GREEN/RED)
  - [ ] **Subtask 7.1**: Create visual feedback for correct answers (GREEN)
  - [ ] **Subtask 7.2**: Create visual feedback for incorrect answers (RED)
  - [ ] **Subtask 7.3**: Implement immediate feedback after selection
  - [ ] **Subtask 7.4**: Add proper Japanese and English comments
  - [ ] **Subtask 7.5**: Run TypeScript type checking to ensure no errors
  - [ ] **Subtask 7.6**: Verify 100% implementation according to requirements
- [ ] **Task 8**: Implement scoring system with difficulty-based points
  - [ ] **Subtask 8.1**: Create scoring logic with higher points for later stages
  - [ ] **Subtask 8.2**: Implement real-time score updates
  - [ ] **Subtask 8.3**: Create score display component
  - [ ] **Subtask 8.4**: Add proper Japanese and English comments
  - [ ] **Subtask 8.5**: Run TypeScript type checking to ensure no errors
  - [ ] **Subtask 8.6**: Verify 100% implementation according to requirements
- [ ] **Task 9**: Add keyword-based answer functionality (1-4)
  - [ ] **Subtask 9.1**: Implement keyboard event handling for answer selection
  - [ ] **Subtask 9.2**: Map keys 1-4 to answer options
  - [ ] **Subtask 9.3**: Add user interface indication for keyboard controls
  - [ ] **Subtask 9.4**: Add proper Japanese and English comments
  - [ ] **Subtask 9.5**: Run TypeScript type checking to ensure no errors
  - [ ] **Subtask 9.6**: Verify 100% implementation according to requirements
- [ ] **Task 10**: Implement stage progression logic -[ ] **Subtask 10.1**: Create logic for advancing to next stage - [ ] **Subtask 10.2**: Implement camera movement to specific locations after questions - [ ] **Subtask 10.3**: Update stage indicators in sidebar - [ ] **Subtask 10.4**: Add proper Japanese and English comments - [ ] **Subtask 10.5**: Run TypeScript type checking to ensure no errors - [ ] **Subtask 10.6**: Verify 100% implementation according to requirements

## Quiz Game Implementation Requirements

### Game Structure

- The game begins when a Start button is clicked OR when a player clicks on a random place in the scene
- 5 stages (Stage 1 to Stage 5) displayed in a sidebar on the left
- Each stage contains 3-4 questions about different Tokyo locations
- After answering each question, the camera moves to that specific location
- Player progresses through stages of increasing difficulty

### Question System

- Each question has 4 multiple choice options
- Questions become progressively harder from Stage 1 to Stage 5
- If the same location appears in different stages, questions will be different with varying difficulty levels
- Player can select an answer by clicking the multiple choice options
- Player can also answer using keywords (e.g., "1", "2", "3", "4" for the respective options)

### Visual Feedback System

- When a player clicks an answer option or enters a keyword:
  - Correct answer: Show GREEN visual feedback
  - Incorrect answer: Show RED visual feedback
- Feedback appears immediately after selection or keyword entry

### Stage Progression

- After answering required questions in a stage, progress to the next stage
- When progressing to the next stage, the camera moves to the new location
- The stage indicator updates to reflect the current stage
- Each question is tied to a specific Tokyo location

### UI Components

- Sidebar on the left showing the current stage
- The main quiz interface (questions, answers, score) will appear in the side panel, sharing space with the audio player controls, which will remain visible.
- Visual feedback system for answers (GREEN/RED indicators)
- Progress bar showing overall game progress
- Score display showing current points
- Camera movement that transitions when moving to the next question's location

### Scoring System

- Points awarded for each correct answer
- Higher points for questions in later stages (increasing difficulty)
- Real-time score updates
- Score displayed prominently in the UI

### Additional Features

- Support for keyword-based answers (1, 2, 3, 4 for different options)
- Japanese documentation and comments for all new functionality
- Integration with existing Three.js scene and camera system
- Use of actual 3D models (GLB files) for landmarks at each location

## Quiz Game Implementation Plan

### Task 2: Create basic quiz game data structure and sample questions

- **Subtask 2.1**: Create quiz data types and interfaces with proper TypeScript definitions (COMPLETED)
  - Created `/src/types/quiz.ts` with interfaces for QuizOption, QuizQuestion, QuizStage, QuizGameState, and QuizGameActions
  - Added both English and Japanese comments as per project standards
- **Subtask 2.2**: Create 5 stages with 3-4 questions each about Tokyo locations (IN PROGRESS)
- **Subtask 2.3**: Ensure questions increase in difficulty from Stage 1 to Stage 5 (PENDING)
- **Subtask 2.4**: Associate each question with a specific Tokyo location/landmark (PENDING)
- **Subtask 2.5**: Add proper Japanese and English comments (PENDING)
- **Subtask 2.6**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 2.7**: Verify 100% implementation according to requirements (PENDING)

### Task 3: Set up basic React components for the quiz game UI

- **Subtask 3.1**: Create main QuizGame component (PENDING)
- **Subtask 3.2**: Create QuestionDisplay component (PENDING)
- **Subtask 3.3**: Create AnswerOption component (PENDING)
- **Subtask 3.4**: Create StartScreen component (PENDING)
- **Subtask 3.5**: Add proper Japanese and English comments (PENDING)
- **Subtask 3.6**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 3.7**: Verify 100% implementation according to requirements (PENDING)

### Task 4: Implement core game state management

- **Subtask 4.1**: Create quiz game store using Zustand (PENDING)
- **Subtask 4.2**: Implement state properties (currentStage, currentQuestion, score, etc.) (PENDING)
- **Subtask 4.3**: Add action functions (startGame, answerQuestion, nextQuestion, etc.) (PENDING)
- **Subtask 4.4**: Add proper Japanese and English comments (PENDING)
- **Subtask 4.5**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 4.6**: Verify 100% implementation according to requirements (PENDING)

### Task 5: Create sidebar component showing stages

- **Subtask 5.1**: Create StageSidebar component (PENDING)
- **Subtask 5.2**: Implement stage indicators with visual feedback (PENDING)
- **Subtask 5.3**: Add styling for active/completed stages (PENDING)
- **Subtask 5.4**: Add proper Japanese and English comments (PENDING)
- **Subtask 5.5**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 5.6**: Verify 100% implementation according to requirements (PENDING)

### Task 6: Implement question display and multiple choice selection

- **Subtask 6.1**: Create question display with proper styling (PENDING)
- **Subtask 6.2**: Implement multiple choice selection with click handlers (PENDING)
- **Subtask 6.3**: Add keyboard support for answer selection (PENDING)
- **Subtask 6.4**: Add proper Japanese and English comments (PENDING)
- **Subtask 6.5**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 6.6**: Verify 100% implementation according to requirements (PENDING)

### Task 7: Implement visual feedback system (GREEN/RED)

- **Subtask 7.1**: Create visual feedback for correct answers (GREEN) (PENDING)
- **Subtask 7.2**: Create visual feedback for incorrect answers (RED) (PENDING)
- **Subtask 7.3**: Implement immediate feedback after selection (PENDING)
- **Subtask 7.4**: Add proper Japanese and English comments (PENDING)
- **Subtask 7.5**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 7.6**: Verify 100% implementation according to requirements (PENDING)

### Task 8: Implement scoring system with difficulty-based points

- **Subtask 8.1**: Create scoring logic with higher points for later stages (PENDING)
- **Subtask 8.2**: Implement real-time score updates (PENDING)
- **Subtask 8.3**: Create score display component (PENDING)
- **Subtask 8.4**: Add proper Japanese and English comments (PENDING)
- **Subtask 8.5**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 8.6**: Verify 100% implementation according to requirements (PENDING)

### Task 9: Add keyword-based answer functionality (1-4)

- **Subtask 9.1**: Implement keyboard event handling for answer selection (PENDING)
- **Subtask 9.2**: Map keys 1-4 to answer options (PENDING)
- **Subtask 9.3**: Add user interface indication for keyboard controls (PENDING)
- **Subtask 9.4**: Add proper Japanese and English comments (PENDING)
- **Subtask 9.5**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 9.6**: Verify 100% implementation according to requirements (PENDING)

### Task 10: Implement stage progression logic

- **Subtask 10.1**: Create logic for advancing to next stage (PENDING)
- **Subtask 10.2**: Implement camera movement to specific locations after questions (PENDING)
- **Subtask 10.3**: Update stage indicators in sidebar (PENDING)
- **Subtask 10.4**: Add proper Japanese and English comments (PENDING)
- **Subtask 10.5**: Run TypeScript type checking to ensure no errors (PENDING)
- **Subtask 10.6**: Verify 100% implementation according to requirements (PENDING)

stages should be based on Locatuion ( SHIBUYA, TOKYO SHINJUKU, etc...) not on level

each stage should have 5 questions

popup model on next question should dissapear, and the next popup showup and its
