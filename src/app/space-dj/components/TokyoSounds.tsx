'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TokyoSoundsGeminiClient,
  type TokyoPrompt,
  type PlaybackState,
} from '../lib/gemini-client';
import {
  TOKYO_LOCATIONS,
  getLocationPrompts,
  getTimeBasedPrompts,
} from '../lib/tokyo-data';
import { Controls } from './Controls';
import { LocationSelector } from './LocationSelector';
import { ActivePrompts } from './ActivePrompts';
import { TokyoUniverse3D } from './TokyoUniverse3D';

export default function TokyoSounds() {
  const [client, setClient] = useState<TokyoSoundsGeminiClient | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Map<string, number>>(
    new Map()
  );
  const [activePrompts, setActivePrompts] = useState<TokyoPrompt[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const clientRef = useRef<TokyoSoundsGeminiClient | null>(null);

  // Initialize Gemini client on mount
  useEffect(() => {
    const initClient = async () => {
      try {
        const geminiClient = new TokyoSoundsGeminiClient({
          onSetupComplete: () => {
            setIsConnected(true);
            setInfoMessage('Connected to Tokyo Sounds');
            setTimeout(() => setInfoMessage(null), 3000);
          },
          onPlaybackStateChange: (state) => {
            setPlaybackState(state);
          },
          onError: (error) => {
            setErrorMessage(error.message);
            console.error('Gemini client error:', error);
          },
          onFilteredPrompt: (text, reason) => {
            setErrorMessage(`Prompt filtered: ${text} (${reason})`);
            setTimeout(() => setErrorMessage(null), 5000);
          },
          onClose: () => {
            setIsConnected(false);
            setErrorMessage('Connection closed');
          },
        });

        clientRef.current = geminiClient;
        setClient(geminiClient);

        // Connect to Gemini
        setInfoMessage('Connecting to Gemini API...');
        await geminiClient.connect();
      } catch (error) {
        console.error('Failed to initialize client:', error);
        setErrorMessage('Failed to connect to Gemini API');
      }
    };

    initClient();

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.dispose();
      }
    };
  }, []);

  // Update prompts when locations change
  useEffect(() => {
    if (!client || !isConnected) return;
    updateActivePrompts();
  }, [selectedLocations, client, isConnected]);

  const updateActivePrompts = useCallback(async () => {
    if (!client || selectedLocations.size === 0) return;

    const prompts: TokyoPrompt[] = [];

    // Add location-based prompts
    for (const [locationId, weight] of selectedLocations.entries()) {
      const locationPrompts = getLocationPrompts(locationId);
      locationPrompts.forEach((text) => {
        prompts.push({ text, weight });
      });
    }

    // Add time-based ambient prompts with lower weight
    const timePrompts = getTimeBasedPrompts();
    timePrompts.forEach((text) => {
      prompts.push({ text, weight: 0.3 });
    });

    // Normalize weights if needed (max 10 prompts)
    const finalPrompts = prompts.slice(0, 10);

    setActivePrompts(finalPrompts);

    try {
      await client.setTokyoPrompts(finalPrompts);
    } catch (error) {
      console.error('Error setting prompts:', error);
      setErrorMessage('Failed to update prompts');
    }
  }, [client, selectedLocations]);

  const handlePlayPause = useCallback(async () => {
    if (!client) {
      setErrorMessage('Client not initialized');
      return;
    }

    if (!isConnected) {
      setErrorMessage('Not connected to Gemini API');
      return;
    }

    if (selectedLocations.size === 0) {
      setErrorMessage('Please select at least one location');
      return;
    }

    try {
      if (playbackState === 'playing' || playbackState === 'loading') {
        client.pause();
      } else {
        await client.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setErrorMessage('Playback error occurred');
    }
  }, [client, isConnected, playbackState, selectedLocations]);

  const handleReset = useCallback(async () => {
    if (!client) return;

    try {
      await client.reset();
      setInfoMessage('Audio reset');
      setTimeout(() => setInfoMessage(null), 2000);
    } catch (error) {
      console.error('Error resetting:', error);
      setErrorMessage('Reset error occurred');
    }
  }, [client]);

  const handleLocationSelect = useCallback((locationId: string, weight: number) => {
    setSelectedLocations((prev) => {
      const newMap = new Map(prev);
      if (weight === 0) {
        newMap.delete(locationId);
      } else {
        newMap.set(locationId, weight);
      }
      return newMap;
    });
  }, []);

  const handleLocationToggle = useCallback((locationId: string) => {
    setSelectedLocations((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(locationId)) {
        newMap.delete(locationId);
      } else {
        newMap.set(locationId, 1.0);
      }
      return newMap;
    });
  }, []);

  // Handle proximity-based weight changes from 3D universe
  const handleProximityWeights = useCallback(async (prompts: TokyoPrompt[]) => {
    if (!client || !isConnected) return;

    setActivePrompts(prompts);

    try {
      await client.setTokyoPrompts(prompts);
    } catch (error) {
      console.error('Error setting proximity prompts:', error);
      setErrorMessage('Failed to update prompts');
    }
  }, [client, isConnected]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* 3D Universe Background - Full Screen */}
      <div className="fixed inset-0 w-full h-full">
        <TokyoUniverse3D
          onWeightsChange={handleProximityWeights}
          isPlaying={playbackState === 'playing'}
          layoutMode="clustered"
        />
      </div>

      {/* Header - Fixed at top with transparency */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tokyo Sounds
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                AI-Generated Tokyo Soundscapes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}
                />
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages - Fixed below header */}
      {errorMessage && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-red-500/30 border-b border-red-500 text-red-100 px-6 py-3 backdrop-blur-sm">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
      {infoMessage && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-blue-500/30 border-b border-blue-500 text-blue-100 px-6 py-3 backdrop-blur-sm">
          <p className="text-sm">{infoMessage}</p>
        </div>
      )}

      {/* Left Floating Panel - Location Selector */}
      <div className="fixed left-4 top-20 bottom-4 z-30 w-80 max-w-[calc(100vw-2rem)] md:w-96">
        <div className="h-full bg-black/60 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col">
          <LocationSelector
            locations={TOKYO_LOCATIONS}
            selectedLocations={selectedLocations}
            onLocationSelect={handleLocationSelect}
            onLocationToggle={handleLocationToggle}
          />
        </div>
      </div>

      {/* Right Floating Panel - Active Prompts */}
      <div className="fixed right-4 top-20 bottom-4 z-30 w-80 max-w-[calc(100vw-2rem)] md:w-96">
        <div className="h-full bg-black/60 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col">
          <ActivePrompts prompts={activePrompts} playbackState={playbackState} />
        </div>
      </div>

      {/* Bottom Center Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-black/70 backdrop-blur-md rounded-full border border-purple-500/30 shadow-2xl px-6 py-3">
          <Controls
            playbackState={playbackState}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
}
