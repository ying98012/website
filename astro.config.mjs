import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  site: "https://ying98012.github.io",
  base: isDev ? "/" : "/website",
  integrations: [react(), tailwind(), sitemap()],
  output: "static",
});
