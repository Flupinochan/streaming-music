<template>
  <v-list
    v-model:selected="selectedMusicName"
    selectable
    select-strategy="single-independent"
    :disabled="musicStore.loading"
  >
    <v-list-item
      v-for="music in musicStore.musicList"
      :key="music.musicS3Path"
      :value="music.musicS3Path"
      @click="handleSelectMusic(music)"
    >
      <v-list-item-title>{{
        music.title +
        " - " +
        Math.floor(music.musicDurationSeconds / 60) +
        "分 " +
        (music.musicDataBytes / 1024 / 1024).toFixed(1) +
        "MB"
      }}</v-list-item-title>
    </v-list-item>
  </v-list>

  <div v-if="musicPlayerStore.musicUrl">
    <div class="mb-2">
      <v-slider
        v-model="sliderSeconds"
        :min="0"
        :max="Math.max(0, musicPlayerStore.durationSeconds)"
        :step="1"
        hide-details
        @start="musicPlayerStore.isSeeking = true"
        @end="musicPlayerStore.isSeeking = false"
      />
      <div class="text-caption">
        {{ musicPlayerStore.timeLabel }}
      </div>
    </div>

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
import { useMusicPlayerStore } from "@/presentation/stores/useMusicPlayerStore";
import { useMusicStore } from "@/presentation/stores/useMusicStore";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";
import { computed, onMounted, onUnmounted, watch } from "vue";

const musicStore = useMusicStore();
const musicPlayerStore = useMusicPlayerStore();

const selectedMusicName = computed<string[]>({
  get: () =>
    musicPlayerStore.activeS3Path ? [musicPlayerStore.activeS3Path] : [],
  set: (v) => {
    musicPlayerStore.activeS3Path = v[0] ?? null;
  },
});

const sliderSeconds = computed<number>({
  get: () => musicPlayerStore.positionSeconds,
  set: (v) => {
    musicPlayerStore.seekTo(v);
  },
});

const handleSelectMusic = async (music: SubMusicMetadataDto): Promise<void> => {
  musicPlayerStore.setNowPlaying(music);
  try {
    await musicStore.fetchMusic({ musicDataPath: music.musicS3Path });
    if (musicStore.selectedMusicUrl) {
      musicPlayerStore.loadFromUrl(musicStore.selectedMusicUrl.toString());
    }
  } catch (error) {
    console.error("select music error", error);
  }
};

onMounted(async () => {
  musicStore.startMusicListSubscription();
});

onUnmounted(() => {
  musicStore.stopMusicListSubscription();
});

watch(
  () => [musicPlayerStore.activeS3Path, musicStore.musicList] as const,
  async ([currentS3Path, list]) => {
    if (currentS3Path) return;
    if (list.length === 0) return;
    await handleSelectMusic(list[0]);
  },
  { immediate: true },
);
</script>

<style scoped></style>
