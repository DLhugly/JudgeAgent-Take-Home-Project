import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/judge": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000",
      "/sample-natural.mp4": "http://127.0.0.1:8000",
      "/sample-cgi.mp4": "http://127.0.0.1:8000",
      "/sample-ai.mp4": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: "../static",
    emptyOutDir: true,
  },
});
