import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "standalone" ? [viteSingleFile()] : [])],
  base: "./",
  build: { assetsInlineLimit: mode === "standalone" ? 10000000 : 4096 },
}));
