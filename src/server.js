import express from "express";
import "dotenv/config";
import importarRoutes from "./routes/importar.routes.js";
import criarPreco from "./routes/criarPreco.routes.js";
import { db } from "./db/connection.js";
import { produtos } from "./db/schema.js";
import { healthCheck } from "./services/healthCheck.js";

const app = express();

console.log("DATABASE_URL =", process.env.DATABASE_URL);

healthCheck();

app.use(express.static("src/public"));
app.use(importarRoutes);
app.use(criarPreco);

app.get("/health", async (req, res) => {
  try {
    await db.select().from(produtos).limit(1);

    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Health check error:", error); // 👈 ISSO É ESSENCIAL

    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server rodando");
});
