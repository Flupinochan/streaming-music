import { defineStore } from "pinia";
import { ref } from "vue";

import type {
  MusicRepository,
  MusicItem as RepositoryMusicItem,
  UploadMusicRequest as RepositoryUploadMusicRequest,
  SubscriptionLike,
} from "@/repository/musicRepository";

export type MusicItem = RepositoryMusicItem;
export type UploadMusicRequest = RepositoryUploadMusicRequest;

export const useMusicStore = defineStore("music", () => {
  let repository: MusicRepository | null = null;
  let musicListSubscription: SubscriptionLike | null = null;

  // DynamoDBのMetadata
  const musicList = ref<MusicItem[]>([]);
  const selectedMusic = ref<MusicItem | null>(null);
  // S3のMusic本体
  const selectedMusicUrl = ref<URL | null>(null);
  // UI State
  const loading = ref(false);
  const error = ref<string | null>(null);

  const requireRepository = (): MusicRepository => {
    if (!repository) {
      throw new Error(
        "MusicRepository is not set. Call useMusicStore(pinia).setRepository() in main.ts.",
      );
    }
    return repository;
  };

  const setRepository = (next: MusicRepository): void => {
    repository = next;
  };

  const startMusicListSubscription = (): void => {
    if (musicListSubscription) return;

    loading.value = true;
    error.value = null;

    musicListSubscription = requireRepository().observeMusicList(
      (items) => {
        musicList.value = items;
        loading.value = false;
      },
      (e) => {
        error.value =
          e instanceof Error ? e.message : "音楽一覧の取得に失敗しました";
        loading.value = false;
      },
    );
  };

  const stopMusicListSubscription = (): void => {
    musicListSubscription?.unsubscribe();
    musicListSubscription = null;
  };

  async function fetchMusicList(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      musicList.value = await requireRepository().listMusic();
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "音楽一覧の取得に失敗しました";
    } finally {
      loading.value = false;
    }
  }

  async function fetchMusic(music: MusicItem): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const url = await requireRepository().getMusicUrl(music.s3Path);
      selectedMusic.value = music;
      selectedMusicUrl.value = url;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "音楽の取得に失敗しました";
      selectedMusic.value = null;
      selectedMusicUrl.value = null;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function uploadMusic(music: UploadMusicRequest): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await requireRepository().uploadMusic(music);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "音楽のアップロードに失敗しました";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeMusic(): Promise<void> {
    if (!selectedMusic.value) return;

    loading.value = true;
    error.value = null;

    try {
      await requireRepository().removeMusic(selectedMusic.value);
      selectedMusic.value = null;
      selectedMusicUrl.value = null;
      await fetchMusicList();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "音楽の削除に失敗しました";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    setRepository,
    musicList,
    selectedMusic,
    selectedMusicUrl,
    loading,
    error,
    startMusicListSubscription,
    stopMusicListSubscription,
    fetchMusicList,
    fetchMusic,
    uploadMusic,
    removeMusic,
  };
});
