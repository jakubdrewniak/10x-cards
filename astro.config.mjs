// @ts-check
import { defineConfig } from "astro/config";
import path from "path";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  experimental: {
    session: true,
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: path.resolve("./src"),
        },
        ...(import.meta.env.PROD
          ? [
              {
                find: "react-dom/server",
                replacement: "react-dom/server.edge",
              },
            ]
          : []),
      ],
    },
  },
  adapter: cloudflare({
    mode: "directory",
    functionPerRoute: true,
  }),
});
