import { Howl } from "howler";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useMusicStore, type MusicItem } from "./useMusicStore";

export const useMusicPlayerStore = defineStore("musicPlayer", () => {
  const musicStore = useMusicStore();

  const sound = ref<Howl | null>(null);
  const musicUrl = ref<string | null>(null);
  const isPlaying = ref(false);
  const currentS3Path = ref<string | null>(null);

  // Repeat one track
  const repeatOne = ref(false);

  // Shuffle all tracks
  const shuffleAll = ref(false);
  const shufflePool = ref<string[]>([]);

  const resetSound = (): void => {
    sound.value?.unload();
    sound.value = null;
    if (musicUrl.value?.startsWith("blob:")) {
      URL.revokeObjectURL(musicUrl.value);
    }
    musicUrl.value = null;
  };

  const createHowlInstance = (url: string): Howl =>
    new Howl({
      src: [url],
      html5: true,
      loop: repeatOne.value,
      onplay: (): void => {
        isPlaying.value = true;

        if (!("mediaSession" in navigator)) return;
        if (!currentS3Path.value) return;
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentS3Path.value,
        });
      },
      onpause: () => (isPlaying.value = false),
      onstop: () => (isPlaying.value = false),
      onend: (): void => {
        if (!repeatOne.value && shuffleAll.value) {
          void playNextShuffle();
          return;
        }
        isPlaying.value = false;
      },
    });

  const loadFromFile = (file: File): void => {
    resetSound();
    musicUrl.value = URL.createObjectURL(file);
    sound.value = createHowlInstance(musicUrl.value);
  };

  const loadFromUrl = (url: string): void => {
    resetSound();
    musicUrl.value = url;
    sound.value = createHowlInstance(url);
  };

  // toggleShuffleAll時にmusicList配列をコピーし、1つずつランダムに再生/削除していく
  // ※最初に再生した曲が次に再生される可能性があるが許容
  const playNextShuffle = async (): Promise<void> => {
    if (shufflePool.value.length === 0) {
      isPlaying.value = false;
      return;
    }

    const i = Math.floor(Math.random() * shufflePool.value.length);
    const [nextKey] = shufflePool.value.splice(i, 1);
    if (!nextKey) {
      isPlaying.value = false;
      return;
    }

    currentS3Path.value = nextKey;
    const item: MusicItem = { s3Path: nextKey };

    await musicStore.fetchMusic(item);
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
      shufflePool.value = musicStore.musicList.map((m) => m.s3Path);
    } else {
      shufflePool.value = [];
    }
  };

  const play = (): number | undefined => sound.value?.play();
  const pause = (): Howl | undefined => sound.value?.pause();
  const stop = (): Howl | undefined => sound.value?.stop();
  const cleanup = (): void => resetSound();

  return {
    isPlaying,
    musicUrl,
    repeatOne,
    shuffleAll,
    currentS3Path,
    loadFromFile,
    loadFromUrl,
    toggleRepeatOne,
    toggleShuffleAll,
    play,
    pause,
    stop,
    cleanup,
  };
});
