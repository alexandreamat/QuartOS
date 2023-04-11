<template>
  <v-container fluid>
    <v-card class="ma-3 pa-3">
      <v-card-title primary-title>
        <div class="headline primary--text">Set Password</div>
      </v-card-title>
      <v-card-text>
        <template>
          <div class="my-3">
            <div class="subheading secondary--text text--lighten-2">User</div>
            <div class="title primary--text text--darken-2" v-if="userProfile.fullName">{{ userProfile.fullName }}</div>
            <div class="title primary--text text--darken-2" v-else>{{ userProfile.email }}</div>
          </div>
          <v-form ref="form">
            <v-text-field type="password" ref="password" label="Password" v-model="password1">
            </v-text-field>
            <v-text-field type="password" label="Confirm Password" v-model="password2">
            </v-text-field>
          </v-form>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="cancel">Cancel</v-btn>
        <v-btn @click="reset">Reset</v-btn>
        <v-btn @click="submit" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IUserProfileUpdate } from '@/interfaces';
import useMainStore from '@/stores/main';

const router = useRouter();
const mainStore = useMainStore();

const valid = ref(true);
const password1 = ref('');
const password2 = ref('');

const userProfile = computed(() => mainStore.userProfile);

function reset() {
  password1.value = '';
  password2.value = '';
}

function cancel() {
  router.back();
}

async function submit() {
  const updatedProfile: IUserProfileUpdate = {};
  updatedProfile.password = password1.value;
  await mainStore.updateUserProfile(updatedProfile);
  router.push('/main/profile');
}
</script>
