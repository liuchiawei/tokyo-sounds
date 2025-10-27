// src/stores/quiz-store.ts
// クイズゲームのZustandストア - Zustand store for the quiz game

import { create } from 'zustand';
import { QuizGameState, QuizGameActions, QuizQuestion, QuizLocation } from '../types/quiz';
import { quizQuestions } from '../data/quiz-data';
import { useSceneStore } from './use-scene-store';

// Global timeout ID to manage answer timeouts and prevent race conditions
declare global {
  interface Window {
    answerTimeoutId: NodeJS.Timeout | number | null;
  }
}

if (typeof window !== 'undefined') {
  window.answerTimeoutId = null;
}

// すべてのステージの場所の順序を定義 - Define the sequence of locations for all stages
export const locationSequence: QuizLocation[] = [QuizLocation.TOKYO, QuizLocation.SHIBUYA, QuizLocation.SHINJUKU, QuizLocation.ASAKUSA];

// 初期状態の定義 - Define initial state
const initialQuizState: Omit<QuizGameState, keyof QuizGameActions> = {
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
  showQuestionDetails: false,         // 質問詳細を表示するかどうか - Whether to show question details
};

// クイズストアの定義 - Define the quiz store
export const useQuizStore = create<QuizGameState & QuizGameActions>((set, get) => ({
  // 初期状態 - Initial state
  ...initialQuizState,

  // ゲーム開始 - Start the game with questions appropriate to the clicked location and current stage
  // Questions are specific to the location and stage difficulty
  startGame: (locationName?: QuizLocation) => {
    const startingLocation = locationName || locationSequence[0];
    const startingLocationIndex = locationSequence.indexOf(startingLocation);

    const questionsForLocation = quizQuestions.filter(q => q.location === startingLocation);

    set({
      gameStarted: true,
      gameCompleted: false,
      currentQuestions: questionsForLocation,
      score: 0,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      answeredQuestions: [],
      completedLocations: [],
      currentLocationIndex: startingLocationIndex >= 0 ? startingLocationIndex : 0,
      readyForNextLocation: false,
      showQuestionDetails: false,
    });
  },

  // 質問セットを切り替える - Switch question set based on the clicked location and current stage
  switchQuestionSet: (locationName: QuizLocation) => {
    // Clear any pending timeouts to prevent race conditions
    get().clearPendingTimeout();
    
    const questionsForLocation = quizQuestions.filter(q => q.location === locationName);
    const newLocationIndex = locationSequence.indexOf(locationName);

    set({
      currentQuestions: questionsForLocation,
      currentQuestionIndex: 0,
      currentLocationIndex: newLocationIndex,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      showQuestionDetails: false  // Ensure question details are hidden when switching
    });
  },

  // 質問に回答 - Answer a question
  answerQuestion: (optionId: string) => {
    const { currentQuestions, currentQuestionIndex } = get();
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
      const pointsPerQuestion = 10; // Fixed points per correct answer
      const newScore = Math.min(100, get().score + pointsPerQuestion); // Cap score at 100
      const newTotalScore = Math.min(100, get().totalScore + pointsPerQuestion); // Cap total score at 100
      set({ 
        score: newScore,
        totalScore: newTotalScore,
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

    // Clear any existing timeout to prevent race conditions
    if (window.answerTimeoutId) {
      clearTimeout(window.answerTimeoutId);
    }

    // Show question details after the feedback delay (preserving the original 1.5s feedback)
    const timeoutId = setTimeout(() => {
      set({ 
        answeredQuestions,
        showFeedback: false,  // Hide the brief feedback
        showQuestionDetails: true  // Show question details instead of continuing automatically
      });
    }, 1500); // 1.5秒後に質問詳細を表示 - Show question details after 1.5 seconds (original delay)
    
    // Store timeout ID globally to allow clearing when changing locations
    window.answerTimeoutId = timeoutId;
  },

  // 次の質問へ進む - Move to next question
  nextQuestion: () => {
    const { currentQuestions, currentQuestionIndex } = get();
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      set({ currentQuestionIndex: nextIndex });
      
      // 同じ場所内の次の質問に手動で進むときはカメラを移動しない - Do not move camera when manually progressing to the next question within the same location
      // 場所間の移行時にのみカメラ移動が発生します - Camera movement only happens when transitioning between locations
    }
  },



  // ゲームをリセット - Reset the game
  resetGame: () => {
    // Clear any pending timeouts to prevent race conditions
    get().clearPendingTimeout();
    
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
      showQuestionDetails: false,
    });
  },

  // フィードバック表示の設定 - Set feedback visibility
  setShowFeedback: (show: boolean) => set({ showFeedback: show }),

  // 質問詳細表示の設定 - Set question details visibility
  setShowQuestionDetails: (show: boolean) => set({ showQuestionDetails: show }),

  // 現在の質問インデックスを設定 - Set current question index
  setCurrentQuestionIndex: (index: number) => set({ currentQuestionIndex: index }),

  // スコアを更新 - Update score
  updateScore: (points: number) => set(state => ({ score: state.score + points, totalScore: state.totalScore + points })),

  // 現在の場所で質問を完了した後、次の場所に進む（固定シーケンスに従う） - Proceed to the next location in fixed sequence after completing questions at current location
    proceedToNextLocation: () => {
      // Clear any pending timeouts to prevent race conditions
      get().clearPendingTimeout();
      
      const { currentLocationIndex, completedLocations } = get();
  
      // Find the next location in the fixed sequence that hasn't been completed yet
      let nextLocation: QuizLocation | null = null;
      
      // Find the current location's index in the sequence
      const currentLocation = locationSequence[currentLocationIndex];
      
      // Look for next uncompleted location in the sequence (circular loop)
      for (let i = 1; i < locationSequence.length; i++) {
        const nextIndex = (currentLocationIndex + i) % locationSequence.length;
        const candidateLocation = locationSequence[nextIndex];
        if (!completedLocations.includes(candidateLocation)) {
          nextLocation = candidateLocation;
          break;
        }
      }
  
      if (nextLocation) {
        // If there's an uncompleted location, go to it
        const nextLocationQuestions = quizQuestions.filter(q => q.location === nextLocation);
        const nextLocationIndex = locationSequence.indexOf(nextLocation);
  
        set({
          currentLocationIndex: nextLocationIndex,
          currentQuestions: nextLocationQuestions,
          currentQuestionIndex: 0,
          readyForNextLocation: false,
          selectedAnswer: null,
          feedback: null,
          showFeedback: false,
          showQuestionDetails: false
        });
  
        get().moveCameraToLocation(nextLocation);
      } else {
        // If no uncompleted locations are left, the game is completed
        set({
          gameCompleted: true,
          readyForNextLocation: false
        });
      }
    },
  // 次の質問に進む（質問詳細表示後に呼び出される） - Move to the next question (called after viewing question details)
  goToNextQuestion: () => {
    // Clear any pending timeouts to prevent race conditions
    get().clearPendingTimeout();
    
    const { currentQuestions, currentQuestionIndex, currentLocationIndex, completedLocations } = get();
    
    // 閉じる質問詳細をリセット - Reset the question details view
    set({ showQuestionDetails: false });
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      // 次の質問へ進む - Go to next question
      const nextIndex = currentQuestionIndex + 1;
      set({ 
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        feedback: null,
        showFeedback: false
      });
      
      // 同じ場所内の次の質問に進むときはカメラを移動しない - Do not move camera when progressing to the next question within the same location
      // 場所間の移行時にのみカメラ移動が発生します - Camera movement only happens when transitioning between locations
    } else {
      // 現在のロケーションの質問がすべて完了 - All questions at current location completed
      const currentLocName = locationSequence[currentLocationIndex];
      
      // Only add to completedLocations if it's not already completed
      if (!completedLocations.includes(currentLocName)) {
        const newCompletedLocations = [...completedLocations, currentLocName];
        
        // Check if all locations have been completed
        const allLocationsCompleted = locationSequence.every(location => 
          newCompletedLocations.includes(location)
        );
        
        if (allLocationsCompleted) {
          // If all locations are completed, mark the game as complete
          set({
            completedLocations: newCompletedLocations,
            gameCompleted: true,
            readyForNextLocation: false
          });
        } else {
          // If not all locations are completed, update completed locations and show ready for next location
          set({
            completedLocations: newCompletedLocations,
            readyForNextLocation: true
          });
        }
      } else {
        // If this location was already completed (shouldn't happen in normal flow), just check if all are done
        const allLocationsCompleted = locationSequence.every(location => 
          completedLocations.includes(location)
        );
        
        if (allLocationsCompleted) {
          set({
            gameCompleted: true,
            readyForNextLocation: false
          });
        } else {
          set({
            readyForNextLocation: true
          });
        }
      }
    }
  },

  // Clear any pending timeouts to prevent race conditions when changing locations
  clearPendingTimeout: () => {
    if (window.answerTimeoutId) {
      clearTimeout(window.answerTimeoutId);
      window.answerTimeoutId = null;
    }
  },

  // カメラを指定の場所に移動 - Move camera to a specific location
  moveCameraToLocation: (location: QuizLocation) => {
    // シーンストア内の実際のシーンIDへの内部場所名のマッピング - Mapping from our internal location names to actual scene IDs in the scene store
    const locationToSceneId: Record<QuizLocation, string> = {
      [QuizLocation.TOKYO]: 'tokyo-overview',      // Tokyo location maps to 'tokyo-overview' scene
      [QuizLocation.SHIBUYA]: 'shibuya-crossing',  // Shibuya location maps to 'shibuya-crossing' scene
      [QuizLocation.SHINJUKU]: 'shinjuku',         // Shinjuku location maps to 'shinjuku' scene
      [QuizLocation.ASAKUSA]: 'asakusa'            // Asakusa location maps to 'asakusa' scene
    };
    
    // 必要に応じて、内部場所名を実際のシーンIDに変換 - Convert our internal location name to the actual scene ID if needed
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