import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import { verificarToken } from './middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client'; 

// Carrega as variáveis de ambiente
dotenv.config();
const prisma = new PrismaClient(); // 
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ROTAS PÚBLICAS
// Rota para Cadastrar Usuário
app.post('/api/auth/registrar', async (req: Request, res: Response) => {
    const { nome, email, senha, perfil } = req.body;

    try {
        // 1. Verifica se o e-mail já está em uso
        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) {
            res.status(400).json({ erro: "E-mail já cadastrado." });
            return;
        }

        // 2. Criptografa a senha (o "10" é o custo do processamento, padrão seguro e rápido)
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // 3. Salva no banco de dados
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaCriptografada,
                perfil // Ex: "GERENTE", "RH", "DIRETORIA"
            }
        });

        res.status(201).json({ mensagem: "Usuário criado com sucesso!", usuarioId: novoUsuario.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno ao criar usuário." });
    }
});

// Rota para Fazer Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    try {
        // 1. Busca o usuário no banco
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            res.status(401).json({ erro: "Credenciais inválidas." });
            return;
        }

        // 2. Compara a senha digitada com o hash salvo no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            res.status(401).json({ erro: "Credenciais inválidas." });
            return;
        }

        // 3. Gera o Token JWT contendo o ID e o Perfil do usuário
        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' } // Token expira em 8 horas
        );

        res.json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno ao realizar login." });
    }
});


// Rotas do gerente

// Nova Requisição
app.post('/api/requisicoes', verificarToken, async (req: Request, res: Response) => {
    try {
        // O ID do gerente vem do token decodificado pelo nosso middleware!
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

        res.status(201).json({ 
            mensagem: "Requisição criada com sucesso!", 
            requisicao: novaRequisicao 
        });
    } catch (error) {
        console.error("Erro no Prisma:", error);
        res.status(500).json({ erro: "Erro interno ao criar a requisição." });
    }
});


// Middlewares 
app.use(cors()); // Permite requisições do frontend Vite/React
app.use(express.json()); // Permite que a API receba dados no formato JSON

// Gerente
app.post('/api/requisicoes', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "Criar Nova Requisição" });
});

app.get('/api/requisicoes/minhas', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "Listar as requisições do Gerente" });
});

app.put('/api/requisicoes/:id/assinar', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "Assinatura Final do Gerente" });
});

// RH
app.get('/api/requisicoes/rh', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "Listar requisições para o RH" });
});

app.put('/api/requisicoes/:id/encaminhar-diretoria', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "RH preenche dados e envia para Diretoria" });
});

app.put('/api/requisicoes/:id/retornar-gerente', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "RH retorna requisição para o Gerente" });
});

// Diretoria
app.get('/api/requisicoes/diretoria', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "Caixa de Entrada da Diretoria" });
});

app.put('/api/requisicoes/:id/avaliar', verificarToken, (req: Request, res: Response) => {
    res.json({ message: "Aval da Diretoria e disparo de e-mail" });
});


app.listen(PORT, () => {
    console.log(`Servidor dash RH rodando na porta ${PORT}`);
});
