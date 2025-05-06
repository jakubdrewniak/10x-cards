// @ts-check
import { defineConfig, envField } from "astro/config";
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
  env: {
    schema: {
      OPENROUTER_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      OPENROUTER_API_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      OPENROUTER_DEFAULT_MODEL: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
});
