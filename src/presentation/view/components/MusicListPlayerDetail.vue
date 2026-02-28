<template>
  <v-container
    fluid
    class="pa-0 ma-0 relative-container d-flex align-center justify-center"
    :style="{
      backgroundImage: `url(${musicPlayerStore.playerState.artworkUrl})`,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundBlendMode: 'darken',
    }"
  >
    <div class="glass-overlay"></div>
    <v-img
      :src="musicPlayerStore.playerState.artworkUrl"
      style="view-transition-name: artwork"
      class="clickable"
      contain
      @click="handleImageClick()"
    />

    <div
      v-if="musicPlayerStore.playerState.title"
      class="title-overlay primary--text"
    >
      {{ musicPlayerStore.playerState.title }}
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useMusicPlayerStore } from "@/presentation/stores/useMusicPlayerStore";
import type { DetailProps } from "@/router";
import { watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<DetailProps>();

const musicPlayerStore = useMusicPlayerStore();
const router = useRouter();

watch(
  () => props.musicId,
  async (newId) => {
    if (!newId) return;
    if (newId !== musicPlayerStore.playerState.id) {
      await musicPlayerStore.selectTrackById(newId);
    }
  },
  { immediate: true },
);

watch(
  () => musicPlayerStore.playerState.id,
  (id) => {
    if (!id) return;
    if (id !== props.musicId) {
      router.replace({ name: "detail", params: { id } });
    }
  },
);

watch(
  () => musicPlayerStore.tracks,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_tracks) => {
    const id = props.musicId;
    if (id && !musicPlayerStore.playerState.id) {
      musicPlayerStore.selectTrackById(id);
    }
  },
  { immediate: true },
);

const handleImageClick = (): void => {
  router.push({ name: "home" });
};
</script>

<style scoped>
.play-button-padding {
  gap: clamp(0.5rem, 0.185rem + 1.34vw, 2rem);
}
.relative-container {
  position: relative;
}

.glass-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.clickable {
  cursor: pointer;
}

.title-overlay {
  position: absolute;
  bottom: clamp(0.5rem, 0.3rem + 1vw, 1.5rem);
  left: clamp(0.5rem, 0.3rem + 1vw, 1.5rem);
  font-size: clamp(1rem, 0.8rem + 1vw, 2rem);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}
</style>
