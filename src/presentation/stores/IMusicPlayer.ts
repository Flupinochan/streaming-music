export type PlayerStatus = "stopped" | "playing" | "paused";
export type RepeatMode = "none" | "one" | "all";
export type TrackId = string;

export interface Track {
  id: TrackId;
  url: string;
}

export interface PlayerState {
  status: PlayerStatus;
  currentTrackId: TrackId | undefined;
  positionSeconds: number;
  durationSeconds: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
}

export interface IAudioEngine {
  load(url: string): void;

  play(): void;
  pause(): void;
  stop(): void;

  seek(seconds: number): void;

  getPosition(): number;
  getDuration(): number;

  onEnd(handler: () => void): void;
  dispose(): void;
}

export interface IMusicPlayer {
  setQueue(tracks: Track[], startAt?: number): void;
  getState(): PlayerState;

  play(): void;
  pause(): void;
  stop(): void;

  seek(seconds: number): void;
  next(): Track | undefined;
  previous(): Track | undefined;

  setRepeatMode(mode: RepeatMode): void;
  setShuffle(enabled: boolean): void;
}
