import { Router } from 'express';
import ItemCardapio from '../models/ItemCardapio.js';

export const router = Router();

// Buscar todos os itens do cardápio
router.get('/', async (req, res) => {
    try {
        const { tipo, categoria, disponivel } = req.query;
        let filtro = {};
        
        if (tipo) filtro.tipo = tipo;
        if (categoria) filtro.categoria = categoria;
        if (disponivel !== undefined) filtro.disponivel = disponivel === 'true';
        
        const itens = await ItemCardapio.find(filtro).sort({ nome: 1 });
        res.json(itens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buscar um item por ID
router.get('/:id', async (req, res) => {
    try {
        const item = await ItemCardapio.findById(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Criar um novo item do cardápio
router.post('/', async (req, res) => {
    try {
        const novoItem = new ItemCardapio(req.body);
        const itemSalvo = await novoItem.save();
        res.status(201).json(itemSalvo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar um item do cardápio
router.put('/:id', async (req, res) => {
    try {
        const item = await ItemCardapio.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar disponibilidade do item
router.patch('/:id/disponibilidade', async (req, res) => {
    try {
        const { disponivel } = req.body;
        const item = await ItemCardapio.findByIdAndUpdate(
            req.params.id,
            { disponivel },
            { new: true }
        );
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Excluir um item do cardápio
router.delete('/:id', async (req, res) => {
    try {
        const item = await ItemCardapio.findByIdAndDelete(req.params.id);
        if (item) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Item não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buscar itens por tipo
router.get('/tipo/:tipo', async (req, res) => {
    try {
        const itens = await ItemCardapio.find({ 
            tipo: req.params.tipo,
            disponivel: true 
        }).sort({ nome: 1 });
        res.json(itens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buscar categorias disponíveis
router.get('/meta/categorias', async (req, res) => {
    try {
        const categorias = await ItemCardapio.distinct('categoria');
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});