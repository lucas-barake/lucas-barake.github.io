// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { rehypeSpotlight } from "./plugins/rehype-spotlight.mjs";

import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://lucas-barake.github.io",
  integrations: [
    mdx({ rehypePlugins: [rehypeSpotlight] }),
    sitemap(),
    tailwind()
  ]
});
