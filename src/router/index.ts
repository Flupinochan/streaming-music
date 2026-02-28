import { getCurrentUser } from "aws-amplify/auth";
import type { Component } from "vue";
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
} from "vue-router";

export type DetailProps = {
  musicId: string;
};

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    name: "home",
    path: "/home",
    alias: ["/home"],
    component: (): Promise<{ default: Component }> =>
      import("@/presentation/view/GuestPage.vue"),
  },
  {
    name: "detail",
    path: "/detail/:id",
    alias: ["/detail"],
    props: (route: RouteLocationNormalized): DetailProps => ({
      musicId: route.params.id as string,
    }),
    component: (): Promise<{ default: Component }> =>
      import("@/presentation/view/components/MusicListPlayerDetail.vue"),
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
