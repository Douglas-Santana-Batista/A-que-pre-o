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
    const texto = data.text;

    console.log("PDF OK — iniciando extração...");

    // Captura todos os códigos do PDF
    const regexCodigo = /\b\d{12,13}\b/g;
    const codigosExtraidos = texto.match(regexCodigo) || [];

    // Preços do banco
    const precosDoBanco = await buscarPrecosNoBanco(codigosExtraidos);

    const linhas = texto
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const produtosFinal = [];

    for (let i = 0; i < linhas.length; i++) {
      let linha = linhas[i];

      if (linha.toUpperCase().includes("NÃO TEM")) continue;

      // PRECISO CAPTURAR PREÇO NA LINHA
      const precoMatch = linha.match(/(\d{1,3}(?:\.\d{3})*,\d{2})$/);
      if (!precoMatch) continue;

      const precoPDF = precoMatch[1];
      const textoAntes = linha.replace(precoPDF, "").trim();

      let descricao = textoAntes;
      let codigo = null;

      // SE LINHA ANTERIOR FOR CÓDIGO
      if (i > 0 && /^\d{12,13}$/.test(linhas[i - 1])) {
        codigo = linhas[i - 1].trim();
      }

      if (!codigo && i > 0 && !linhas[i - 1].match(/\d{1,3},\d{2}$/)) {
        // MAS NÃO PODE SER "VARIOS SABORES"
        if (!linhas[i - 1].toUpperCase().includes("VARIOS SABORES", "VARIAS APRESENTAÇÕES")) {
          descricao = linhas[i - 1].trim();
        }
      }

      // === 4) AGORA SIM: SE TIVER "VARIOS SABORES", BUSCAR PELA DESCRIÇÃO ===
      if (linha.toUpperCase().includes("VARIOS SABORES", "VARIAS APRESENTAÇÕES")) {
        try {
          const buscaDesc = await db
            .select({
              codigo: produtos.codigoBarras,
              descricao: produtos.descricao,
              precoCheio: produtos.precoVenda,
              precoReferencial: produtos.precoReferencial,
            })
            .from(produtos)
            .where(like(produtos.descricao, `%${descricao}%`)); // agora descricao já existe!

          if (buscaDesc.length > 0) {
            precoCheio = buscaDesc[0].precoCheio;
            codigo = buscaDesc[0].codigo;

            console.log("🔎 Encontrado no banco via descrição:", buscaDesc[0]);
          }
        } catch (error) {
          console.error("Erro buscando descrição:", error);
        }
      }

      // ========================================
      // TENTA PUXAR PREÇO DO BANCO PELO CÓDIGO
      // ========================================

      let precoCheio = null;

      if (codigo && precosDoBanco[codigo]) {
        precoCheio = precosDoBanco[codigo].cheio;
      }

      // ========================================
      // FALLBACK → USA PREÇO DO PDF
      // ========================================
      if (!precoCheio) precoCheio = precoPDF;

      produtosFinal.push({
        descricao,
        preco_cheio: precoCheio,
        preco_pdf: precoPDF,
        codigo,
      });
    }

    console.log(`EXTRAÍDOS: ${produtosFinal.length}`);

    return produtosFinal.map((p) => ({
      descricao: p.descricao,
      cheio: String(p.preco_cheio || ""),
      promo: String(p.preco_pdf || ""),
    }));
  } catch (err) {
    console.error("Erro geral:", err);
    throw err;
  }
}
