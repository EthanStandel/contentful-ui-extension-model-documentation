import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  base: "",
  build: {
    outDir: "build",
  },
  server: {
    host: "localhost",
    port: 3000,
  },
});
