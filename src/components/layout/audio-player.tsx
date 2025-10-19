'use client';

// audio player and quiz interface
import { useQuizStore } from '@/stores/quiz-store';
import QuizGame from '../quiz/QuizGame';
import { useAudioControl } from "../audio/audio-control-context";
import { Play, Pause, StopCircle, Music } from 'lucide-react';

export default function AudioPlayer() {
  const { playAudio, pauseAudio, resumeAudio, stopAudio, isPlaying, currentAudioUrl } = useAudioControl();
  const { gameStarted } = useQuizStore();

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl shadow-lg p-4 border border-slate-700/50">
      {/* Audio Controls Section */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <h3 className="text-xl font-bold flex items-center justify-between">
          <span className="flex items-center">
            <Music size={22} className="mr-3 text-blue-400" />
            Audio Player
          </span>
          {gameStarted && (
            <span className="text-xs px-2 py-1 bg-blue-900/60 text-blue-200 rounded-full font-medium">
              Quiz Active
            </span>
          )}
        </h3>
        {currentAudioUrl && (
          <div className="text-sm text-slate-300 mt-3 flex items-center bg-slate-700/30 p-2 rounded-lg">
            <Music size={16} className="mr-2 text-slate-400" />
            <span className="truncate">
              {isPlaying ? "Now Playing:" : "Paused:"}
              <span className="font-semibold text-slate-100 ml-1">{currentAudioUrl.split('/').pop()}</span>
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 my-4">
        <button
          onClick={() => {
            if (currentAudioUrl && !isPlaying) {
              resumeAudio();
            } else if (!currentAudioUrl) {
              playAudio("/audio/tokyo-street.mp3");
            }
          }}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 text-white disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg"
          disabled={isPlaying}
        >
          <Play size={24} />
        </button>
        <button
          onClick={pauseAudio}
          className="p-3 bg-yellow-600 hover:bg-yellow-700 rounded-full transition-all duration-200 text-white disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg"
          disabled={!isPlaying}
        >
          <Pause size={24} />
        </button>
        <button
          onClick={stopAudio}
          className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200 text-white disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg"
          disabled={!currentAudioUrl}
        >
          <StopCircle size={24} />
        </button>
      </div>

      {/* Quiz Game Section */}
      <div className="flex-1 min-h-0">
        <QuizGame />
      </div>
    </div>
  );
}
