import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/main.ts"),
      name: "RRWebPlayer",
      fileName: '@bpsmartdesign/rrweb-player-vue3',
    },
    rollupOptions: {
      external: ["vue", "rrweb"],
      output: {
        globals: {
          vue: "vue",
          rrweb: "rrweb",
        },
      },
    },
  },
  plugins: [vue()],
});
