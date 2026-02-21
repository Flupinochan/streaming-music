import { useMusicPlayerStore } from "@/presentation/stores/useMusicPlayerStore";
import { defineStore } from "pinia";
import { ref } from "vue";
import { SubMusicMetadataUsecase } from "./../../use_cases/subMusicMetadataUsecase";

import type { Track } from "@/domain/gateways/MusicPlayer";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import { TrackId } from "@/domain/value_objects/trackId";
import type { CreateMusicDto } from "@/use_cases/createMusicDto";
import type { CreateMusicUsecase } from "@/use_cases/createMusicUsecase";
import type { RemoveMusicDto } from "@/use_cases/removeMusicDto";
import type { RemoveMusicUsecase } from "@/use_cases/removeMusicUsecase";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";

export const useMusicStore = defineStore("music", () => {
  let createMusicUsecase: CreateMusicUsecase | undefined = undefined;
  let removeMusicUsecase: RemoveMusicUsecase | undefined = undefined;
  let subMusicMetadataUsecase: SubMusicMetadataUsecase | undefined = undefined;

  // DynamoDBのMetadata
  const musicList = ref<SubMusicMetadataDto[]>([]);
  const selectedMusic = ref<SubMusicMetadataDto | undefined>(undefined);
  const tracks = ref<Track[]>([]);
  // UI State
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  const musicPlayerStore = useMusicPlayerStore();

  let subscription: { unsubscribe: () => void } | undefined = undefined;

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

    loading.value = true;
    error.value = undefined;
    const usecase = getSubMusicMetadataUsecase();

    subscription = usecase.observeMusicMetadata().subscribe({
      next: (dtos) => {
        musicList.value = dtos;
        tracks.value = dtos.map((dto) => ({
          id: TrackId.create(dto.id),
          musicDataPath: new MusicDataPath(dto.musicS3Path),
        }));
        // type Trackの弊害がでている。クラスにしたほうが良い
        musicPlayerStore.setTracks(tracks.value as Track[]);
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
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "";
      error.value = `音楽の削除に失敗しました: ${errorMessage}`;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    setCreateMusicUsecase,
    setRemoveMusicUsecase,
    setSubMusicMetadataUsecase,
    musicList,
    selectedMusic,
    loading,
    error,
    startMusicListSubscription,
    stopMusicListSubscription,
    uploadMusic,
    removeMusic,
  };
});
