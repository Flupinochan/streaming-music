import { getUrl, list, remove, uploadData } from "aws-amplify/storage";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface MusicItem {
  s3Path: string;
}

export interface UploadMusicRequest {
  s3Path: string;
  musicData: Blob;
}

export const useMusicStore = defineStore("music", () => {
  const baseMusicPath = "music";

  const musicList = ref<MusicItem[]>([]);
  const selectedMusicS3Path = ref<string | null>(null);
  const selectedMusicUrl = ref<URL | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMusicList(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const result = await list({
        path: `${baseMusicPath}/`,
        options: { listAll: true },
      });

      musicList.value = result.items
        .map((item) => item.path)
        .filter((p): p is string => typeof p === "string" && p.length > 0)
        .map((path) => ({
          s3Path: path.replace(`${baseMusicPath}/`, ""),
        }));
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
      const linkToStorageFile = await getUrl({
        path: `${baseMusicPath}/${music.s3Path}`,
      });
      selectedMusicS3Path.value = music.s3Path;
      selectedMusicUrl.value = linkToStorageFile.url;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "音楽の取得に失敗しました";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function uploadMusic(music: UploadMusicRequest): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await uploadData({
        data: music.musicData,
        path: `${baseMusicPath}/${music.s3Path}`,
      }).result;

      await fetchMusicList();
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "音楽のアップロードに失敗しました";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeMusic(): Promise<void> {
    loading.value = true;
    error.value = null;

    if (!selectedMusicS3Path.value) return;

    try {
      await remove({
        path: `${baseMusicPath}/${selectedMusicS3Path.value}`,
      }).result;
      selectedMusicS3Path.value = null;
      await fetchMusicList();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "音楽の削除に失敗しました";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    musicList,
    selectedMusicS3Path,
    selectedMusicUrl,
    loading,
    error,
    fetchMusicList,
    fetchMusic,
    uploadMusic,
    removeMusic,
  };
});
