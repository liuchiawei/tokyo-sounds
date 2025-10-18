"use client";

// audio player and quiz interface
import { useQuizStore } from '@/stores/quiz-store';
import QuizGame from '../quiz/QuizGame';
import { useAudioControl } from "../audio/audio-control-context";

export default function AudioPlayer() {
  const { playAudio, pauseAudio, resumeAudio, stopAudio, isPlaying, currentAudioUrl } = useAudioControl();
  const { gameStarted, gameCompleted } = useQuizStore();

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 text-white rounded-lg shadow-lg p-4">
      {/* Audio Controls Section - Always visible */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
          <span>Audio Player</span>
          {gameStarted && (
            <span className="text-xs px-2 py-1 bg-blue-900/50 rounded">
              Quiz Active
            </span>
          )}
        </h3>
        {currentAudioUrl && (
          <p className="text-sm mb-3">
            {isPlaying ? "Playing:" : "Paused:"} {currentAudioUrl.split('/').pop()}
          </p>
        )}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (!isPlaying && currentAudioUrl) {
                resumeAudio();
              } else if (!currentAudioUrl) {
                playAudio("/audio/tokyo-street.mp3");
              }
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 text-sm"
            disabled={isPlaying && currentAudioUrl !== null}
          >
            {isPlaying ? "Playing" : "Play"}
          </button>
          <button
            onClick={() => {
              if (isPlaying) {
                pauseAudio();
              } else {
                resumeAudio();
              }
            }}
            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors duration-200 text-sm"
            disabled={!currentAudioUrl}
          >
            {isPlaying ? "Pause" : "Resume"}
          </button>
          <button
            onClick={stopAudio}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 text-sm"
            disabled={!currentAudioUrl}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Quiz Game Section - Appears when game starts */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <QuizGame />
      </div>
    </div>
  );
}