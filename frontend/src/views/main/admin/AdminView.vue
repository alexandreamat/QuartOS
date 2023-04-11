<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

import useMainStore from '@/stores/main';

const mainStore = useMainStore();

async function routeGuardAdmin() {
  if (!mainStore.hasAdminAccess) {
    return '/main';
  }
  return '';
}

onBeforeRouteLeave(() => routeGuardAdmin());

onBeforeRouteUpdate(() => routeGuardAdmin());
</script>
