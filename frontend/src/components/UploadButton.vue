<template>
  <div>
    <v-btn :color="color" @click="trigger">
      <slot>Choose File</slot>
    </v-btn>
    <!-- eslint-disable-next-line -->
    <input :multiple="multiple" class="visually-hidden" type="file" v-on:change="files" ref="fileInput">
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const color = 'blue';
const multiple = false;
const fileInput = ref({} as HTMLInputElement);
const emit = defineEmits(['files']);

function files(e: Event) {
  if (e.target) emit('files', e.target, e);
}

function trigger() {
  if (fileInput.value) fileInput.value.click();
}
</script>

<style scoped>
.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
}
</style>
