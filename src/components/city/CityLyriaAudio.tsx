"use client";

/**
 * CityLyriaAudio Component
 * Single Lyria session that blends 4 plate prompts based on camera proximity
 */

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const CROSSFADE_MS = 5;

interface PlatePrompt {
  id: string;
  prompt: string;
  position: THREE.Vector3;
}

export interface PlateDebugInfo {
  name: string;
  weight: number;
  distance: number;
}

interface CityLyriaAudioProps {
  apiKey: string;
  enabled?: boolean;
  volume?: number;
  platePositions: [number, number, number][];
  onStatusUpdate?: (status: string) => void;
  onDebugUpdate?: (plates: PlateDebugInfo[]) => void;
}

const PLATE_PROMPTS = [
  // Shinjuku - Neon nightlife, Kabukicho energy, bustling station
  "Pulsing electronic beats, neon-soaked synths, late night Tokyo energy, Shinjuku nightlife vibes, dense urban soundscape with distant train announcements",
  // Shibuya - Youth culture, fashion, iconic crossing
  "Trendy J-pop influenced electronic, upbeat and youthful, Shibuya crossing energy, fashion district vibes, bright and colorful synth melodies",
  // Chiyoda - Imperial palace area, refined and serene
  "Elegant ambient music, traditional Japanese instruments blended with soft electronics, peaceful and contemplative, imperial garden serenity, refined Tokyo atmosphere",
  // Ikebukuro - Anime culture, arcades, urban edge
  "Energetic arcade game inspired music, anime soundtrack vibes, playful chiptune elements, otaku culture energy, Ikebukuro night adventure",
];

const PLATE_NAMES = ["Shinjuku", "Shibuya", "Chiyoda", "Ikebukuro"];

