<template>
  <div id="app">
    <v-app>
      <v-content v-if="loggedIn === null">
        <v-container fill-height>
          <v-layout align-center justify-center>
            <v-flex>
              <div class="text-xs-center">
                <div class="headline my-5">Loading...</div>
                <v-progress-circular size="100" indeterminate color="primary"></v-progress-circular>
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
      <router-view v-else />
      <NotificationsManager />
    </v-app>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import NotificationsManager from '@/components/NotificationsManager.vue';
import useMainStore from './stores/main';

const mainStore = useMainStore();

const loggedIn = computed(() => mainStore.isLoggedIn);

onMounted(async () => {
  await mainStore.checkLoggedIn();
});
</script>
