import { Router } from 'express';
import { getAllProdutos, getProdutoById, createProduto, updateProduto, deleteProduto } from '../models/produto.js';

export const router = Router();

// Buscar todos os produtos
router.get('/', async (req, res) => {
    try {
        const produtos = await getAllProdutos();
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Buscar um produto por ID
router.get('/:id', async (req, res) => {
    try {
        const produto = await getProdutoById(req.params.id);
        if (produto) {
            res.json(produto);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Criar um novo produto
router.post('/', async (req, res) => {
    try {
        const novoProduto = await createProduto(req.body);
        res.status(201).json(novoProduto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar um produto
router.put('/:id', async (req, res) => {
    try {
        const produto = await updateProduto(req.params.id, req.body);
        res.json(produto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Excluir um produto
router.delete('/:id', async (req, res) => {
    try {
        await deleteProduto(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});