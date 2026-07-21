import { Router } from "express";
import { 
    criarRequisicao, 
    listarMinhasRequisicoes, 
    listarRequisicoesRH, 
    encaminharDiretoria // <-- Adicionado aqui
} from "../controllers/requisicao.controller.ts";
import { verificarToken } from "../middleware/auth.middleware.ts";

const router = Router();

// Rotas de consulta 
router.get('/minhas', verificarToken, listarMinhasRequisicoes);
router.get('/rh', verificarToken, listarRequisicoesRH);

// Rotas de criação e atualização
router.post('/', verificarToken, criarRequisicao);
router.put('/:id/encaminhar-diretoria', verificarToken, encaminharDiretoria); // <-- Nova rota aqui

export default router;