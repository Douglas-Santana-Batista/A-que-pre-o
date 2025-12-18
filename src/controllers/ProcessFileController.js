import { PdfProductExtractor } from "../infra/extractors/PdfProductExtractor.js";
import { ExcelProductExtractor } from "../infra/extractors/ExcelProductExtractor.js";
import { ProcessFileUseCase } from "../usecases/ProcessFileUseCase.js";

const useCase = new ProcessFileUseCase(new PdfProductExtractor(), new ExcelProductExtractor());

export async function process(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const produtos = await useCase.execute(req.file.mimetype, req.file.buffer);

    res.json({ produtos });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
