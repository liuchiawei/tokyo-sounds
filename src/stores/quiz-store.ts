// src/stores/quiz-store.ts
// クイズゲームのZustandストア - Zustand store for the quiz game

import { create } from 'zustand';
import { QuizGameState, QuizGameActions, QuizQuestion } from '../types/quiz';
import { getQuestionsForStageAndLocation, getPointsForStage } from '../data/quiz-data';
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
  showQuestionDetails: false,         // 質問詳細を表示するかどうか - Whether to show question details
};

// クイズストアの定義 - Define the quiz store
export const useQuizStore = create<QuizGameState & QuizGameActions>((set, get) => ({
  // 初期状態 - Initial state
  ...initialQuizState,

  // ゲーム開始 - Start the game with questions appropriate to the clicked location and current stage
  // Questions are specific to the location and stage difficulty
  startGame: (locationName?: string) => {
    // 場所名が提供された場合、場所固有の質問を取得 - If a location name is provided, get location-specific questions
    // それ以外の場合は、東京の質問をデフォルトとする - Otherwise, default to Tokyo questions
    const location = locationName || 'tokyo';
    
    // すべてのステージの場所の順序を定義 - Define the sequence of locations for all stages
    const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
    
    // 順序内の開始場所のインデックスを取得 - Get the index of the starting location in the sequence
    const startingLocationIndex = locationSequence.indexOf(location);
    
    // 現在のステージを取得（デフォルトはステージ1） - Get current stage (default to stage 1)
    const currentStage = useQuizStore.getState().currentStage || 1;
    
    // 指定されたステージと場所に適した質問を取得 - Get questions appropriate for the specified stage and location
    const questionsToUse = getQuestionsForStageAndLocation(currentStage, location);
    
    set({ 
      gameStarted: true,
      gameCompleted: false,
      currentStage: currentStage, // Use the current stage level
      currentQuestions: questionsToUse,
      score: 0,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      answeredQuestions: [],
      completedLocations: [],
      currentLocationIndex: startingLocationIndex >= 0 ? startingLocationIndex : 0,
      readyForNextLocation: false,
    });
  },

  // 質問セットを切り替える - Switch question set based on the clicked location and current stage
  switchQuestionSet: (locationName: string) => {
    // 現在のステージを取得（デフォルトはステージ1） - Get current stage (default to stage 1)
    const currentStage = useQuizStore.getState().currentStage || 1;
    
    // 提供された場所名と現在のステージに基づいて場所固有の質問を取得 - Get location-specific questions based on the provided location name and current stage
    const questionsToUse = getQuestionsForStageAndLocation(currentStage, locationName);
    
    // すべてのステージの場所の順序を定義 - Define the sequence of locations for all stages
    const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
    
    // 質問を更新して最初の質問にリセットしますが、他の状態は保持します - Update the questions and reset to the first question, but keep other state
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
    const { currentQuestions, currentQuestionIndex, currentLocationIndex, completedLocations, currentStage } = get();
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
      const pointsForStage = getPointsForStage(currentStage); // Use the new function for stage-based scoring
      const newScore = Math.min(100, get().score + pointsForStage); // Cap score at 100
      const newTotalScore = Math.min(100, get().totalScore + pointsForStage); // Cap total score at 100
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

    // Show question details after the feedback delay (preserving the original 1.5s feedback)
    setTimeout(() => {
      set({ 
        answeredQuestions,
        showFeedback: false,  // Hide the brief feedback
        showQuestionDetails: true  // Show question details instead of continuing automatically
      });
    }, 1500); // 1.5秒後に質問詳細を表示 - Show question details after 1.5 seconds (original delay)
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

  // 質問詳細表示の設定 - Set question details visibility
  setShowQuestionDetails: (show: boolean) => set({ showQuestionDetails: show }),

  // 現在の質問インデックスを設定 - Set current question index
  setCurrentQuestionIndex: (index: number) => set({ currentQuestionIndex: index }),

  // スコアを更新 - Update score
  updateScore: (points: number) => set(state => ({ score: state.score + points, totalScore: state.totalScore + points })),

  // 現在の場所で質問を完了した後、次の場所に進む - Proceed to the next location after completing questions at current location
  proceedToNextLocation: () => {
    const { currentLocationIndex, completedLocations, currentStage } = get();
    
    // すべてのステージの場所の順序を定義 - Define the sequence of locations for all stages
    const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
    
    // 現在のステージで訪問する場所がまだあるか確認 - Check if there are more locations to visit in the current stage
    if (currentLocationIndex < locationSequence.length - 1) {
      // 同じステージ内で順序の次の場所に移動 - Move to next location in sequence within the same stage
      const nextLocationIndex = currentLocationIndex + 1;
      const nextLocation = locationSequence[nextLocationIndex];
      
      // 現在のステージの次の場所の質問を取得 - Get questions for the next location in the current stage
      const nextLocationQuestions = getQuestionsForStageAndLocation(currentStage, nextLocation);
      
      set({
        currentLocationIndex: nextLocationIndex,
        currentQuestions: nextLocationQuestions,
        currentQuestionIndex: 0,
        readyForNextLocation: false,  // フラグをリセット - Reset the flag
        selectedAnswer: null
      });
      
      // 次の場所にカメラを移動 - Move camera to the next location
      get().moveCameraToLocation(nextLocation);
    } else {
      // 現在のステージのすべての場所が完了 - All locations in current stage completed
      // 次のステージがあるか確認 - Check if there's a next stage
      if (currentStage < 5) {
        // 次のステージに移動（そしてそのステージの最初の場所に戻る） - Move to next stage (and back to first location in that stage)
        const nextStage = currentStage + 1;
        
        // 次のステージの最初の場所に切り替える - Switch to first location in the next stage
        const firstLocation = locationSequence[0];
        const firstLocationQuestions = getQuestionsForStageAndLocation(nextStage, firstLocation);
        
        set({
          currentStage: nextStage,
          currentLocationIndex: 0,
          currentQuestions: firstLocationQuestions,
          currentQuestionIndex: 0,
          readyForNextLocation: false,
          selectedAnswer: null
        });
        
        // 新しいステージの最初の場所にカメラを移動 - Move camera to the first location in the new stage
        get().moveCameraToLocation(firstLocation);
      } else {
        // すべてのステージと場所が完了 - Game complete
        set({ 
          gameCompleted: true,
          readyForNextLocation: false
        });
      }
    }
  },

  // 次の質問に進む（質問詳細表示後に呼び出される） - Move to the next question (called after viewing question details)
  goToNextQuestion: () => {
    const { currentQuestions, currentQuestionIndex, currentLocationIndex } = get();
    
    // 閉じる質問詳細をリセット - Reset the question details view
    set({ showQuestionDetails: false });
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      // 次の質問へ進む - Go to next question
      const nextIndex = currentQuestionIndex + 1;
      set({ 
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        feedback: null
      });
      
      // 同じ場所内の次の質問に進むときはカメラを移動しない - Do not move camera when progressing to the next question within the same location
      // 場所間の移行時にのみカメラ移動が発生します - Camera movement only happens when transitioning between locations
    } else {
      // 現在のロケーションの質問がすべて完了 - All questions at current location completed
      // すべてのステージの場所の順序を定義 - Define the sequence of locations for all stages
      const locationSequence = ['tokyo', 'shibuya', 'shinjuku', 'asakusa'];
      
      // 訪問する場所がまだあるか確認 - Check if there are more locations to visit
      if (currentLocationIndex < locationSequence.length - 1) {
        // 次の場所に進む準備ができていることを示すフラグを設定 - Set the flag to indicate user is ready to proceed to next location
        set({
          readyForNextLocation: true
        });
      } else {
        // 現在のステージのすべての場所が完了 - All locations completed for current stage
        // さらにステージがあるか確認 - Check if there are more stages
        if (get().currentStage < 5) {
          // ユーザーは現在のステージのすべての場所を完了しましたが、さらにステージがあります - User has completed all locations in current stage, but there are more stages
          set({
            readyForNextLocation: true
          });
        } else {
          // すべてのステージと場所が完了 - Game complete
          set({ 
            gameCompleted: true
          });
        }
      }
    }
  },

  // カメラを指定の場所に移動 - Move camera to a specific location
  moveCameraToLocation: (location: string) => {
    // シーンストア内の実際のシーンIDへの内部場所名のマッピング - Mapping from our internal location names to actual scene IDs in the scene store
    const locationToSceneId: Record<string, string> = {
      'tokyo': 'tokyo-overview',      // Tokyo location maps to 'tokyo-overview' scene
      'shibuya': 'shibuya-crossing',  // Shibuya location maps to 'shibuya-crossing' scene
      'shinjuku': 'shinjuku',         // Shinjuku location maps to 'shinjuku' scene
      'asakusa': 'asakusa'            // Asakusa location maps to 'asakusa' scene
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