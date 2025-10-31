// src/components/quiz/QuizGame.tsx
// クイズゲームのメインコンポーネント

import React, { useEffect } from "react";
import { useQuizStore } from "@/stores/quiz-store";
import { locationSequence } from "@/stores/quiz-store";
import { useIsMobile } from "@/hooks/use-mobile";
import confetti from "canvas-confetti";
import { useConfetti } from "@/hooks/use-confetti";
import QuestionDisplay from "./QuestionDisplay";
import AnswerOption from "./AnswerOption";
import QuestionDetails from "./QuestionDetails";
import BadgeDisplay from "./BadgeDisplay";
import { CheckCircle, ArrowRightCircle } from "lucide-react";
import "@/stores/use-scene-store";

/**
 * クイズゲームのメインコンポーネント - サイドパネルに適したUI
 * @returns {JSX.Element}
 */
export default function QuizGame(): React.JSX.Element {
  const {
    gameStarted,
    gameCompleted,
    currentQuestions,
    currentQuestionIndex,
    showFeedback,
    score,
    readyForNextLocation,
    proceedToNextLocation,
    answerQuestion,
    currentLocationIndex,
    showQuestionDetails,
    selectedAnswer,
  } = useQuizStore();
  const isMobile = useIsMobile();
  const { triggerConfetti } = useConfetti();

  // Trigger confetti celebration when game is completed
  useEffect(() => {
    if (gameCompleted) {
      triggerConfetti({ score });
    }
  }, [gameCompleted, score, triggerConfetti]);

  // キーボードイベントを処理 - Handle keyboard events
  useEffect(() => {
    // 回答選択用のキーボードイベントリスナーを設定 - Set up keyboard event listener for answer selection
    const handleKeyDown = (e: KeyboardEvent) => {
      // 回答選択は1-4キーで行う - Answer selection using keys 1-4
      if (
        e.key >= "1" &&
        e.key <= "4" &&
        !showFeedback &&
        !showQuestionDetails
      ) {
        const optionIndex = parseInt(e.key) - 1; // Convert to 0-based index
        const currentQuestion = currentQuestions[currentQuestionIndex];
        if (currentQuestion && optionIndex < currentQuestion.options.length) {
          answerQuestion(currentQuestion.options[optionIndex].id);
        }
      }
    };

    // イベントリスナーを追加 - Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // クリーンアップ関数でイベントリスナーを削除 - Remove event listener on cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentQuestionIndex,
    currentQuestions,
    showFeedback,
    showQuestionDetails,
    answerQuestion,
  ]);

  // ゲームがまだ開始されていない場合、説明メッセージを表示 - If the game hasn't started yet, show an instructional message
  if (!gameStarted) {
    return (
      <div className="w-full text-center p-4">
        <div className="mb-6 p-5 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-700/50 shadow-xl">
          <h1 className="text-2xl font-bold text-blue-300 mb-2">
            東京サウンド クイズ
          </h1>
          <div className="text-sm text-blue-200 mt-2">
            東京のランドマークを探検して、クイズで学びましょう！
          </div>
          <div className="text-sm mt-2 text-blue-300 font-medium">
            キー 1-4 で回答を選択してください
          </div>
        </div>
        <div className="text-gray-300 p-4 rounded-xl bg-gray-800/30">
          <p className="mb-3">
            3Dシーン内の任意のランドマークをクリックしてクイズを開始してください。
          </p>
          <div className="mt-4 text-blue-400">
            <p>
              モデル内の建物や店舗、その他のランドマークをクリックしてみてください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ゲームが完了した場合、完了メッセージを表示 - If the game is completed, show the completion message
  if (gameCompleted) {
    const { currentBadge } = useQuizStore.getState();

    // Function to create the quiz results image
    const createQuizResultsImage = () => {
      return new Promise<Blob>((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Draw background
          const gradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
          );
          gradient.addColorStop(0, "#0f172a"); // slate-900
          gradient.addColorStop(1, "#1e293b"); // slate-800
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw content
          ctx.fillStyle = "#f8fafc"; // slate-50
          ctx.font = "bold 36px Arial";
          ctx.textAlign = "center";
          ctx.fillText("東京サウンドズ", canvas.width / 2, 80);

          ctx.font = "24px Arial";
          ctx.fillText("クイズ完了！", canvas.width / 2, 130);

          ctx.font = "bold 48px Arial";
          ctx.fillStyle = "#94a3b8"; // slate-400
          ctx.fillText(`${score}/100`, canvas.width / 2, 200);

          ctx.fillStyle = "#f8fafc"; // slate-50
          ctx.font = "20px Arial";
          ctx.fillText(
            `獲得バッジ: ${currentBadge?.name || ""}`,
            canvas.width / 2,
            260
          );

          ctx.fillStyle = "#64748b"; // slate-500
          ctx.font = "16px Arial";
          ctx.fillText("Tokyo Sounds Quiz", canvas.width / 2, 320);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not create image blob"));
            }
          }, "image/png");
        } else {
          reject(new Error("Could not get canvas context"));
        }
      });
    };

    // Function to handle Instagram sharing (mobile only)
    const handleInstagramShare = async () => {
      if (!isMobile) {
        // On desktop, show a message that Instagram sharing is mobile-only
        alert("Instagramシェア機能はモバイル端末からのみ利用できます。");
        return;
      }

      try {
        const imageBlob = await createQuizResultsImage();

        // Check if Web Share API is available (mobile devices)
        if (navigator.share) {
          const file = new File([imageBlob], "tokyo-sounds-quiz-results.png", {
            type: "image/png",
          });

          // Share using Web Share API
          await navigator.share({
            title: "東京サウンドズ",
            text: `東京サウンドズでクイズを完了しました！スコア: ${score}/100 『${currentBadge?.name}』バッジを獲得しました！`,
            files: [file],
          });
        } else {
          // On mobile without Web Share API, show a message
          alert("お使いのブラウザは共有機能をサポートしていません。");
        }
      } catch (error) {
        console.error("Error sharing to Instagram:", error);

        // Alert the user that Instagram sharing failed
        alert("シェアに失敗しました。");
      }
    };

    // Function to handle X (Twitter) sharing (text only, as web intents don't support image uploads)
    const handleXShare = () => {
      // Create share message
      const shareMessage = `東京サウンドズでクイズを完了しました！スコア: ${score}/100 『${currentBadge?.name}』バッジを獲得しました！ #TokyoSoundsQuiz #東京`;
      const shareUrl =
        typeof window !== "undefined"
          ? window.location.href
          : "https://tokyo-sounds.vercel.app";

      // Open Twitter share URL with the message
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareMessage
        )}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    };

    return (
      <div className="w-full h-full flex flex-col p-4">
        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          {/* Completion message and score */}
          <div className="mb-6 p-5 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-700/50 shadow-xl w-full max-w-sm">
            <h1 className="text-2xl font-bold text-green-400 mb-2 text-center">
              🎉 クイズ完了！ 🎉
            </h1>
            <p className="text-base text-white mb-3 text-center">
              お疲れ様でした！
            </p>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-300">最終スコア</p>
              <p className="text-3xl font-bold mt-1">
                <span className="font-mono bg-blue-900/50 px-4 py-2 rounded-full">
                  [{score}/100]
                </span>
              </p>
            </div>
          </div>

          {/* バッジ表示 - Badge display */}
          {currentBadge && (
            <div className="w-full max-w-sm animate-fade-in">
              <h2 className="text-base font-semibold text-slate-300 mb-3 text-center">
                獲得バッジ
              </h2>
              <div className="flex justify-center">
                <BadgeDisplay badge={currentBadge} />
              </div>
            </div>
          )}
        </div>

        {/* Social sharing buttons */}
        <div className="py-3">
          <div className="text-center mb-3">
            <p className="text-sm text-slate-400">結果をシェアする</p>
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            {/* Share to X (Twitter) */}
            <button
              onClick={handleXShare}
              className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              title="X(Twitter)でシェア"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="lucide lucide-x"
              >
                <path
                  d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z"
                  stroke-width="1"
                ></path>
              </svg>
            </button>

            {/* Share to Instagram - only show on mobile */}
            {isMobile && (
              <button
                onClick={handleInstagramShare}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                title="Instagramでシェア"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Reset button positioned closer to the content */}
        <div className="py-3">
          <button
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-base w-full"
            onClick={() => {
              useQuizStore.getState().resetGame();
            }}
          >
            クイズをリセット
          </button>
        </div>
      </div>
    );
  }

  // 現在のロケーションのすべての質問が完了し、まだ次のロケーションに進んでいない場合 - If user has completed all questions at current location but not yet proceeded
  if (readyForNextLocation) {
    const { completedLocations } = useQuizStore.getState();
    const allLocationsCompleted =
      locationSequence.length === completedLocations.length &&
      locationSequence.every((location) =>
        completedLocations.includes(location)
      );

    let nextStepLabel = "次のロケーション";
    let nextStepValue = "";

    if (allLocationsCompleted) {
      nextStepLabel = "ゲーム";
      nextStepValue = "完了";
    } else {
      // Find the next uncompleted location in the sequence
      const nextUncompletedLocation = locationSequence.find(
        (location) => !completedLocations.includes(location)
      );
      nextStepValue = nextUncompletedLocation || "";
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-sm p-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 transform animate-slide-up">
          {/* Header with Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/30">
              <CheckCircle size={32} className="text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200 mb-2">
            ロケーションクリア
          </h1>

          <p className="text-base text-slate-400 mb-6">
            あなたはこのエリアをマスターしました。
          </p>

          {/* Stats/Info */}
          <div className="my-6 px-4 py-3 bg-slate-700/20 rounded-lg border border-slate-600/30 flex justify-around items-center">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase">スコア</p>
              <p className="text-xl font-bold text-emerald-400">{score}</p>
            </div>
            <div className="border-l border-slate-600/30 h-8"></div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase">
                {nextStepLabel}
              </p>
              <p className="text-xl font-bold text-blue-400">{nextStepValue}</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:scale-105 flex items-center justify-center"
            onClick={proceedToNextLocation}
          >
            <ArrowRightCircle size={20} className="mr-2" />
            進む
          </button>
        </div>
      </div>
    );
  }

  // Show question details if showQuestionDetails is true
  if (showQuestionDetails && selectedAnswer) {
    const currentQuestion = currentQuestions[currentQuestionIndex];

    if (currentQuestion) {
      return (
        <QuestionDetails
          question={currentQuestion}
          selectedOptionId={selectedAnswer}
        />
      );
    }
  }

  // それ以外の場合は、現在の質問と回答オプションを表示 - Otherwise, show the current question and answer options
  const currentQuestion = currentQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-white text-center py-8">
        <div className="animate-pulse">問題を読み込み中...</div>
      </div>
    );
  }

  // Temporary confetti test buttons
  const testConfetti = (score: number) => {
    if (score >= 100) {
      // School Pride effect for perfect score (100) - Confetti cannons from both sides
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#eab308", "#facc15", "#fef08a"], // Yellow/gold tones for "Tokyo Sound Master" badge
        shapes: ["circle", "square", "star"],
      });

      confetti({
        particleCount: 150,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#eab308", "#facc15", "#fef08a"], // Yellow/gold tones for "Tokyo Sound Master" badge
        shapes: ["circle", "square", "star"],
      });

      // Additional bursts for extra celebration
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#eab308", "#facc15", "#fef08a"],
          shapes: ["star"],
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#eab308", "#facc15", "#fef08a"],
          shapes: ["circle"],
        });
      }, 400);

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#eab308", "#facc15", "#fef08a"],
          shapes: ["circle"],
        });
      }, 600);
    } else if (score >= 90) {
      // Stars effect for very high scores (90-99)
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fbbf24"], // Amber tones for "Sound Seeker" badge
        shapes: ["star"],
      });

      // Additional bursts
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ["#f59e0b", "#fbbf24"],
          shapes: ["star", "circle"],
        });
      }, 150);

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ["#f59e0b", "#fbbf24"],
          shapes: ["star", "circle"],
        });
      }, 300);
    } else if (score >= 76) {
      // Fireworks effect for high scores (76-89)
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#8b5cf6", "#d946ef"], // Indigo tones for "Urban Navigator" badge
        shapes: ["circle", "square", "star"],
      });

      // Additional burst
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#6366f1", "#8b5cf6", "#d946ef"],
        });
      }, 150);

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#6366f1", "#8b5cf6", "#d946ef"],
        });
      }, 300);
    } else if (score >= 51) {
      // More elaborate for good scores (51-75)
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399"], // Green tones for "Metro Explorer" badge
        shapes: ["circle", "square", "star"],
      });
    } else if (score >= 26) {
      // Slightly more elaborate for medium scores (26-50)
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#60a5fa"], // Blue tones for "City Hopper" badge
        shapes: ["circle", "square"],
      });
    } else {
      // Simple confetti for lower scores (0-25)
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#94a3b8"], // Grey tones for "Station Commuter" badge
        shapes: ["circle", "square"],
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-1">
      {/* Temporary confetti test buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          className="px-2 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600"
          onClick={() => testConfetti(0)}
        >
          Test 0-25 (Low)
        </button>
        <button
          className="px-2 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600"
          onClick={() => testConfetti(30)}
        >
          Test 26-50 (Medium)
        </button>
        <button
          className="px-2 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600"
          onClick={() => testConfetti(60)}
        >
          Test 51-75 (Good)
        </button>
        <button
          className="px-2 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600"
          onClick={() => testConfetti(80)}
        >
          Test 76-89 (High)
        </button>
        <button
          className="px-2 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600"
          onClick={() => testConfetti(95)}
        >
          Test 90-99 (Very High)
        </button>
        <button
          className="px-2 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600"
          onClick={() => testConfetti(100)}
        >
          Test 100 (Perfect)
        </button>
      </div>

      {/* スコアとステージ表示 - Score and stage display */}
      <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-blue-300">
            ロケーション:{" "}
            <span className="font-mono bg-blue-900/50 px-2 py-0.5 rounded">
              {locationSequence[currentLocationIndex]}
            </span>
          </div>
          <div className="text-sm font-medium text-blue-300">
            スコア:{" "}
            <span className="font-mono bg-blue-900/50 px-2 py-0.5 rounded">
              [{score}/100]
            </span>
          </div>
        </div>
      </div>

      {/* 質問表示 - Question display */}
      <div className="mt-4">
        <QuestionDisplay />
      </div>

      {/* フィードバック表示 - Feedback message when showing feedback */}
      {showFeedback && (
        <div
          className={`mt-3 p-2.5 rounded-lg text-center font-bold text-sm ${
            useQuizStore.getState().feedback === "正解！"
              ? "bg-gradient-to-r from-green-800/60 to-emerald-800/60 text-green-300 border border-green-600/50"
              : "bg-gradient-to-r from-red-800/60 to-rose-800/60 text-red-300 border border-red-600/50"
          }`}
        >
          {useQuizStore.getState().feedback}
        </div>
      )}

      {/* 回答オプション - Answer options */}
      <div className="flex-1 space-y-2 py-3 my-3">
        {currentQuestion.options.map((option, index) => (
          <AnswerOption
            key={option.id}
            optionId={option.id}
            optionText={`${index + 1}. ${option.text}`}
          />
        ))}
      </div>

      {/* 進行状況インジケーター - Progress indicator */}
      <div className="text-xs text-gray-400 text-center p-2 bg-gray-800/40 rounded">
        問 {currentQuestionIndex + 1}/{currentQuestions.length} |{" "}
        {Math.round(
          ((currentQuestionIndex + 1) / currentQuestions.length) * 100
        )}
        % ロケーション内
      </div>
    </div>
  );
}
