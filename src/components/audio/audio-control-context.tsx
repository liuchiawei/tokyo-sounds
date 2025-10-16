"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import * as Tone from 'tone';

interface AudioControlContextType {
  playAudio: (url: string) => Promise<void>;
  togglePlayPause: () => void;
  stopAudio: () => void;
  isPlaying: boolean;
  currentAudioUrl: string | null;
}

const AudioControlContext = createContext<AudioControlContextType | undefined>(undefined);

export const AudioControlProvider = ({ children }: { children: ReactNode }) => {
  const playerRef = useRef<Tone.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Tone.js context on first user interaction
    const initializeTone = async () => {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      // Remove event listeners after context is started
      document.documentElement.removeEventListener('mousedown', initializeTone);
      document.documentElement.removeEventListener('touchstart', initializeTone);
    };

    document.documentElement.addEventListener('mousedown', initializeTone);
    document.documentElement.addEventListener('touchstart', initializeTone);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      Tone.Transport.stop(); // Stop transport on unmount
      document.documentElement.removeEventListener('mousedown', initializeTone);
      document.documentElement.removeEventListener('touchstart', initializeTone);
    };
  }, []);

  const playAudio = async (url: string) => {
    await Tone.start(); // Ensure context is started

    if (playerRef.current) {
      playerRef.current.stop(Tone.now()); // Explicitly stop at current time
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const newPlayer = new Tone.Player({
      url: url,
      onstop: () => {
        setIsPlaying(false);
        setCurrentAudioUrl(null);
        Tone.Transport.stop(); // Stop transport when player finishes
      },
    }).toDestination();

    await newPlayer.load(url); // Explicitly load the audio

    playerRef.current = newPlayer; // Assign to ref after successful loading

    // Sync player to transport and start it at the beginning of the transport's timeline
    playerRef.current.sync().start(0);

    // Only start Tone.Transport if it's not already running or paused
    if (Tone.Transport.state !== "started" && Tone.Transport.state !== "paused") {
      Tone.Transport.start();
    }
    setIsPlaying(true);
    setCurrentAudioUrl(url);
  };

  const togglePlayPause = () => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else if (Tone.Transport.state === "paused") {
      Tone.Transport.start();
      setIsPlaying(true);
    } else if (Tone.Transport.state === "stopped" && currentAudioUrl && playerRef.current) {
      // If stopped and there's a current audio, restart it
      playerRef.current.sync().start(0); // Resync and start player from beginning
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (playerRef.current) {
      playerRef.current.stop(); // Stop the individual player
      playerRef.current.dispose(); // Dispose of the player
      playerRef.current = null;
    }
    Tone.Transport.stop(); // Stop the global transport
    setIsPlaying(false);
    setCurrentAudioUrl(null);
  };

  return (
    <AudioControlContext.Provider value={{ playAudio, togglePlayPause, stopAudio, isPlaying, currentAudioUrl }}>
      {children}
    </AudioControlContext.Provider>
  );
};

export const useAudioControl = () => {
  const context = useContext(AudioControlContext);
  if (context === undefined) {
    throw new Error('useAudioControl must be used within an AudioControlProvider');
  }
  return context;
};