import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://ying98012.github.io",
  base: "/website",
  integrations: [
    react(),
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: "zh-Hant",
        locales: {
          "zh-Hant": "zh-Hant",
          en: "en",
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: "zh-Hant",
    locales: ["zh-Hant", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  output: "static",
});
