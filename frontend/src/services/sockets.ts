import { io } from 'socket.io-client';

// Conecta o frontend ao servidor Node.js que está rodando na porta 3000
export const socket = io('http://localhost:3000', {
    autoConnect: true, // Conecta automaticamente quando o app abrir
});
import { io } from 'socket.io-client';

// Conecta o frontend ao servidor Node.js que está rodando na porta 3000
export const socket = io('http://localhost:3000', {
    autoConnect: true, // Conecta automaticamente quando o app abrir
});

