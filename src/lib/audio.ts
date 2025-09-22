import { Howl } from "howler";

export interface AudioTrack {
    id: string
    name: string
    url: string
    howl?: Howl
    volume: number
    reverb: number
    pitch: number
    pan: number
}

export class AudioManager {
    private audioContext: AudioContext | null = null;
    private tracks: Map<string, AudioTrack> = new Map();
    private isPlaying = false;
    private startTime = 0;
    private currentTime = 0;
    private duration = 0;

    constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    async loadSound(url: string, name: string): Promise<AudioTrack> {
        return new Promise((resolve, reject) => {
            const howl = new Howl({
                src: [url],
                preload: true,
                onload: () => {
                    const trackDuration = howl.duration();
                    if (trackDuration > this.duration) {
                        this.duration = trackDuration;
                    }
                    const track: AudioTrack = {
                        id: crypto.randomUUID(),
                        name,
                        url,
                        howl,
                        volume: 1,
                        reverb: 0,
                        pitch: 0,
                        pan: 0
                    }

                    howl.volume(track.volume);
                    howl.stereo(track.pan);
                    this.tracks.set(track.id, track);
                    resolve(track);
                },
                onloaderror: (_id: any, err: any) => {
                    reject(new Error(`Failed to load sound: ${err}`));
                }
            })
        })
    }

    play() {
        if (!this.audioContext) return;

        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime - this.currentTime;

        this.tracks.forEach(track => {
            if (track.howl) {
                track.howl.play();
            }
        });
    }

    pause() {
        this.isPlaying = false;
        this.tracks.forEach(track => {
            track.howl?.pause();
        });
    }

    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.tracks.forEach(track => {
            track.howl?.stop();
        })
    }

    setCurrentTime(time: number) {
        this.currentTime = time;
        this.tracks.forEach(track => {
            if (track.howl) {
                track.howl.seek(time);
            }
        });
    }

    getCurrentTime(): number {
        if (this.isPlaying && this.audioContext) {
            return this.audioContext.currentTime - this.startTime;
        }
        return this.currentTime;
    }

    getTracks(): AudioTrack[] {
        return Array.from(this.tracks.values());
    }

    getDuration(): number {
        return this.duration;
    }

    setVolume(volume: number) {
        this.tracks.forEach(track => {
            track.volume = volume;
        })
    }

    setReverb(reverb: number) {
        this.tracks.forEach(track => {
            track.reverb = reverb;
        })
    }

    setPitch(pitch: number) {
        this.tracks.forEach(track => {
            track.pitch = pitch;
        })
    }

    setPan(pan: number) {
        this.tracks.forEach(track => {
            track.pan = pan;
        })
    }

    getVolume(): number {
        const firstTrack = this.tracks.values().next().value;
        return firstTrack?.volume || 0;
    }

    getReverb(): number {
        const firstTrack = this.tracks.values().next().value;
        return firstTrack?.reverb || 0;
    }
    
    getPitch(): number {
        const firstTrack = this.tracks.values().next().value;
        return firstTrack?.pitch || 0;
    }

    getPan(): number {
        const firstTrack = this.tracks.values().next().value;
        return firstTrack?.pan || 0;
    }

    isCurrentlyPlaying(): boolean {
        return this.isPlaying;
    }
}