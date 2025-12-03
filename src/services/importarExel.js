import xlsx from "xlsx";
import { produtos } from "../db/schema.js";
import { db } from "../db/connection.js";

async function importar() {
  const workbook = xlsx.readFile("planilia atualizada.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const dados = xlsx.utils.sheet_to_json(sheet);

  console.log("📄 Registros encontrados:", dados.length);

  let importados = 0;
  let erros = 0;

  for (const item of dados) {
    try {
      const descricao = item["Produto"];
      const codigo_barras = item["Código de Barras"];
      const preco_venda = Number(item["Preço Venda"]);
      const preco_referencial = Number(item["Preço Referencial"]);

      // Validações
      if (!codigo_barras) {
        console.warn("⚠️ Código de barras vazio:", descricao);
        erros++;
        continue;
      }

      if (!descricao) {
        console.warn("⚠️ Descrição vazia para código:", codigo_barras);
        erros++;
        continue;
      }

      // Use os nomes CORRETOS do schema!
      await db
        .insert(produtos)
        .values({
          descricao: descricao,
          codigoBarras: codigo_barras.toString(),
          precoVenda: preco_venda || 0,
          precoReferencial: preco_referencial || 0,
        })
        .onConflictDoUpdate({
          target: produtos.codigoBarras,
        });

      importados++;

      // Log a cada 1000 registros
      if (importados % 1000 === 0) {
        console.log(`📊 Progresso: ${importados} importados...`);
      }
    } catch (error) {
      erros++;
      console.error(`❌ Erro no item ${importados + erros}:`, error.message);
      console.error("   Item:", item);
    }
  }

  console.log(`\n🎉 Importação finalizada!`);
  console.log(`✅ Importados: ${importados}`);
  console.log(`❌ Erros: ${erros}`);
}

importar();
