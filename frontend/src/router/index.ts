import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Login from '../views/LoginView.vue';
// import PasswordRecovery from '../views/PasswordRecoveryView.vue';
// import ResetPassword from '../views/ResetPasswordView.vue';
// import Main from '../views/main/MainView.vue';
import Start from '../views/main/StartView.vue';
// import Dashboard from '../views/main/DashboardView.vue';
// import UserProfile from '../views/main/profile/UserProfileView.vue';
// import UserProfileEdit from '../views/main/profile/UserProfileEditView.vue';
// import UserProfileEditPassword from '../views/main/profile/UserProfileEditPasswordView.vue';
// import Admin from '../views/main/admin/AdminView.vue';
// import AdminUsers from '../views/main/admin/AdminUsersView.vue';
// import EditUser from '../views/main/admin/EditUserView.vue';
// import CreateUser from '../views/main/admin/CreateUserView.vue';

// import RouterComponent from '../components/RouterComponent.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Start,
    children: [
      {
        path: 'login',
        component: Login,
      },
      // {
      //   path: 'recover-password',
      //   component: PasswordRecovery,
      // },
      // {
      //   path: 'reset-password',
      //   component: ResetPassword,
      // },
      // {
      //   path: 'main',
      //   component: Main,
      //   children: [
      //     {
      //       path: 'dashboard',
      //       component: Dashboard,
      //     },
      //     {
      //       path: 'profile',
      //       component: RouterComponent,
      //       redirect: 'profile/view',
      //       children: [
      //         {
      //           path: 'view',
      //           component: UserProfile,
      //         },
      //         {
      //           path: 'edit',
      //           component: UserProfileEdit,
      //         },
      //         {
      //           path: 'password',
      //           component: UserProfileEditPassword,
      //         },
      //       ],
      //     },
      //     {
      //       path: 'admin',
      //       component: Admin,
      //       redirect: 'admin/users/all',
      //       children: [
      //         {
      //           path: 'users',
      //           redirect: 'users/all',
      //         },
      //         {
      //           path: 'users/all',
      //           component: AdminUsers,
      //         },
      //         {
      //           path: 'users/edit/:id',
      //           name: 'main-admin-users-edit',
      //           component: EditUser,
      //         },
      //         {
      //           path: 'users/create',
      //           name: 'main-admin-users-create',
      //           component: CreateUser,
      //         },
      //       ],
      //     },
      //   ],
      // },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
