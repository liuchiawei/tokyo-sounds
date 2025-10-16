"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import * as Tone from 'tone';

interface AudioControlContextType {
  playAudio: (url: string) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => void;
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
    console.log("playAudio: Starting new track", url);
    await Tone.start(); // Ensure context is started

    // Stop and dispose of the old player if it exists
    if (playerRef.current) {
      console.log("playAudio: Disposing previous player.");
      playerRef.current.stop(Tone.now());
      playerRef.current.dispose();
      playerRef.current = null;
    }
    
    // Clear any previously scheduled events to avoid duplicates
    Tone.Transport.cancel(); 
    console.log("playAudio: Cleared previous transport schedule.");

    // Create a new player without the problematic onstop event
    const newPlayer = new Tone.Player({
      url: url,
    }).toDestination();

    console.log("playAudio: Loading new player...");
    await newPlayer.load(url); // Explicitly load the audio
    console.log("playAudio: Player loaded.");

    playerRef.current = newPlayer; // Assign to ref after successful loading

    // Get the duration of the loaded audio
    const duration = newPlayer.buffer.duration;
    console.log(`playAudio: Audio duration is ${duration} seconds.`);

    // Schedule a one-time event to stop the transport when the audio finishes
    Tone.Transport.scheduleOnce((time) => {
      console.log("Transport scheduleOnce: Audio finished at", time);
      console.log("Transport scheduleOnce: Stopping transport.");
      Tone.Transport.stop();
      setIsPlaying(false);
      setCurrentAudioUrl(null);
    }, duration);
    console.log(`playAudio: Scheduled transport stop at ${duration} seconds.`);

    // Sync player to transport and start it at the beginning of the transport's timeline
    playerRef.current.sync().start(0);

    // Only start Tone.Transport if it's not already running or paused
    if (Tone.Transport.state !== "started" && Tone.Transport.state !== "paused") {
      console.log("playAudio: Starting transport.");
      Tone.Transport.start();
    }
    setIsPlaying(true);
    setCurrentAudioUrl(url);
  };

  const pauseAudio = () => {
    if (Tone.Transport.state === "started") {
      console.log("AudioContext: Pausing audio");
      Tone.Transport.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (Tone.Transport.state === "paused") {
      console.log("AudioContext: Resuming audio");
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
    <AudioControlContext.Provider value={{ playAudio, pauseAudio, resumeAudio, stopAudio, isPlaying, currentAudioUrl }}>
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