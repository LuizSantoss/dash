import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.ts';
import { enviarEmailNotificacao } from '../services/email.service.ts';
import { getIO } from '../services/socket.service.ts';

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
                ambienteTrabalho: true,
                gerente: {select: { nome: true, email: true, setor: true }} // Adicionado setor
            }
        });

        getIO().emit('nova_requisição', novaRequisicao);
        res.status(201).json({ mensagem: "Requisição criada com sucesso!", requisicao: novaRequisicao });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno ao criar a requisição." });
    }
};

// Listagem do gerente
export const listarMinhasRequisicoes = async (req: Request, res: Response): Promise<void> => {
    try {
        const gerenteId = req.usuario!.id;

        const minhasRequisicoes = await prisma.requisicao.findMany({
            where: { gerenteId },
            include: {
                dadosGerais: true,
                avaliacaoDiretoria: true 
            },
            orderBy: { criadoEm: 'desc' } 
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
        if (req.usuario!.perfil !== 'RH') {
            res.status(403).json({ erro: "Acesso negado. Área exclusiva para o RH." });
            return;
        }

        const requisicoesRH = await prisma.requisicao.findMany({
            include: {
                dadosGerais: true,
                gerente: {
                    select: { nome: true, email: true, setor: true } // Adicionado setor
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

// RH encaminha para a diretoria
export const encaminharDiretoria = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.usuario!.perfil !== 'RH') {
            res.status(403).json({ erro: "Acesso negado. Apenas o RH pode encaminhar para a Diretoria." });
            return;
        }

        const requisicaoId = req.params.id as string; 
        const { dadosRH } = req.body; 

        const requisicaoExistente = await prisma.requisicao.findUnique({
            where: { id: requisicaoId }
        });

        if (!requisicaoExistente) {
            res.status(404).json({ erro: "Requisição não encontrada." });
            return;
        }

        const requisicaoAtualizada = await prisma.requisicao.update({
            where: { id: requisicaoId },
            data: {
                status: "Aguardando Diretoria",
                dadosRH: {
                    upsert: {
                        create: dadosRH,
                        update: dadosRH
                    }
                }
            },
            include: {
                dadosGerais: true,
                dadosRH: true, 
                gerente: { select: { nome: true, email:true, setor: true }}, // Adicionado setor
                avaliacaoDiretoria: true
            }
        });

        getIO().emit('status_atualizado', requisicaoAtualizada);
        res.json({
            mensagem: "Requisição encaminhada para a Diretoria com sucesso!",
            requisicao: requisicaoAtualizada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao encaminhar requisição para a Diretoria." });
    }
};

// Listagem diretoria
export const listarRequisicoesDiretoria = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.usuario!.perfil !== 'DIRETORIA') {
            res.status(403).json({ erro: "Acesso negado. Área exclusiva para a Diretoria." });
            return;
        }

        const requisicoesDiretoria = await prisma.requisicao.findMany({
            where: {
                status: "Aguardando Diretoria"
            },
            include: {
                dadosGerais: true,
                dadosRH: true, 
                gerente: {
                    select: { nome: true, email: true, setor: true } // Adicionado setor
                }
            },
            orderBy: { criadoEm: 'desc' }
        });

        res.json(requisicoesDiretoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar as requisições para a Diretoria." });
    }
};

// Histórico da Diretoria
export const listarHistoricoDiretoria = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.usuario!.perfil !== 'DIRETORIA') {
            res.status(403).json({ erro: "Acesso negado. Área exclusiva para a Diretoria." });
            return;
        }

        const historico = await prisma.requisicao.findMany({
            where: {
                status: {
                    in: ["Aprovada", "Recusada"]
                }
            },
            include: {
                dadosGerais: true,
                dadosRH: true,
                gerente: {
                    select: { nome: true, setor: true } // Adicionado setor
                },
                avaliacaoDiretoria: true 
            },
            orderBy: { atualizadoEm: 'desc' } 
        });

        res.json(historico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar o histórico da Diretoria." });
    }
};

// Avaliar (APROVAR/RECUSAR)
export const avaliarRequisicao = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.usuario!.perfil !== 'DIRETORIA') {
            res.status(403).json({ erro: "Acesso negado. Apenas a Diretoria pode avaliar." });
            return;
        }

        const requisicaoId = req.params.id as string;
        const { decisao, observacao } = req.body; 

        const requisicaoExistente = await prisma.requisicao.findUnique({
            where: { id: requisicaoId }
        });
        
        if (!requisicaoExistente) {
            res.status(404).json({ erro: "Requisição não encontrada." });
            return;
        }

        const novoStatus = decisao === "Aprovado" ? "Aprovada" : "Recusada";

        const requisicaoAtualizada = await prisma.requisicao.update({
            where: { id: requisicaoId },
            data: {
                status: novoStatus,
                avaliacaoDiretoria: {
                    upsert: {
                        create: { decisao, observacao },
                        update: { decisao, observacao }
                    }
                }
            },
            include: {
                dadosGerais: true,
                gerente: { select: { nome: true, email:true, setor: true }}, // Adicionado setor
                avaliacaoDiretoria: true
            }
        });
        
        const dadosGerente = await prisma.usuario.findUnique({
            where: { id: requisicaoExistente.gerenteId }
        });

        if (dadosGerente) {
            const assunto = `Atualização de Requisição: ${novoStatus}`;
            const html = `
                <h2>Olá, ${dadosGerente.nome}</h2>
                <p>A tua requisição de pessoal acabou de ser avaliada pela Diretoria.</p>
                <p><strong>Status Final:</strong> ${novoStatus}</p>
                <p><strong>Observação da Diretoria:</strong> ${observacao || 'Sem observações adicionais.'}</p>
                <br/>
                <p>Acesse o Dash RH para ver mais detalhes e assinar o documento final.</p>
            `;

            enviarEmailNotificacao(dadosGerente.email, assunto, html);
        }

        getIO().emit('status_atualizado', requisicaoAtualizada);

        res.json({
            mensagem: `Requisição ${novoStatus.toLowerCase()} com sucesso!`,
            requisicao: requisicaoAtualizada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao avaliar a requisição." });
    }
};

// ==========================================
// FUNÇÕES EXCLUSIVAS DO ADMINISTRADOR (ADM)
// ==========================================

export const listarTodasRequisicoesADM = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.usuario!.perfil !== 'ADM') {
            res.status(403).json({ erro: "Acesso negado. Área exclusiva para o Administrador." });
            return;
        }

        // O ADM puxa o banco de dados inteiro para visualizar o andamento global
        const todasRequisicoes = await prisma.requisicao.findMany({
            include: {
                dadosGerais: true,
                dadosRH: true,
                avaliacaoDiretoria: true,
                gerente: {
                    select: { nome: true, email: true, setor: true }
                }
            },
            orderBy: { criadoEm: 'desc' }
        });

        res.json(todasRequisicoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar as requisições para o Administrador." });
    }
};
