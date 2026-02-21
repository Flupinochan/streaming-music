import type { MusicMetadata } from "../entities/musicMetadata";
import { Seconds } from "../value_objects/seconds";
import { TrackId } from "../value_objects/trackId";

export type PlayerStatus = "stopped" | "playing" | "paused";
export type RepeatMode = "none" | "one" | "all";

export type Track = Pick<MusicMetadata, "id" | "musicDataPath">;

// 再生が不可能 or 再生する曲がない状態のときはundefinedを使用
export interface PlayerState {
  status: PlayerStatus;
  currentTrackId: TrackId | undefined;
  positionSeconds: Seconds;
  durationSeconds: Seconds;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
}

export interface MusicPlayer {
  setTracks(tracks: Track[], startAt?: number): void;
  selectTrack(trackId: TrackId): Promise<void>;
  getState(): PlayerState;
  isPlaying(): boolean;

  play(): void;
  pause(): void;
  stop(): void;

  seek(seconds: Seconds): void;

  // 以下再生モードによる次/前の曲を選択するロジックを定義
  next(): Promise<Track | undefined>;
  previous(): Promise<Track | undefined>;

  setRepeatMode(mode: RepeatMode): void;
  setShuffle(enabled: boolean): void;
}
