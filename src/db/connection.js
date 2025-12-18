import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(process.env.DATABASE_URL, {
  ssl: "require", // 👈 STRING, não objeto
  max: 1, // 👈 obrigatório no Railway
  prepare: false, // 👈 proxy não suporta bem
  idle_timeout: 10,
  connect_timeout: 10,
});

export const db = drizzle(client);
