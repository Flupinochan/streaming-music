<template>
  <div style="overflow-y: auto">
    <v-list
      v-if="musicPlayerStore.tracks.length > 0"
      role="listbox"
      mandatory
      select-strategy="single-independent"
      v-model:selected="selectedIds"
      class="pa-0"
      :disabled="musicStore.loading"
      aria-label="再生リスト"
    >
      <v-list-item
        v-for="music in musicPlayerStore.tracks"
        :key="music.id"
        :value="music.id"
        class="pa-4"
        color="primary"
        tabindex="0"
        :aria-label="`${formatTitle(music)}`"
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
            alt=""
            role="img"
            aria-hidden="true"
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
  </div>
</template>

<script setup lang="ts">
import {
  useMusicPlayerStore,
  type SubMusicMetadataViewDto,
} from "@/presentation/stores/useMusicPlayerStore";
import { useMusicStore } from "@/presentation/stores/useMusicStore";
import { computed } from "vue";

const musicStore = useMusicStore();
const musicPlayerStore = useMusicPlayerStore();

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
    " " +
    Math.floor(music.musicDurationSeconds / 60) +
    "分 " +
    (music.musicDataBytes / 1024 / 1024).toFixed(1) +
    "MB"
  );
};
</script>

<style scoped>
.v-list-item {
  border-top: 1px inset rgba(255, 255, 255, 0.15);
}

.v-list-item:first-child {
  border-top: none;
}
</style>
