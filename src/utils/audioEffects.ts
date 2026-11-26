// Zero-dependency Web Audio synthesizer for tactile UI sounds, drone motors, DC gearmotors, and multimeter beeps.

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Crisp, subtle tactile click when wire connects to pin (fixed pitch micro-tick, zero bubble sound)
   */
  playWireSnap() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(2200, ctx.currentTime);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.015);
    } catch {}
  }

  /**
   * Crisp, subtle tactile click when wire disconnects (fixed pitch micro-tick, zero bubble sound)
   */
  playWireDisconnect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1600, ctx.currentTime);

      gain.gain.setValueAtTime(0.018, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.015);
    } catch {}
  }

  /**
   * Multimeter continuity beep (standard 2.4 kHz piezoelectric tone)
   */
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

  /**
   * Gentle, soft circuit alert tone (softened; no harsh ear-piercing crackle or buzzing)
   */
  playShortCircuitBuzz() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft, gentle low warning hum with low gain
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  /**
   * Drone arming / disarming standard ESC tones (DShot beacon)
   */
  playEscArmBeep(isArming: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const freqs = isArming ? [880, 1174, 1760] : [1760, 1174, 600];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.07);
      });
    } catch {}
  }

  /**
   * Multi-rotor continuous sound simulation: scales pitch & volume with RPM
   */
  updateDroneMotorSound(isArmed: boolean, avgRpm: number, throttlePct: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!isArmed || avgRpm <= 0) {
      if (this.droneGain) {
        try {
          this.droneGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        } catch {}
      }
      return;
    }

    try {
      if (this.droneOscillators.length === 0) {
        this.droneGain = ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
        this.droneGain.connect(ctx.destination);

        // 3 harmonic voices for 4 BLDC motors with multi-blade chop
        const baseHarmonics = [1.0, 2.0, 3.5];
        this.droneOscillators = baseHarmonics.map((h) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(140 * h, ctx.currentTime);
          osc.connect(this.droneGain!);
          osc.start();
          return osc;
        });
      }

      // Base frequency mapped from motor RPM: 2000 RPM idle ~ 130 Hz, 24000 RPM ~ 650 Hz
      const baseFreq = Math.max(90, Math.min(800, 90 + (avgRpm / 24000) * 550));
      const harmonics = [1.0, 1.98, 3.45];
      this.droneOscillators.forEach((osc, i) => {
        osc.frequency.setTargetAtTime(baseFreq * harmonics[i], ctx.currentTime, 0.04);
      });

      const volume = Math.min(0.08, 0.015 + (throttlePct / 100) * 0.065);
      if (this.droneGain) {
        this.droneGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
      }
    } catch {}
  }

  /**
   * Robot DC Gearmotor sound simulation: frequency mapped to speed
   */
  updateRobotMotorSound(speedPct: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const absSpeed = Math.abs(speedPct);
    if (absSpeed <= 2) {
      if (this.motorGain) {
        try {
          this.motorGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        } catch {}
      }
      return;
    }

    try {
      if (!this.motorOsc) {
        this.motorOsc = ctx.createOscillator();
        this.motorGain = ctx.createGain();
        this.motorOsc.type = "triangle";
        this.motorOsc.frequency.setValueAtTime(80, ctx.currentTime);
        this.motorGain.gain.setValueAtTime(0.001, ctx.currentTime);

        this.motorOsc.connect(this.motorGain);
        this.motorGain.connect(ctx.destination);
        this.motorOsc.start();
      }

      const freq = 70 + (absSpeed / 100) * 160;
      this.motorOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      const volume = Math.min(0.06, 0.01 + (absSpeed / 100) * 0.045);
      if (this.motorGain) {
        this.motorGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
      }
    } catch {}
  }

  /**
   * Relay coil engage/disengage bistable click (clean, soft mechanical click, no speaker pop or pitch drops)
   */
  playRelayClick(isEngage = true) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(isEngage ? 800 : 650, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.018);
    } catch {}
  }

  /**
   * Switch / UI toggle click sound (gentle and smooth)
   */
  playSwitchClick(isOn = true) {
    this.playRelayClick(isOn);
  }

  /**
   * Power switch simulation on
   */
  playPowerOn() {
    this.playRelayClick(true);
  }

  /**
   * Instrument button press beep
   */
  playButtonBeep() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  }

  /**
   * High-precision ultrasonic micro-welding sound for 99.99% gold wire bonding (Au capillary)
   */
  playGoldWireBond() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Dual harmonic ultrasonic pulse + golden resonance chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(3600, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(4800, ctx.currentTime + 0.03);
      osc1.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.12);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1800, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  /**
   * Component placement and solder paste seating snap sound (clean, subtle click, no bubble swoop)
   */
  playComponentMount() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, ctx.currentTime);

      gain.gain.setValueAtTime(0.018, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.018);
    } catch {}
  }

  /**
   * Component removal pop or warning click sound (clean, subtle tick, no bubble swoop)
   */
  playComponentPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1100, ctx.currentTime);

      gain.gain.setValueAtTime(0.018, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.018);
    } catch {}
  }

  /**
   * High-speed serial firmware upload chirp sequence (EEPROM/Flash write)
   */
  playFirmwareFlash() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const steps = [880, 1320, 1760, 2640];
      steps.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.04);
      });
    } catch {}
  }

  /**
   * Component placed onto breadboard / PCB
   */
  playComponentDrop() {
    this.playComponentMount();
  }

  /**
   * Tactile button / switch click
   */
  playClick() {
    this.playButtonBeep();
  }

  /**
   * Rotary switch / multimeter range selector click
   */
  playMultimeterClick() {
    this.playRelayClick(false);
  }

  /**
   * Repair completion triumph chime
   */
  playSuccessChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    } catch {}
  }
}

export const soundEffects = new SoundEffectsEngine();
