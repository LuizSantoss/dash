import { Router } from "express";
import { registrar, login } from '../controllers/auth.controller.ts'
import { 
    criarRequisicao, 
    listarMinhasRequisicoes, 
    listarRequisicoesRH, 
    encaminharDiretoria,
    listarRequisicoesDiretoria, // <-- Adicionado
    avaliarRequisicao           // <-- Adicionado
} from "../controllers/requisicao.controller.ts";
import { verificarToken } from "../middleware/auth.middleware.ts";

const router = Router();

router.post('/registrar', registrar);
router.post('/login', login);

export default router;
