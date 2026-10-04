import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths so the build works from any subpath (e.g. GitHub Pages)
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        synthwave: resolve(import.meta.dirname, "synthwave/index.html"),
      },
    },
  },
});
