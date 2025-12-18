import { db } from "../db/connection.js";
import { produtos } from "../db/schema.js";

export async function upsertProduto(data) {
  await db.insert(produtos).values(data).onConflictDoUpdate({
    target: produtos.codigoBarras,
    set: data,
  });
}
