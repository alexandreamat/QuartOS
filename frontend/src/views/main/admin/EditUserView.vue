<template>
  <v-container fluid>
    <v-card class="ma-3 pa-3">
      <v-card-title primary-title>
        <div class="headline primary--text">Edit User</div>
      </v-card-title>
      <v-card-text>
        <template>
          <div class="my-3">
            <div class="subheading secondary--text text--lighten-2">Username</div>
            <div class="title primary--text text--darken-2" v-if="user">{{ user.email }}</div>
            <div class="title primary--text text--darken-2" v-else>-----</div>
          </div>
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
              <v-flex shrink>
                <v-checkbox v-model="setPassword" class="mr-2"></v-checkbox>
              </v-flex>
              <v-flex>
                <v-text-field :disabled="!setPassword" type="password" ref="password" label="Set Password"
                  v-model="password1">
                </v-text-field>
                <v-text-field v-show="setPassword" type="password" label="Confirm Password" v-model="password2">
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
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useAdminStore from '@/stores/admin';
import { IUserProfileUpdate } from '@/interfaces';

const valid = ref(true);
const fullName = ref('');
const email = ref('');
const isActive = ref(true);
const isSuperuser = ref(false);
const setPassword = ref(false);
const password1 = ref('');
const password2 = ref('');

const adminStore = useAdminStore();
const router = useRouter();

const user = computed(() => adminStore.adminOneUser(+router.currentRoute.value.params.id));

function reset() {
  setPassword.value = false;
  password1.value = '';
  password2.value = '';
  if (user.value) {
    fullName.value = user.value.fullName;
    email.value = user.value.email;
    isActive.value = user.value.isActive;
    isSuperuser.value = user.value.isSuperuser;
  }
}

onMounted(
  async () => {
    await adminStore.getUsers();
    reset();
  },
);

function cancel() {
  router.back();
}

async function submit() {
  if (!user.value) return;

  const updatedProfile: IUserProfileUpdate = {};
  if (fullName.value) {
    updatedProfile.fullName = fullName.value;
  }
  if (email.value) {
    updatedProfile.email = email.value;
  }
  updatedProfile.isActive = isActive.value;
  updatedProfile.isSuperuser = isSuperuser.value;
  if (setPassword.value) {
    updatedProfile.password = password1.value;
  }
  await adminStore.updateUser({ id: user.value.id, user: updatedProfile });
  router.push('/main/admin/users');
}

</script>
