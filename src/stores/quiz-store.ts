// src/stores/quiz-store.ts
// クイズゲームのZustandストア - Zustand store for the quiz game

import { create } from 'zustand';
import { QuizGameState, QuizGameActions, QuizQuestion } from '../types/quiz';
import { getQuestionsForLocation } from '../data/quiz-data';
import { useSceneStore } from './use-scene-store';

// 初期状態の定義 - Define initial state
const initialQuizState: Omit<QuizGameState, keyof QuizGameActions> = {
  currentStage: 1,                    // 現在のステージ - Current stage (default to stage 1)
  currentQuestionIndex: 0,            // 現在の質問インデックス - Current question index
  currentQuestions: [],               // 現在の質問リスト - Current questions list
  score: 0,                           // 現在のスコア - Current score
  totalScore: 0,                      // 総合スコア - Total score
  gameStarted: false,                 // ゲームが開始されたかどうか - Whether the game has started
  gameCompleted: false,               // ゲームが完了したかどうか - Whether the game is completed
  selectedAnswer: null,               // 選択された回答 - Selected answer
  feedback: null,                     // フィードバックメッセージ - Feedback message
  showFeedback: false,                // フィードバックを表示するかどうか - Whether to show feedback
  answeredQuestions: [],              // 回答済みの質問IDの配列 - Array of answered question IDs
  completedLocations: [],             // 完了したロケーションの配列 - Array of completed locations
  currentLocationIndex: 0,            // 現在のロケーションインデックス - Current location index in the sequence
  readyForNextLocation: false,        // 次のロケーションに進む準備ができているか - Whether ready to proceed to the next location
};

