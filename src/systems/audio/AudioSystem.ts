type AudioCue = "shoot" | "missile" | "hit" | "explosion" | "pickup" | "ui" | "damage";

const cueSettings: Record<AudioCue, { frequency: number; duration: number; type: OscillatorType; gain: number }> = {
  shoot: { frequency: 720, duration: 0.035, type: "triangle", gain: 0.035 },
  missile: { frequency: 180, duration: 0.18, type: "sawtooth", gain: 0.055 },
  hit: { frequency: 260, duration: 0.08, type: "square", gain: 0.04 },
  explosion: { frequency: 96, duration: 0.24, type: "sawtooth", gain: 0.065 },
  pickup: { frequency: 880, duration: 0.14, type: "sine", gain: 0.05 },
  ui: { frequency: 520, duration: 0.055, type: "triangle", gain: 0.035 },
  damage: { frequency: 110, duration: 0.16, type: "square", gain: 0.06 }
};

export class AudioSystem {
  private context?: AudioContext;
  private master?: GainNode;

  async resume(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.context.destination);
    }
    if (this.context.state !== "running") {
      await this.context.resume();
    }
  }

  play(cue: AudioCue): void {
    if (!this.context || !this.master || this.context.state !== "running") {
      return;
    }

    const settings = cueSettings[cue];
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = settings.type;
    oscillator.frequency.setValueAtTime(settings.frequency, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, settings.frequency * 0.52), this.context.currentTime + settings.duration);
    gain.gain.setValueAtTime(settings.gain, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + settings.duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start();
    oscillator.stop(this.context.currentTime + settings.duration);
  }
}
