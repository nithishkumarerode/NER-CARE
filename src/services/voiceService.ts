import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../locales/translations';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private recognition: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
        } catch (e) {
          console.warn('SpeechRecognition init error:', e);
        }
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public speak(text: string, lang: Language = 'en'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        // Fallback gentle tone
        this.playGentleChime();
        resolve();
        return;
      }

      this.synth.cancel(); // cancel any previous utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
      utterance.lang = langInfo?.voiceCode || 'en-US';
      utterance.rate = 0.88; // Slightly slower, calm cadence for elderly comprehension
      utterance.pitch = 1.05; // Warm, friendly tone

      // Try to find native voice
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        const matchingVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.includes(lang));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public playTone(freq: number, durationMs: number = 200, type: OscillatorType = 'sine', gainVal: number = 0.15): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  public playSuccessChime(): void {
    // Warm soothing major chord: C5 -> E5 -> G5 -> C6
    this.playTone(523.25, 180, 'sine', 0.12);
    setTimeout(() => this.playTone(659.25, 200, 'sine', 0.12), 120);
    setTimeout(() => this.playTone(783.99, 250, 'sine', 0.14), 240);
    setTimeout(() => this.playTone(1046.50, 450, 'sine', 0.15), 360);
  }

  public playGentleChime(): void {
    // Gentle non-jarring feedback
    this.playTone(440, 200, 'sine', 0.1);
    setTimeout(() => this.playTone(554.37, 250, 'sine', 0.1), 120);
  }

  public playAlarmSound(): void {
    // Calming medical reminder chime: soft ascending harp-like sequence
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 400, 'triangle', 0.2);
      }, idx * 220);
    });
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public listenOnce(
    onResult: (text: string) => void, 
    onError?: (err: any) => void,
    onEnd?: () => void,
    langCode?: string
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError(new Error('Speech recognition not supported in this browser'));
      return () => {};
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (e) {}
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = langCode || 'en-IN';

      this.recognition.onresult = (event: any) => {
        try {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        } catch (err) {
          if (onError) onError(err);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (onError) onError(event.error || event);
      };

      this.recognition.onend = () => {
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (e) {
      if (onError) onError(e);
    }

    return () => {
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
    };
  }
}

export const voiceService = new VoiceService();
