import { parsePdf } from "../infra/pdf/pdfParser.js";
import { buscarPrecosPorCodigo, buscarProdutoPorDescricao } from "../repositories/produtosPdfRepository.js";

// ===============================
// REGEX CENTRALIZADAS
// ===============================
const REGEX_COD_BARRAS = /\b\d{8,14}\b/g;
const REGEX_PRECO = /\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g;

// ===============================
// USE CASE
// ===============================
export async function extrairProdutosDoPdf(buffer) {
  // 1️⃣ Extrai texto do PDF
  let texto = await parsePdf(buffer);

  // 2️⃣ Normalização
  texto = texto.replace(/ {2,}/g, " ").replace(/\t+/g, " ").replace(/\s+$/gm, "").trim();

  // 3️⃣ Quebra em linhas
  const linhas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // 4️⃣ Coletar códigos para consulta no banco
  const todosCodigos = texto.match(REGEX_COD_BARRAS) || [];
  const precosDoBanco = await buscarPrecosPorCodigo(todosCodigos);

  const produtosFinal = [];

  // 5️⃣ Processar linha por linha
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // Ignorar linhas inválidas
    if (linha.includes("NÃO TEM") || linha.includes("SEM ESTOQUE") || linha.includes("INATIVO")) {
      continue;
    }

    // Buscar preços
    const precos = linha.match(REGEX_PRECO);
    if (!precos) continue;

    const precoPDF = precos[precos.length - 1];

    // Buscar código de barras
    let codigo = (linha.match(REGEX_COD_BARRAS) || [])[0] ?? null;

    // Montar descrição
    let descricao = linha.replace(precoPDF, "").replace(REGEX_COD_BARRAS, "").trim();

    // Tentar pegar descrição da linha anterior
    if (!descricao || descricao.length < 4) {
      const anterior = linhas[i - 1];
      if (anterior && !anterior.match(REGEX_PRECO)) {
        descricao = anterior.trim();
      }
    }

    // Caso especial: vários sabores
    if (descricao?.toUpperCase().includes("VARIOS SABORES") || descricao?.toUpperCase().includes("VARIAS APRESENTACOES") || descricao?.toUpperCase().includes("VARIAS APRESENTAÇÕES")) {
      const encontrados = await buscarProdutoPorDescricao(descricao.split(" ")[0]);
      if (encontrados.length > 0) {
        codigo = encontrados[0].codigo;
      }
    }

    // Preço cheio
    const precoCheio = codigo && precosDoBanco[codigo] ? String(precosDoBanco[codigo].cheio) : "";

    produtosFinal.push({
      descricao,
      cheio: precoCheio,
      promo: String(precoPDF),
    });
  }

  return produtosFinal;
}
