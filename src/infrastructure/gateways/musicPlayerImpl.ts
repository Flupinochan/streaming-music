import type { AudioEngine } from "../../domain/gateways/audioEngine";
import type {
  MusicPlayer,
  PlayerState,
  PlayerStatus,
  RepeatMode,
  Track,
} from "../../domain/gateways/musicPlayer";
import type { MusicDataRepository } from "../../domain/repositories/musicDataRepository";
import { Seconds } from "../../domain/value_objects/seconds";
import type { TrackId } from "../../domain/value_objects/trackId";

export class MusicPlayerImpl implements MusicPlayer {
  private status: PlayerStatus = "stopped";
  private repeatMode: RepeatMode = "none";
  private shuffleEnabled = false;

  // 曲のリスト
  private tracks: Track[] = [];
  // queue配列の中で現在再生している曲のindex (-1の場合は再生する曲がない状態)
  private index = -1;
  // queue配列の中で再生した曲のindexの履歴 (シャッフル再生時に利用)
  private history: number[] = [];

  private readonly engine: AudioEngine;
  private readonly musicDataRepo: MusicDataRepository;

  constructor(engine: AudioEngine, musicDataRepo: MusicDataRepository) {
    this.engine = engine;
    this.musicDataRepo = musicDataRepo;
    // 曲終了時のルールを設定
    this.engine.onEnd(() => {
      if (this.repeatMode === "one") {
        this.play();
        return;
      }
      this.next();
    });
  }

  // 曲のリストを初期化 (デフォルトでは先頭0番目から再生)
  setTracks(tracks: Track[], startAt = 0): void {
    this.tracks = tracks;
    this.index =
      tracks.length === 0
        ? -1
        : Math.max(0, Math.min(startAt, tracks.length - 1));
    this.history = [];
    this.status = "stopped";
  }

  async selectTrack(trackId: TrackId): Promise<void> {
    const index = this.tracks.findIndex(
      (track) => track.id.toString() === trackId.toString(),
    );
    this.index = index;
    await this.load();
    if (this.status === "playing") {
      this.engine.play();
    }
    this.history = [];
  }

  play(): void {
    if (this.index < 0) return;
    this.status = "playing";
    this.engine.play();
  }

  pause(): void {
    this.status = "paused";
    this.engine.pause();
  }

  stop(): void {
    this.status = "stopped";
    this.engine.stop();
  }

  seek(seconds: Seconds): void {
    this.engine.seek(seconds.value);
  }

  async next(): Promise<Track | undefined> {
    const nextIndex = this.calcNextIndex();
    if (nextIndex === undefined) return undefined;
    this.index = nextIndex;

    // historyを更新 (重複は避ける)
    if (!this.history.includes(this.index)) {
      this.history.push(this.index);
    }
    // 一周分再生済みなら履歴をクリア
    if (this.shuffleEnabled && this.tracks.length > 1) {
      if (this.history.length >= this.tracks.length - 1) {
        this.history = [];
      }
    }

    await this.load();
    if (this.status === "playing") {
      this.engine.play();
    }

    return this.tracks[this.index] ?? undefined;
  }

  async previous(): Promise<Track | undefined> {
    const prevIndex = this.calcPreviousIndex();
    if (prevIndex === undefined) return undefined;
    this.index = prevIndex;

    // historyを更新
    const idx = this.history.lastIndexOf(prevIndex);
    if (idx >= 0) this.history.splice(idx, 1);

    await this.load();
    if (this.status === "playing") {
      this.engine.play();
    }

    return this.tracks[this.index] ?? undefined;
  }

  setRepeatMode(mode: RepeatMode): void {
    this.repeatMode = mode;
  }

  setShuffle(enabled: boolean): void {
    this.shuffleEnabled = enabled;
    this.history = [];
  }

