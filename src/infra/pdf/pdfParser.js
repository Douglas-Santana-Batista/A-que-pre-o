import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pdfParseModule = require("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;

export async function parsePdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}
