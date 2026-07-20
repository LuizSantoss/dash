import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares 
app.use(cors()); // Permite requisições do frontend Vite/React
app.use(express.json()); // Permite que a API receba dados no formato JSON

// Gerente
app.post('/api/requisicoes', (req: Request, res: Response) => {
    res.json({ message: "Criar Nova Requisição" });
});

app.get('/api/requisicoes/minhas', (req: Request, res: Response) => {
    res.json({ message: "Listar as requisições do Gerente" });
});

app.put('/api/requisicoes/:id/assinar', (req: Request, res: Response) => {
    res.json({ message: "Assinatura Final do Gerente" });
});

// RH
app.get('/api/requisicoes/rh', (req: Request, res: Response) => {
    res.json({ message: "Listar requisições para o RH" });
});

app.put('/api/requisicoes/:id/encaminhar-diretoria', (req: Request, res: Response) => {
    res.json({ message: "RH preenche dados e envia para Diretoria" });
});

app.put('/api/requisicoes/:id/retornar-gerente', (req: Request, res: Response) => {
    res.json({ message: "RH retorna requisição para o Gerente" });
});

// Diretoria
app.get('/api/requisicoes/diretoria', (req: Request, res: Response) => {
    res.json({ message: "Caixa de Entrada da Diretoria" });
});

app.put('/api/requisicoes/:id/avaliar', (req: Request, res: Response) => {
    res.json({ message: "Aval da Diretoria e disparo de e-mail" });
});


app.listen(PORT, () => {
    console.log(`Servidor dash RH rodando na porta ${PORT}`);
});