// src/services/extractPrice.js
import { createRequire } from "module";
import { db } from "../db/connection.js";
const require = createRequire(import.meta.url);

const pdfParseModule = require("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;

console.log("pdfParse =", pdfParse);
/**
 * Extrai produtos de um PDF enviado via upload
 * @param {Buffer} buffer - arquivo PDF em Buffer
 * @returns {Promise<Array<{descricao, cheio, promo}>>}
 */
export async function extrairProdutos(buffer) {
  // Lê o PDF
  const data = await pdfParse(buffer);
  const texto = data.text;

  // Quebra o PDF em linhas
  const linhas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const produtos = [];

  // Dois tipos de preço: cheio + promoção ou apenas um preço
  const regexPrecoDois = /(.+?)\s+R\$ ?(\d{1,3}(?:\.\d{3})*,\d{2})\s+R\$ ?(\d{1,3}(?:\.\d{3})*,\d{2})/i;
  const regexPrecoSimples = /^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})$/;
  const regexBarra = /\b\d{12,13}\b/g;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // Ignora produtos com "NÃO TEM"
    if (linha.toUpperCase().includes("NÃO TEM")) continue;

    // ❌ Ignora linhas que são apenas código de barras
    if (/^\d{6,13}$/.test(linha)) continue;

    const codigos = texto.match(regexBarra);

    const precocheio = await db.select({ codigos });
    console.log("estou aqui", precocheio);

    // 1) Tenta capturar descrição + preço cheio + preço promo
    let m = linha.match(regexPrecoDois);
    if (m) {
      produtos.push({
        descricao: m[1].trim(),
        promo: m[2],
      });
      continue;
    }

    // 2) Tenta capturar descrição + preço único (usa mesmo preço nos dois)
    m = linha.match(regexPrecoSimples);
    if (m) {
      produtos.push({
        descricao: m[1].trim(),
        promo: m[2],
      });
      continue;
    }
  }

  return produtos;
}
