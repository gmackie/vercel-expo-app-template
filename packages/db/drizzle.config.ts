import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_SQLITE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
