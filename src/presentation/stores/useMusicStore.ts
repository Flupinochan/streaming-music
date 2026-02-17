import { defineStore } from "pinia";
import { ref } from "vue";
import { SubMusicMetadataUsecase } from "./../../use_cases/subMusicMetadataUsecase";

import type { CreateMusicDto } from "@/use_cases/createMusicDto";
import type { CreateMusicUsecase } from "@/use_cases/createMusicUsecase";
import type { FetchMusicDto } from "@/use_cases/fetchMusicDto";
import type { FetchMusicUsecase } from "@/use_cases/fetchMusicUsecase";
import type { RemoveMusicDto } from "@/use_cases/removeMusicDto";
import type { RemoveMusicUsecase } from "@/use_cases/removeMusicUsecase";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";

export const useMusicStore = defineStore("music", () => {
  let fetchMusicUsecase: FetchMusicUsecase | undefined = undefined;
  let createMusicUsecase: CreateMusicUsecase | undefined = undefined;
  let removeMusicUsecase: RemoveMusicUsecase | undefined = undefined;
  let SubMusicMetadataUsecase: SubMusicMetadataUsecase | undefined = undefined;

  // DynamoDBのMetadata
  const musicList = ref<SubMusicMetadataDto[]>([]);
  const selectedMusic = ref<SubMusicMetadataDto | undefined>(undefined);
  // S3のMusic本体
  const selectedMusicUrl = ref<URL | undefined>(undefined);
  // UI State
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  let subscription: { unsubscribe: () => void } | undefined = undefined;

  // function用Getter
  const getFetchMusicUsecase = (): FetchMusicUsecase => {
    if (!fetchMusicUsecase) {
      throw new Error(
        "FetchMusicUsecase is not set. Call useMusicStore(pinia).setFetchMusicUsecase() in main.ts.",
      );
    }
    return fetchMusicUsecase;
  };

  const getCreateMusicUsecase = (): CreateMusicUsecase => {
    if (!createMusicUsecase) {
      throw new Error(
        "CreateMusicUsecase is not set. Call useMusicStore(pinia).setCreateMusicUsecase() in main.ts.",
      );
    }
    return createMusicUsecase;
  };

  const getRemoveMusicUsecase = (): RemoveMusicUsecase => {
    if (!removeMusicUsecase) {
      throw new Error(
        "RemoveMusicUsecase is not set. Call useMusicStore(pinia).setRemoveMusicUsecase() in main.ts.",
      );
    }
    return removeMusicUsecase;
  };

  const getSubMusicMetadataUsecase = (): SubMusicMetadataUsecase => {
    if (!SubMusicMetadataUsecase) {
      throw new Error(
        "SubMusicMetadataUsecase is not set. Call useMusicStore(pinia).setSubMusicMetadataUsecase() in main.ts.",
      );
    }
    return SubMusicMetadataUsecase;
  };

  // DI用Setter
  const setFetchMusicUsecase = (value: FetchMusicUsecase): void => {
    fetchMusicUsecase = value;
  };

  const setCreateMusicUsecase = (value: CreateMusicUsecase): void => {
    createMusicUsecase = value;
  };

  const setRemoveMusicUsecase = (value: RemoveMusicUsecase): void => {
    removeMusicUsecase = value;
  };

  const setSubMusicMetadataUsecase = (value: SubMusicMetadataUsecase): void => {
    SubMusicMetadataUsecase = value;
  };

  // Subscription
  const startMusicListSubscription = (): void => {
    if (subscription) return;

    loading.value = true;
    error.value = undefined;
    const usecase = getSubMusicMetadataUsecase();

    subscription = usecase.observeMusicMetadata().subscribe({
      next: (dtos) => {
        musicList.value = dtos;
        loading.value = false;
      },
      error: (e) => {
        const errorMessage = e instanceof Error ? e.message : "";
        error.value = `音楽リストの購読に失敗しました: ${errorMessage}`;
        loading.value = false;
      },
    });
  };

  const stopMusicListSubscription = (): void => {
    subscription?.unsubscribe();
    subscription = undefined;
  };

  async function fetchMusic(dto: FetchMusicDto): Promise<void> {
    loading.value = true;
    error.value = undefined;
    const usecase = getFetchMusicUsecase();

    try {
      // selectedMusic.value = dto.music;
      selectedMusicUrl.value = await usecase.fetchMusic(dto);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "";
      error.value = `音楽の取得に失敗しました: ${errorMessage}`;
      selectedMusic.value = undefined;
      selectedMusicUrl.value = undefined;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function uploadMusic(dto: CreateMusicDto): Promise<void> {
    loading.value = true;
    error.value = undefined;
    const usecase = getCreateMusicUsecase();

    try {
      await usecase.uploadMusic(dto);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "";
      error.value = `"音楽のアップロードに失敗しました": ${errorMessage}`;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeMusic(dto: RemoveMusicDto): Promise<void> {
    loading.value = true;
    error.value = undefined;
    const usecase = getRemoveMusicUsecase();

    try {
      await usecase.removeMusic(dto);
      selectedMusic.value = undefined;
      selectedMusicUrl.value = undefined;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "";
      error.value = `音楽の削除に失敗しました: ${errorMessage}`;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    setFetchMusicUsecase,
    setCreateMusicUsecase,
    setRemoveMusicUsecase,
    setSubMusicMetadataUsecase,
    musicList,
    selectedMusic,
    selectedMusicUrl,
    loading,
    error,
    startMusicListSubscription,
    stopMusicListSubscription,
    fetchMusic,
    uploadMusic,
    removeMusic,
  };
});
