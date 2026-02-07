<template>
  <PageShell>
    <template #actions>
      <v-btn :to="{ name: 'admin' }">Admin</v-btn>
    </template>

    <MusicListPlayer />
  </PageShell>
</template>

<script setup lang="ts">
import MusicListPlayer from "@/components/MusicListPlayer.vue";
import PageShell from "@/components/PageShell.vue";
</script>

<style scoped></style>
