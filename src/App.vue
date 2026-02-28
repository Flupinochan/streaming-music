<template>
  <!-- vhではなくスマホのURLバーを考慮したdvhを利用する -->
  <v-app>
    <keep-alive include="Home,Detail">
      <v-main class="d-flex flex-column" style="height: 100dvh">
        <router-view style="min-height: 0" />
      </v-main>
    </keep-alive>

    <MusicPlayerFooter />
  </v-app>
</template>

<script setup lang="ts">
import { useMusicStore } from "@/presentation/stores/useMusicStore";
import MusicPlayerFooter from "@/presentation/view/components/MusicPlayerFooter.vue";
import { onMounted } from "vue";

const musicStore = useMusicStore();

onMounted(() => {
  musicStore.startMusicListSubscription();
});
</script>

<style scoped></style>
