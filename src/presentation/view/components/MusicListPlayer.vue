<template>
  <div style="overflow-y: auto">
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
        <template #prepend>
          <v-img
            :src="music.artworkThumbnailUrl"
            :alt="music.title"
            style="view-transition-name: artwork"
            class="me-2"
            width="48"
            height="48"
            aspect-ratio="1"
            cover
            rounded="sm"
            :aria-label="`アートワーク${music.title}を表示する`"
            role="button"
            @click="handleImageClick(music)"
          >
            <template #placeholder>
              <v-skeleton-loader type="image" width="48" height="48" />
            </template>
          </v-img>
        </template>
        <v-list-item-title
          :aria-label="`曲名は${music.title}、再生時間は${Math.floor(music.musicDurationSeconds / 60)}分`"
        >
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
import { useRouter } from "vue-router";

const musicStore = useMusicStore();
const musicPlayerStore = useMusicPlayerStore();
const router = useRouter();

const handleImageClick = async (
  music: SubMusicMetadataViewDto,
): Promise<void> => {
  console.log("clicked image for music", music.title);
  await musicPlayerStore.selectTrack(music);

  router.push({
    name: "detail",
    params: { id: music.id },
  });
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

// subscription is started once in App.vue, components no longer need to manage it
</script>

<style scoped>
.play-button-padding {
  gap: clamp(0.5rem, 0.185rem + 1.34vw, 2rem);
}
</style>
