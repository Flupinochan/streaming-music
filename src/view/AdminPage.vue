<template>
  <PageShell>
    <template #actions>
      <v-btn :to="{ name: 'home' }">Home</v-btn>
    </template>

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
      :disabled="
        !selectedMusicFile || !selectedArtworkFile || musicStore.loading
      "
      :loading="musicStore.loading"
      @click="handleUpload"
    >
      アップロード
    </v-btn>
    <v-btn
      :disabled="!musicStore.selectedMusic || musicStore.loading"
      :loading="musicStore.loading"
      @click="handleDelete"
    >
      削除
    </v-btn>
  </PageShell>
</template>

<script setup lang="ts">
import MusicListPlayer from "@/components/MusicListPlayer.vue";
import PageShell from "@/components/PageShell.vue";
import { useMusicPlayerStore } from "@/stores/useMusicPlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { ref } from "vue";

const musicStore = useMusicStore();
const musicPlayerStore = useMusicPlayerStore();

const selectedMusicFile = ref<File | null>(null);
const selectedArtworkFile = ref<File | null>(null);
const selectedMusicDurationSeconds = ref<number | null>(null);

const baseName = (filename: string): string => filename.replace(/\.[^/.]+$/, "");

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
  musicPlayerStore.loadFromFile(selectedMusicFile.value);

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
    await musicStore.uploadMusic({
      musicFile: selectedMusicFile.value,
      artworkFile: selectedArtworkFile.value,
      title: baseName(selectedMusicFile.value.name),
      durationSeconds: selectedMusicDurationSeconds.value ?? 0,
    });
  } catch (error) {
    console.error("upload error", error);
  }
};

const handleDelete = async (): Promise<void> => {
  if (!musicStore.selectedMusic) return;
  try {
    await musicStore.removeMusic();
  } catch (error) {
    console.error("delete error", error);
  }
};
</script>

<style scoped></style>
