<template>
  <MusicListPlayer />

  <v-file-input
    label="Music file input"
    accept="audio/*"
    variant="solo"
    prepend-icon="$fileImage"
    show-size
    @change="onFileSelected"
  />
  <v-file-input
    label="Artwork image file input"
    accept="image/*"
    variant="solo"
    prepend-icon="$fileImage"
    show-size
    @change="onArtworkSelected"
  />
  <v-btn
    :disabled="!selectedMusicFile || !selectedArtworkFile || musicStore.loading"
    :loading="musicStore.loading"
    @click="handleUpload"
  >
    アップロード
  </v-btn>
  <v-btn
    :disabled="!musicPlayerStore.playerState.id || musicStore.loading"
    :loading="musicStore.loading"
    @click="handleDelete"
  >
    削除
  </v-btn>
</template>

<script setup lang="ts">
import { useMusicStore } from "@/presentation/stores/useMusicStore";
import MusicListPlayer from "@/presentation/view/components/MusicListPlayer.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useMusicPlayerStore } from "../stores/useMusicPlayerStore";

const musicStore = useMusicStore();
const musicPlayerStore = useMusicPlayerStore();

const selectedMusicFile = ref<File | null>(null);
const selectedArtworkFile = ref<File | null>(null);
const selectedMusicDurationSeconds = ref<number | null>(null);

const getAudioDurationSeconds = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";

    audio.onloadedmetadata = (): void => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      URL.revokeObjectURL(url);
      resolve(Math.round(duration));
    };

    audio.onerror = (): void => {
      URL.revokeObjectURL(url);
      reject(new Error("failed to load audio metadata"));
    };

    audio.src = url;
  });

const onFileSelected = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  selectedMusicFile.value = input.files[0];

  selectedMusicDurationSeconds.value = null;
  try {
    selectedMusicDurationSeconds.value = await getAudioDurationSeconds(
      selectedMusicFile.value,
    );
  } catch (error) {
    console.warn("duration calc error", error);
  }
};

const onArtworkSelected = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  selectedArtworkFile.value = input.files[0];
};

const handleUpload = async (): Promise<void> => {
  if (!selectedMusicFile.value) return;
  if (!selectedArtworkFile.value) return;
  try {
    const thumbnailBlob = await createThumbnail(selectedArtworkFile.value);

    await musicStore.uploadMusic({
      musicDataFile: selectedMusicFile.value,
      artworkImageFile: selectedArtworkFile.value,
      artworkThumbnailImageBlob: thumbnailBlob,
      musicDurationSeconds: selectedMusicDurationSeconds.value ?? 0,
    });
  } catch (error) {
    console.error("upload error", error);
  }
};

const handleDelete = async (): Promise<void> => {
  if (
    !musicPlayerStore.playerState.id ||
    !musicPlayerStore.playerState.musicS3Path ||
    !musicPlayerStore.playerState.artworkS3Path
  )
    return;

  await musicStore.removeMusic({
    id: musicPlayerStore.playerState.id,
    musicDataPath: musicPlayerStore.playerState.musicS3Path,
    artworkImagePath: musicPlayerStore.playerState.artworkS3Path,
  });
};

async function createThumbnail(file: File, maxSize = 300): Promise<Blob> {
  const img = new Image();
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (): void => {
      img.src = reader.result as string;
    };

    img.onload = (): void => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject();

      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject();
          resolve(blob);
        },
        "image/jpeg",
        0.8,
      );
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const router = useRouter();
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === "a") {
    router.push({ path: "home" });
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped></style>
