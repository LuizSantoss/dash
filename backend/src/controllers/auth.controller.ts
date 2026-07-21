import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.ts';

export const registrar = async (req: Request, res: Response): Promise<void> => {
    const { nome, email, senha, perfil } = req.body;
    try {
        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) { res.status(400).json({ erro: "E-mail já cadastrado." }); return; }

        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const novoUsuario = await prisma.usuario.create({
            data: { nome, email, senha: senhaCriptografada, perfil }
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
        res.json({ mensagem: "Login realizado com sucesso!", token, usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno ao realizar login." });
    }
};
