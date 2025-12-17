import { Router } from "express";
import { upload } from "../infra/upload/multer.js";
import { process } from "../controllers/ProcessFileController.js";

const router = Router();

router.post("/process", upload.single("file"), process);

export default router;
