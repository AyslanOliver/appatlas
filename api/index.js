import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './lib/mongodb.js';
import { router as productRoutes } from './routes/produtos.js';

dotenv.config();

const app = express();

// Conectar ao MongoDB
await connectToDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/produtos', productRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});