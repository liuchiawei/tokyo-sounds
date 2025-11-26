'use client';

import { type TokyoPrompt } from '../lib/gemini-client';
import { type PlaybackState } from '../lib/gemini-client';

interface ActivePromptsProps {
  prompts: TokyoPrompt[];
  playbackState: PlaybackState;
}

export function ActivePrompts({ prompts, playbackState }: ActivePromptsProps) {
  // Sort prompts by weight (descending)
  const sortedPrompts = [...prompts].sort((a, b) => b.weight - a.weight);

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-purple-300">
          Active Prompts
        </h2>
        {playbackState === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span>Loading</span>
          </div>
        )}
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <p className="text-sm">No active prompts</p>
          <p className="text-xs mt-1">Select locations to generate sounds</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedPrompts.map((prompt, index) => (
            <div
              key={`${prompt.text}-${index}`}
              className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4 transition-all duration-200 hover:border-purple-500/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {prompt.text}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-purple-300 font-mono">
                    {prompt.weight.toFixed(2)}
                  </span>
                  <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${prompt.weight * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {prompts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-500/30">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-purple-500/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Total Prompts</p>
              <p className="text-2xl font-bold text-purple-300">
                {prompts.length}
              </p>
            </div>
            <div className="bg-pink-500/10 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Avg Weight</p>
              <p className="text-2xl font-bold text-pink-300">
                {(
                  prompts.reduce((sum, p) => sum + p.weight, 0) / prompts.length
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <p className="text-xs text-blue-200">
          <strong>Note:</strong> Prompts are sent to the Gemini API with their
          respective weights. Higher weights have more influence on the generated
          soundscape.
        </p>
      </div>
    </div>
  );
}
