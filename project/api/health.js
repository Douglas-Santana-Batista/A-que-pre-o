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
    const formData = await req.formData();
    const file = formData.get("pdf");

    if (!file) {
      return res.status(400).json({ error: "Nenhum PDF enviado" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const produtos = await extrairProdutos(buffer);

    res.status(200).json({ produtos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao processar PDF" });
  }
}
