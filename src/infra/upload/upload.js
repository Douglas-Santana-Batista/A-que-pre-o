import multer from "multer.js";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // pasta onde o arquivo será salvo
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `planilha-${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return cb(new Error("Apenas arquivos Excel são permitidos"));
    }
    cb(null, true);
  },
});
