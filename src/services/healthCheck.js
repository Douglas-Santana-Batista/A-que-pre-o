import { db } from "../db/connection.js";
import { sql } from "drizzle-orm";

export async function healthCheck() {
  try {
    await db.execute(sql`select 1`);
    console.log("✅ Banco conectado");
  } catch (err) {
    console.error("❌ Banco indisponível (Railway proxy ainda acordando)");
  }
}
