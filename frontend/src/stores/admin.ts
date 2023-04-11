import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { IUserProfile, IUserProfileUpdate, IUserProfileCreate } from '@/interfaces';
import { api } from '@/api';
import { AxiosError } from 'axios';
import useMainStore from './main';

const mainStore = useMainStore();

const useAdminStore = defineStore('admin', () => {
  // state
  const users = ref([] as Array<IUserProfile>);

  // getters
  const adminOneUser = computed(() => (userId: number) => {
    const filteredUsers = users.value.filter((user) => user.id === userId);
    if (filteredUsers.length > 0) {
      return { ...filteredUsers[0] };
    }
    return null;
  });

  // actions
  function setUser(payload: IUserProfile) {
    const filteredUsers = users.value.filter((user: IUserProfile) => user.id !== payload.id);
    filteredUsers.push(payload);
    users.value = filteredUsers;
  }

  async function getUsers() {
    try {
      const response = await api.getUsers(mainStore.token);
      if (response) users.value = response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        await mainStore.checkApiError(error);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  async function updateUser(payload: { id: number, user: IUserProfileUpdate }) {
    try {
      const loadingNotification = { content: 'saving', showProgress: true };
      mainStore.notifications.push(loadingNotification);
      const response = (await Promise.all([
        api.updateUser(mainStore.token, payload.id, payload.user),
        await new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 500); }),
      ]))[0];
      setUser(response.data);
      mainStore.removeNotification(loadingNotification);
      mainStore.notifications.push({ content: 'User successfully updated', color: 'success' });
    } catch (error) {
      if (error instanceof AxiosError) {
        await mainStore.checkApiError(error);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  async function createUser(payload: IUserProfileCreate) {
    try {
      const loadingNotification = { content: 'saving', showProgress: true };
      mainStore.notifications.push(loadingNotification);
      const response = (await Promise.all([
        api.createUser(mainStore.token, payload),
        await new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 500); }),
      ]))[0];
      setUser(response.data);
      mainStore.removeNotification(loadingNotification);
      mainStore.notifications.push({ content: 'User successfully created', color: 'success' });
    } catch (error) {
      if (error instanceof AxiosError) {
        await mainStore.checkApiError(error);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  return {
    users,
    adminOneUser,
    setUser,
    getUsers,
    updateUser,
    createUser,
  };
});

export default useAdminStore;
