import { defineConfig } from "vitest/config";
import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv();

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // Next.js special-cases this import at build time; outside Next it just throws.
      "server-only": path.resolve(import.meta.dirname, "./vitest.server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
    },
  },
});
