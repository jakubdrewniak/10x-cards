import { defineConfig } from "vitest/config";
import react from "@astrojs/react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "src/**/*.d.ts", "src/test/**", "**/*.config.{js,ts}"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
