import type {
  MusicPlayer,
  MusicPlayerFactory,
} from "@/domain/gateways/musicPlayer";
import type { MusicMetadataDto } from "@/infrastructure/repositories/dto/musicMetadataDto";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useMusicStore } from "./useMusicStore";

export const useMusicPlayerStore = defineStore("musicPlayer", () => {
  const musicStore = useMusicStore();

  let musicPlayerFactory: MusicPlayerFactory | null = null;

  const requireMusicPlayerFactory = (): MusicPlayerFactory => {
    if (!musicPlayerFactory) {
      throw new Error(
        "MusicPlayerFactory is not set. Call useMusicPlayerStore(pinia).setMusicPlayerFactory() in main.ts.",
      );
    }
    return musicPlayerFactory;
  };

  const setMusicPlayerFactory = (next: MusicPlayerFactory): void => {
    musicPlayerFactory = next;
  };

  const sound = ref<MusicPlayer | null>(null);
  const musicUrl = ref<string | null>(null);
  const isPlaying = ref(false);
  const activeS3Path = ref<string | null>(null);
  const activeMusicTitle = ref<string | null>(null);

  const positionSeconds = ref(0);
  const durationSeconds = ref(0);
  const isSeeking = ref(false);

  let positionTimer: number | null = null;

  const startPositionTimer = (): void => {
    if (positionTimer != null) return;
    positionTimer = window.setInterval(() => {
      if (!sound.value) return;
      if (isSeeking.value) return;
      const pos = sound.value.seek();
      if (typeof pos === "number") positionSeconds.value = pos;
      durationSeconds.value = sound.value.duration() || durationSeconds.value;
    }, 250);
  };

  const stopPositionTimer = (): void => {
    if (positionTimer == null) return;
    window.clearInterval(positionTimer);
    positionTimer = null;
  };

  // Repeat one track
  const repeatOne = ref(false);

  // Shuffle all tracks
  const shuffleAll = ref(false);
  const shufflePool = ref<MusicMetadataDto[]>([]);

  const resetSound = (): void => {
    stopPositionTimer();
    isPlaying.value = false;
    sound.value?.stop();
    sound.value?.unload();
    sound.value = null;
    if (musicUrl.value?.startsWith("blob:")) {
      URL.revokeObjectURL(musicUrl.value);
    }
    musicUrl.value = null;

    positionSeconds.value = 0;
    durationSeconds.value = 0;
    isSeeking.value = false;
  };

  const setNowPlaying = (music: SubMusicMetadataDto): void => {
    activeS3Path.value = music.musicS3Path;
    activeMusicTitle.value = music.title;
  };

  const seekTo = (seconds: number): void => {
    if (!sound.value) return;
    const clamped = Math.max(
      0,
      Math.min(seconds, durationSeconds.value || seconds),
    );
    sound.value.seek(clamped);
    positionSeconds.value = clamped;
  };

  const timeLabel = computed((): string => {
    const format = (s: number): string => {
      if (!Number.isFinite(s) || s < 0) return "0:00";
      const whole = Math.floor(s);
      const m = Math.floor(whole / 60);
      const sec = whole % 60;
      return `${m}:${sec.toString().padStart(2, "0")}`;
    };
    return `${format(positionSeconds.value)} / ${format(durationSeconds.value)}`;
  });

  // Event初期化
  const attachPlayerHandlers = (): void => {
    if (!sound.value) return;

    sound.value.off("load").on("load", (): void => {
      durationSeconds.value = sound.value?.duration() || durationSeconds.value;
    });

    sound.value.off("play").on("play", (): void => {
      isPlaying.value = true;
      startPositionTimer();

      if (!("mediaSession" in navigator)) return;
      const title = activeMusicTitle.value ?? activeS3Path.value;
      if (!title) return;
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
      });
    });

    sound.value.off("pause").on("pause", (): void => {
      isPlaying.value = false;
      stopPositionTimer();
    });

    sound.value.off("stop").on("stop", (): void => {
      isPlaying.value = false;
      stopPositionTimer();
      positionSeconds.value = 0;
    });

    sound.value.off("end").on("end", (): void => {
      if (!repeatOne.value && shuffleAll.value) {
        void playNextShuffle();
        return;
      }
      isPlaying.value = false;
      stopPositionTimer();
      positionSeconds.value = 0;
    });
  };

  const createMusicPlayerInstance = (url: string): MusicPlayer => {
    const player = requireMusicPlayerFactory()({
      src: url,
      loop: repeatOne.value,
    });
    return player;
  };

  const loadFromFile = (file: File): void => {
    resetSound();
    musicUrl.value = URL.createObjectURL(file);
    sound.value = createMusicPlayerInstance(musicUrl.value);
    attachPlayerHandlers();
  };

  const loadFromUrl = (url: string): void => {
    resetSound();
    musicUrl.value = url;
    sound.value = createMusicPlayerInstance(url);
    attachPlayerHandlers();
  };

  // toggleShuffleAll時にmusicList配列をコピーし、1つずつランダムに再生/削除していく
  // ※最初に再生した曲が次に再生される可能性があるが許容
  const playNextShuffle = async (): Promise<void> => {
    if (shufflePool.value.length === 0) {
      isPlaying.value = false;
      return;
    }

    const i = Math.floor(Math.random() * shufflePool.value.length);
    const [nextItem] = shufflePool.value.splice(i, 1);
    if (!nextItem) {
      isPlaying.value = false;
      return;
    }

    setNowPlaying(nextItem);
    await musicStore.fetchMusic({ musicDataPath: nextItem.musicS3Path });
    const url = musicStore.selectedMusicUrl?.toString();
    if (!url) return;

    loadFromUrl(url);
    play();
  };

  const toggleRepeatOne = (): void => {
    repeatOne.value = !repeatOne.value;
    if (sound.value) {
      sound.value.loop(repeatOne.value);
    }
  };

  const toggleShuffleAll = (): void => {
    shuffleAll.value = !shuffleAll.value;

    if (shuffleAll.value) {
      shufflePool.value = [...musicStore.musicList];
    } else {
      shufflePool.value = [];
    }
  };

  const play = (): number | undefined => sound.value?.play();
  const pause = (): MusicPlayer | undefined => sound.value?.pause();
  const stop = (): MusicPlayer | undefined => sound.value?.stop();
  const cleanup = (): void => resetSound();

  return {
    setMusicPlayerFactory,
    isPlaying,
    musicUrl,
    repeatOne,
    shuffleAll,
    activeS3Path,
    activeMusicTitle,
    positionSeconds,
    durationSeconds,
    isSeeking,
    timeLabel,
    loadFromFile,
    loadFromUrl,
    setNowPlaying,
    seekTo,
    toggleRepeatOne,
    toggleShuffleAll,
    play,
    pause,
    stop,
    cleanup,
  };
});
