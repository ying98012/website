import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig(({ command }) => ({
  site: "https://ying98012.github.io",
  base: command === "dev" ? "/" : "/website",
  integrations: [react(), tailwind(), sitemap()],
  output: "static",
}));
