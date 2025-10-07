const express = require('express');
const cors = require('cors');
const { connectToMongoDB, produtoQueries, pedidoQueries, configQueries } = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB na inicialização
let dbConnected = false;

async function initializeServer() {
    try {
        await connectToMongoDB();
        dbConnected = true;
        console.log('Servidor inicializado com MongoDB!');
    } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error);
        console.log('Servidor iniciará sem banco de dados.');
    }
}

// Rotas da API

// Pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const pedidos = await pedidoQueries.getAll();
        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/pedidos/:id', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const pedido = await pedidoQueries.getById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        res.json(pedido);
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/pedidos', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }

        const novoPedido = {
            cliente: req.body.cliente,
            itens: req.body.itens || [],
            total: req.body.total || 0,
            observacoes: req.body.observacoes || '',
            status: 'pendente',
            numero_pedido: `PED${Math.floor(Math.random() * 1000000)}`,
            dataPedido: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        };
        
        const result = await pedidoQueries.create(novoPedido);
        res.json({ success: true, pedido: result });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.put('/api/pedidos/:id', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        
        // Se apenas status for enviado, usa a função updateStatus
        if (req.body.status && Object.keys(req.body).length === 1) {
            await pedidoQueries.updateStatus(req.params.id, req.body.status);
        } else {
            // Caso contrário, atualiza o pedido completo
            const updateData = { ...req.body };
            updateData.updated_at = new Date();
            await pedidoQueries.update(req.params.id, updateData);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        
        await pedidoQueries.delete(req.params.id);
        res.json({ success: true, message: 'Pedido deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Produtos
app.get('/api/produtos', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const produtos = await produtoQueries.getAll();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/produtos/:id', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const produto = await produtoQueries.getById(req.params.id);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/produtos', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const novoProduto = await produtoQueries.create(req.body);
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.put('/api/produtos/:id', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const produtoAtualizado = await produtoQueries.update(req.params.id, req.body);
        res.json(produtoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.delete('/api/produtos/:id', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        await produtoQueries.delete(req.params.id);
        res.json({ message: 'Produto removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Configurações
app.get('/api/configuracoes', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const configuracoes = await configQueries.getAll();
        res.json(configuracoes);
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.put('/api/configuracoes', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        
        // Converter objeto para array de configurações
        const configuracoes = Object.entries(req.body).map(([chave, valor]) => ({
            chave,
            valor: typeof valor === 'object' ? JSON.stringify(valor) : String(valor)
        }));
        
        await configQueries.updateMultiple(configuracoes);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// API de impressão
app.post('/api/impressora', async (req, res) => {
    try {
        const { acao, pedidoId } = req.body;
        
        if (acao === 'imprimir_pedido') {
            // Buscar o pedido no banco
            const pedido = await pedidoQueries.getById(pedidoId);
            
            if (!pedido) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
            
            // Simular impressão (em produção seria enviado para impressora real)
            console.log('Imprimindo pedido:', pedido.numero_pedido);
            
            return res.json({
                success: true,
                message: 'Pedido enviado para impressão',
                pedido: pedido
            });
        }
        
        if (acao === 'testar_impressora') {
            console.log('Teste de impressora solicitado');
            
            return res.json({
                success: true,
                message: 'Teste de impressora executado'
            });
        }
        
        return res.status(400).json({ error: 'Ação não reconhecida' });
    } catch (error) {
        console.error('Erro na API de impressão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Teste de impressora (manter compatibilidade)
app.post('/api/impressora/teste', (req, res) => {
    // Simular teste de impressora
    const sucesso = Math.random() > 0.3; // 70% de chance de sucesso
    
    if (sucesso) {
        res.json({ 
            sucesso: true, 
            mensagem: 'Impressora conectada e funcionando!' 
        });
    } else {
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro ao conectar com a impressora. Verifique a conexão.' 
        });
    }
});

// Cardápio público
app.get('/api/cardapio', async (req, res) => {
    try {
        if (!dbConnected) {
            return res.status(503).json({ error: 'Banco de dados não conectado' });
        }
        const produtos = await produtoQueries.getAll();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar cardápio:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Inicializar servidor com MongoDB
initializeServer();

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor da API rodando em http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponíveis:`);
    console.log(`   GET  /api/pedidos`);
    console.log(`   POST /api/pedidos`);
    console.log(`   GET  /api/produtos`);
    console.log(`   POST /api/produtos`);
    console.log(`   GET  /api/configuracoes`);
    console.log(`   PUT  /api/configuracoes`);
    console.log(`   POST /api/impressora`);
    console.log(`   POST /api/impressora/teste`);
    console.log(`   GET  /api/cardapio`);
});