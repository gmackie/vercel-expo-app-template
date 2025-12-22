import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createDb() {
  const client = createClient({
    url: getEnvVar("TURSO_SQLITE_URL"),
    authToken: getEnvVar("TURSO_AUTH_TOKEN"),
  });

  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
