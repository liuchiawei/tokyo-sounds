"use client";

// audio player
import { useAudioControl } from "../audio/audio-control-context";

export default function AudioPlayer() {
  const { playAudio, pauseAudio, resumeAudio, stopAudio, isPlaying, currentAudioUrl } = useAudioControl();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Audio Player</h3>
      {currentAudioUrl && (
        <p className="text-sm mb-4">
          {isPlaying ? "Playing:" : "Paused:"} {currentAudioUrl.split('/').pop()}
        </p>
      )}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            if (!isPlaying && currentAudioUrl) {
              console.log("AudioPlayer: 'Play' button clicked to resume.");
              resumeAudio();
            } else if (!currentAudioUrl) {
              console.log("AudioPlayer: 'Play' button clicked to play default.");
              playAudio("/audio/tokyo-street.mp3");
            }
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
          disabled={isPlaying && currentAudioUrl !== null}
        >
          {isPlaying ? "Playing" : "Play"}
        </button>
        <button
          onClick={() => {
            if (isPlaying) {
              console.log("AudioPlayer: 'Pause' button clicked.");
              pauseAudio();
            } else {
              console.log("AudioPlayer: 'Resume' button clicked.");
              resumeAudio();
            }
          }}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors duration-200"
          disabled={!currentAudioUrl}
        >
          {isPlaying ? "Pause" : "Resume"}
        </button>
        <button
          onClick={stopAudio}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
          disabled={!currentAudioUrl}
        >
          Stop
        </button>
      </div>
    </div>
  );
}