import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

// Variável para guardar a instância do servidor de WebSockets
let io: Server;

export const initSocket = (server: HttpServer): Server => {
    io = new Server(server, {
        cors: {
            origin: "*", // Permite que o teu frontend Vite aceda ao socket
            methods: ["GET", "POST", "PUT"]
        }
    });

    // Fica à escuta de novos utilizadores a abrirem o sistema
    io.on('connection', (socket) => {
        console.log(`🟢 Novo cliente conectado ao painel: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`🔴 Cliente desconectado: ${socket.id}`);
        });
    });

    return io;
};

// Função para usar o "io" 
export const getIO = (): Server => {
    if (!io) {
        throw new Error("O Socket.io não foi inicializado!");
    }
    return io;
};
