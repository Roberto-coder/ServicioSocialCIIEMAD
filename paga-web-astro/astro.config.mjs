// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// Importa el adaptador de Node
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: "server", // <-- ¡Importante!
  adapter: node({
    // <-- ¡Importante!
    mode: "standalone",
  }),
});
