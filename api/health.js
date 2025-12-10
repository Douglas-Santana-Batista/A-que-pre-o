import { db } from "../src/db/connection.js";
import { produtos } from "../src/db/schema.js";

export default async function handler(req, res) {
  try {
    await db.select().from(produtos).limit(1);

    return res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
}
