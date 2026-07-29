import { Router } from "express";
import { 
    criarRequisicao, 
    listarMinhasRequisicoes, 
    listarRequisicoesRH, 
    encaminharDiretoria,
    listarRequisicoesDiretoria,
    avaliarRequisicao,
    listarHistoricoDiretoria,
    listarTodasRequisicoesADM // <-- Função importada do ADM
} from "../controllers/requisicao.controller.ts";
import { verificarToken } from "../middleware/auth.middleware.ts";

const router = Router();

// Rotas de consulta (GET)
router.get('/minhas', verificarToken, listarMinhasRequisicoes);
router.get('/rh', verificarToken, listarRequisicoesRH);
router.get('/diretoria', verificarToken, listarRequisicoesDiretoria); 
router.get('/diretoria/historico', verificarToken, listarHistoricoDiretoria);
router.get('/adm/todas', verificarToken, listarTodasRequisicoesADM); // <-- Nova rota do ADM

// Rotas de criação e atualização (POST / PUT)
router.post('/', verificarToken, criarRequisicao);
router.put('/:id/encaminhar-diretoria', verificarToken, encaminharDiretoria);
router.put('/:id/avaliar', verificarToken, avaliarRequisicao); 

export default router;
