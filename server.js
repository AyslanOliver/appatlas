import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Dados mock para simular o banco de dados
let pedidos = [
    {
        id: '1',
        cliente: 'João Silva',
        telefone: '(11) 99999-9999',
        endereco: 'Rua das Flores, 123',
        itens: [
            { nome: 'Pizza Margherita', quantidade: 1, preco: 35.00 }
        ],
        total: 35.00,
        status: 'pendente',
        criadoEm: new Date('2024-01-15T10:30:00'),
        data_pedido: new Date('2024-01-15T10:30:00')
    },
    {
        id: '2',
        cliente: 'Maria Santos',
        telefone: '(11) 88888-8888',
        endereco: 'Av. Principal, 456',
        itens: [
            { nome: 'Pizza Calabresa', quantidade: 2, preco: 32.00 }
        ],
        total: 64.00,
        status: 'preparando',
        criadoEm: new Date('2024-01-15T11:15:00'),
        data_pedido: new Date('2024-01-15T11:15:00')
    }
];

let produtos = [
    {
        id: '1',
        nome: 'Pizza Margherita',
        tipo: 'pizza',
        preco: 35.00,
        descricao: 'Molho de tomate, mussarela e manjericão',
        disponivel: true
    },
    {
        id: '2',
        nome: 'Pizza Calabresa',
        tipo: 'pizza',
        preco: 32.00,
        descricao: 'Molho de tomate, mussarela e calabresa',
        disponivel: true
    },
    {
        id: '3',
        nome: 'Coca-Cola 2L',
        tipo: 'bebida',
        preco: 8.00,
        descricao: 'Refrigerante Coca-Cola 2 litros',
        disponivel: true
    },
    {
        id: '4',
        nome: 'Água Mineral',
        tipo: 'bebida',
        preco: 3.00,
        descricao: 'Água mineral 500ml',
        disponivel: true
    }
];

// Rotas da API

// Pedidos
app.get('/api/pedidos', (req, res) => {
    res.json(pedidos.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)));
});

app.post('/api/pedidos', (req, res) => {
    const novoPedido = {
        id: (pedidos.length + 1).toString(),
        ...req.body,
        status: req.body.status || 'pendente',
        criadoEm: new Date(),
        data_pedido: new Date()
    };
    pedidos.push(novoPedido);
    res.status(201).json(novoPedido);
});

app.put('/api/pedidos', (req, res) => {
    const { id } = req.query;
    const index = pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
        pedidos[index] = { ...pedidos[index], ...req.body, atualizadoEm: new Date() };
        res.json({ message: 'Pedido atualizado com sucesso' });
    } else {
        res.status(404).json({ error: 'Pedido não encontrado' });
    }
});

app.delete('/api/pedidos', (req, res) => {
    const { id, deleteAll } = req.query;
    
    if (deleteAll === 'true') {
        const count = pedidos.length;
        pedidos = [];
        res.json({ 
            message: `${count} pedidos foram apagados com sucesso`,
            deletedCount: count
        });
    } else {
        const index = pedidos.findIndex(p => p.id === id);
        if (index !== -1) {
            pedidos.splice(index, 1);
            res.json({ message: 'Pedido deletado com sucesso' });
        } else {
            res.status(404).json({ error: 'Pedido não encontrado' });
        }
    }
});

// Produtos
app.get('/api/produtos', (req, res) => {
    res.json(produtos);
});

app.post('/api/produtos', (req, res) => {
    const novoProduto = {
        id: (produtos.length + 1).toString(),
        ...req.body,
        criadoEm: new Date(),
        atualizadoEm: new Date()
    };
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

app.put('/api/produtos', (req, res) => {
    const { id } = req.query;
    const index = produtos.findIndex(p => p.id === id);
    if (index !== -1) {
        produtos[index] = { ...produtos[index], ...req.body, atualizadoEm: new Date() };
        res.json({ message: 'Produto atualizado com sucesso' });
    } else {
        res.status(404).json({ error: 'Produto não encontrado' });
    }
});

app.delete('/api/produtos', (req, res) => {
    const { id } = req.query;
    const index = produtos.findIndex(p => p.id === id);
    if (index !== -1) {
        produtos.splice(index, 1);
        res.json({ message: 'Produto deletado com sucesso' });
    } else {
        res.status(404).json({ error: 'Produto não encontrado' });
    }
});

// Cardápio
app.get('/api/cardapio', (req, res) => {
    const { tipo } = req.query;
    let cardapio = produtos;
    
    if (tipo) {
        cardapio = produtos.filter(p => p.tipo === tipo);
    }
    
    // Organizar por tipo
    const cardapioOrganizado = cardapio.reduce((acc, item) => {
        if (!acc[item.tipo]) {
            acc[item.tipo] = [];
        }
        acc[item.tipo].push(item);
        return acc;
    }, {});
    
    res.json(cardapioOrganizado);
});

// Configurações (endpoint básico)
app.get('/api/configuracoes', (req, res) => {
    res.json({
        nomeEstabelecimento: 'Pizzaria Atlas',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Principal, 123',
        horarioFuncionamento: '18:00 - 23:00',
        taxaEntrega: 5.00
    });
});

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API local funcionando!', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor API local rodando na porta ${PORT}`);
    console.log(`📡 Acesse: http://localhost:${PORT}/api/test`);
});