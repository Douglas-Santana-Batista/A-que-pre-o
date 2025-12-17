import xlsx from "xlsx";
import { validarPlanilha } from "../services/spreadsheetValidator.js";
import { upsertProduto } from "../repositories/produtoRepository.js";

export async function importarProdutos(fileBuffer) {
  const workbook = xlsx.read(fileBuffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const dados = xlsx.utils.sheet_to_json(sheet);

  validarPlanilha(dados);

  for (const item of dados) {
    await upsertProduto({
      descricao: item["Produto"],
      codigoBarras: item["Código de Barras"].toString(),
      precoVenda: Number(item["Preço Venda"]),
      precoReferencial: Number(item["Preço Referencial"]),
    });
  }

  return dados.length;
}
