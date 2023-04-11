<template>
  <v-container fluid>
    <v-card class="ma-3 pa-3">
      <v-card-title primary-title>
        <div class="headline primary--text">Dashboard</div>
      </v-card-title>
      <v-card-text>
        <div class="headline font-weight-light ma-5">Welcome {{ greetedUser }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn to="/main/profile/view">View Profile</v-btn>
        <v-btn to="/main/profile/edit">Edit Profile</v-btn>
        <v-btn to="/main/profile/password">Change Password</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useMainStore from '@/stores/main';

const mainStore = useMainStore();
const greetedUser = computed(() => {
  const { userProfile } = mainStore;
  if (userProfile) {
    if (userProfile.fullName) {
      return userProfile.fullName;
    }
    return userProfile.email;
  }
  return '';
});
</script>
