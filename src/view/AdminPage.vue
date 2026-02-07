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
    <v-btn
      :disabled="!selectedFile || musicStore.loading"
      :loading="musicStore.loading"
      @click="handleUpload"
    >
      アップロード
    </v-btn>
    <v-btn
      :disabled="!musicStore.selectedMusicS3Path || musicStore.loading"
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

const selectedFile = ref<File | null>(null);

const onFileSelected = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  selectedFile.value = input.files[0];

  musicPlayerStore.loadFromFile(selectedFile.value);
};

const handleUpload = async (): Promise<void> => {
  if (!selectedFile.value) return;
  try {
    const s3Path = selectedFile.value.name;
    await musicStore.uploadMusic({
      musicData: selectedFile.value,
      s3Path,
    });
  } catch (error) {
    console.error("upload error", error);
  }
};

const handleDelete = async (): Promise<void> => {
  if (!musicStore.selectedMusicS3Path) return;
  try {
    await musicStore.removeMusic();
  } catch (error) {
    console.error("delete error", error);
  }
};
</script>

<style scoped></style>
