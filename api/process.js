import { extrairProdutos } from "../src/services/extractPrice.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const form = await req.formData();
    const file = form.get("pdf");

    if (!file) {
      return res.status(400).json({ error: "Nenhum PDF enviado" });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const produtos = await extrairProdutos(buffer);

    return res.status(200).json({
      total: produtos.length,
      produtos,
    });
  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({
      error: "Erro ao processar PDF",
      detalhes: err.message,
    });
  }
}
