'use client';

import { type PlaybackState } from '../lib/gemini-client';

interface ControlsProps {
  playbackState: PlaybackState;
  onPlayPause: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function Controls({
  playbackState,
  onPlayPause,
  onReset,
  disabled = false,
}: ControlsProps) {
  const isPlaying = playbackState === 'playing' || playbackState === 'loading';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
        Controls
      </h3>

      <div className="flex gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          disabled={disabled}
          className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
            disabled
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : isPlaying
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/50'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50'
          } ${playbackState === 'loading' ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center justify-center gap-2">
            {playbackState === 'loading' && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {playbackState === 'stopped' && (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {playbackState === 'playing' && (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            )}
            {playbackState === 'paused' && (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            <span>
              {playbackState === 'loading'
                ? 'Loading...'
                : playbackState === 'playing'
                ? 'Pause'
                : playbackState === 'paused'
                ? 'Resume'
                : 'Play'}
            </span>
          </div>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={disabled}
          className={`px-6 py-4 rounded-lg font-semibold transition-all duration-200 ${
            disabled
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 shadow-lg shadow-gray-700/50'
          }`}
          title="Reset audio context"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Playback State Indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div
          className={`w-2 h-2 rounded-full ${
            playbackState === 'playing'
              ? 'bg-green-500 animate-pulse'
              : playbackState === 'loading'
              ? 'bg-yellow-500 animate-pulse'
              : playbackState === 'paused'
              ? 'bg-orange-500'
              : 'bg-gray-500'
          }`}
        />
        <span>
          Status:{' '}
          <span className="capitalize font-semibold">{playbackState}</span>
        </span>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-4 p-3 bg-black/30 rounded-lg border border-purple-500/20">
        <p className="text-xs text-gray-400 mb-2 font-semibold">
          Keyboard Shortcuts
        </p>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Play/Pause:</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">
              Space
            </kbd>
          </div>
          <div className="flex justify-between">
            <span>Reset:</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">R</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
