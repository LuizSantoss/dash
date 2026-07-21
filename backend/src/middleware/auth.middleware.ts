import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  perfil: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export const verificarToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ erro: "Token não fornecido. Acesso negado." });
    return;
  }

  // 1. Garante que o array terá duas partes e a variável 'token' nunca será undefined
  const partes = authHeader.split(' ');
  if (partes.length !== 2) {
    res.status(401).json({ erro: "Formato de token inválido." });
    return;
  }
  const token = partes[1] as string;

  // 2. Garante que o segredo existe no .env (nunca será undefined)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("ERRO CRÍTICO: JWT_SECRET não está definido no arquivo .env!");
    res.status(500).json({ erro: "Erro interno de configuração do servidor." });
    return;
  }

  try {
    // 3. A ponte de conversão: passa por 'unknown' antes de forçar o tipo 'TokenPayload'
    const decoded = jwt.verify(token, secret) as unknown as TokenPayload;
    
    req.usuario = decoded;
    
    return next();
  } catch (error) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
    return;
  }
};
