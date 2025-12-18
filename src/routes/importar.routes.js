import { Router } from "express";
import { upload } from "../infra/upload/multer.js";
import { importarProdutosController } from "../controllers/importarProdutosController.js";

const router = Router();

router.post("/importar-produtos", upload.single("file"), importarProdutosController);

export default router;
