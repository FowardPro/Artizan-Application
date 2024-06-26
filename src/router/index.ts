import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
      {
        name: 'Dashboard',
        path: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
      },
      {
        name: 'Alerts',
        path: 'ui-components/alert',
        component: () => import('@/views/ui-components/Alerts.vue'),
      },
      {
        name: 'Buttons',
        path: 'ui-components/buttons',
        component: () => import('@/views/ui-components/Buttons.vue'),
      },
      {
        name: 'Approvals',
        path: 'ui-components/approvals',
        component: () => import('@/views/ui-components/Approvals.vue'),
      },
      {
        name: 'Cards',
        path: 'ui-components/cards',
        component: () => import('@/views/ui-components/Cards.vue'),
      },
      {
        name: 'Menus',
        path: 'ui-components/menus',
        component: () => import('@/views/ui-components/Menus.vue'),
      },
      {
        name: 'Tables',
        path: 'ui-components/tables',
        component: () => import('@/views/ui-components/Tables.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/full/AuthLayout.vue'),
    children: [
      {
        name: 'Login',
        path: 'login', // Relative path to /auth
        component: () => import('@/views/Login.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
