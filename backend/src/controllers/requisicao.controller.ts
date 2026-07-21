
import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.ts';

export const criarRequisicao = async (req: Request, res: Response): Promise<void> => {
    try {
        const gerenteId = req.usuario!.id;
        const { dadosGerais, jornadaTrabalho, requisitosCargo, ambienteTrabalho } = req.body;

        const novaRequisicao = await prisma.requisicao.create({
            data: {
                gerenteId,
                dadosGerais: { create: dadosGerais },
                jornadaTrabalho: { create: jornadaTrabalho },
                requisitosCargo: { create: requisitosCargo },
                ambienteTrabalho: { create: ambienteTrabalho }
            },
            include: {
                dadosGerais: true,
                jornadaTrabalho: true,
                requisitosCargo: true,
                ambienteTrabalho: true
            }
        });

        res.status(201).json({ mensagem: "Requisição criada com sucesso!", requisicao: novaRequisicao });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno ao criar a requisição." });
    }
};



// Listagem do gerente
export const listarMinhasRequisicoes = async (req: Request, res: Response): Promise<void> => {
    try {
        // O ID vem de forma segura do token JWT
        const gerenteId = req.usuario!.id;

        const minhasRequisicoes = await prisma.requisicao.findMany({
            where: { gerenteId },
            // O Prisma traz as tabelas relacionadas automaticamente
            include: {
                dadosGerais: true,
                avaliacaoDiretoria: true // mostrar o selo de Aprovado/Recusado no futuro
            },
            orderBy: { criadoEm: 'desc' } // Mostra as mais recentes primeiro
        });

        res.json(minhasRequisicoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar as requisições do gerente." });
    }
};


// Listagem RH
export const listarRequisicoesRH = async (req: Request, res: Response): Promise<void> => {
    try {
        // Camada extra de segurança: garantir que o utilizador tem o perfil 'RH'
        if (req.usuario!.perfil !== 'RH') {
            res.status(403).json({ erro: "Acesso negado. Área exclusiva para o RH." });
            return;
        }

        const requisicoesRH = await prisma.requisicao.findMany({
            // O RH precisa de ver todas as requisições 
            include: {
                dadosGerais: true,
                gerente: {
                    select: { nome: true, email: true } // Traz apenas o nome e email do gerente que pediu
                }
            },
            orderBy: { criadoEm: 'desc' }
        });

        res.json(requisicoesRH);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar as requisições para o RH." });
    }
};
