/**
 * Generative Audio Controls
 * UI for controlling Lyria generative audio feature
 */

"use client";

import { useGenerativeAudioStore } from "@/stores/use-generative-audio-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Music, Settings, Volume2 } from "lucide-react";
import { useState } from "react";

export function GenerativeAudioControls() {
  const {
    enabled,
    setEnabled,
    apiKey,
    setApiKey,
    volume,
    setVolume,
    showDebugInfo,
    setShowDebugInfo
  } = useGenerativeAudioStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const handleSaveSettings = () => {
    setApiKey(tempApiKey);
    setIsSettingsOpen(false);
  };

  const isConfigured = apiKey.trim().length > 0;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
            title="Generative Audio Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generative Audio Settings</DialogTitle>
            <DialogDescription>
              Configure Lyria RealTime API for proximity-based generative music
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                Google AI API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Get your API key from{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="volume" className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                id="volume"
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="debug"
                type="checkbox"
                checked={showDebugInfo}
                onChange={(e) => setShowDebugInfo(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="debug" className="text-sm font-medium">
                Show debug info in console
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTempApiKey(apiKey);
                setIsSettingsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant={enabled ? "default" : "outline"}
        size="icon"
        onClick={() => setEnabled(!enabled)}
        disabled={!isConfigured}
        className={`${
          enabled
            ? "bg-green-500 hover:bg-green-600"
            : "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
        }`}
        title={
          !isConfigured
            ? "Configure API key first"
            : enabled
            ? "Disable generative audio"
            : "Enable generative audio"
        }
      >
        <Music className="h-4 w-4" />
      </Button>

      {enabled && isConfigured && (
        <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/50 rounded-md px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-100">Generative Audio Active</span>
        </div>
      )}
    </div>
  );
}
