// src/types/quiz.ts
// クイズゲームの型定義 - Quiz game type definitions

// クイズの選択肢インターフェース - Quiz option interface
export interface QuizOption {
  id: string;                    // 選択肢ID - Option ID
  text: string;                  // 選択肢のテキスト - Option text
  isCorrect: boolean;            // 正解かどうか - Whether this is the correct answer
}

// クイズの質問インターフェース - Quiz question interface
export interface QuizQuestion {
  id: string;                    // 質問ID - Question ID
  text: string;                  // 質問文 - Question text
  options: QuizOption[];         // 選択肢の配列 - Array of options
  location: string;              // 関連する東京の場所 - Related Tokyo location
}

// クイズステージインターフェース - Quiz stage interface
export interface QuizStage {
  id: string;                    // ステージID - Stage ID
  number: number;                // ステージ番号 - Stage number
  name: string;                  // ステージ名 - Stage name
  description: string;           // ステージの説明 - Stage description
  questions: QuizQuestion[];     // 質問の配列 - Array of questions
  location: string;              // 関連する東京の場所 - Related Tokyo location
}

// クイズゲームの状態インターフェース - Quiz game state interface
export interface QuizGameState {
  currentStage: number;          // 現在のステージ - Current stage
  currentQuestionIndex: number;  // 現在の質問インデックス - Current question index
  currentQuestions: QuizQuestion[]; // 現在の質問リスト - Current questions list
  score: number;                 // 現在のスコア - Current score
  totalScore: number;            // 総合スコア - Total score
  gameStarted: boolean;          // ゲームが開始されたかどうか - Whether the game has started
  gameCompleted: boolean;        // ゲームが完了したかどうか - Whether the game is completed
  selectedAnswer: string | null; // 選択された回答 - Selected answer
  feedback: string | null;       // フィードバックメッセージ - Feedback message
  showFeedback: boolean;         // フィードバックを表示するかどうか - Whether to show feedback
  answeredQuestions: string[];   // 回答済みの質問IDの配列 - Array of answered question IDs
  completedLocations: string[];  // 完了したロケーションの配列 - Array of completed locations
  currentLocationIndex: number;  // 現在のロケーションインデックス - Current location index in the sequence
  readyForNextLocation: boolean; // 次のロケーションに進む準備ができているか - Whether ready to proceed to the next location
}

// クイズゲームのアクションインターフェース - Quiz game actions interface
export interface QuizGameActions {
  startGame: (landmarkName?: string) => void;         // ゲーム開始 - Start the game (with optional landmark name)
  answerQuestion: (optionId: string) => void; // 質問に回答 - Answer a question
  nextQuestion: () => void;      // 次の質問へ進む - Move to the next question
  resetGame: () => void;         // ゲームをリセット - Reset the game
  setShowFeedback: (show: boolean) => void; // フィードバック表示の設定 - Set feedback visibility
  setCurrentQuestionIndex: (index: number) => void; // 現在の質問インデックスを設定 - Set current question index
  updateScore: (points: number) => void; // スコアを更新 - Update score
  moveCameraToLocation: (location: string) => void; // カメラを指定の場所に移動 - Move camera to a specific location
  switchQuestionSet: (landmarkName: string) => void; // 質問セットを切り替える - Switch question set to a different landmark
  proceedToNextLocation: () => void; // 次のロケーションに進む - Proceed to the next location
}