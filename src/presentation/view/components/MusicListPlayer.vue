<template>
  <v-list
    v-if="musicPlayerStore.tracks.length > 0"
    select-strategy="single-independent"
    v-model:selected="selectedIds"
    :disabled="musicStore.loading"
  >
    <v-list-item
      v-for="music in musicPlayerStore.tracks"
      :key="music.id"
      :value="music.id"
      color="primary"
    >
      <v-list-item-title>
        {{ formatTitle(music) }}
      </v-list-item-title>
    </v-list-item>
  </v-list>

  <!-- 再生位置 -->
  <v-container fluid>
    <v-row align="center">
      <v-col cols="auto">
        <p class="text-caption">
          {{ musicPlayerStore.currentPositionLabel() }}
        </p>
      </v-col>
      <v-col>
        <v-slider
          track-color="on-surface"
          v-model="sliderSeconds"
          :min="0"
          :max="Math.max(0, musicPlayerStore.playerState.musicDurationSeconds)"
          :step="1"
          hide-details
        />
      </v-col>
      <v-col cols="auto">
        <p class="text-caption">
          {{ musicPlayerStore.remainDurationLabel() }}
        </p>
      </v-col>
    </v-row>
  </v-container>

  <v-container class="d-flex justify-center align-center" fluid>
    <v-row justify="center" class="ga-2">
      <!-- リピート -->
      <v-col cols="auto">
        <!-- none -->
        <v-btn
          v-if="musicPlayerStore.playerState.repeatMode === 'none'"
          icon="$mdiRepeat"
          color="on-surface"
          variant="text"
          @click="toggleRepeat()"
        />
        <!-- all -->
        <v-btn
          v-else-if="musicPlayerStore.playerState.repeatMode === 'all'"
          icon="$mdiRepeat"
          color="primary"
          variant="text"
          @click="toggleRepeat()"
        />
        <!-- one -->
        <v-btn
          v-else
          icon="$mdiRepeatOnce"
          color="primary"
          variant="text"
          @click="toggleRepeat()"
        />
      </v-col>

      <!-- 前へ -->
      <v-col cols="auto">
        <v-btn
          color="on-surface"
          icon="$mdiSkipPrevious"
          variant="text"
          :disabled="!musicPlayerStore.canPrevious()"
          @click="musicPlayerStore.previous()"
        ></v-btn>
      </v-col>

      <!-- 再生/一時停止 -->
      <v-col cols="auto">
        <!-- 再生 -->
        <v-btn
          v-if="musicPlayerStore.isPlaying()"
          icon="$mdiPause"
          variant="tonal"
          @click="musicPlayerStore.pause()"
        >
        </v-btn>
        <!-- 一時停止 -->
        <v-btn
          v-else
          color="on-surface"
          icon="$mdiPlay"
          variant="tonal"
          :disabled="!musicPlayerStore.canPlaying()"
          @click="musicPlayerStore.play()"
        >
        </v-btn>
      </v-col>

      <!-- 次へ -->
      <v-col cols="auto">
        <v-btn
          color="on-surface"
          icon="$mdiSkipNext"
          variant="text"
          :disabled="!musicPlayerStore.canNext()"
          @click="musicPlayerStore.next()"
        ></v-btn>
      </v-col>

      <!-- シャッフル -->
      <v-col cols="auto">
        <v-btn
          icon="$mdiShuffleVariant"
          :color="
            musicPlayerStore.playerState.shuffleEnabled
              ? 'primary'
              : 'on-surface'
          "
          variant="text"
          @click="musicPlayerStore.toggleShuffle()"
        >
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useMusicPlayerStore } from "@/presentation/stores/useMusicPlayerStore";
import { useMusicStore } from "@/presentation/stores/useMusicStore";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";
import { computed, onMounted, onUnmounted } from "vue";

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

const selectedIds = computed<string[]>({
  get() {
    const id = musicPlayerStore.playerState.id;
    return id ? [id] : [];
  },
  set(ids) {
    // 選択変更時に呼ばれる
    const id = ids[0];
    const track = musicPlayerStore.tracks.find((t) => t.id === id);
    musicPlayerStore.selectTrack(track);
  },
});

const formatTitle = (music: SubMusicMetadataDto): string => {
  return (
    music.title +
    " - " +
    Math.floor(music.musicDurationSeconds / 60) +
    "分 " +
    (music.musicDataBytes / 1024 / 1024).toFixed(1) +
    "MB"
  );
};

onMounted(async () => {
  musicStore.startMusicListSubscription();
});

onUnmounted(() => {
  musicStore.stopMusicListSubscription();
});
</script>

<style scoped></style>
