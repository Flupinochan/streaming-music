<template>
  <img
    v-if="showPlayer"
    :src="musicPlayerStore.playerState.artworkUrl"
    style="view-transition-name: artwork"
    class="overlay"
    @click="togglePlayer"
  />

  <v-list
    v-if="musicPlayerStore.tracks.length > 0 && !showPlayer"
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
      <template #prepend>
        <v-img
          :src="music.artworkThumbnailUrl"
          style="view-transition-name: artwork"
          class="me-2"
          width="48"
          height="48"
          aspect-ratio="1"
          cover
          rounded="sm"
          @click="togglePlayer()"
        >
          <template #placeholder>
            <v-skeleton-loader type="image" width="48" height="48" />
          </template>
        </v-img>
      </template>
      <v-list-item-title>
        {{ formatTitle(music) }}
      </v-list-item-title>
    </v-list-item>
  </v-list>

  <!-- 再生位置 -->
  <v-container fluid>
    <v-row align="center" class="ga-2">
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
          :disabled="!musicPlayerStore.canPlaying()"
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
    <v-row justify="center" class="play-button-padding">
      <!-- リピート -->
      <v-col cols="auto">
        <!-- none -->
        <v-btn
          v-if="musicPlayerStore.playerState.repeatMode === 'none'"
          :size="btnSize"
          icon="$mdiRepeat"
          color="on-surface"
          variant="text"
          @click="toggleRepeat()"
        />
        <!-- all -->
        <v-btn
          v-else-if="musicPlayerStore.playerState.repeatMode === 'all'"
          :size="btnSize"
          icon="$mdiRepeat"
          color="primary"
          variant="text"
          @click="toggleRepeat()"
        />
        <!-- one -->
        <v-btn
          v-else
          :size="btnSize"
          icon="$mdiRepeatOnce"
          color="primary"
          variant="text"
          @click="toggleRepeat()"
        />
      </v-col>

      <!-- 前へ -->
      <v-col cols="auto">
        <v-btn
          :size="btnSize"
          color="on-surface"
          icon="$mdiSkipPrevious"
          variant="text"
          :disabled="!musicPlayerStore.canPrevious()"
          @click="musicPlayerStore.previous()"
        ></v-btn>
      </v-col>

      <!-- 再生/一時停止 -->
      <v-col cols="auto">
        <!-- 一時停止 -->
        <v-btn
          v-if="musicPlayerStore.isPlaying()"
          :size="btnSize"
          icon="$mdiPause"
          variant="tonal"
          @click="musicPlayerStore.pause()"
        >
        </v-btn>
        <!-- 再生 -->
        <v-btn
          v-else
          :size="btnSize"
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
          :size="btnSize"
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
          :size="btnSize"
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
import { useResponsiveButton } from "@/presentation/composables/useResponsiveButton";
import {
  useMusicPlayerStore,
  type SubMusicMetadataViewDto,
} from "@/presentation/stores/useMusicPlayerStore";
import { useMusicStore } from "@/presentation/stores/useMusicStore";
import { computed, onMounted, onUnmounted, ref } from "vue";

const { btnSize } = useResponsiveButton();
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

const formatTitle = (music: SubMusicMetadataViewDto): string => {
  return (
    music.title +
    " - " +
    Math.floor(music.musicDurationSeconds / 60) +
    "分 " +
    (music.musicDataBytes / 1024 / 1024).toFixed(1) +
    "MB"
  );
};

const showPlayer = ref(false);
function togglePlayer(): void {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      showPlayer.value = !showPlayer.value;
    });
  } else {
    showPlayer.value = !showPlayer.value;
  }
}

onMounted(async () => {
  musicStore.startMusicListSubscription();
});

onUnmounted(() => {
  musicStore.stopMusicListSubscription();
});
</script>

<style scoped>
.play-button-padding {
  gap: clamp(0.5rem, 0.185rem + 1.34vw, 2rem);
}
</style>
