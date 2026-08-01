import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './services/socket.service.ts';
import authRoutes from './routes/auth.routes.ts';
import requisicaoRoutes from './routes/requisicao.routes.ts';

dotenv.config();

const app = express();
const server = createServer(app);

// Middlewares globais
app.use(cors());
app.use(express.json());

// 1. Inicializa os WebSockets no servidor HTTP
initSocket(server);

// 2. Rotas limpas SEM o prefixo /api (Opção 2)
app.use('/auth', authRoutes);
app.use('/requisicoes', requisicaoRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor dash RH rodando na porta ${PORT}`);
});