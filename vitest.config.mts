import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
    env: {
      VERCEL_ENV: "test",
      HEALTH_ALERTS_ENABLED: "false",
      DATABASE_URL: "postgresql://test:test@127.0.0.1:1/meritously_test",
      RESEND_API_KEY: "re_test_only",
    },
  },
});
