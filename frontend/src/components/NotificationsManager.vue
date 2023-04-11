<template>
  <div>
    <v-snackbar auto-height :color="currentNotificationColor" v-model="show">
      <v-progress-circular class="ma-2" indeterminate v-show="showProgress"></v-progress-circular>
      {{ currentNotificationContent }}
      <v-btn flat @click="close">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import useMainStore, { AppNotification } from '@/stores/main';

const mainStore = useMainStore();

const show = ref(false);
const showProgress = ref(false);
const currentNotification = ref<AppNotification | false>(false);

async function hide() {
  show.value = false;
  await new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 500); });
}

async function close() {
  await hide();
  // eslint-disable-next-line no-use-before-define
  await removeCurrentNotification();
}

async function removeCurrentNotification() {
  if (currentNotification.value) {
    mainStore.removeNotification(currentNotification.value);
  }
}

function setNotification(notification: AppNotification | false) {
  if (show.value) {
    hide();
  }
  if (notification) {
    currentNotification.value = notification;
    showProgress.value = notification.showProgress || false;
    show.value = true;
  } else {
    currentNotification.value = false;
  }
}

watch(
  () => mainStore.firstNotification,
  async (newNotification: AppNotification | false) => {
    if (newNotification !== currentNotification.value) {
      setNotification(newNotification);
      if (newNotification) {
        mainStore.asyncRemoveNotification({ notification: newNotification, timeout: 6500 });
      }
    }
  },
);

function currentNotificationContent() {
  return (currentNotification.value && currentNotification.value.content) || '';
}

function currentNotificationColor() {
  return (currentNotification.value && currentNotification.value.color) || 'info';
}
</script>
