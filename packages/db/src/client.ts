import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createDb() {
  const sql = neon(getEnvVar("DATABASE_URL"));
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;
