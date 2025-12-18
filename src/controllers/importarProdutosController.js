import { importarProdutos } from "../usecases/importarProdutos.js";

export async function importarProdutosController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const total = await importarProdutos(req.file.buffer);

    res.json({
      success: true,
      total,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
