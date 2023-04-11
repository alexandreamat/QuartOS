<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>{{ appName }} - Reset Password</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <p class="subheading">Enter your new password below</p>
              <v-form @keyup.enter="submit" v-model="valid" ref="form" @submit.prevent="" lazy-validation>
                <v-text-field type="password" ref="password" label="Password" v-model="password1">
                </v-text-field>
                <v-text-field type="password" label="Confirm Password" v-model="password2">
                </v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="cancel">Cancel</v-btn>
              <v-btn @click="reset">Clear</v-btn>
              <v-btn @click="submit" :disabled="!valid">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useMainStore from '@/stores/main';
import { appName } from '@/env';

const password1 = ref('');
const password2 = ref('');
const valid = ref(true);
const router = useRouter();
const mainStore = useMainStore();
const form = ref(null);

function checkToken() {
  const token = (router.currentRoute.value.query.token as string);
  if (!token) {
    mainStore.notifications.push({
      content: 'No token provided in the URL, start a new password recovery',
      color: 'error',
    });
    router.push('/recover-password');
    return null;
  }
  return token;
}

function reset() {
  password1.value = '';
  password2.value = '';
}

const cancel = () => {
  router.push('/');
};

async function submit() {
  const token = checkToken();
  if (token) {
    await mainStore.resetPassword({ token, password: password1.value });
    router.push('/');
  }
}
</script>
