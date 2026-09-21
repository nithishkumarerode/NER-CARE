/**
 * Web Audio API synthesizer for cognitive games
 * Works 100% offline, zero external audio assets, high accessibility
 */

class GameSoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playTone(frequency: number, durationSeconds: number = 0.3, type: OscillatorType = 'sine', gainVal: number = 0.15): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSeconds);
    } catch (e) {
      console.warn('Tone play error:', e);
    }
  }

  // Musical notes frequencies (Hz)
  public readonly NOTE_FREQ: Record<string, number> = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88,
    'C5': 523.25,
    'D5': 587.33,
    'E5': 659.25,
  };

  public playNote(noteName: string, durationSeconds: number = 0.4): void {
    const freq = this.NOTE_FREQ[noteName] || 440;
    this.playTone(freq, durationSeconds, 'triangle', 0.18);
  }

  // Specific sound effects for Sound Memory Game
  public playSoundEffect(type: 'bell' | 'bird' | 'train' | 'water' | 'wind' | 'drum'): void {
    const ctx = this.getContext();
    if (!ctx) return;

    switch (type) {
      case 'bell':
        // Pure harmonic temple bell chime
        this.playTone(784, 0.8, 'sine', 0.2);
        setTimeout(() => this.playTone(1568, 0.6, 'sine', 0.08), 50);
        break;

      case 'bird':
        // Rising frequency chirp
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);
          osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
        break;

      case 'train':
        // Two-tone chord whistle
        this.playTone(440, 0.6, 'sawtooth', 0.08);
        this.playTone(554, 0.6, 'sawtooth', 0.08);
        setTimeout(() => {
          this.playTone(440, 0.8, 'sawtooth', 0.07);
          this.playTone(554, 0.8, 'sawtooth', 0.07);
        }, 300);
        break;

      case 'water':
        // Gentle liquid drop
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } catch (e) {}
        break;

      case 'wind':
        // Soothing bamboo wind chime
        this.playTone(659.25, 0.7, 'sine', 0.12);
        setTimeout(() => this.playTone(880, 0.7, 'sine', 0.1), 100);
        setTimeout(() => this.playTone(1046.5, 0.8, 'sine', 0.08), 200);
        break;

      case 'drum':
        // Deep warm dholak / gentle bass pulse
        this.playTone(110, 0.25, 'triangle', 0.28);
        break;
    }
  }

  public playSuccessChime(): void {
    // Warm celebratory chord: C5 -> E5 -> G5 -> C6
    this.playTone(523.25, 0.18, 'sine', 0.15);
    setTimeout(() => this.playTone(659.25, 0.2, 'sine', 0.15), 120);
    setTimeout(() => this.playTone(783.99, 0.25, 'sine', 0.16), 240);
    setTimeout(() => this.playTone(1046.50, 0.45, 'sine', 0.18), 360);
  }

  public playGentleFeedback(): void {
    // Reassuring soft gentle tone
    this.playTone(392, 0.18, 'sine', 0.12);
    setTimeout(() => this.playTone(440, 0.22, 'sine', 0.1), 100);
  }
}

export const soundManager = new GameSoundManager();
