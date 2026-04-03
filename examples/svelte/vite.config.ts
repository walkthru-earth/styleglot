import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/styleglot/",
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      "@walkthru-earth/styleglot": new URL(
        "../../src/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
});
