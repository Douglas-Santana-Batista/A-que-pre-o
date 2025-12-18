import xlsx from "xlsx";
import { ProductExtractor } from "../../domain/services/ProductExtractor.js";

export class ExcelProductExtractor extends ProductExtractor {
  async extract(buffer) {
    const workbook = xlsx.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    return rows.map((item) => ({
      descricao: item["Produto"] || "",
      cheio: String(item["Preço Venda"] || ""),
      promo: String(item["Preço Referencial"] || ""),
    }));
  }
}
