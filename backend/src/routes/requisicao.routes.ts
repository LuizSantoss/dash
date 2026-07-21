import { Router } from "express";
import { 
    criarRequisicao, 
    listarMinhasRequisicoes, 
    listarRequisicoesRH, 
    encaminharDiretoria,
    listarRequisicoesDiretoria,
    avaliarRequisicao
} from "../controllers/requisicao.controller.ts";
import { verificarToken } from "../middleware/auth.middleware.ts";

const router = Router();

// Rotas de consulta (GET)
router.get('/minhas', verificarToken, listarMinhasRequisicoes);
router.get('/rh', verificarToken, listarRequisicoesRH);
router.get('/diretoria', verificarToken, listarRequisicoesDiretoria); // <-- Nova rota

// Rotas de criação e atualização (POST / PUT)
router.post('/', verificarToken, criarRequisicao);
router.put('/:id/encaminhar-diretoria', verificarToken, encaminharDiretoria);
router.put('/:id/avaliar', verificarToken, avaliarRequisicao); // <-- Nova rota



export default router;