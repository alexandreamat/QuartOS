import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { AxiosError } from 'axios';

import { api } from '@/api';
import { IUserProfile, IUserProfileUpdate } from '@/interfaces';
import { getLocalToken, removeLocalToken, saveLocalToken } from '@/utils';
import { useRouter } from 'vue-router';

export interface AppNotification {
  content: string;
  color?: string;
  showProgress?: boolean;
}
const router = useRouter();

const useMainStore = defineStore('main', () => {
  // state
  const isLoggedIn = ref(false);
  const token = ref('');
  const logInError = ref(false);
  const userProfile = ref({} as IUserProfile);
  const dashboardMiniDrawer = ref(false);
  const dashboardShowDrawer = ref(true);
  const notifications = ref([] as Array<AppNotification>);

  // getters
  const hasAdminAccess = computed(() => userProfile.value
    && userProfile.value.isSuperuser && userProfile.value.isActive);
  const firstNotification = computed(() => notifications.value.length > 0
    && notifications.value[0]);

  // actions
  function removeNotification(payload: AppNotification) {
    notifications.value = notifications.value.filter((notification) => notification !== payload);
  }

  async function logIn(payload: { username: string; password: string }) {
    try {
      const response = await api.logInGetToken(payload.username, payload.password);
      const newToken = response.data.access_token;
      if (newToken) {
        saveLocalToken(newToken);
        token.value = newToken;
        isLoggedIn.value = true;
        logInError.value = false;
        // eslint-disable-next-line no-use-before-define
        await getUserProfile();
        // eslint-disable-next-line no-use-before-define
        await routeLoggedIn();
        notifications.value.push({ content: 'Logged in', color: 'success' });
      } else {
        // eslint-disable-next-line no-use-before-define
        await logOut();
      }
    } catch (err) {
      logInError.value = true;
      // eslint-disable-next-line no-use-before-define
      await logOut();
    }
  }

  async function getUserProfile() {
    try {
      const response = await api.getMe(token.value);
      if (response.data) {
        userProfile.value = response.data;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        // eslint-disable-next-line no-use-before-define
        await checkApiError(error);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  async function updateUserProfile(payload: IUserProfileUpdate) {
    try {
      const loadingNotification = { content: 'saving', showProgress: true };
      notifications.value.push(loadingNotification);
      const response = (await Promise.all([
        api.updateMe(token.value, payload),
        await new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 500); }),
      ]))[0];
      userProfile.value = response.data;
      removeNotification(loadingNotification);
      notifications.value.push({ content: 'Profile successfully updated', color: 'success' });
    } catch (error) {
      if (error instanceof AxiosError) {
        // eslint-disable-next-line no-use-before-define
        await checkApiError(error);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  async function checkLoggedIn() {
    if (!isLoggedIn.value) {
      if (!token.value) {
        const localToken = getLocalToken();
        if (localToken) token.value = localToken;
      }
      if (token.value) {
        try {
          const response = await api.getMe(token.value);
          isLoggedIn.value = true;
          userProfile.value = response.data;
        } catch (error) {
          // eslint-disable-next-line no-use-before-define
          await removeLogIn();
        }
      } else {
        // eslint-disable-next-line no-use-before-define
        await removeLogIn();
      }
    }
  }

  async function removeLogIn() {
    removeLocalToken();
    token.value = '';
    isLoggedIn.value = false;
  }

  async function logOut() {
    await removeLogIn();
    // eslint-disable-next-line no-use-before-define
    await routeLogOut();
  }

  async function userLogOut() {
    await logOut();
    notifications.value.push({ content: 'Logged out', color: 'success' });
  }

  function routeLogOut() {
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login');
    }
  }

  async function checkApiError(payload: AxiosError) {
    if (payload.response?.status === 401) {
      await logOut();
    }
  }

  function routeLoggedIn() {
    if (router.currentRoute.value.path === '/login' || router.currentRoute.value.path === '/') {
      router.push('/main');
    }
  }

  async function asyncRemoveNotification(
    payload: { notification: AppNotification, timeout: number },
  ) {
    return new Promise((resolve) => {
      setTimeout(() => {
        removeNotification(payload.notification);
        resolve(true);
      }, payload.timeout);
    });
  }

  async function passwordRecovery(payload: { username: string }) {
    const loadingNotification = { content: 'Sending password recovery email', showProgress: true };
    try {
      notifications.value.push(loadingNotification);
      await Promise.all([
        api.passwordRecovery(payload.username),
        await new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 500); }),
      ]);
      removeNotification(loadingNotification);
      notifications.value.push({ content: 'Password recovery email sent', color: 'success' });
      await logOut();
    } catch (error) {
      removeNotification(loadingNotification);
      notifications.value.push({ color: 'error', content: 'Incorrect username' });
    }
  }

  async function resetPassword(payload: { password: string, token: string }) {
    const loadingNotification = { content: 'Resetting password', showProgress: true };
    try {
      notifications.value.push(loadingNotification);
      await Promise.all([
        api.resetPassword(payload.password, payload.token),
        await new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 500); }),
      ]);
      removeNotification(loadingNotification);
      notifications.value.push({ content: 'Password successfully reset', color: 'success' });
      await logOut();
    } catch (error) {
      removeNotification(loadingNotification);
      notifications.value.push({ color: 'error', content: 'Error resetting password' });
    }
  }

  return {
    isLoggedIn,
    token,
    logInError,
    userProfile,
    dashboardMiniDrawer,
    dashboardShowDrawer,
    notifications,
    hasAdminAccess,
    firstNotification,
    removeNotification,
    logIn,
    getUserProfile,
    updateUserProfile,
    checkLoggedIn,
    removeLogIn,
    logOut,
    userLogOut,
    routeLogOut,
    checkApiError,
    routeLoggedIn,
    asyncRemoveNotification,
    passwordRecovery,
    resetPassword,
  };
});

export default useMainStore;
