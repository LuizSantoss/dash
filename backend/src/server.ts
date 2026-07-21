import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.ts';
import requisicaoRoutes from './routes/requisicao.routes.ts';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('api/requisicoes', requisicaoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})