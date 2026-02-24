import { FetchMusicDto } from "@/use_cases/fetchMusicDto";
import type { FetchMusicUsecase } from "@/use_cases/fetchMusicUsecase";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";
import { Howl } from "howler";
import { defineStore } from "pinia";
import { ref } from "vue";

export type PlayerStatus = "stopped" | "playing" | "paused";
export type RepeatMode = "none" | "one" | "all";
export interface PlayerState {
  id: string | undefined;
  title: string | undefined;
  musicS3Path: string | undefined;
  artworkS3Path: string | undefined;
  positionSeconds: number;
  musicDurationSeconds: number;
  status: PlayerStatus;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
}

/**
 * Howler に依存した音楽プレイヤー
 */
export const useMusicPlayerStore = defineStore("musicPlayer", () => {
  // 公開データ ----------------------------------------------------------
  // 選択中の曲、状態 (分離すべきかもしれない)
  const playerState = ref<PlayerState>({
    id: undefined,
    title: undefined,
    musicS3Path: undefined,
    artworkS3Path: undefined,
    positionSeconds: 0,
    musicDurationSeconds: 0,
    status: "stopped",
    repeatMode: "none",
    shuffleEnabled: false,
  });
  // 曲のリスト
  const tracks = ref<SubMusicMetadataDto[]>([]);

  // 内部データ --------------------------------------------------------------
  // queue配列の中で現在再生している曲のindex (-1の場合は再生する曲がない状態)
  let index = -1;
  // queue配列の中で再生した曲のindexの履歴 (シャッフル再生時に利用)
  let history: number[] = [];
  let currentUrl: URL | undefined;
  let howl: Howl | undefined;
  let fetchMusicUsecase: FetchMusicUsecase | undefined;
  // seek用タイマーID
  let tickId: number | undefined;

  // DI
  const setFetchMusicUsecase = (usecase: FetchMusicUsecase): void => {
    fetchMusicUsecase = usecase;
  };

  const canPlaying = (): boolean => {
    return (
      playerState.value.status !== "playing" &&
      playerState.value.id !== undefined
    );
  };
  const isPlaying = (): boolean => playerState.value.status === "playing";

  const disposeEngine = (): void => {
    if (!howl) return;
    howl.off("end");
    clearTick();
    howl.stop();
    howl.unload();
    howl = undefined;
    currentUrl = undefined;
  };

  // 再生位置の更新ロジック --------------------------------------------------------------
  // seekとは再生位置のこと
  const getSeek = (): void => {
    if (!howl) return;
    playerState.value = {
      ...playerState.value,
      positionSeconds: howl.seek() as number,
      musicDurationSeconds: howl.duration() ?? 0,
    };
  };

  const setSeek = (seconds: number): void => {
    howl?.seek(Math.max(0, seconds));
    getSeek();
  };

  // howlerから定期的に再生位置(seek)を取得するタイマー
  const startTick = (): void => {
    if (tickId !== undefined) return;
    tickId = window.setInterval(getSeek, 500);
  };

  const clearTick = (): void => {
    if (tickId === undefined) return;
    clearInterval(tickId);
    tickId = undefined;
  };

  // トラック管理 ----------------------------------------------------------
  const loadTrack = async (track: SubMusicMetadataDto): Promise<void> => {
    if (!fetchMusicUsecase) return;
    const url = await fetchMusicUsecase.fetchMusic(
      new FetchMusicDto(track.musicS3Path),
    );
    if (howl && currentUrl === url) return;
    disposeEngine();
    currentUrl = url;
    howl = new Howl({
      src: [url.toString()],
      html5: true,
      pool: 1,
      // イベント定義
      // 曲が終了したときの挙動
      onend: async (): Promise<void> => {
        if (playerState.value.repeatMode === "one") {
          play();
          return;
        }

        const isNext = await next();
        if (!isNext) {
          // 次の曲がない場合は停止状態にする
          playerState.value = {
            ...playerState.value,
            status: "stopped",
          };
        }
      },
    });
  };

  const setTracks = (newTracks: SubMusicMetadataDto[], startAt = 0): void => {
    tracks.value = newTracks;
    index =
      tracks.value.length === 0
        ? -1
        : Math.max(0, Math.min(startAt, tracks.value.length - 1));
    history = [];
    playerState.value = { ...playerState.value, status: "stopped" };
  };

  const selectTrack = async (
    track: SubMusicMetadataDto | undefined,
  ): Promise<void> => {
    if (!track) {
      playerState.value = {
        ...playerState.value,
        id: undefined,
        title: undefined,
        musicS3Path: undefined,
        artworkS3Path: undefined,
        positionSeconds: 0,
        musicDurationSeconds: 0,
        status: "stopped",
      };
      disposeEngine();
      return;
    }

    const idx = tracks.value.findIndex((t) => t.id === track.id);
    index = idx;
    if (tracks.value[index]) {
      await loadTrack(tracks.value[index]);
    }
    if (isPlaying()) {
      howl?.play();
    }
    history = [];
    playerState.value = {
      ...playerState.value,
      ...track,
      positionSeconds: 0,
    };
  };

  // 再生操作 --------------------------------------------------------------
  const play = (): void => {
    if (index < 0) return;
    playerState.value = { ...playerState.value, status: "playing" };
    howl?.play();
    startTick();
  };

  const pause = (): void => {
    playerState.value = { ...playerState.value, status: "paused" };
    howl?.pause();
    clearTick();
  };

  const stop = (): void => {
    playerState.value = { ...playerState.value, status: "stopped" };
    howl?.stop();
    clearTick();
    setSeek(0);
  };

  const setRepeatMode = (mode: RepeatMode): void => {
    playerState.value = { ...playerState.value, repeatMode: mode };
  };

  const toggleShuffle = (): void => {
    const currentShuffleEnabled = playerState.value.shuffleEnabled;
    playerState.value = {
      ...playerState.value,
      shuffleEnabled: !currentShuffleEnabled,
    };

    if (!currentShuffleEnabled) {
      history = [];
    }
  };

  const next = async (): Promise<SubMusicMetadataDto | undefined> => {
    const nextIdx = calcNextIndex();
    if (nextIdx === undefined) return undefined;
    index = nextIdx;

    // historyを更新 (重複は避ける)
    if (!history.includes(index)) {
      history.push(index);
    }

    // 一周分再生済みなら履歴をクリア
    if (
      playerState.value.shuffleEnabled &&
      tracks.value.length > 1 &&
      history.length >= tracks.value.length - 1
    ) {
      history = [];
    }

    if (tracks.value[index]) {
      await loadTrack(tracks.value[index]);
    }

    if (playerState.value.status === "playing") {
      howl?.play();
    }

    return tracks.value[index];
  };

  const previous = async (): Promise<SubMusicMetadataDto | undefined> => {
    const prevIdx = calcPreviousIndex();
    if (prevIdx === undefined) return undefined;
    index = prevIdx;

    // historyを更新
    const histIdx = history.lastIndexOf(prevIdx);
    if (histIdx >= 0) history.splice(histIdx, 1);

    if (tracks.value[index]) {
      await loadTrack(tracks.value[index]);
    }

    if (playerState.value.status === "playing") {
      howl?.play();
    }

    return tracks.value[index];
  };

  // next/previous 計算ロジック --------------------------------------------

  // 次に再生する曲のindexを計算して返却するロジック
  // 状態変更は行わない。上位関数である next() で状態変更は実施
  // 詳細は README.md を参照
  const calcNextIndex = (): number | undefined => {
    if (index < 0 || tracks.value.length === 0) return undefined;
    const isAtEnd = index === tracks.value.length - 1;
    const hasMultiple = tracks.value.length > 1;

    // repeat one は常に現在の曲を返す
    if (playerState.value.repeatMode === "one") return index;

    // シャッフル有効時
    if (playerState.value.shuffleEnabled) {
      // 曲が1つしかない場合
      if (!hasMultiple)
        return playerState.value.repeatMode === "all" ? index : undefined;

      // 複数曲ある場合: history と現在の曲を除いた候補からランダムに選ぶ
      const excluded = new Set<number>(history);
      excluded.add(index);

      const candidates: number[] = [];
      for (let i = 0; i < tracks.value.length; i++) {
        if (!excluded.has(i)) candidates.push(i);
      }

      // 履歴が他の全曲を含んでいる場合 (最後の曲まで再生した場合)
      if (candidates.length === 0) {
        // repeatMode に応じて挙動を決定
        if (playerState.value.repeatMode === "all") {
          // 履歴をクリアせず計算上は現在の曲以外からランダムに選ぶ
          const fresh: number[] = [];
          for (let i = 0; i < tracks.value.length; i++) {
            if (i !== index) fresh.push(i);
          }
          if (fresh.length === 0) return index;
          return fresh[Math.floor(Math.random() * fresh.length)];
        }

        // repeatMode が none の場合は再生を停止
        return undefined;
      }

      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // シャッフル無効時で最終曲でない場合はシンプルに次のインデックスを返却
    if (!isAtEnd) return index + 1;

    // 最終曲でallの場合は先頭の曲を返却
    return playerState.value.repeatMode === "all" ? 0 : undefined;
  };

  // 前に再生した曲のindexを計算して返却するロジック
  // 状態変更は行わない。上位関数である previous() で状態変更は実施
  // 詳細は README.md を参照
  const calcPreviousIndex = (): number | undefined => {
    if (index < 0 || tracks.value.length === 0) return undefined;
    const isAtStart = index === 0;
    const hasHistory = history.length > 0;
    const hasMultiple = tracks.value.length > 1;

    // repeat one は常に現在の曲を返す
    if (playerState.value.repeatMode === "one") return index;

    // シャッフル有効時
    if (playerState.value.shuffleEnabled) {
      // historyがある場合
      if (hasHistory) return history[history.length - 1];
      // historyがなければシャッフル無効時と同様のロジック
      if (!isAtStart) return index - 1;
      return playerState.value.repeatMode === "all"
        ? hasMultiple
          ? tracks.value.length - 1
          : 0
        : undefined;
    }

    // シャッフル無効時: 先頭の曲でない場合はシンプルに前のインデックスを返却
    if (!isAtStart) return index - 1;
    // 先頭の曲でallで複数の曲がある場合は最後の曲を返却
    return playerState.value.repeatMode === "all"
      ? hasMultiple
        ? tracks.value.length - 1
        : 0
      : undefined;
  };

  return {
    playerState,
    tracks,
    setFetchMusicUsecase,
    setTracks,
    selectTrack,
    play,
    pause,
    stop,
    seek: setSeek,
    setRepeatMode,
    toggleShuffle,
    isPlaying,
    canPlaying,
    next,
    previous,
  };
});
