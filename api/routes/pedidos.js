import { Router } from 'express';
import Pedido from '../models/Pedido.js';

export const router = Router();

// Buscar todos os pedidos
router.get('/', async (req, res) => {
    try {
        const pedidos = await Pedido.find({}).sort({ dataPedido: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buscar um pedido por ID
router.get('/:id', async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        if (pedido) {
            res.json(pedido);
        } else {
            res.status(404).json({ message: 'Pedido não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Criar um novo pedido
router.post('/', async (req, res) => {
    try {
        const novoPedido = new Pedido(req.body);
        const pedidoSalvo = await novoPedido.save();
        res.status(201).json(pedidoSalvo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar um pedido
router.put('/:id', async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if (pedido) {
            res.json(pedido);
        } else {
            res.status(404).json({ message: 'Pedido não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar status do pedido
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (pedido) {
            res.json(pedido);
        } else {
            res.status(404).json({ message: 'Pedido não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Excluir um pedido
router.delete('/:id', async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndDelete(req.params.id);
        if (pedido) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Pedido não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buscar pedidos por status
router.get('/status/:status', async (req, res) => {
    try {
        const pedidos = await Pedido.find({ status: req.params.status })
                                   .sort({ dataPedido: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});