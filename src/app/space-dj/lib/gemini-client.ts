/**
 * Gemini Live Music API client for Tokyo Sounds
 * Handles real-time audio streaming and prompt management
 */

import {
  GoogleGenAI,
  MusicGenerationMode,
  type LiveMusicServerMessage,
  type LiveMusicSession,
} from '@google/genai';
import { decode, decodeAudioData } from './audio-utils';
import { AudioCrossfadeManager, type AudioTrack } from './audio-crossfade';

export interface TokyoPrompt {
  text: string;
  weight: number;
}

export type PlaybackState = 'stopped' | 'playing' | 'loading' | 'paused';

export interface GeminiClientCallbacks {
  onSetupComplete?: () => void;
  onAudioChunk?: (audioBuffer: AudioBuffer) => void;
  onFilteredPrompt?: (text: string, reason: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onPlaybackStateChange?: (state: PlaybackState) => void;
}

export class TokyoSoundsGeminiClient {
  private session: LiveMusicSession | null = null;
  private audioContext: AudioContext;
  private outputNode: GainNode;
  private nextStartTime = 0;
  private readonly bufferTime = 2; // seconds
  private readonly sampleRate = 48000;
  private callbacks: GeminiClientCallbacks;
  private isConnecting = false;
  private connectionError = false;
  public playbackState: PlaybackState = 'stopped';
  private filteredPrompts = new Set<string>();

  // Audio crossfade and buffering
  private crossfadeManager: AudioCrossfadeManager;
  private currentTrack: AudioTrack | null = null;
  private isTransitioning = false;
  private audioCache: Map<string, AudioBuffer[]> = new Map(); // Cache audio buffers by prompt combination
  private pendingPromptsUpdate: TokyoPrompt[] | null = null;

  constructor(callbacks: GeminiClientCallbacks = {}) {
    this.callbacks = callbacks;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });
    this.outputNode = this.audioContext.createGain();
    this.outputNode.connect(this.audioContext.destination);

    // Initialize crossfade manager with 2-second crossfade
    this.crossfadeManager = new AudioCrossfadeManager(this.audioContext, 2.0);

