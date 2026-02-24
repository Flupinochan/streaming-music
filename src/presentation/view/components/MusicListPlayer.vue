<template>
  <v-list
    v-if="musicStore.selectedMusic"
    selectable
    select-strategy="single-independent"
    :disabled="musicStore.loading"
  >
    <v-list-item
      v-for="music in musicStore.musicList"
      :key="music.musicS3Path"
      :value="music"
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

  <div v-if="musicStore.selectedMusic">
    <div class="mb-2">
      <v-slider
        v-model="sliderSeconds"
        :min="0"
        :max="Math.max(0, musicPlayerStore.playerState.durationSeconds.value)"
        :step="1"
        hide-details
      />
      <div class="text-caption">
        {{ musicPlayerStore.playerState.durationSeconds.getLabel() }}
      </div>
    </div>

    <v-btn
      :disabled="musicPlayerStore.isPlaying()"
      @click="musicPlayerStore.play"
    >
      再生
    </v-btn>
    <v-btn
      :disabled="!musicPlayerStore.isPlaying()"
      @click="musicPlayerStore.pause"
    >
      一時停止
    </v-btn>
    <v-btn @click="musicPlayerStore.stop"> 停止 </v-btn>
    <v-btn
      :color="
        musicPlayerStore.playerState.repeatMode !== 'none'
          ? 'primary'
          : undefined
      "
      :variant="
        musicPlayerStore.playerState.repeatMode !== 'none'
          ? 'elevated'
          : 'outlined'
      "
      @click="toggleRepeat()"
    >
      {{
        musicPlayerStore.playerState.repeatMode === "none"
          ? "リピート: 無効"
          : musicPlayerStore.playerState.repeatMode === "one"
            ? "リピート: 1曲"
            : "リピート: 全曲"
      }}
    </v-btn>
    <v-btn
      :color="
        musicPlayerStore.playerState.shuffleEnabled ? 'primary' : undefined
      "
      :variant="
        musicPlayerStore.playerState.shuffleEnabled ? 'elevated' : 'outlined'
      "
      @click="musicPlayerStore.toggleShuffle()"
    >
      {{
        musicPlayerStore.playerState.shuffleEnabled
          ? "シャッフル: 有効"
          : "シャッフル: 無効"
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

const sliderSeconds = computed<number>({
  get: () => musicPlayerStore.playerState.positionSeconds.value,
  set: (v) => {
    musicPlayerStore.seek(v);
  },
});

const toggleRepeat = (): void => {
  const current = musicPlayerStore.playerState.repeatMode;
  const next = current === "none" ? "one" : current === "one" ? "all" : "none";
  musicPlayerStore.setRepeatMode(next);
};

const handleSelectMusic = async (music: SubMusicMetadataDto): Promise<void> => {
  musicStore.selectedMusic = music;
  await musicPlayerStore.selectTrack(music.id);
};

onMounted(async () => {
  musicStore.startMusicListSubscription();
});

onUnmounted(() => {
  musicStore.stopMusicListSubscription();
});

watch(
  () => [musicStore.selectedMusic, musicStore.musicList] as const,
  async ([selectedMusic, list]) => {
    if (selectedMusic) return;
    if (list.length === 0) return;
    await handleSelectMusic(list[0]);
  },
  { immediate: true },
);
</script>

<style scoped></style>
