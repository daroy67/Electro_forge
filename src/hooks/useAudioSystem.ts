import { useState, useCallback, useEffect, useRef } from "react";
import { soundEffects } from "../utils/audioEffects";

// Extended Web Audio Sound Synthesizer
class CentralSoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      this.isMuted = localStorage.getItem("electroforge_sfx_muted") === "true";
    } catch {
      this.isMuted = false;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem("electroforge_sfx_muted", String(muted));
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined" || this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Mechanical switch click (toggle switch / circuit breaker - soft and subtle)
  playSwitchClick(isOn: boolean = true) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(isOn ? 850 : 700, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.018);
    } catch {}
  }

  // 2. Multimeter continuity beep (standard 2.4 kHz piezo buzzer)
  playMultimeterBeep(durationMs = 120) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(2400, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime + durationMs / 1000 - 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {}
  }

  // 3. Gentle component alert (soft, muted; NO loud crackle or harsh noise)
  playLedExplosion() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.045);
    } catch {}
  }

  // 4. Short-circuit electrical hazard alert (gentle, warm low alert tone; no harsh grating buzz)
  playShortCircuitBuzz() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.085);
    } catch {}
  }

  // 5. Mission victory / challenge triumph fanfare
  playTriumphFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const chords = [
        { freqs: [523.25, 659.25], time: 0.0, dur: 0.12 }, // C5 + E5
        { freqs: [659.25, 783.99], time: 0.13, dur: 0.12 }, // E5 + G5
        { freqs: [783.99, 1046.5], time: 0.26, dur: 0.15 }, // G5 + C6
        { freqs: [1046.5, 1318.5, 1567.98], time: 0.44, dur: 0.45 }, // Full C6 Major chord triumph!
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + chord.time);

          gain.gain.setValueAtTime(0.12, ctx.currentTime + chord.time);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + chord.time + chord.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + chord.time);
          osc.stop(ctx.currentTime + chord.time + chord.dur + 0.05);
        });
      });
    } catch {}
  }

  // 6. Experience (XP) & coins reward chime
  playXpGain() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [880, 1174, 1480]; // A5 -> D6 -> F#6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.26);
      });
    } catch {}
  }

  // 7. Wire snap
  playWireSnap() {
    if (this.isMuted) return;
    soundEffects.playWireSnap();
  }

  // 8. Wire disconnect
  playWireDisconnect() {
    if (this.isMuted) return;
    soundEffects.playWireDisconnect();
  }

  // 9. Component mount
  playComponentMount() {
    if (this.isMuted) return;
    soundEffects.playComponentMount();
  }

  // 10. Component pop / delete
  playComponentPop() {
    if (this.isMuted) return;
    soundEffects.playComponentPop();
  }
}

export const centralAudio = new CentralSoundEffectsEngine();

export function useAudioSystem() {
  const [isMuted, setIsMutedState] = useState<boolean>(() => centralAudio.getMuted());

  const setMuted = useCallback((muted: boolean) => {
    centralAudio.setMuted(muted);
    setIsMutedState(muted);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !centralAudio.getMuted();
    centralAudio.setMuted(next);
    setIsMutedState(next);
  }, []);

  return {
    isMuted,
    setMuted,
    toggleMute,
    playSwitchClick: useCallback((isOn?: boolean) => centralAudio.playSwitchClick(isOn), []),
    playMultimeterBeep: useCallback((dur?: number) => centralAudio.playMultimeterBeep(dur), []),
    playLedExplosion: useCallback(() => centralAudio.playLedExplosion(), []),
    playShortCircuitBuzz: useCallback(() => centralAudio.playShortCircuitBuzz(), []),
    playTriumphFanfare: useCallback(() => centralAudio.playTriumphFanfare(), []),
    playXpGain: useCallback(() => centralAudio.playXpGain(), []),
    playWireSnap: useCallback(() => centralAudio.playWireSnap(), []),
    playWireDisconnect: useCallback(() => centralAudio.playWireDisconnect(), []),
    playComponentMount: useCallback(() => centralAudio.playComponentMount(), []),
    playComponentPop: useCallback(() => centralAudio.playComponentPop(), []),
  };
}
