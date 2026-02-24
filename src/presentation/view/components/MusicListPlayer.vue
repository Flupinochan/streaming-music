<template>
  <v-list
    v-if="musicPlayerStore.tracks.length > 0"
    selectable
    select-strategy="single-independent"
    :disabled="musicStore.loading"
  >
    <v-list-item
      v-for="music in musicPlayerStore.tracks"
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

  <div v-if="musicPlayerStore.tracks.length > 0">
    <div class="mb-2">
      <v-slider
        v-model="sliderSeconds"
        :min="0"
        :max="Math.max(0, musicPlayerStore.playerState.musicDurationSeconds)"
        :step="1"
        hide-details
      />
      <div class="text-caption">
        {{ musicPlayerStore.playerState.musicDurationSeconds }}
      </div>
    </div>

    <v-btn
      :disabled="!musicPlayerStore.canPlaying()"
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
    <v-btn
      :disabled="!musicPlayerStore.isPlaying()"
      @click="musicPlayerStore.stop"
    >
      停止
    </v-btn>
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
import { computed, onMounted, onUnmounted, ref } from "vue";

const selected = ref<SubMusicMetadataDto | undefined>(undefined);
const musicStore = useMusicStore();
const musicPlayerStore = useMusicPlayerStore();

const sliderSeconds = computed<number>({
  get: () => musicPlayerStore.playerState.positionSeconds,
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
  if (selected.value?.id === music.id) {
    selected.value = undefined;
    await musicPlayerStore.selectTrack(undefined);
    return;
  }

  selected.value = music;
  await musicPlayerStore.selectTrack(music);
};

onMounted(async () => {
  musicStore.startMusicListSubscription();
});

onUnmounted(() => {
  musicStore.stopMusicListSubscription();
});
</script>

<style scoped></style>
