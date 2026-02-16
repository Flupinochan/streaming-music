<template>
  <PageShell>
    <template #actions>
      <v-btn :to="{ name: 'admin' }">Admin</v-btn>
    </template>

    <MusicListPlayer />
  </PageShell>
</template>

<script setup lang="ts">
import MusicListPlayer from "@/presentation/view/components/MusicListPlayer.vue";
import PageShell from "@/presentation/view/components/PageShell.vue";
</script>

<style scoped></style>
