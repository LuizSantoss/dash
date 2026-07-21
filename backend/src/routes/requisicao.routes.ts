import { Router } from "express";
import { criarRequisicao, listarMinhasRequisicoes, listarRequisicoesRH } from "../controllers/requisicao.controller.ts";
import { verificarToken } from "../middleware/auth.middleware.ts";

const router = Router();

// Rotas de consulta RH
router.get('/minhas', verificarToken, listarMinhasRequisicoes);
router.get('/rh', verificarToken, listarRequisicoesRH);

// Rotas de criação 
router.post('/', verificarToken, criarRequisicao);

export default router;
