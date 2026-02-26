import { defineStore } from "pinia";
import { ref } from "vue";
import { SubMusicMetadataUsecase } from "./../../use_cases/subMusicMetadataUsecase";
import {
  useMusicPlayerStore,
  type SubMusicMetadataViewDto,
} from "./useMusicPlayerStore";

import { FetchMusicDto } from "@/use_cases/fetchMusicDto";
import type { FetchMusicUsecase } from "@/use_cases/fetchMusicUsecase";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";
import type { CreateMusicDto } from "../../use_cases/createMusicDto";
import type { CreateMusicUsecase } from "../../use_cases/createMusicUsecase";
import type { RemoveMusicDto } from "../../use_cases/removeMusicDto";
import type { RemoveMusicUsecase } from "../../use_cases/removeMusicUsecase";

export const useMusicStore = defineStore("music", () => {
  let fetchMusicUsecase: FetchMusicUsecase | undefined = undefined;
  let createMusicUsecase: CreateMusicUsecase | undefined = undefined;
  let removeMusicUsecase: RemoveMusicUsecase | undefined = undefined;
  let subMusicMetadataUsecase: SubMusicMetadataUsecase | undefined = undefined;
  const musicPlayerStore = useMusicPlayerStore();

  // UI State
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  let subscription: { unsubscribe: () => void } | undefined = undefined;

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
    if (!subMusicMetadataUsecase) {
      throw new Error(
        "SubMusicMetadataUsecase is not set. Call useMusicStore(pinia).setSubMusicMetadataUsecase() in main.ts.",
      );
    }
    return subMusicMetadataUsecase;
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
    subMusicMetadataUsecase = value;
  };

  // Subscription
  const startMusicListSubscription = (): void => {
    if (subscription) return;

    error.value = undefined;
    const getUseCase = getFetchMusicUsecase();
    const usecase = getSubMusicMetadataUsecase();

    subscription = usecase.observeMusicMetadata().subscribe({
      next: async (dtos: SubMusicMetadataDto[]) => {
        const enriched: SubMusicMetadataViewDto[] = await Promise.all(
          dtos.map(async (dto) => {
            const artworkUrl = await getUseCase.fetchMusic(
              new FetchMusicDto(dto.artworkS3Path),
            );
            const thumbnailUrl = await getUseCase.fetchMusic(
              new FetchMusicDto(dto.artworkThumbnailS3Path),
            );
            return {
              ...dto,
              artworkUrl: artworkUrl.toString(),
              artworkThumbnailUrl: thumbnailUrl.toString(),
            };
          }),
        );

        musicPlayerStore.setTracks(enriched);
      },
      error: (e) => {
        const errorMessage = e instanceof Error ? e.message : "";
        error.value = `音楽リストの購読に失敗しました: ${errorMessage}`;
      },
    });
  };

  const stopMusicListSubscription = (): void => {
    subscription?.unsubscribe();
    subscription = undefined;
  };

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
    loading,
    error,
    startMusicListSubscription,
    stopMusicListSubscription,
    uploadMusic,
    removeMusic,
  };
});
