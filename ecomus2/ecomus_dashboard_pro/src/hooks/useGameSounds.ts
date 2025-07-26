"use client";

import { useCallback } from "react";

// Hook pour les effets sonores gamifiés
export function useGameSounds() {
  // Créer des sons synthétiques via Web Audio API
  const playSound = useCallback((type: "success" | "level-up" | "coin" | "notification" | "click" | "achievement") => {
    if (typeof window === "undefined") return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configuration selon le type de son
      switch (type) {
        case "success":
          // Son de succès : montée harmonique
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Do5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Mi5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // Sol5
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.type = "triangle";
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;

        case "level-up":
          // Son de niveau : fanfare
          oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // Sol4
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.15); // Do5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.3); // Mi5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.45); // Sol5
          oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.6); // Do6
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
          oscillator.type = "square";
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 1);
          break;

        case "coin":
          // Son de pièce : ding métallique
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.type = "sine";
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case "notification":
          // Son de notification : double bip
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.05);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
          oscillator.type = "sine";
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.25);
          break;

        case "click":
          // Son de clic : pop subtil
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.type = "triangle";
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;

        case "achievement":
          // Son d'achievement : mélodie triomphante
          const notes = [523.25, 659.25, 783.99, 1046.5]; // Do5, Mi5, Sol5, Do6
          notes.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
            gain.gain.setValueAtTime(0.3, audioContext.currentTime + index * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.4);
            osc.type = "triangle";
            osc.start(audioContext.currentTime + index * 0.15);
            osc.stop(audioContext.currentTime + index * 0.15 + 0.4);
          });
          return; // Pas besoin de start/stop pour l'oscillateur principal
      }
    } catch (error) {
      console.log("Audio non supporté:", error);
    }
  }, []);

  // Effets sonores spécifiques
  const playCoinSound = useCallback(() => playSound("coin"), [playSound]);
  const playSuccessSound = useCallback(() => playSound("success"), [playSound]);
  const playLevelUpSound = useCallback(() => playSound("level-up"), [playSound]);
  const playNotificationSound = useCallback(() => playSound("notification"), [playSound]);
  const playClickSound = useCallback(() => playSound("click"), [playSound]);
  const playAchievementSound = useCallback(() => playSound("achievement"), [playSound]);

  return {
    playSound,
    playCoinSound,
    playSuccessSound,
    playLevelUpSound,
    playNotificationSound,
    playClickSound,
    playAchievementSound,
  };
}

// Hook pour la vibration (mobile)
export function useGameHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightVibration = useCallback(() => vibrate(50), [vibrate]);
  const mediumVibration = useCallback(() => vibrate(100), [vibrate]);
  const strongVibration = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const successVibration = useCallback(() => vibrate([50, 30, 50, 30, 100]), [vibrate]);

  return {
    vibrate,
    lightVibration,    mediumVibration,
    strongVibration,
    successVibration,
  };
}
