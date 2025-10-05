import { connectToDatabase } from '../../../lib/mongodb';
import mongoose from 'mongoose';

const ProdutoSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        enum: ['tamanho', 'sabor']
    },
    nome: {
        type: String,
        required: true
    },
    descricao: String,
    categoria: {
        type: String,
        enum: ['tradicional', 'especial'],
        required: function() { return this.tipo === 'sabor'; }
    },
    preco: {
        type: Number,
        required: function() { return this.tipo === 'tamanho'; }
    },
    adicional: {
        type: Number,
        default: 0,
        required: function() { return this.tipo === 'sabor' && this.categoria === 'especial'; }
    }
});

const Produto = mongoose.models.Produto || mongoose.model('Produto', ProdutoSchema);

export default async function handler(req, res) {
    try {
        await connectToDatabase();

        switch (req.method) {
            case 'GET':
                const produtos = await Produto.find();
                const response = {
                    tamanhos: produtos.filter(p => p.tipo === 'tamanho'),
                    sabores: produtos.filter(p => p.tipo === 'sabor')
                };
                res.status(200).json(response);
                break;

            case 'POST':
                const novoProduto = await Produto.create(req.body);
                res.status(201).json(novoProduto);
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a requisição' });
    }
}