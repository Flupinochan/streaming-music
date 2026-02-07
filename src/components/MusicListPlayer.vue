<template>
  <v-list
    v-model:selected="selectedMusicName"
    selectable
    select-strategy="single-independent"
    :disabled="musicStore.loading"
  >
    <v-list-item
      v-for="music in musicStore.musicList"
      :key="music.s3Path"
      :value="music.s3Path"
      @click="handleSelectMusic(music)"
    >
      <v-list-item-title>{{ music.s3Path }}</v-list-item-title>
    </v-list-item>
  </v-list>

  <div v-if="musicPlayerStore.musicUrl">
    <v-btn
      :disabled="musicPlayerStore.isPlaying"
      @click="musicPlayerStore.play"
    >
      再生
    </v-btn>
    <v-btn
      :disabled="!musicPlayerStore.isPlaying"
      @click="musicPlayerStore.pause"
    >
      一時停止
    </v-btn>
    <v-btn @click="musicPlayerStore.stop"> 停止 </v-btn>
    <v-btn
      :color="musicPlayerStore.repeatOne ? 'primary' : undefined"
      :variant="musicPlayerStore.repeatOne ? 'elevated' : 'outlined'"
      @click="musicPlayerStore.toggleRepeatOne"
    >
      {{ musicPlayerStore.repeatOne ? "リピート: 有効" : "リピート: 無効" }}
    </v-btn>
    <v-btn
      :color="musicPlayerStore.shuffleAll ? 'primary' : undefined"
      :variant="musicPlayerStore.shuffleAll ? 'elevated' : 'outlined'"
      @click="musicPlayerStore.toggleShuffleAll"
    >
      {{
        musicPlayerStore.shuffleAll ? "シャッフル: 有効" : "シャッフル: 無効"
      }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useMusicPlayerStore } from "@/stores/useMusicPlayerStore";
import { useMusicStore, type MusicItem } from "@/stores/useMusicStore";
import { computed, onMounted } from "vue";

const musicStore = useMusicStore();
const musicPlayerStore = useMusicPlayerStore();

const selectedMusicName = computed<string[]>({
  get: () =>
    musicPlayerStore.currentS3Path ? [musicPlayerStore.currentS3Path] : [],
  set: (v) => {
    musicPlayerStore.currentS3Path = v[0] ?? null;
  },
});

const handleSelectMusic = async (music: MusicItem): Promise<void> => {
  musicPlayerStore.currentS3Path = music.s3Path;
  try {
    await musicStore.fetchMusic(music);
    if (musicStore.selectedMusicUrl) {
      musicPlayerStore.loadFromUrl(musicStore.selectedMusicUrl.toString());
    }
  } catch (error) {
    console.error("select music error", error);
  }
};

onMounted(async () => {
  await musicStore.fetchMusicList();
  if (!musicPlayerStore.currentS3Path && musicStore.musicList.length > 0) {
    await handleSelectMusic(musicStore.musicList[0]);
  }
});
</script>

<style scoped></style>
