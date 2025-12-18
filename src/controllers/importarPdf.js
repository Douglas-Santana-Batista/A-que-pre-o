import { extrairProdutosDoPdf } from "../usecases/extrairProdutosDoPdf.js";

export async function importarPdf(req, res) {
  const buffer = req.file.buffer;

  const produtos = await extrairProdutosDoPdf(buffer);

  res.json(produtos);
}
