// src/server.js - CORRIGIDO
import express from "express";
import { db } from "./db/connection.js";
import { produtos as produtosSchema } from "./db/schema.js"; // ✅ Renomeado
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { extrairProdutos } from "./services/extractPrice.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(path.join(__dirname, "public")));

// ✅ Rota /process corrigida
app.post("/process", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhum PDF enviado" });

    console.log(`📤 Processando PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    const buffer = req.file.buffer;
    const produtosExtraidos = await extrairProdutos(buffer); // ✅ Nome diferente

    console.log(`📊 Retornando ${produtosExtraidos.length} produtos`);

    return res.json({
      produtos: produtosExtraidos,
      total: produtosExtraidos.length,
    });
  } catch (err) {
    console.error("❌ Erro ao processar PDF:", err);
    return res.status(500).json({
      error: "Erro ao processar PDF",
      detalhes: err.message,
    });
  }
});

// ✅ Rota health check corrigida
app.get("/health", async (req, res) => {
  try {
    await db.select().from(produtosSchema).limit(1); // ✅ Usa o nome renomeado

    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🏪 Drogaria API rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
