import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.ts';

export const registrar = async (req: Request, res: Response): Promise<void> => {
    let { nome, email, senha, perfil, setor } = req.body;
    try {
        if (nome) nome = nome.trim();
        if (email) email = email.trim().toLowerCase(); 
        if (perfil) perfil = perfil.trim().toUpperCase();
        if (setor) setor = setor.trim();

        // 1. REGRA DE NEGÓCIO: Trava de limite máximo de 2 usuários de RH
        if (perfil === 'RH') {
            const totalRH = await prisma.usuario.count({
                where: { perfil: 'RH' }
            });
            
            if (totalRH >= 2) {
                res.status(403).json({ erro: "Limite máximo atingido. O sistema permite apenas 2 contas de RH." });
                return;
            }
        }

        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) { res.status(400).json({ erro: "E-mail já cadastrado." }); return; }

        const senhaCriptografada = await bcrypt.hash(senha, 10);
        
        // 2. REGRA DE NEGÓCIO: Adição do campo 'setor' na criação
        const novoUsuario = await prisma.usuario.create({
            data: { nome, email, senha: senhaCriptografada, perfil, setor }
        });
        res.status(201).json({ mensagem: "Usuário criado com sucesso!", usuarioId: novoUsuario.id });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno ao criar usuário." });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, senha } = req.body;
    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) { res.status(401).json({ erro: "Credenciais inválidas." }); return; }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) { res.status(401).json({ erro: "Credenciais inválidas." }); return; }

        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' }
        );
        res.json({ 
            mensagem: "Login realizado com sucesso!", 
            token, 
            usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil, setor: usuario.setor } 
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno ao realizar login." });
    }
};

// ==========================================
// FUNÇÕES EXCLUSIVAS DO ADMINISTRADOR (ADM)
// ==========================================

export const listarUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.usuario!.perfil !== 'ADM') {
            res.status(403).json({ erro: "Acesso negado. Área exclusiva para o Administrador." });
            return;
        }

        const usuarios = await prisma.usuario.findMany({
            select: { id: true, nome: true, email: true, perfil: true, setor: true } // Não retorna as senhas
        });

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar usuários." });
    }
};

export const alterarSenhaUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        // Apenas o ADM pode alterar a senha de qualquer usuário através desta rota
        if (req.usuario!.perfil !== 'ADM') {
            res.status(403).json({ erro: "Acesso negado. Apenas o Administrador pode redefinir senhas." });
            return;
        }

        const { idUsuario, novaSenha } = req.body;

        if (!idUsuario || !novaSenha) {
            res.status(400).json({ erro: "ID do usuário e a nova senha são obrigatórios." });
            return;
        }

        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

        await prisma.usuario.update({
            where: { id: idUsuario },
            data: { senha: senhaCriptografada }
        });

        res.json({ mensagem: "Senha do usuário atualizada com sucesso pelo Administrador!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno ao alterar a senha." });
    }
};