export function CityLyriaAudio({
  apiKey,
  enabled = true,
  volume = 0.5,
  platePositions,
  onStatusUpdate,
  onDebugUpdate,
}: CityLyriaAudioProps) {
  const { camera } = useThree();
  const [status, setStatus] = useState<string>("Initializing...");

  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
    onStatusUpdate?.(newStatus);
  };

  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef<number>(0);
  const initStartedRef = useRef(false);

  const previousWeightsRef = useRef<number[]>([0.25, 0.25, 0.25, 0.25]);
  const lastUpdateTimeRef = useRef<number>(0);
  const smoothedWeightsRef = useRef<number[]>([0.25, 0.25, 0.25, 0.25]);
  const isMountedRef = useRef(false);
  const instanceIdRef = useRef(0);

  const plates = useRef<PlatePrompt[]>(
    platePositions.map((pos, i) => ({
      id: `plate_${i}`,
      prompt: PLATE_PROMPTS[i],
      position: new THREE.Vector3(pos[0], pos[1], pos[2]),
    }))
  );

  const calculatePlateWeights = (cameraPos: THREE.Vector3): { weights: number[]; distances: number[] } => {
    const weights: number[] = [];
    const distances: number[] = [];

    for (const plate of plates.current) {
      const dist = cameraPos.distanceTo(plate.position);
      distances.push(dist);
    }

    const minDist = 50;
    const maxDist = 600;

    let totalWeight = 0;
    for (const dist of distances) {
      let weight = 0;
      if (dist < minDist) {
        weight = 1.0;
      } else if (dist < maxDist) {
        const t = (dist - minDist) / (maxDist - minDist);
        weight = Math.pow(1 - t, 2);
      }
      weights.push(weight);
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      for (let i = 0; i < weights.length; i++) {
        weights[i] = weights[i] / totalWeight;
      }
    } else {
      for (let i = 0; i < weights.length; i++) {
        weights[i] = 0.25;
      }
    }

    return { weights, distances };
  };

  const smoothWeights = (current: number[], target: number[], smoothing: number): number[] => {
    return current.map((c, i) => c + (target[i] - c) * smoothing);
  };

  const hasSignificantChange = (prev: number[], curr: number[], threshold: number = 0.05): boolean => {
    for (let i = 0; i < prev.length; i++) {
      if (Math.abs(prev[i] - curr[i]) > threshold) {
        return true;
      }
    }
    return false;
  };

  const playNextBuffer = () => {
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state === 'closed') return;

    if (nextStartTimeRef.current === 0) {
      nextStartTimeRef.current = audioContext.currentTime;
    }

    while (audioQueueRef.current.length > 0) {
      if (audioContext.state === 'interrupted') return;

      const buffer = audioQueueRef.current.shift()!;

      try {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = audioContext.createGain();

        const now = audioContext.currentTime;
        const startTime = Math.max(now + 0.05, nextStartTimeRef.current);

        const fade = CROSSFADE_MS / 1000;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + fade);
        const fadeOutStart = Math.max(startTime, startTime + buffer.duration - fade);
        gainNode.gain.setValueAtTime(volume, fadeOutStart);
        gainNode.gain.linearRampToValueAtTime(0, startTime + buffer.duration);

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start(startTime);
        source.onended = () => {
          if (audioQueueRef.current.length > 0 && audioContextRef.current?.state !== 'closed') {
            playNextBuffer();
          } else {
            isPlayingRef.current = false;
          }
        };

        nextStartTimeRef.current = startTime + buffer.duration - (CROSSFADE_MS / 1000);
        isPlayingRef.current = true;

        if (nextStartTimeRef.current - now > 0.5) {
          break;
        }
      } catch (err) {
        console.warn("[CityLyria] Error playing buffer:", err);
        break;
      }
    }

    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
    }
  };

  const initializeLyriaSession = async () => {
    if (!apiKey || initStartedRef.current || !isMountedRef.current) return;
    initStartedRef.current = true;

    try {
      updateStatus("Connecting to Lyria...");

      if (!isMountedRef.current) return;

      const audioContext = new AudioContext({ sampleRate: 48000 });

      if (!isMountedRef.current) {
        audioContext.close();
        return;
      }

      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!isMountedRef.current) {
        audioContext.close();
        return;
      }

      const { GoogleGenAI } = await import("@google/genai");

      if (!isMountedRef.current) {
        audioContext.close();
        return;
      }

      const client = new GoogleGenAI({
        apiKey,
        apiVersion: "v1alpha",
      });

      const session = await client.live.music.connect({
        model: "models/lyria-realtime-exp",
        callbacks: {
          onmessage: (message: any) => {
            if (!isMountedRef.current) return;

            if (message.serverContent?.audioChunks) {
              const ctx = audioContextRef.current;
              if (!ctx || ctx.state === 'closed') {
                return;
              }

              for (const chunk of message.serverContent.audioChunks) {
                if (chunk.data) {
                  try {
                    const binaryString = atob(chunk.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }

                    const pcm16 = new Int16Array(bytes.buffer);
                    const numChannels = 2;
                    const numFrames = pcm16.length / numChannels;

                    const audioBuffer = ctx.createBuffer(
                      numChannels,
                      numFrames,
                      chunk.sampleRate ?? 48000
                    );

                    const leftChannel = audioBuffer.getChannelData(0);
                    const rightChannel = audioBuffer.getChannelData(1);

                    for (let i = 0; i < numFrames; i++) {
                      leftChannel[i] = pcm16[i * 2] / 32768.0;
                      rightChannel[i] = pcm16[i * 2 + 1] / 32768.0;
                    }

                    audioQueueRef.current.push(audioBuffer);

                    if (!isPlayingRef.current) {
                      playNextBuffer();
                    }
                  } catch (err) {
                    console.error("[CityLyria] Error processing audio:", err);
                  }
                }
              }
            }
          },
          onerror: (err: any) => {
            console.error("[CityLyria] Lyria error:", err);
            updateStatus("Error: " + (err?.message || "Unknown"));
            initStartedRef.current = false;
          },
          onclose: (event: any) => {
            const reason = event?.reason || 'Unknown';
            console.warn(`[CityLyria] Connection closed: ${reason}`);
            updateStatus("Disconnected");
            initStartedRef.current = false;
          },
        },
      });

      if (!isMountedRef.current) {
        session.stop();
        audioContext.close();
        return;
      }

      sessionRef.current = session;

      await session.setMusicGenerationConfig({
        musicGenerationConfig: {
          bpm: 120,
          temperature: 1.1,
          guidance: 4.0,
        },
      });

      const initialPrompts = plates.current.map((plate) => ({
        text: plate.prompt,
        weight: 0.25,
      }));

      await session.setWeightedPrompts({
        weightedPrompts: initialPrompts,
      });

      await session.play();
      updateStatus("Playing");
      console.log("[CityLyria] Started with blended prompts from 4 plates");
    } catch (err) {
      console.error("[CityLyria] Failed to initialize:", err);
      updateStatus("Failed to connect");
      initStartedRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    const currentInstance = ++instanceIdRef.current;

    if (enabled && apiKey) {
      setTimeout(() => {
        if (isMountedRef.current && currentInstance === instanceIdRef.current) {
          initializeLyriaSession();
        }
      }, 50);
    }

    return () => {
      isMountedRef.current = false;
      const sessionToStop = sessionRef.current;
      const contextToClose = audioContextRef.current;

      sessionRef.current = null;
      audioContextRef.current = null;
      initStartedRef.current = false;

      setTimeout(() => {
        if (sessionToStop) {
          try {
            sessionToStop.stop();
          } catch (e) { }
        }
        if (contextToClose && contextToClose.state !== 'closed') {
          contextToClose.close();
        }
      }, 200);
    };
  }, [enabled, apiKey]);

  const lastDistancesRef = useRef<number[]>([0, 0, 0, 0]);

  useFrame(() => {
    const cameraPos = new THREE.Vector3();
    camera.getWorldPosition(cameraPos);

    const { weights: targetWeights, distances } = calculatePlateWeights(cameraPos);
    lastDistancesRef.current = distances;

    smoothedWeightsRef.current = smoothWeights(smoothedWeightsRef.current, targetWeights, 0.15);

    if (onDebugUpdate) {
      const debugInfo: PlateDebugInfo[] = PLATE_NAMES.map((name, i) => ({
        name,
        weight: smoothedWeightsRef.current[i],
        distance: distances[i],
      }));
      onDebugUpdate(debugInfo);
    }

    if (!sessionRef.current || !enabled) return;

    const now = performance.now();

    if (now - lastUpdateTimeRef.current < 500) return;
    lastUpdateTimeRef.current = now;

    if (hasSignificantChange(previousWeightsRef.current, smoothedWeightsRef.current, 0.03)) {
      previousWeightsRef.current = [...smoothedWeightsRef.current];

      const weightedPrompts = plates.current.map((plate, i) => ({
        text: plate.prompt,
        weight: Math.max(0.01, smoothedWeightsRef.current[i]),
      }));

      try {
        sessionRef.current.setWeightedPrompts({
          weightedPrompts,
        });
      } catch (err) {
        console.warn("[CityLyria] Failed to update prompts:", err);
      }
    }
  });

  return null;
}

