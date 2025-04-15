// @ts-check
import { defineConfig } from "astro/config";
import path from 'path';

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  experimental: {
    session: true
  },
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [{
        find: '@',
        replacement: path.resolve('./src')
      }]
    }
  },
  adapter: node({
    mode: "standalone",
  }),
});
