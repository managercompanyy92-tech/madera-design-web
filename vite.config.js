import { defineConfig } from "vite";

export default defineConfig({
  root: ".",          // индексный файл лежит в корне
  build: {
    outDir: "dist",   // куда собирать сайт
  },
});
