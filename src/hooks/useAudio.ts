'use client';

import { useState, useRef, useEffect } from "react";
import { AudioManager, AudioTrack } from "@/lib/audio";

export function useAudio() {
    const audManagerRef = useRef<AudioManager>(new AudioManager());
    const [tracks, setTracks] = useState<AudioTrack[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const tracks = audManagerRef.current.getTracks();
        return () => {
            audManagerRef.current?.stop();
        }
    }, []);

    const loadSound = async (url: string, name: string) => {
        if (!audManagerRef.current) return null;
        
        try {
            const track = await audManagerRef.current.loadSound(url, name);
            setTracks(prev => [...prev, track]);
            return track;
        } catch (err) {
            console.error('Failed to load sound:', err);
            throw err;
        }
    }

    const play = () => {
        if (!audManagerRef.current) return;
        audManagerRef.current.play();
        setIsPlaying(true);
    }

    const pause = () => {
        if (!audManagerRef.current) return;
        audManagerRef.current.pause();
        setIsPlaying(false);
    }

    const stop = () => {
        if (!audManagerRef.current) return;
        audManagerRef.current.stop();
        setIsPlaying(false);
    }

    useEffect(() => {
        if (!isPlaying || !audManagerRef.current) return;

        const interval = setInterval(() => {
            const time = audManagerRef.current.getCurrentTime() || 0;
            setCurrentTime(time);
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return {
        tracks,
        isPlaying,
        currentTime,
        duration,
        loadSound,
        play,
        pause,
        stop
    };
}