    // Create initial track
    this.currentTrack = this.crossfadeManager.createTrack();
  }

  /**
   * Connect to Gemini Live Music API
   */
  async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log('Already connecting...');
      return;
    }

    this.isConnecting = true;
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1alpha',
    });

    let resolveConnectedPromise: () => void;
    const connectedPromise = new Promise<void>((resolve) => {
      resolveConnectedPromise = resolve;
    }).then(() => {
      this.isConnecting = false;
    });

    const handleError = (error?: Error) => {
      this.connectionError = true;
      this.stopAudio();
      this.callbacks.onError?.(error || new Error('Connection error'));
      resolveConnectedPromise();
    };

    try {
      this.session = await ai.live.music.connect({
        model: 'lyria-realtime-exp',
        callbacks: {
          onmessage: async (message: LiveMusicServerMessage) => {
            if (message.setupComplete) {
              console.log('Tokyo Sounds connected to Gemini');
              this.connectionError = false;
              this.callbacks.onSetupComplete?.();
              resolveConnectedPromise();
            }

            if (message.filteredPrompt) {
              this.filteredPrompts.add(message.filteredPrompt.text);
              this.callbacks.onFilteredPrompt?.(
                message.filteredPrompt.text,
                message.filteredPrompt.filteredReason
              );
            }

            if (message.serverContent?.audioChunks !== undefined) {
              if (this.playbackState === 'paused' || this.playbackState === 'stopped') {
                return;
              }

              try {
                const audioBuffer = await this.decodePCMAudioData(
                  message.serverContent.audioChunks[0].data
                );

                await this.playAudioBuffer(audioBuffer);
                this.callbacks.onAudioChunk?.(audioBuffer);
              } catch (error) {
                console.error('Error decoding PCM audio:', error);
                this.callbacks.onError?.(error as Error);
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            console.warn('Gemini error:', e);
            handleError(new Error(e.message));
          },
          onclose: (e: CloseEvent) => {
            console.warn('Gemini connection closed:', e);
            this.callbacks.onClose?.();
            handleError(new Error('Connection closed'));
          },
        },
      });

      // Configure for ambient soundscapes (no vocals)
      await this.session.setMusicGenerationConfig({
        musicGenerationConfig: {
          musicGenerationMode: MusicGenerationMode.QUALITY,
        },
      });
    } catch (error) {
      handleError(error as Error);
      throw error;
    }

    return connectedPromise;
  }

  /**
   * Set Tokyo location prompts with weights (optimized with buffering)
   */
  async setTokyoPrompts(prompts: TokyoPrompt[]): Promise<void> {
    if (!this.session) {
      throw new Error('Session not connected. Call connect() first.');
    }

    // Filter out prompts that were previously filtered and have zero weight
    const validPrompts = prompts.filter(
      (p) => !this.filteredPrompts.has(p.text) && p.weight > 0
    );

    if (validPrompts.length === 0) {
      console.warn('No valid prompts to send');
      return;
    }

    // If currently transitioning, queue the update
    if (this.isTransitioning) {
      console.log('Currently transitioning, queuing prompts update');
      this.pendingPromptsUpdate = validPrompts;
      return;
    }

    // Check if prompts are significantly different
    const promptKey = this.getPromptKey(validPrompts);
    const cachedAudio = this.audioCache.get(promptKey);

    if (cachedAudio && cachedAudio.length > 0) {
      console.log('Using cached audio for prompts');
      // Use cached audio with smooth transition
      await this.transitionToNewAudio();
    }

    try {
      // Start transition
      this.isTransitioning = true;

      // Send new prompts to API
      await this.session.setWeightedPrompts({
        weightedPrompts: validPrompts,
      });
      console.log('Set prompts:', validPrompts);

      // Wait for new audio to arrive and buffer
      // The transition will complete when new audio chunks are received

    } catch (error) {
      console.error('Error setting prompts:', error);
      this.callbacks.onError?.(error as Error);
      this.isTransitioning = false;
      throw error;
    }
  }

  /**
   * Generate cache key from prompts
   */
  private getPromptKey(prompts: TokyoPrompt[]): string {
    return prompts
      .map((p) => `${p.text}:${p.weight.toFixed(2)}`)
      .sort()
      .join('|');
  }

  /**
   * Transition to new audio stream smoothly
   */
  private async transitionToNewAudio(): Promise<void> {
    // Create new track for upcoming audio
    const newTrack = this.crossfadeManager.createTrack();

    // Start crossfade
    await this.crossfadeManager.crossfadeTo(newTrack);

    // Update current track reference
    this.currentTrack = newTrack;

    // Mark transition complete
    this.isTransitioning = false;

    // Process pending updates if any
    if (this.pendingPromptsUpdate) {
      const pending = this.pendingPromptsUpdate;
      this.pendingPromptsUpdate = null;
      await this.setTokyoPrompts(pending);
    }
  }

  /**
   * Toggle vocals on/off
   */
  async setVocalsEnabled(enabled: boolean): Promise<void> {
    if (!this.session) {
      throw new Error('Session not connected');
    }

    await this.session.setMusicGenerationConfig({
      musicGenerationConfig: {
        musicGenerationMode: enabled
          ? MusicGenerationMode.VOCALIZATION
          : MusicGenerationMode.QUALITY,
      },
    });
  }

  /**
   * Start playing audio
   */
  async play(): Promise<void> {
    if (!this.session) {
      throw new Error('Session not connected');
    }

    if (this.connectionError) {
      await this.connect();
    }

    console.log('Starting playback');
    await this.audioContext.resume();
    this.session.play();
    this.setPlaybackState('loading');
    this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
  }

  /**
   * Pause audio playback
   */
  pause(): void {
    if (!this.session) return;

    console.log('Pausing playback');
    this.session.pause();
    this.setPlaybackState('paused');

    // Fade out
    this.outputNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.outputNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + 0.1
    );

    this.nextStartTime = 0;

    // Create new output node for next play
    this.outputNode = this.audioContext.createGain();
    this.outputNode.connect(this.audioContext.destination);
  }

  /**
   * Stop audio and reset
   */
  stopAudio(): void {
    if (!this.session) return;

    console.log('Stopping audio');
    this.session.stop();
    this.setPlaybackState('stopped');

    this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.nextStartTime = 0;
  }

  /**
   * Reset context and restart
   */
  async reset(): Promise<void> {
    if (!this.session) return;

    if (this.connectionError) {
      await this.connect();
    } else {
      this.pause();
      this.session.resetContext();
    }

    await this.play();
  }

  /**
   * Decode base64 PCM audio data to AudioBuffer
   * Gemini returns raw PCM data, not compressed audio formats
   */
  private async decodePCMAudioData(base64Data: string): Promise<AudioBuffer> {
    // Decode base64 to Uint8Array
    const pcmData = decode(base64Data);

    // Decode PCM data to AudioBuffer
    // Gemini uses 48kHz sample rate and 2 channels (stereo)
    return await decodeAudioData(
      pcmData,
      this.audioContext,
      this.sampleRate, // 48000
      2 // stereo
    );
  }

  /**
   * Play audio buffer with timing management
   */
  private async playAudioBuffer(audioBuffer: AudioBuffer): Promise<void> {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputNode);

    // Initialize start time on first chunk
    if (this.nextStartTime === 0) {
      this.nextStartTime = this.audioContext.currentTime + this.bufferTime;
      this.outputNode.gain.setValueAtTime(0, this.nextStartTime);
      this.outputNode.gain.linearRampToValueAtTime(1, this.nextStartTime + 0.75);

      // Update state after buffer time
      setTimeout(() => {
        this.setPlaybackState('playing');
      }, this.bufferTime * 1000);
    }

    // Check for underrun
    if (this.nextStartTime < this.audioContext.currentTime) {
      console.warn('Audio underrun - buffering');
      this.setPlaybackState('loading');
      this.nextStartTime = 0;
      return;
    }

    // Schedule audio playback
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  /**
   * Update playback state
   */
  private setPlaybackState(state: PlaybackState): void {
    this.playbackState = state;
    this.callbacks.onPlaybackStateChange?.(state);
  }

  /**
   * Get current audio context time
   */
  getCurrentTime(): number {
    return this.audioContext.currentTime;
  }

  /**
   * Get filtered prompts
   */
  getFilteredPrompts(): Set<string> {
    return new Set(this.filteredPrompts);
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.session !== null && !this.connectionError;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAudio();
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.session = null;
  }
}
