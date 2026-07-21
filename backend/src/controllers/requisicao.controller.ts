
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
