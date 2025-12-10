// db/connection.js - CORRIGIDO
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";
dotenv.config();

// Conexão com SSL para Neon
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não encontrada no .env");
}

const client = postgres(connectionString, {
  ssl: "require",
  max: 1,
});

export const db = drizzle(client, { schema });
