"use client";

/**
 * DebugPanel Component
 * Shows real-time debug info for generative and spatial audio
 */

import { useState } from "react";
import type { PlateDebugInfo } from "./CityLyriaAudio";

export interface SpatialDebugInfo {
  name: string;
  distance: number;
  volume: number;
  culled: boolean;
}

interface DebugPanelProps {
  plateWeights: PlateDebugInfo[];
  spatialSources: SpatialDebugInfo[];
  cameraPosition?: { x: number; y: number; z: number };
  generativeEnabled: boolean;
}

export function DebugPanel({
  plateWeights,
  spatialSources,
  cameraPosition,
  generativeEnabled,
}: DebugPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 hover:text-white transition-colors text-xs font-mono"
      >
        🔧 DEBUG
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 text-white max-w-[320px] font-mono text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-emerald-400 tracking-wide">🔧 DEBUG</h3>
        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Camera Position */}
      {cameraPosition && (
        <div className="mb-3 pb-3 border-b border-slate-700/50">
          <p className="text-slate-500 text-[10px] mb-1">CAMERA POSITION</p>
          <div className="flex gap-3 text-[11px]">
            <span className="text-red-400">X: {cameraPosition.x.toFixed(0)}</span>
            <span className="text-green-400">Y: {cameraPosition.y.toFixed(0)}</span>
            <span className="text-blue-400">Z: {cameraPosition.z.toFixed(0)}</span>
          </div>
        </div>
      )}

      {/* Generative Audio Weights */}
      {generativeEnabled && plateWeights.length > 0 && (
        <div className="mb-3 pb-3 border-b border-slate-700/50">
          <p className="text-slate-500 text-[10px] mb-2">GENERATIVE WEIGHTS</p>
          <div className="space-y-1.5">
            {plateWeights.map((plate) => (
              <div key={plate.name} className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">{plate.name}</span>
                  <span className="text-amber-400">{(plate.weight * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-amber-500 transition-all duration-150"
                      style={{ width: `${plate.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-600 text-[10px] w-12 text-right">
                    {plate.distance.toFixed(0)}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spatial Audio Sources */}
      {spatialSources.length > 0 && (
        <div>
          <p className="text-slate-500 text-[10px] mb-2">SPATIAL SOURCES</p>
          <div className="space-y-1.5">
            {spatialSources.map((source, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className={source.culled ? "text-slate-600" : "text-slate-300"}>
                    {source.name}
                    {source.culled && <span className="text-amber-600 ml-1">(culled)</span>}
                  </span>
                  <span className={source.culled ? "text-slate-600" : "text-cyan-400"}>
                    {(source.volume * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-150 ${source.culled ? "bg-slate-700" : "bg-gradient-to-r from-cyan-500 to-emerald-500"
                        }`}
                      style={{ width: `${source.volume * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-600 text-[10px] w-12 text-right">
                    {source.distance.toFixed(0)}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!generativeEnabled && spatialSources.length === 0 && (
        <p className="text-slate-600 text-center py-2">No audio sources active</p>
      )}
    </div>
  );
}

