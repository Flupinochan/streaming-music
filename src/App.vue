<template>
  <keep-alive include="Home,Detail">
    <router-view />
  </keep-alive>
</template>

<script setup lang="ts">
import { useMusicStore } from "@/presentation/stores/useMusicStore";
import { onMounted } from "vue";

const musicStore = useMusicStore();

onMounted(() => {
  musicStore.startMusicListSubscription();
});
</script>

<style scoped></style>
