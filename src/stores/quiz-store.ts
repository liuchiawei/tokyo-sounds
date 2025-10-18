// src/stores/quiz-store.ts
// クイズゲームのZustandストア - Zustand store for the quiz game

import { create } from 'zustand';
import { QuizGameState, QuizGameActions } from '../types/quiz';
import { quizStages, landmarkSpecificQuestions } from '../data/quiz-data';
import { useSceneStore } from './use-scene-store';

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
};

// クイズストアの定義 - Define the quiz store
export const useQuizStore = create<QuizGameState & QuizGameActions>((set, get) => ({
  // 初期状態 - Initial state
  ...initialQuizState,

  // ゲーム開始 - Start the game with optional landmark-specific questions
  startGame: (landmarkName?: string) => {
    let questionsToUse = []; // Default to empty
    
    // If a specific landmark is provided, get its specific questions
    if (landmarkName && landmarkSpecificQuestions[landmarkName]) {
      // Use the landmark-specific questions directly
      questionsToUse = landmarkSpecificQuestions[landmarkName];
    } else {
      // If no landmark specified, use all questions from default quizStages
      for (const stage of quizStages) {
        questionsToUse = questionsToUse.concat(stage.questions);
      }
    }
    
    set({ 
      gameStarted: true,
      gameCompleted: false,
      currentQuestions: questionsToUse,
      score: 0,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      feedback: null,
      showFeedback: false,
      answeredQuestions: [],
    });
  },

  // 質問セットを切り替える - Switch question set to a different landmark
  switchQuestionSet: (landmarkName: string) => {
    // Check if this specific landmark has dedicated questions
    if (landmarkSpecificQuestions[landmarkName]) {
      // Get the landmark-specific questions
      const landmarkQuestions = landmarkSpecificQuestions[landmarkName];
      
      // Update the questions and reset to the first question, but keep other state
      set({ 
        currentQuestions: landmarkQuestions,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        feedback: null,
        showFeedback: false
      });
    }
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

    // 質問がすべて終わったらゲーム終了、そうでなければ次の質問 - 
    // Complete game if all questions are answered, otherwise go to next question
    setTimeout(() => {
      set({ 
        answeredQuestions,
        showFeedback: false
      });

      if (get().currentQuestionIndex < currentQuestions.length - 1) {
        // 次の質問へ進む - Go to next question
        const nextIndex = get().currentQuestionIndex + 1;
        set({ currentQuestionIndex: nextIndex });
        
        // Move camera to the location of the next question
        const nextQuestion = currentQuestions[nextIndex];
        if (nextQuestion && nextQuestion.location) {
          get().moveCameraToLocation(nextQuestion.location);
        }
      } else {
        // ゲーム終了 - Game completed
        set({ gameCompleted: true });
      }
    }, 1500); // 1.5秒後に次へ進む - Move to next after 1.5 seconds
  },

  // 次の質問へ進む - Move to next question
  nextQuestion: () => {
    const { currentQuestions, currentQuestionIndex } = get();
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      set({ currentQuestionIndex: nextIndex });
      
      // Move camera to the location of the current question
      const nextQuestion = currentQuestions[nextIndex];
      if (nextQuestion && nextQuestion.location) {
        get().moveCameraToLocation(nextQuestion.location);
      }
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