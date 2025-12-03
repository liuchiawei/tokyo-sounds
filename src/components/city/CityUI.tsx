"use client";

/**
 * CityUI Component
 * UI overlay for the city flight experience
 * Supports two movement modes: elytra (flight sim) and simple (WASD XYZ)
 */

import { useState } from "react";
import { type MovementMode } from "@/lib/flight";

interface AudioFileInfo {
  name: string;
  url: string;
}

interface CityUIProps {
  stats: {
    totalSources: number;
    activeSources: number;
    culledSources: number;
    estimatedMemoryMB: number;
  };
  flightSpeed: number;
  ready: boolean;
  audioFiles: AudioFileInfo[];
  generativeEnabled: boolean;
  movementMode?: MovementMode;
  isPointerLocked?: boolean;
  isGyroActive?: boolean;
  onRecalibrateGyro?: () => void;
}

export function CityUI({
  stats,
  flightSpeed,
  ready,
  audioFiles,
  generativeEnabled,
  movementMode = "elytra",
  isPointerLocked = false,
  isGyroActive = false,
  onRecalibrateGyro,
}: CityUIProps) {
  const [showControls, setShowControls] = useState(true);
  const [showStats, setShowStats] = useState(true);

  const speedColor = flightSpeed > 200 ? "text-red-400" :
    flightSpeed > 100 ? "text-amber-400" :
      "text-cyan-400";

  return (
    <>
      {showControls && (
        <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700/50 rounded-xl p-4 text-white max-w-[220px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-bold tracking-wide text-sm ${movementMode === "elytra" ? "text-cyan-400" : "text-emerald-400"}`}>
              {movementMode === "elytra" ? "ELYTRA FLIGHT" : "SIMPLE MOVE"}
            </h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-slate-500 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {movementMode === "elytra" ? (
            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-cyan-400 font-mono font-bold">W</span>
                <span className="text-slate-400">Pitch up</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-cyan-400 font-mono font-bold">S</span>
                <span className="text-slate-400">Pitch down</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-fuchsia-400 font-mono font-bold">A / D</span>
                <span className="text-slate-400">Bank & Turn</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-amber-400 font-mono font-bold">SHIFT</span>
                <span className="text-slate-400">Boost!</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-emerald-400 font-mono font-bold">SPACE</span>
                <span className="text-slate-400">Freeze</span>
              </div>
              {isGyroActive && (
                <div className="bg-orange-500/20 border border-orange-500/50 p-2 rounded flex items-center justify-between">
                  <span className="text-orange-400 font-mono font-bold">📱</span>
                  <span className="text-orange-300">Tilt to fly!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-emerald-400 font-mono font-bold">W / S</span>
                <span className="text-slate-400">Forward / Back</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-emerald-400 font-mono font-bold">A / D</span>
                <span className="text-slate-400">Strafe L / R</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-cyan-400 font-mono font-bold">SPACE</span>
                <span className="text-slate-400">Move Up</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-fuchsia-400 font-mono font-bold">CTRL</span>
                <span className="text-slate-400">Move Down</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-amber-400 font-mono font-bold">SHIFT</span>
                <span className="text-slate-400">Sprint</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between">
                <span className="text-sky-400 font-mono font-bold">MOUSE</span>
                <span className="text-slate-400">Look Around</span>
              </div>
              {!isPointerLocked && !isGyroActive && (
                <div className="bg-sky-500/20 border border-sky-500/50 p-2 rounded text-center">
                  <span className="text-sky-300 text-[10px]">Click to enable mouse look</span>
                </div>
              )}
            </div>
          )}

          {isGyroActive && (
            <div className="mt-2 pt-2 border-t border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">GYROSCOPE</span>
                <span className="text-xs font-mono text-emerald-400">ACTIVE</span>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-800/50 p-2 rounded flex items-center justify-between text-xs">
                  <span className="text-orange-400 font-mono font-bold">TILT</span>
                  <span className="text-slate-400">Control camera</span>
                </div>
                {onRecalibrateGyro && (
                  <button
                    onClick={onRecalibrateGyro}
                    className="w-full bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded text-xs text-slate-300 transition-colors"
                  >
                    Recalibrate
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="bg-slate-800/30 p-2 rounded flex items-center justify-between mb-2">
              <span className="text-purple-400 font-mono font-bold text-xs">M</span>
              <span className="text-slate-400 text-xs">Toggle Mode</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">SPEED</span>
              <span className={`font-mono font-bold ${speedColor}`}>
                {flightSpeed}
              </span>
            </div>
            <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-cyan-500 via-amber-500 to-red-500"
                style={{ width: `${Math.min(100, (flightSpeed / 300) * 100)}%` }}
              />
            </div>
            {movementMode === "elytra" && (
              <p className="text-[10px] text-slate-600 mt-1">Gravity affects speed!</p>
            )}
          </div>
        </div>
      )}

      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 hover:text-white transition-colors text-xs"
        >
          ?
        </button>
      )}

      {showStats && ready && (
        <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700/50 rounded-xl p-4 text-white min-w-[200px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-fuchsia-400 tracking-wide text-sm">AUDIO</h3>
            <button
              onClick={() => setShowStats(false)}
              className="text-slate-500 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Sources</span>
              <span className="text-cyan-400 font-mono">{stats.totalSources}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active</span>
              <span className="text-emerald-400 font-mono">{stats.activeSources}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Culled</span>
              <span className="text-amber-400 font-mono">{stats.culledSources}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <h4 className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Audio Buildings</h4>
            <div className="space-y-1">
              {audioFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: ["#00ffff", "#ff00ff", "#ffaa00", "#00ff88", "#ff6b6b", "#6b5bff"][idx % 6],
                    }}
                  />
                  <span className="text-slate-300 truncate text-[11px]">{file.name}</span>
                </div>
              ))}
            </div>
          </div>

          {generativeEnabled && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Lyria Active</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!showStats && ready && (
        <button
          onClick={() => setShowStats(true)}
          className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 hover:text-white transition-colors text-xs"
        >
          ♪
        </button>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-full px-5 py-2 flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 animate-pulse" />
          <span className="text-slate-400">Spatial</span>
        </div>
        {generativeEnabled && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-500 animate-pulse" />
            <span className="text-slate-400">Generative</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
          <span className="text-slate-400">Building</span>
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="text-cyan-400 font-mono text-sm">LOADING CITY...</p>
          </div>
        </div>
      )}
    </>
  );
}
