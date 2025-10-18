// src/stores/quiz-store.ts
// クイズゲームのZustandストア - Zustand store for the quiz game

import { create } from 'zustand';
import { QuizGameState, QuizGameActions } from '../types/quiz';
import { quizStages } from '../data/quiz-data';
import { useSceneStore } from './use-scene-store';

// 初期状態の定義 - Define initial state
const initialQuizState: Omit<QuizGameState, keyof QuizGameActions> = {
  currentStage: 0,                    // 現在のステージ - Current stage (0-indexed)
  currentQuestionIndex: 0,            // 現在の質問インデックス - Current question index
  score: 0,                           // 現在のスコア - Current score
  totalScore: 0,                      // 総合スコア - Total score
  gameStarted: false,                 // ゲームが開始されたかどうか - Whether the game has started
  gameCompleted: false,               // ゲームが完了したかどうか - Whether the game is completed
  selectedAnswer: null,               // 選択された回答 - Selected answer
  feedback: null,                     // フィードバックメッセージ - Feedback message
  showFeedback: false,                // フィードバックを表示するかどうか - Whether to show feedback
  stages: quizStages,                 // すべてのステージ - All stages
  answeredQuestions: [],              // 回答済みの質問IDの配列 - Array of answered question IDs
};

// クイズストアの定義 - Define the quiz store
export const useQuizStore = create<QuizGameState & QuizGameActions>((set, get) => ({
  // 初期状態 - Initial state
  ...initialQuizState,

  // ゲーム開始 - Start the game
  startGame: () => {
    set({ 
      gameStarted: true,
      gameCompleted: false,
      score: 0,
      currentStage: 0,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      answeredQuestions: [],
    });
  },

  // 質問に回答 - Answer a question
  answerQuestion: (optionId: string) => {
    const { stages, currentStage, currentQuestionIndex } = get();
    const currentQuestion = stages[currentStage].questions[currentQuestionIndex];
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
      const newScore = get().score + currentQuestion.points;
      set({ 
        score: newScore,
        totalScore: get().totalScore + currentQuestion.points,
        feedback,
        showFeedback: true
      });
    } else {
      // 不正解の場合 - If incorrect
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

    // 質問がすべて終わったら次のステージへ進む、そうでなければ次の質問 - 
    // Go to next stage if all questions are answered, otherwise go to next question
    setTimeout(() => {
      const stage = get().stages[get().currentStage];
      set({ 
        answeredQuestions,
        showFeedback: false
      });

      if (get().currentQuestionIndex < stage.questions.length - 1) {
        // 次の質問へ進む - Go to next question
        set({ currentQuestionIndex: get().currentQuestionIndex + 1 });
        
        // Move camera to the location of the next question
        const nextQuestion = stage.questions[get().currentQuestionIndex + 1];
        get().moveCameraToLocation(nextQuestion.location);
      } else {
        // 次のステージへ進む - Go to next stage
        set({ currentQuestionIndex: 0 });
        
        // 全ステージ完了チェック - Check if all stages are completed
        if (get().currentStage < get().stages.length - 1) {
          set({ currentStage: get().currentStage + 1 });
          
          // Move camera to the location of the next stage
          const nextStage = get().stages[get().currentStage + 1];
          get().moveCameraToLocation(nextStage.location);
        } else {
          // ゲーム終了 - Game completed
          set({ gameCompleted: true });
        }
      }
    }, 1500); // 1.5秒後に次へ進む - Move to next after 1.5 seconds
  },

  // 次の質問へ進む - Move to next question
  nextQuestion: () => {
    const { currentStage, currentQuestionIndex, stages } = get();
    if (currentQuestionIndex < stages[currentStage].questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
      
      // Move camera to the location of the current question
      const nextQuestion = stages[currentStage].questions[currentQuestionIndex + 1];
      get().moveCameraToLocation(nextQuestion.location);
    }
  },

  // 次のステージへ進む - Move to next stage
  nextStage: () => {
    const { currentStage, stages } = get();
    if (currentStage < stages.length - 1) {
      set({ 
        currentStage: currentStage + 1,
        currentQuestionIndex: 0  // ステージが変わったら最初の質問に戻る - Return to first question when stage changes
      });
      
      // Move camera to the location of the next stage
      const nextStage = stages[currentStage + 1];
      get().moveCameraToLocation(nextStage.location);
    }
  },

  // ゲームをリセット - Reset the game
  resetGame: () => {
    set({ 
      currentStage: 0,
      currentQuestionIndex: 0,
      score: 0,
      totalScore: 0,
      gameStarted: false,
      gameCompleted: false,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      answeredQuestions: [],
    });
  },

  // フィードバック表示の設定 - Set feedback visibility
  setShowFeedback: (show: boolean) => set({ showFeedback: show }),

  // 現在のステージを設定 - Set current stage
  setCurrentStage: (stage: number) => set({ currentStage: stage }),

  // 現在の質問インデックスを設定 - Set current question index
  setCurrentQuestionIndex: (index: number) => set({ currentQuestionIndex: index }),

  // スコアを更新 - Update score
  updateScore: (points: number) => set(state => ({ score: state.score + points, totalScore: state.totalScore + points })),

  // カメラを指定の場所に移動 - Move camera to a specific location
  moveCameraToLocation: (location: string) => {
    // 現在のシーンストアから対応するランドマークを見つける - Find the corresponding landmark from the current scene store
    const sceneStore = useSceneStore.getState();
    const targetScene = sceneStore.allScenes.find(scene => scene.id === location);
    
    if (targetScene && targetScene.cameraPositions.length > 0) {
      // 最初のカメラ位置に移動 - Move to the first camera position
      sceneStore.moveCameraToLandmark(targetScene.cameraPositions[0]);
    }
  }
}));