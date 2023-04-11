<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate, RouteLocationNormalized } from 'vue-router';
import useMainStore from '@/stores/main';

const mainStore = useMainStore();

async function startRouteGuard(to: RouteLocationNormalized) {
  await mainStore.checkLoggedIn();
  if (mainStore.isLoggedIn) {
    if (to.path === '/login' || to.path === '/') {
      return '/main';
    }
  } else if (mainStore.isLoggedIn === false) {
    if (to.path === '/' || (to.path as string).startsWith('/main')) {
      return '/login';
    }
  }
  return '';
}

onBeforeRouteUpdate((to) => startRouteGuard(to));
onBeforeRouteLeave((to) => startRouteGuard(to));
</script>
