import { Router } from "express";
import { criarRequisicao } from "../controllers/requisicao.controller.ts";
import { verificarToken } from "../middleware/auth.middleware.ts";

const router = Router();

router.post('/', verificarToken, criarRequisicao);

export default router; 