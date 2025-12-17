export class ProcessFileUseCase {
  constructor(pdfExtractor, excelExtractor) {
    this.pdfExtractor = pdfExtractor;
    this.excelExtractor = excelExtractor;
  }

  async execute(mimetype, buffer) {
    if (mimetype === "application/pdf") {
      return this.pdfExtractor.extract(buffer);
    }

    if (mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimetype === "application/vnd.ms-excel") {
      return this.excelExtractor.extract(buffer);
    }

    throw new Error("Tipo de arquivo não suportado");
  }
}
