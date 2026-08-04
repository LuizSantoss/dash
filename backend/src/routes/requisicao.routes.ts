import { Router } from "express";
import { 
    criarRequisicao, 
    listarMinhasRequisicoes, 
    listarRequisicoesRH, 
    encaminharDiretoria,
    listarRequisicoesDiretoria,
    avaliarRequisicao,
    listarHistoricoDiretoria,
    listarTodasRequisicoesADM
} from "../controllers/requisicao.controller.ts";
import { verificarToken } from "../middleware/auth.middleware.ts";
import { ROTAS } from "../config/rotas.ts";

const router = Router();

// Rotas de consulta (GET)
router.get(ROTAS.REQUISICOES.MINHAS, verificarToken, listarMinhasRequisicoes);
router.get(ROTAS.REQUISICOES.RH, verificarToken, listarRequisicoesRH);
router.get(ROTAS.REQUISICOES.DIRETORIA, verificarToken, listarRequisicoesDiretoria); 
router.get(ROTAS.REQUISICOES.DIRETORIA_HISTORICO, verificarToken, listarHistoricoDiretoria);
router.get(ROTAS.REQUISICOES.ADM_TODAS, verificarToken, listarTodasRequisicoesADM);

// Rotas de criação e atualização (POST / PUT)
router.post(ROTAS.REQUISICOES.CRIAR, verificarToken, criarRequisicao);
router.put(ROTAS.REQUISICOES.ENCAMINHAR_DIRETORIA, verificarToken, encaminharDiretoria);
router.put(ROTAS.REQUISICOES.AVALIAR, verificarToken, avaliarRequisicao); 

export default router;