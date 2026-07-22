import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // <-- Importação nativa do Node
import { initSocket } from './services/socket.service.ts'; // <-- O nosso novo serviço
import authRoutes from './routes/auth.routes.ts';
import requisicaoRoutes from './routes/requisicao.routes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Criamos o servidor HTTP unindo-o ao Express
const httpServer = createServer(app);

// 2. Iniciamos o Socket.io usando esse servidor HTTP
initSocket(httpServer);

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/requisicoes', requisicaoRoutes);

// Usamos 'httpServer.listen' em vez do 'app.listen'
httpServer.listen(PORT, () => {
    console.log(`Servidor dash RH rodando na porta ${PORT} com WebSockets ATIVOS 🚀`);
});