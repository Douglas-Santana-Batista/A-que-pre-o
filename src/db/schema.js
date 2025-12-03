import { pgTable, serial, text, decimal, timestamp } from "drizzle-orm/pg-core";

export const produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  descricao: text("descricao"),
  precoVenda: decimal("preco_venda", { precision: 10, scale: 2 }).notNull(),
  precoReferencial: decimal("preco_referencial", { precision: 10, scale: 2 }).notNull(),
  codigoBarras: text("codigo_barras").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
