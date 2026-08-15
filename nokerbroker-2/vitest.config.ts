import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Route tests mock overlapping Next/Auth modules.  Keeping files serial
    // prevents their module mocks from contending in the constrained CI runner.
    fileParallelism: false,
  },
  resolve: { alias: { "@": path.resolve(__dirname) } },
});
