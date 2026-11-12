/**
 * Web Audio API retro sound synthesizer for GameClub
 * 100% embedded, zero external audio assets.
 */

class RetroAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private buzzOsc1: OscillatorNode | null = null;
  private buzzOsc2: OscillatorNode | null = null;
  private buzzGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Button click blip
  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Drawing scratch sound
  public playDrawTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 60, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  }

  // Countdown second tick
  public playTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // Ignore
    }
  }

  // Bee swarm buzzing ambient sound
  public startSwarmBuzz() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx || this.buzzOsc1) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(115, this.ctx.currentTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(118, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.buzzOsc1 = osc1;
      this.buzzOsc2 = osc2;
      this.buzzGain = gain;
    } catch {
      // Ignore
    }
  }

  public stopSwarmBuzz() {
    try {
      if (this.buzzGain && this.ctx) {
        this.buzzGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        setTimeout(() => {
          this.buzzOsc1?.stop();
          this.buzzOsc2?.stop();
          this.buzzOsc1 = null;
          this.buzzOsc2 = null;
          this.buzzGain = null;
        }, 120);
      }
    } catch {
      this.buzzOsc1 = null;
      this.buzzOsc2 = null;
      this.buzzGain = null;
    }
  }

  // Stung failure sound
  public playStung() {
    this.stopSwarmBuzz();
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch {
      // Ignore
    }
  }

  // Victory fanfare
  public playWin() {
    this.stopSwarmBuzz();
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.09);

        gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.09 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + i * 0.09);
        osc.stop(this.ctx!.currentTime + i * 0.09 + 0.2);
      });
    } catch {
      // Ignore
    }
  }
}

export const retroAudio = new RetroAudio();
