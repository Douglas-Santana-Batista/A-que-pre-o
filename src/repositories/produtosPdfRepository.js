import { db } from "../db/connection.js";
import { produtos } from "../db/schema.js";
import { inArray, like } from "drizzle-orm";

export async function buscarPrecosPorCodigo(codigos) {
  if (!codigos.length) return {};

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
}

export async function buscarProdutoPorDescricao(descricao) {
  return db
    .select({
      codigo: produtos.codigoBarras,
      descricao: produtos.descricao,
      cheio: produtos.precoVenda,
      promo: produtos.precoReferencial,
    })
    .from(produtos)
    .where(like(produtos.descricao, `%${descricao}%`));
}
