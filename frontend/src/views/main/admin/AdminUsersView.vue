<template>
  <div>
    <v-toolbar light>
      <v-toolbar-title>
        Manage Users
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" to="/main/admin/users/create">Create User</v-btn>
    </v-toolbar>
    <v-data-table :headers="headers" :items="users">
      <template v-slot:items="props">
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.fullName }}</td>
        <td><v-icon v-if="props.item.is_active">checkmark</v-icon></td>
        <td><v-icon v-if="props.item.is_superuser">checkmark</v-icon></td>
        <td class="justify-center layout px-0">
          <v-tooltip top>
            <span>Edit</span>
            <v-btn flat :to="{
              name: 'main-admin-users-edit',
              params: { id: props.item.id }
            }">
              <v-icon>edit</v-icon>
            </v-btn>
          </v-tooltip>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import useAdminStore from '@/stores/admin';

const adminStore = useAdminStore();
const headers = [
  {
    text: 'Name',
    sortable: true,
    value: 'name',
    align: 'left',
  },
  {
    text: 'Email',
    sortable: true,
    value: 'email',
    align: 'left',
  },
  {
    text: 'Full Name',
    sortable: true,
    value: 'fullName',
    align: 'left',
  },
  {
    text: 'Is Active',
    sortable: true,
    value: 'isActive',
    align: 'left',
  },
  {
    text: 'Is Superuser',
    sortable: true,
    value: 'isSuperuser',
    align: 'left',
  },
  {
    text: 'Actions',
    value: 'id',
  },
];

const users = computed(() => adminStore.users);

onMounted(async () => {
  await adminStore.getUsers();
});

</script>
