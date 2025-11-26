/**
 * Audio Crossfade Manager for Tokyo Sounds
 * Handles smooth transitions between audio streams
 */

export interface AudioTrack {
  gainNode: GainNode;
  isPlaying: boolean;
  fadeState: 'in' | 'out' | 'stable' | 'idle';
}

export class AudioCrossfadeManager {
  private audioContext: AudioContext;
  private currentTrack: AudioTrack | null = null;
  private nextTrack: AudioTrack | null = null;
  private crossfadeDuration: number; // seconds
  private masterGain: GainNode;

  constructor(audioContext: AudioContext, crossfadeDuration: number = 2.0) {
    this.audioContext = audioContext;
    this.crossfadeDuration = crossfadeDuration;

    // Create master gain node
    this.masterGain = audioContext.createGain();
    this.masterGain.connect(audioContext.destination);
  }

  /**
   * Create a new audio track with its own gain node
   */
  createTrack(): AudioTrack {
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0; // Start silent
    gainNode.connect(this.masterGain);

    return {
      gainNode,
      isPlaying: false,
      fadeState: 'idle',
    };
  }

  /**
   * Start crossfade to a new track
   */
  crossfadeTo(newTrack: AudioTrack): Promise<void> {
    return new Promise((resolve) => {
      const now = this.audioContext.currentTime;

      // If there's a current track, fade it out
      if (this.currentTrack && this.currentTrack.isPlaying) {
        this.fadeOut(this.currentTrack, now);
      }

      // Fade in the new track
      this.fadeIn(newTrack, now);

      // Move next track to current
      this.nextTrack = this.currentTrack;
      this.currentTrack = newTrack;

      // Resolve after crossfade completes
      setTimeout(() => {
        // Clean up old track
        if (this.nextTrack) {
          this.nextTrack.isPlaying = false;
          this.nextTrack.fadeState = 'idle';
          this.nextTrack.gainNode.gain.value = 0;
        }
        resolve();
      }, this.crossfadeDuration * 1000);
    });
  }

  /**
   * Fade in a track
   */
  private fadeIn(track: AudioTrack, startTime: number) {
    track.isPlaying = true;
    track.fadeState = 'in';

    const gainNode = track.gainNode;
    gainNode.gain.cancelScheduledValues(startTime);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(
      1.0,
      startTime + this.crossfadeDuration
    );

    // Mark as stable after fade completes
    setTimeout(() => {
      track.fadeState = 'stable';
    }, this.crossfadeDuration * 1000);
  }

  /**
   * Fade out a track
   */
  private fadeOut(track: AudioTrack, startTime: number) {
    track.fadeState = 'out';

    const gainNode = track.gainNode;
    gainNode.gain.cancelScheduledValues(startTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, startTime);
    gainNode.gain.linearRampToValueAtTime(
      0,
      startTime + this.crossfadeDuration
    );
  }

  /**
   * Instant switch to a track (no crossfade)
   */
  switchTo(newTrack: AudioTrack) {
    // Stop current track
    if (this.currentTrack) {
      this.currentTrack.gainNode.gain.value = 0;
      this.currentTrack.isPlaying = false;
      this.currentTrack.fadeState = 'idle';
    }

    // Start new track
    newTrack.gainNode.gain.value = 1.0;
    newTrack.isPlaying = true;
    newTrack.fadeState = 'stable';

    this.currentTrack = newTrack;
  }

  /**
   * Get current track
   */
  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  /**
   * Check if currently crossfading
   */
  isCrossfading(): boolean {
    return (
      (this.currentTrack?.fadeState === 'in' ||
        this.currentTrack?.fadeState === 'out') ||
      (this.nextTrack?.fadeState === 'in' ||
        this.nextTrack?.fadeState === 'out')
    );
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.currentTrack) {
      this.currentTrack.gainNode.disconnect();
    }
    if (this.nextTrack) {
      this.nextTrack.gainNode.disconnect();
    }
    this.masterGain.disconnect();
  }
}