// クイズストアの定義 - Define the quiz store
export const useQuizStore = create<QuizGameState & QuizGameActions>((set, get) => ({
  // 初期状態 - Initial state
  ...initialQuizState,

  // ゲーム開始 - Start the game with questions appropriate to the clicked location
  // Questions are specific to the location
  startGame: (locationName?: string) => {
    // If a location name is provided, get location-specific questions
    // Otherwise, default to Tokyo questions
    const location = locationName || 'tokyo';
    
    // Define the sequence of locations for Stage 1
    const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
    
    // Get the index of the starting location in the sequence
    const startingLocationIndex = locationSequence.indexOf(location);
    
    // Get questions appropriate for the specified location
    const questionsToUse = getQuestionsForLocation(location);
    
    set({ 
      gameStarted: true,
      gameCompleted: false,
      currentStage: 1, // In this system, it's always stage 1 but different locations
      currentQuestions: questionsToUse,
      score: 0,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      answeredQuestions: [],
      completedLocations: [],
      currentLocationIndex: startingLocationIndex >= 0 ? startingLocationIndex : 0,
    });
  },

  // 質問セットを切り替える - Switch question set based on the clicked location
  switchQuestionSet: (locationName: string) => {
    // Get location-specific questions based on the provided location name
    const questionsToUse = getQuestionsForLocation(locationName);
    
    // Define the sequence of locations for Stage 1
    const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
    
    // Update the questions and reset to the first question, but keep other state
    set({ 
      currentQuestions: questionsToUse,
      currentQuestionIndex: 0,
      currentLocationIndex: locationSequence.indexOf(locationName),
      selectedAnswer: null,
      feedback: null,
      showFeedback: false
    });
  },

  // 質問に回答 - Answer a question
  answerQuestion: (optionId: string) => {
    const { currentQuestions, currentQuestionIndex, currentLocationIndex, completedLocations } = get();
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    if (!currentQuestion) return;
    
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);

    if (!selectedOption) return;

    // 選択肢を保存 - Save selected option
    set({ selectedAnswer: optionId });

    // 正誤判定 - Check if correct
    const isCorrect = selectedOption.isCorrect;

    // フィードバックを設定 - Set feedback
    const feedback = isCorrect ? '正解！' : '不正解！';
    
    if (isCorrect) {
      // 正解の場合、スコアを更新 - Update score if correct
      // Calculate points based on current stage (difficulty increases with stage number)
      const pointsForStage = get().currentStage * 10; // Stage 1 = 10 points, Stage 2 = 20 points, etc.
      const newScore = get().score + pointsForStage;
      set({ 
        score: newScore,
        totalScore: get().totalScore + pointsForStage,
        feedback,
        showFeedback: true
      });
    } else {
      // 不正解の場合 - If incorrect (no points awarded)
      set({ 
        feedback,
        showFeedback: true
      });
    }

    // 回答した質問を追加 - Add answered question to the list
    const questionId = currentQuestion.id;
    const answeredQuestions = [...get().answeredQuestions];
    if (!answeredQuestions.includes(questionId)) {
      answeredQuestions.push(questionId);
    }

    // 質問がすべて終わったら次のロケーションへ、そうでなければ次の質問 - 
    // Move to next location if all questions at current location are answered, otherwise go to next question
    setTimeout(() => {
      set({ 
        answeredQuestions,
        showFeedback: false
      });

      if (get().currentQuestionIndex < currentQuestions.length - 1) {
        // 次の質問へ進む - Go to next question
        const nextIndex = get().currentQuestionIndex + 1;
        set({ currentQuestionIndex: nextIndex });
        
        // Do not move camera when progressing to the next question within the same location
        // Camera movement only happens when transitioning between locations
      } else {
        // 現在のロケーションの質問がすべて完了 - All questions at current location completed
        // Define the sequence of locations for Stage 1
        const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
        
        // Mark current location as completed
        const currentLocation = locationSequence[currentLocationIndex];
        const newCompletedLocations = [...completedLocations];
        if (!newCompletedLocations.includes(currentLocation)) {
          newCompletedLocations.push(currentLocation);
        }

        // Check if there are more locations to visit
        if (currentLocationIndex < locationSequence.length - 1) {
          // Set the flag to indicate user is ready to proceed to next location
          set({
            completedLocations: newCompletedLocations,
            readyForNextLocation: true
          });
        } else {
          // All locations completed - Stage 1 complete
          set({ 
            gameCompleted: true,
            completedLocations: newCompletedLocations
          });
        }
      }
    }, 1500); // 1.5秒後に次へ進む - Move to next after 1.5 seconds
  },

  // 次の質問へ進む - Move to next question
  nextQuestion: () => {
    const { currentQuestions, currentQuestionIndex } = get();
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      set({ currentQuestionIndex: nextIndex });
      
      // Do not move camera when manually progressing to the next question within the same location
      // Camera movement only happens when transitioning between locations
    }
  },



  // ゲームをリセット - Reset the game
  resetGame: () => {
    set({ 
      currentQuestionIndex: 0,
      currentQuestions: [],
      score: 0,
      totalScore: 0,
      gameStarted: false,
      gameCompleted: false,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      answeredQuestions: [],
      completedLocations: [],
      currentLocationIndex: 0,
      readyForNextLocation: false,
    });
  },

  // 現在のステージを設定 - Set current stage
  setCurrentStage: (stage: number) => set({ currentStage: stage }),
  
  // フィードバック表示の設定 - Set feedback visibility
  setShowFeedback: (show: boolean) => set({ showFeedback: show }),

  // 現在の質問インデックスを設定 - Set current question index
  setCurrentQuestionIndex: (index: number) => set({ currentQuestionIndex: index }),

  // スコアを更新 - Update score
  updateScore: (points: number) => set(state => ({ score: state.score + points, totalScore: state.totalScore + points })),

  // Proceed to the next location after completing questions at current location
  proceedToNextLocation: () => {
    const { currentLocationIndex, completedLocations } = get();
    
    // Define the sequence of locations for Stage 1
    const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
    
    // Check if there are more locations to visit
    if (currentLocationIndex < locationSequence.length - 1) {
      // Move to next location in sequence
      const nextLocationIndex = currentLocationIndex + 1;
      const nextLocation = locationSequence[nextLocationIndex];
      
      // Get questions for the next location
      const nextLocationQuestions = getQuestionsForLocation(nextLocation);
      
      set({
        currentLocationIndex: nextLocationIndex,
        currentQuestions: nextLocationQuestions,
        currentQuestionIndex: 0,
        readyForNextLocation: false,  // Reset the flag
        selectedAnswer: null
      });
      
      // Move camera to the next location
      get().moveCameraToLocation(nextLocation);
    } else {
      // All locations completed - Stage 1 complete
      set({ 
        gameCompleted: true,
        readyForNextLocation: false
      });
    }
  },

  // カメラを指定の場所に移動 - Move camera to a specific location
  moveCameraToLocation: (location: string) => {
    // Mapping from our internal location names to actual scene IDs in the scene store
    const locationToSceneId: Record<string, string> = {
      'tokyo': 'tokyo-overview',      // Tokyo location maps to 'tokyo-overview' scene
      'shibuya': 'shibuya-crossing',  // Shibuya location maps to 'shibuya-crossing' scene
      'shinjuku': 'shinjuku',         // Shinjuku location maps to 'shinjuku' scene
      'asakusa': 'asakusa'            // Asakusa location maps to 'asakusa' scene
    };
    
    // Convert our internal location name to the actual scene ID if needed
    const sceneId = locationToSceneId[location] || location;
    
    // 現在のシーンストアから対応するランドマークを見つける - Find the corresponding landmark from the current scene store
    const sceneStore = useSceneStore.getState();
    const targetScene = sceneStore.allScenes.find(scene => scene.id === sceneId);
    
    if (targetScene && targetScene.cameraPositions.length > 0) {
      // 最初のカメラ位置に移動 - Move to the first camera position
      sceneStore.moveCameraToLandmark(targetScene.cameraPositions[0]);
    }
  }
}));