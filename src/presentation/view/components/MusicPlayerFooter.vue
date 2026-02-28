<template>
  <v-footer class="flex-column" app>
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
            :max="
              Math.max(0, musicPlayerStore.playerState.musicDurationSeconds)
            "
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

    <v-container class="d-flex justify-center align-center mb-4" fluid>
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
            @click="musicPlayerStore.toggleRepeatMode()"
          />
          <!-- all -->
          <v-btn
            v-else-if="musicPlayerStore.playerState.repeatMode === 'all'"
            :size="btnSize"
            icon="$mdiRepeat"
            color="primary"
            variant="text"
            @click="musicPlayerStore.toggleRepeatMode()"
          />
          <!-- one -->
          <v-btn
            v-else
            :size="btnSize"
            icon="$mdiRepeatOnce"
            color="primary"
            variant="text"
            @click="musicPlayerStore.toggleRepeatMode()"
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
  </v-footer>
</template>

<script setup lang="ts">
import { useResponsiveButton } from "@/presentation/composables/useResponsiveButton";
import { useMusicPlayerStore } from "@/presentation/stores/useMusicPlayerStore";
import type { SubMusicMetadataDto } from "@/use_cases/subMusicMetadataDto";
import { computed, onMounted, watch } from "vue";

const { btnSize } = useResponsiveButton();
const musicPlayerStore = useMusicPlayerStore();

const sliderSeconds = computed<number>({
  get: () => musicPlayerStore.playerState.positionSeconds,
  set: (v) => {
    musicPlayerStore.seek(v);
  },
});

onMounted(() => {
  if ("mediaSession" in navigator) {
    const actionHandlers: [MediaSessionAction, (...args: unknown[]) => void][] =
      [
        ["play", (): void => musicPlayerStore.play()],
        ["pause", (): void => musicPlayerStore.pause()],
        ["seekforward", (): void => musicPlayerStore.nextSeek()],
        ["seekbackward", (): void => musicPlayerStore.previousSeek()],
        [
          "previoustrack",
          (): Promise<SubMusicMetadataDto | undefined> =>
            musicPlayerStore.previous(),
        ],
        [
          "nexttrack",
          (): Promise<SubMusicMetadataDto | undefined> =>
            musicPlayerStore.next(),
        ],
        ["stop", (): void => musicPlayerStore.pause()],
        [
          "seekto",
          (...args: unknown[]): void => {
            const details = args[0] as { seekTime?: number } | undefined;
            if (details?.seekTime !== undefined) {
              musicPlayerStore.seek(details.seekTime);
            }
          },
        ],
      ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(
          action,
          handler as unknown as () => void,
        );
      } catch {}
    }
  }
});

const updateMediaSessionPosition = (): void => {
  if (!("mediaSession" in navigator)) return;
  if ("setPositionState" in navigator.mediaSession) {
    try {
      navigator.mediaSession.setPositionState({
        duration: musicPlayerStore.playerState.musicDurationSeconds,
        position: musicPlayerStore.playerState.positionSeconds,
        playbackRate: 1.0,
      });
    } catch {}
  }
};

watch(
  () => musicPlayerStore.playerState,
  (state) => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.title ?? "",
      artwork: state.artworkUrl
        ? [
            {
              src: state.artworkUrl,
            },
          ]
        : undefined,
    });

    navigator.mediaSession.playbackState =
      state.status === "playing"
        ? "playing"
        : state.status === "paused"
          ? "paused"
          : "none";

    updateMediaSessionPosition();
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
.play-button-padding {
  gap: clamp(0.5rem, 0.185rem + 1.34vw, 2rem);
}
</style>
