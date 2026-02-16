import { getCurrentUser } from "aws-amplify/auth";
import type { Component } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import GuestPage from "../presentation/view/GuestPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    name: "home",
    path: "/home",
    alias: ["/home"],
    component: GuestPage,
  },
  {
    name: "auth",
    path: "/auth",
    component: (): Promise<{ default: Component }> =>
      import("@/presentation/view/AuthPage.vue"),
  },
  {
    name: "admin",
    meta: { requiresAuth: true },
    path: "/admin",
    component: (): Promise<{ default: Component }> =>
      import("@/presentation/view/AdminPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  if (!to.meta?.requiresAuth) return true;

  try {
    await getCurrentUser();
    return true;
  } catch {
    return {
      name: "auth",
      query: { redirect: to.fullPath },
    };
  }
});
