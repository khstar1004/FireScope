/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { createRlDevServerPlugin } from "./scripts/createRlDevServerPlugin";

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ["VITE_", "MAPTILER_", "LLM_", "OPENROUTER_", "HF_", "MISTRAL_"],
  plugins: [react(), svgr(), tsconfigPaths(), createRlDevServerPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/testing/setup.ts", // Global setup file
    include: ["src/**/*.spec.{js,jsx,ts,tsx}"], // Matches test files
  },
});
