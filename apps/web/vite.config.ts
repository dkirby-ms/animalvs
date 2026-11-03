import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  envDir: "../..",
  define: { __LOCAL_AUTH_BUILD__: JSON.stringify(command === "serve") },
  server: { proxy: { "/api": process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3000" } },
}));
