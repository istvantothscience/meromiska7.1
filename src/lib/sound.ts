/**
 * Synthesized Paper Rustle (Lapzizzenés) and Success Chime using Web Audio API
 * - 100% self-contained, offline-ready, zero latency, no missing asset 404s
 * - Volume / mute state can be toggled by the student or teacher
 */

class SoundController {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage preference if previously saved
    try {
      const saved = localStorage.getItem('mero_miska_sound_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // ignore
    }
  }

  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('mero_miska_sound_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('mero_miska_sound_muted', String(muted));
    } catch {
      // ignore
    }
  }

  /**
   * Delicate, realistic paper rustle ("lapzizzenés")
   * Created using filtered white noise and envelope decay
   */
  public playPageFlip(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const sampleRate = ctx.sampleRate;
      const duration = 0.28; // ~280ms
      const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
      const data = buffer.getChannelData(0);

      // Modulated white noise with natural friction envelope
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const env = Math.sin((t / duration) * Math.PI) * Math.exp(-t * 8);
        data[i] = (Math.random() * 2 - 1) * env * (0.8 + 0.2 * Math.random());
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter centered around 1800Hz gives crisp paper friction
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1800, ctx.currentTime);
      bandpass.Q.setValueAtTime(1.1, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noiseSource.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
    } catch {
      // Browser audio restriction / muted
    }
  }

  /**
   * Warm celebratory chime when a task is completed / points submitted
   */
  public playSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
      });
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundController();
