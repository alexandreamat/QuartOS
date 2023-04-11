<template>
  <v-container fluid>
    <v-card class="ma-3 pa-3">
      <v-card-title primary-title>
        <div class="headline primary--text">Edit User Profile</div>
      </v-card-title>
      <v-card-text>
        <template>
          <v-form v-model="valid" ref="form" lazy-validation>
            <v-text-field label="Full Name" v-model="fullName" required></v-text-field>
            <v-text-field label="E-mail" type="email" v-model="email" required></v-text-field>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import useMainStore from '@/stores/main';

const router = useRouter();
const mainStore = useMainStore();

const valid = ref(true);
const fullName = ref('');
const email = ref('');

const form = ref(null);

onMounted(
  () => {
    const { userProfile } = mainStore;
    if (userProfile) {
      fullName.value = userProfile.fullName;
      email.value = userProfile.email;
    }
  },
);

function reset() {
  const { userProfile } = mainStore;
  if (userProfile) {
    fullName.value = userProfile.fullName;
    email.value = userProfile.email;
  }
}

function cancel() {
  router.back();
}

const submit = async () => {
  const updatedProfile = mainStore.userProfile;
  if (fullName.value) {
    updatedProfile.fullName = fullName.value;
  }
  if (email.value) {
    updatedProfile.email = email.value;
  }
  await mainStore.updateUserProfile(updatedProfile);
  router.push('/main/profile');
};
</script>
