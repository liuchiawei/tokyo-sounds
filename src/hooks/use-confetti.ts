import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  score: number;
}

export const useConfetti = () => {
  const confettiRef = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      confettiRef.current = confetti;
    }
  }, []);

  const triggerConfetti = ({ score }: ConfettiOptions) => {
    if (!confettiRef.current) return;

    // Determine confetti configuration based on score
    if (score >= 100) {
      // School Pride effect for perfect score (100) - Confetti cannons from both sides
      confettiRef.current({
        particleCount: 150,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#eab308', '#facc15', '#fef08a'], // Yellow/gold tones for "Tokyo Sound Master" badge
        shapes: ['circle', 'square', 'star']
      });
      
      confettiRef.current({
        particleCount: 150,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#eab308', '#facc15', '#fef08a'], // Yellow/gold tones for "Tokyo Sound Master" badge
        shapes: ['circle', 'square', 'star']
      });
      
      // Additional bursts for extra celebration
      setTimeout(() => {
        confettiRef.current!({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#eab308', '#facc15', '#fef08a'],
          shapes: ['star']
        });
      }, 200);
      
      setTimeout(() => {
        confettiRef.current!({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#eab308', '#facc15', '#fef08a'],
          shapes: ['circle']
        });
      }, 400);
      
      setTimeout(() => {
        confettiRef.current!({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#eab308', '#facc15', '#fef08a'],
          shapes: ['circle']
        });
      }, 600);
    } else if (score >= 90) {
      // Stars effect for very high scores (90-99)
      confettiRef.current({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24'], // Amber tones for "Sound Seeker" badge
        shapes: ['star']
      });
      
      // Additional bursts
      setTimeout(() => {
        confettiRef.current!({
          particleCount: 60,
          angle: 60,
          spread: 70,
          origin: { x: 0 },
          colors: ['#f59e0b', '#fbbf24'],
          shapes: ['star', 'circle']
        });
      }, 150);
      
      setTimeout(() => {
        confettiRef.current!({
          particleCount: 60,
          angle: 120,
          spread: 70,
          origin: { x: 1 },
          colors: ['#f59e0b', '#fbbf24'],
          shapes: ['star', 'circle']
        });
      }, 300);
    } else if (score >= 76) {
      // Fireworks effect for high scores (76-89)
      confettiRef.current({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#d946ef'], // Indigo tones for "Urban Navigator" badge
        shapes: ['circle', 'square', 'star']
      });
      
      // Additional burst
      setTimeout(() => {
        confettiRef.current!({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#8b5cf6', '#d946ef']
        });
      }, 150);
      
      setTimeout(() => {
        confettiRef.current!({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#8b5cf6', '#d946ef']
        });
      }, 300);
    } else if (score >= 51) {
      // More elaborate for good scores (51-75)
      confettiRef.current({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399'], // Green tones for "Metro Explorer" badge
        shapes: ['circle', 'square', 'star']
      });
    } else if (score >= 26) {
      // Slightly more elaborate for medium scores (26-50)
      confettiRef.current({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa'], // Blue tones for "City Hopper" badge
        shapes: ['circle', 'square']
      });
    } else {
      // Simple confetti for lower scores (0-25)
      confettiRef.current({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#94a3b8'], // Grey tones for "Station Commuter" badge
        shapes: ['circle', 'square']
      });
    }
  };

  return { triggerConfetti };
};