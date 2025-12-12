// src/services/extractPrice.js - VERSÃO FINAL AJUSTADA
import { createRequire } from "module";
import { db } from "../db/connection.js";
import { produtos } from "../db/schema.js";
import { inArray, like } from "drizzle-orm";

const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;

// Buscar preços no banco pelo código
async function buscarPrecosNoBanco(codigos) {
  if (!codigos || codigos.length === 0) return {};

  try {
    const resultados = await db
      .select({
        codigoBarras: produtos.codigoBarras,
        precoCheio: produtos.precoVenda,
        precoReferencial: produtos.precoReferencial,
      })
      .from(produtos)
      .where(inArray(produtos.codigoBarras, codigos));

    const mapa = {};
    resultados.forEach((p) => {
      mapa[p.codigoBarras] = {
        cheio: p.precoCheio,
        referencial: p.precoReferencial,
      };
    });

    return mapa;
  } catch (err) {
    console.error("Erro no banco:", err);
    return {};
  }
}

// ===============================
//  FUNÇÃO PRINCIPAL
// ===============================
export async function extrairProdutos(buffer) {
  try {
    const data = await pdfParse(buffer);
    let texto = data.text;

    // NORMALIZAÇÃO BÁSICA
    texto = texto
      .replace(/ {2,}/g, " ") // remove colunas extras
      .replace(/\t+/g, " ")
      .replace(/\s+$/gm, "")
      .trim();

    // REGEX UNIVERSAIS
    const REGEX_COD_BARRAS = /\b\d{8,14}\b/g; // EAN 8, 12, 13, 14
    const REGEX_PRECO = /\b\d{1,3}(?:\.\d{3})*,\d{2}\b/;
    const REGEX_PRECOS = /\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g;

    // SEPARA LINHAS
    const linhas = texto
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // TODOS OS CODIGOS PARA BUSCAR NO BANCO
    const todosCodigos = texto.match(REGEX_COD_BARRAS) || [];

    const precosDoBanco = await buscarPrecosNoBanco(todosCodigos);

    const produtosFinal = [];

    for (let i = 0; i < linhas.length; i++) {
      let linha = linhas[i];

      if (linha.includes("NÃO TEM") || linha.includes("SEM ESTOQUE") || linha.includes("INATIVO")) continue;

      const precoEncontrado = linha.match(REGEX_PRECOS);
      if (!precoEncontrado) continue;

      const precoPDF = precoEncontrado[precoEncontrado.length - 1];

      let codigo = (linha.match(REGEX_COD_BARRAS) || [])[0];

      if (!codigo && i > 0) {
        const acima = linhas[i - 1].match(REGEX_COD_BARRAS);
        if (acima) codigo = acima[0];
      }

      if (!codigo && i + 1 < linhas.length) {
        const abaixo = linhas[i + 1].match(REGEX_COD_BARRAS);
        if (abaixo) codigo = abaixo[0];
      }

      let descricao = linha.replace(precoPDF, "").replace(REGEX_COD_BARRAS, "").trim();

      if (!descricao || descricao.length < 4) {
        if (i > 0) {
          const linhaSuperior = linhas[i - 1];
          if (!linhaSuperior.match(REGEX_PRECO) && !linhaSuperior.match(REGEX_COD_BARRAS)) {
            descricao = linhaSuperior.trim();
          }
        }
      }

      if (descricao.toUpperCase().includes("VARIOS SABORES") || descricao.toUpperCase().includes("VARIAS APRESENTACOES") || descricao.toUpperCase().includes("VARIAS APRESENTAÇÕES")) {
        try {
          const buscaDesc = await db
            .select({
              codigo: produtos.codigoBarras,
              desc: produtos.descricao,
              cheio: produtos.precoVenda,
              promo: produtos.precoReferencial,
            })
            .from(produtos)
            .where(like(produtos.descricao, `%${descricao.split(" ")[0]}%`));

          if (buscaDesc.length > 0) {
            codigo = buscaDesc[0].codigo;
          }
        } catch (e) {
          console.log("Erro busca descrição:", e);
        }
      }

      let precoCheio = null;

      if (codigo && precosDoBanco[codigo]) {
        precoCheio = precosDoBanco[codigo].cheio;
      }

      if (!precoCheio && precoEncontrado.length > 1) {
        precoCheio = precoEncontrado[0];
      }

      if (!precoCheio) precoCheio = precoPDF;

      produtosFinal.push({
        descricao,
        cheio: String(precoCheio),
        promo: String(precoPDF),
        codigo: codigo || null,
      });
    }

    return produtosFinal.map((p) => ({
      descricao: p.descricao,
      cheio: p.cheio,
      promo: p.promo,
    }));
  } catch (err) {
    console.error("Erro geral:", err);
    throw err;
  }
}
