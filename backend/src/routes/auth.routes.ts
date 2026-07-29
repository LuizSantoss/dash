import { Router } from "express";
import { registrar, login, listarUsuarios, alterarSenhaUsuario } from '../controllers/auth.controller.ts';
import { verificarToken } from "../middleware/auth.middleware.ts";

const router = Router();

// Rotas públicas (Abertas)
router.post('/registrar', registrar);
router.post('/login', login);

// Rotas protegidas (Exclusivas do ADM - a barreira de perfil está no controller)
router.get('/usuarios', verificarToken, listarUsuarios);
router.put('/usuarios/alterar-senha', verificarToken, alterarSenhaUsuario);

export default router;
