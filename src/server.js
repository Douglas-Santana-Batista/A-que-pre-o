import express from "express";
import { db } from "./db/connection.js";
import { produtos } from "./db/schema.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { extrairProdutos } from "./services/extractPrice.js";

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

    const buffer = req.file.buffer;
    const produtosExtraidos = await extrairProdutos(buffer);

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
    await db.select().from(produtos).limit(1);

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🏪 Drogaria API rodando na porta ${PORT}`);
  console.log(`📊 Health check disponível em:`);
  console.log(`   http://localhost:${PORT}/health`);
  console.log(`   http://127.0.0.1:${PORT}/health`);
  console.log(`   http://0.0.0.0:${PORT}/health`);
});
