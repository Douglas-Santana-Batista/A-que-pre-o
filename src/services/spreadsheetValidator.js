export function validarPlanilha(dados) {
  if (!dados.length) {
    throw new Error("Planilha vazia");
  }

  const colunasObrigatorias = ["Produto", "Código de Barras", "Preço Venda", "Preço Referencial"];

  const colunas = Object.keys(dados[0]);

  colunasObrigatorias.forEach((c) => {
    if (!colunas.includes(c)) {
      throw new Error(`Coluna obrigatória ausente: ${c}`);
    }
  });
}
