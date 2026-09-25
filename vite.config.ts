import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["@lingui/core", "react", "react-dom"],
  },
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
  test: {
    include: ["src/**/*.spec.tsx"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
      viewport: { width: 900, height: 700 },
      expect: {
        toMatchScreenshot: {
          comparatorName: "pixelmatch",
          comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
          resolveScreenshotPath: ({
            root,
            testFileDirectory,
            arg,
            browserName,
            platform,
            ext,
          }) =>
            `${root}/${testFileDirectory}/__screenshots__/${arg}-${browserName}-${platform}${ext}`,
        },
      },
    },
  },
});
