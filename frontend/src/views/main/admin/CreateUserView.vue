<template>
  <v-container fluid>
    <v-card class="ma-3 pa-3">
      <v-card-title primary-title>
        <div class="headline primary--text">Create User</div>
      </v-card-title>
      <v-card-text>
        <template>
          <v-form v-model="valid" ref="form" lazy-validation>
            <v-text-field label="Full Name" v-model="fullName" required></v-text-field>
            <v-text-field label="E-mail" type="email" v-model="email" required></v-text-field>
            <div class="subheading secondary--text text--lighten-2">User is superuser <span v-if="isSuperuser">(currently
                is a superuser)</span><span v-else>(currently is not a superuser)</span></div>
            <v-checkbox label="Is Superuser" v-model="isSuperuser"></v-checkbox>
            <div class="subheading secondary--text text--lighten-2">User is active <span v-if="isActive">(currently
                active)</span><span v-else>(currently not active)</span></div>
            <v-checkbox label="Is Active" v-model="isActive"></v-checkbox>
            <v-layout align-center>
              <v-flex>
                <v-text-field type="password" ref="password" label="Set Password" v-model="password1">
                </v-text-field>
                <v-text-field type="password" label="Confirm Password" v-model="password2">
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="cancel">Cancel</v-btn>
        <v-btn @click="reset">Reset</v-btn>
        <v-btn @click="submit" :disabled="!valid">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useAdminStore from '@/stores/admin';
import { IUserProfileCreate } from '@/interfaces';

const valid = ref(false);
const fullName = ref('');
const email = ref('');
const isActive = ref(true);
const isSuperuser = ref(false);
const password1 = ref('');
const password2 = ref('');

const router = useRouter();
const adminStore = useAdminStore();

function reset() {
  password1.value = '';
  password2.value = '';
  fullName.value = '';
  email.value = '';
  isActive.value = true;
  isSuperuser.value = false;
}

onMounted(async () => {
  await adminStore.getUsers();
  reset();
});

function cancel() {
  router.back();
}

async function submit() {
  const updatedProfile: IUserProfileCreate = { email: email.value };
  if (fullName.value) updatedProfile.fullName = fullName.value;
  if (email.value) updatedProfile.email = email.value;
  updatedProfile.isActive = isActive.value;
  updatedProfile.isSuperuser = isSuperuser.value;
  updatedProfile.password = password1.value;
  await adminStore.createUser(updatedProfile);
  router.push('/main/admin/users');
}
</script>
