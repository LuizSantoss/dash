
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
                ambienteTrabalho: true
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


// RH encaminha para a diretoria
export const encaminharDiretoria = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Barreira de Segurança: Verifica se é realmente o perfil RH
        if (req.usuario!.perfil !== 'RH') {
            res.status(403).json({ erro: "Acesso negado. Apenas o RH pode encaminhar para a Diretoria." });
            return;
        }

        // Pega o ID da URL 
        const requisicaoId = req.params.id as string; 
        
        // Pega os dados exclusivos do RH que vieram do frontend
        const { dadosRH } = req.body; 

        // 2. Verifica se a requisição existe no banco
        const requisicaoExistente = await prisma.requisicao.findUnique({
            where: { id: requisicaoId }
        });

        if (!requisicaoExistente) {
            res.status(404).json({ erro: "Requisição não encontrada." });
            return;
        }

        // 3. Atualiza o status e salva os dados do RH usando Upsert 
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
                dadosRH: true, // Retorna os dados recém-salvos para confirmação
                dadosGerais: true,
                gerente: { select: { nome: true, email:true}},
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

        // A Diretoria só vê requisições que já passaram pelo filtro do RH
        const requisicoesDiretoria = await prisma.requisicao.findMany({
            where: {
                status: "Aguardando Diretoria"
            },
            include: {
                dadosGerais: true,
                dadosRH: true, // Essencial para a Diretoria ver os custos (salário)
                gerente: {
                    select: { nome: true, email: true }
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


// ==========================================
// HISTÓRICO DA DIRETORIA
// ==========================================
export const listarHistoricoDiretoria = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.usuario!.perfil !== 'DIRETORIA') {
            res.status(403).json({ erro: "Acesso negado. Área exclusiva para a Diretoria." });
            return;
        }

        // Busca apenas as requisições que já foram Aprovadas ou Recusadas
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
                    select: { nome: true }
                },
                avaliacaoDiretoria: true // Traz a observação que o Diretor deixou!
            },
            // orderBy: { atualizadoEm: 'desc' } // Mostra as avaliadas mais recentemente no topo
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
        // A Diretoria envia a decisão ("Aprovado" ou "Recusado") e uma observação opcional
        const { decisao, observacao } = req.body; 

        const requisicaoExistente = await prisma.requisicao.findUnique({
            where: { id: requisicaoId }
        });
        
        if (!requisicaoExistente) {
            res.status(404).json({ erro: "Requisição não encontrada." });
            return;
        }

        // Ajusta automaticamente o status geral da requisição com base na decisão
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
                gerente: { select: { nome: true, email:true}},
                avaliacaoDiretoria: true
            }
        });
        
        // Vai buscar os dados do gerente para sabermos o e-mail dele
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
                <p>Acede ao Dash RH para veres mais detalhes e assinares o documento final.</p>
            `;

            // Dispara o e-mail de forma assíncrona
            enviarEmailNotificacao(dadosGerente.email, assunto, html);
        }

        // AQUI É O LUGAR CORRETO DO WEBSOCKET
        // Avisa que a Diretoria deu o seu aval final
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
