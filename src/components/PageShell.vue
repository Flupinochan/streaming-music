<template>
  <main class="m-4">
    <div v-if="$slots.actions" class="d-flex justify-end mb-4">
      <slot name="actions" />
    </div>

    <slot />
  </main>
</template>

<script setup lang="ts"></script>

<style scoped></style>
