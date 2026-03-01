import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    // visualizer({
    //   template: "treemap",
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    //   filename: "./tmp/stats.html",
    // }),
    // viteCompression({
    //   algorithm: "brotliCompress",
    //   ext: ".br",
    //   deleteOriginFile: false,
    //   threshold: 1024,
    // }),
    // viteCompression({
    //   algorithm: "gzip",
    //   ext: ".gz",
    //   deleteOriginFile: false,
    //   threshold: 1024,
    // }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