  getState(): PlayerState {
    return {
      status: this.status,
      currentTrackId: this.tracks[this.index]?.id ?? undefined,
      positionSeconds: Seconds.createFromSeconds(this.engine.getPosition()),
      durationSeconds: Seconds.createFromSeconds(this.engine.getDuration()),
      repeatMode: this.repeatMode,
      shuffleEnabled: this.shuffleEnabled,
    };
  }

  isPlaying(): boolean {
    return this.status === "playing";
  }

  dispose(): void {
    this.engine.dispose();
  }

  private async load(): Promise<void> {
    const currentTrack = this.tracks[this.index];
    if (!currentTrack) return;
    const url = await this.musicDataRepo.getMusicDataUrl(
      currentTrack.musicDataPath,
    );
    this.engine.load(url);
  }

  // 次に再生する曲のindexを計算して返却するロジック
  // 状態変更は行わない。上位関数である next() で状態変更は実施
  // 詳細は README.md を参照
  private calcNextIndex(): number | undefined {
    if (this.index < 0 || this.tracks.length === 0) return undefined;

    const isAtEnd = this.index === this.tracks.length - 1;
    const hasMultiple = this.tracks.length > 1;

    // repeat one は常に現在の曲を返す
    if (this.repeatMode === "one") return this.index;

    // シャッフル有効時
    if (this.shuffleEnabled) {
      // 曲が1つしかない場合
      if (!hasMultiple)
        return this.repeatMode === "all" ? this.index : undefined;

      // 複数曲ある場合: history と現在の曲を除いた候補からランダムに選ぶ
      const excluded = new Set<number>(this.history);
      excluded.add(this.index);

      const candidates: number[] = [];
      for (let i = 0; i < this.tracks.length; i++) {
        if (!excluded.has(i)) candidates.push(i);
      }

      // 履歴が他の全曲を含んでいる場合 (最後の曲まで再生した場合)
      if (candidates.length === 0) {
        // repeatMode に応じて挙動を決定
        if (this.repeatMode === "all") {
          // 履歴をクリアせず計算上は現在の曲以外からランダムに選ぶ
          const freshCandidates: number[] = [];
          for (let i = 0; i < this.tracks.length; i++) {
            if (i !== this.index) freshCandidates.push(i);
          }
          if (freshCandidates.length === 0) return this.index;
          return freshCandidates[
            Math.floor(Math.random() * freshCandidates.length)
          ];
        }

        // repeatMode が none の場合は再生を停止
        return undefined;
      }

      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // シャッフル無効時で最終曲でない場合はシンプルに次のインデックスを返却
    if (!isAtEnd) return this.index + 1;

    // 最終曲でallの場合は先頭の曲を返却
    return this.repeatMode === "all" ? 0 : undefined;
  }

  // 前に再生した曲のindexを計算して返却するロジック
  // 状態変更は行わない。上位関数である previous() で状態変更は実施
  // 詳細は README.md を参照
  private calcPreviousIndex(): number | undefined {
    if (this.index < 0 || this.tracks.length === 0) return undefined;

    const isAtStart = this.index === 0;
    const hasHistory = this.history.length > 0;
    const hasMultiple = this.tracks.length > 1;

    // repeat one は常に現在の曲を返す
    if (this.repeatMode === "one") return this.index;

    // シャッフル有効時
    if (this.shuffleEnabled) {
      // historyがある場合
      if (hasHistory) return this.history[this.history.length - 1];

      // historyがなければシャッフル無効時と同様のロジック
      if (!isAtStart) return this.index - 1;
      return this.repeatMode === "all"
        ? hasMultiple
          ? this.tracks.length - 1
          : 0
        : undefined;
    }

    // シャッフル無効時: 先頭の曲でない場合はシンプルに前のインデックスを返却
    if (!isAtStart) return this.index - 1;
    // 先頭の曲でallで複数の曲がある場合は最後の曲を返却
    return this.repeatMode === "all"
      ? hasMultiple
        ? this.tracks.length - 1
        : 0
      : undefined;
  }
}
