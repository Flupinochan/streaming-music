// 純粋にオーディオの再生に関する機能を提供
export interface AudioEngine {
  load(url: URL): void;

  play(): void;
  pause(): void;
  stop(): void;

  seek(seconds: number): void;

  getPosition(): number;
  getDuration(): number;

  dispose(): void;

  onEnd(handler: () => void): void;
}
