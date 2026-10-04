import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = (env.VITE_API_URL || "http://127.0.0.1:8000")
    .replace(
      /^(https?:\/\/)localhost(?=[:/]|$)/i,
      (_match, scheme) => `${scheme}127.0.0.1`
    )
    .replace(/\/+$/, "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "::",
      open: true,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});