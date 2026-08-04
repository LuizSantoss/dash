import { Router } from "express";
import { registrar, login, listarUsuarios, alterarSenhaUsuario } from '../controllers/auth.controller.ts';
import { verificarToken } from "../middleware/auth.middleware.ts";
import { ROTAS } from "../config/rotas.ts";

const router = Router();

// Rotas públicas (Abertas)
router.post(ROTAS.AUTH.REGISTRAR, registrar);
router.post(ROTAS.AUTH.LOGIN, login);

// Rotas protegidas (Exclusivas do ADM )
router.get(ROTAS.AUTH.USUARIOS, verificarToken, listarUsuarios);
router.put(ROTAS.AUTH.ALTERAR_SENHA, verificarToken, alterarSenhaUsuario);

export default router;