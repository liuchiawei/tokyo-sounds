/**
 * Lyria Audio Player
 * Handles real-time playback of PCM16 audio chunks from Lyria API
 */

export class LyriaAudioPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private bufferQueue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private nextStartTime: number = 0;
  private sampleRate: number;
  private volume: number = 0.5;

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
  }

  async init(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.volume;
    this.gainNode.connect(this.audioContext.destination);

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  async addAudioChunk(arrayBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      console.warn("Audio context not initialized");
      return;
    }

    if (this.audioContext.state === "suspended") {
      console.log("AudioContext suspended in addAudioChunk, resuming...");
      await this.audioContext.resume();
    }

    try {
      const pcm16 = new Int16Array(arrayBuffer);
      const float32 = new Float32Array(pcm16.length);

      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = this.audioContext.createBuffer(
        1, // number of channels (mono)
        float32.length,
        this.sampleRate
      );

      audioBuffer.getChannelData(0).set(float32);

      this.bufferQueue.push(audioBuffer);

      if (!this.isPlaying) {
        this.startPlayback();
      }
    } catch (err) {
      console.error("Failed to process audio chunk:", err);
    }
  }

  private startPlayback(): void {
    if (!this.audioContext || !this.gainNode) return;

    this.isPlaying = true;
    this.nextStartTime = this.audioContext.currentTime;

    this.scheduleNextBuffer();
  }

  private scheduleNextBuffer(): void {
    if (!this.audioContext || !this.gainNode || !this.isPlaying) return;

    while (this.bufferQueue.length > 0) {
      const buffer = this.bufferQueue.shift()!;

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode);

      const startTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
      source.start(startTime);

      this.nextStartTime = startTime + buffer.duration;

      source.onended = () => {
        source.disconnect();
      };
    }

    if (this.isPlaying) {
      setTimeout(() => this.scheduleNextBuffer(), 100);
    }
  }

  pause(): void {
    this.isPlaying = false;
    this.bufferQueue = [];
  }

  resume(): void {
    if (!this.audioContext || this.isPlaying) return;
    this.startPlayback();
  }

  stop(): void {
    this.isPlaying = false;
    this.bufferQueue = [];
    this.nextStartTime = 0;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  async dispose(): Promise<void> {
    this.stop();

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }
}
