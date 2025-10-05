import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { router as productRoutes } from './routes/produtos.js';
import { router as pedidoRoutes } from './routes/pedidos.js';
import { router as cardapioRoutes } from './routes/cardapio.js';

dotenv.config();

const app = express();

// Conectar ao MongoDB
await connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando!', timestamp: new Date() });
});

// Rotas
app.use('/api/produtos', productRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/cardapio', cardapioRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});