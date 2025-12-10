import { extrairProdutos } from "../services/extractPrice.js";

export const config = {
  api: {
    bodyParser: false, // Para processar FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Obter o arquivo do FormData
    const formData = await req.formData();
    const file = formData.get("pdf");

    if (!file) {
      return res.status(400).json({ error: "Nenhum PDF enviado" });
    }

    // Converter para Buffer
    const buffer = await file.arrayBuffer();
    const produtos = await extrairProdutos(Buffer.from(buffer));

    res.status(200).json({ produtos });
  } catch (error) {
    console.error("❌ Erro na API:", error);
    res.status(500).json({
      error: "Erro ao processar PDF",
      detalhes: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
