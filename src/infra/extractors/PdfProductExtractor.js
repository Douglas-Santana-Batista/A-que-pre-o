import { ProductExtractor } from "../../domain/services/ProductExtractor.js";
import { extrairProdutos } from "../../services/extractPrice.js";

export class PdfProductExtractor extends ProductExtractor {
  async extract(buffer) {
    return extrairProdutos(buffer);
  }
}
