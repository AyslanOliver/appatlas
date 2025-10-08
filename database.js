const { MongoClient } = require('mongodb');

// URL de conexão do MongoDB (local)
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'pastelaria';

let db = null;
let client = null;

// Conectar ao MongoDB
async function connectToMongoDB() {
    try {
        client = new MongoClient(MONGO_URL);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Conectado ao MongoDB com sucesso!');
        
        // Inicializar dados se necessário
        await initializeData();
        
        return db;
    } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error);
        throw error;
    }
}

// Inicializar dados básicos
async function initializeData() {
    try {
        // Verificar se já existem produtos
        const produtosCount = await db.collection('produtos').countDocuments();
        
        if (produtosCount === 0) {
            try {
                // Carregar produtos do arquivo JSON
                const fs = require('fs');
                const path = require('path');
                const jsonPath = path.join(__dirname, 'pastelaria.produtos.json');
                
                if (fs.existsSync(jsonPath)) {
                    const jsonData = fs.readFileSync(jsonPath, 'utf8');
                    const produtosJson = JSON.parse(jsonData);
                    
                    // Converter produtos do JSON para o formato do banco
                    const produtosParaInserir = produtosJson.map(produto => {
                        // Remover campos específicos do MongoDB
                        const { _id, __v, createdAt, updatedAt, ...produtoLimpo } = produto;
                        
                        return {
                            ...produtoLimpo,
                            // Mapear 'disponivel' para 'ativo' para compatibilidade
                            ativo: produto.disponivel !== undefined ? produto.disponivel : true,
                            created_at: new Date(),
                            updated_at: new Date()
                        };
                    });
                    
                    await db.collection('produtos').insertMany(produtosParaInserir);
                    console.log(`${produtosParaInserir.length} produtos carregados do arquivo JSON!`);
                } else {
                    console.log('Arquivo pastelaria.produtos.json não encontrado, inserindo produtos padrão...');
                    // Fallback para produtos padrão se o arquivo não existir
                    const produtosIniciais = [
                        {
                            nome: 'Pizza Margherita',
                            descricao: 'Molho de tomate, mussarela, manjericão',
                            preco: 25.90,
                            categoria: 'pizza',
                            ativo: true,
                            created_at: new Date(),
                            updated_at: new Date()
                        },
                        {
                            nome: 'Refrigerante Lata',
                            descricao: 'Coca-Cola, Pepsi, Guaraná',
                            preco: 4.50,
                            categoria: 'bebida',
                            ativo: true,
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    ];
                    
                    await db.collection('produtos').insertMany(produtosIniciais);
                    console.log('Produtos padrão inseridos!');
                }
            } catch (error) {
                console.error('Erro ao carregar produtos do JSON:', error);
                console.log('Inserindo produtos padrão como fallback...');
                
                // Fallback em caso de erro
                const produtosIniciais = [
                    {
                        nome: 'Pizza Margherita',
                        descricao: 'Molho de tomate, mussarela, manjericão',
                        preco: 25.90,
                        categoria: 'pizza',
                        ativo: true,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ];
                
                await db.collection('produtos').insertMany(produtosIniciais);
                console.log('Produtos padrão inseridos após erro!');
            }
        }

        // Verificar se já existem configurações
        const configCount = await db.collection('configuracoes').countDocuments();
        
        if (configCount === 0) {
            // Inserir configurações iniciais
            const configuracoesIniciais = [
                {
                    chave: 'nome_pizzaria',
                    valor: 'Pizzaria do João',
                    descricao: 'Nome da pizzaria',
                    updated_at: new Date()
                },
                {
                    chave: 'endereco',
                    valor: 'Rua das Flores, 123',
                    descricao: 'Endereço da pizzaria',
                    updated_at: new Date()
                },
                {
                    chave: 'telefone',
                    valor: '(11) 99999-9999',
                    descricao: 'Telefone da pizzaria',
                    updated_at: new Date()
                },
                {
                    chave: 'taxa_entrega',
                    valor: '5.00',
                    descricao: 'Taxa de entrega',
                    updated_at: new Date()
                },
                {
                    chave: 'tempo_preparo',
                    valor: '30',
                    descricao: 'Tempo médio de preparo em minutos',
                    updated_at: new Date()
                },
                {
                    chave: 'impressora_ip',
                    valor: '192.168.1.100',
                    descricao: 'IP da impressora térmica',
                    updated_at: new Date()
                },
                {
                    chave: 'impressora_porta',
                    valor: '9100',
                    descricao: 'Porta da impressora térmica',
                    updated_at: new Date()
                }
            ];

            await db.collection('configuracoes').insertMany(configuracoesIniciais);
            console.log('Configurações iniciais inseridas!');
        }

    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
    }
}

// Funções para produtos
const produtoQueries = {
    async getAll(incluirInativos = false) {
        try {
            let filtro = {};
            if (!incluirInativos) {
                // Filtrar produtos ativos/disponíveis (compatibilidade com ambos os campos)
                filtro = {
                    $or: [
                        { ativo: true },
                        { disponivel: true }
                    ]
                };
            }
            const produtos = await db.collection('produtos')
                .find(filtro)
                .sort({ categoria: 1, nome: 1 })
                .toArray();
            
            // Converter _id para id para compatibilidade com o frontend
            return produtos.map(produto => ({
                ...produto,
                id: produto._id.toString(),
                _id: undefined
            }));
        } catch (error) {
            throw error;
        }
    },

    async getById(id) {
        try {
            const { ObjectId } = require('mongodb');
            const produto = await db.collection('produtos').findOne({ _id: new ObjectId(id) });
            
            if (produto) {
                // Converter _id para id para compatibilidade com o frontend
                return {
                    ...produto,
                    id: produto._id.toString(),
                    _id: undefined
                };
            }
            
            return produto;
        } catch (error) {
            throw error;
        }
    },

    async create(produto) {
        try {
            const novoProduto = {
                ...produto,
                ativo: true,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            const result = await db.collection('produtos').insertOne(novoProduto);
            return { _id: result.insertedId, ...novoProduto };
        } catch (error) {
            throw error;
        }
    },

    async update(id, produto) {
        try {
            const { ObjectId } = require('mongodb');
            const produtoAtualizado = {
                ...produto,
                updated_at: new Date()
            };
            
            await db.collection('produtos').updateOne(
                { _id: new ObjectId(id) },
                { $set: produtoAtualizado }
            );
            
            return { _id: id, ...produtoAtualizado };
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            const { ObjectId } = require('mongodb');
            await db.collection('produtos').updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        ativo: false,
                        updated_at: new Date()
                    }
                }
            );
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
};

// Funções para pedidos
const pedidoQueries = {
    async getAll() {
        try {
            return await db.collection('pedidos')
                .find({})
                .sort({ created_at: -1 })
                .toArray();
        } catch (error) {
            throw error;
        }
    },

    async getById(id) {
        try {
            const { ObjectId } = require('mongodb');
            return await db.collection('pedidos').findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw error;
        }
    },

    async create(pedido) {
        try {
            const novoPedido = {
                ...pedido,
                status: 'pendente',
                created_at: new Date(),
                updated_at: new Date()
            };
            
            const result = await db.collection('pedidos').insertOne(novoPedido);
            return { _id: result.insertedId, ...novoPedido };
        } catch (error) {
            throw error;
        }
    },

    async updateStatus(id, status) {
        try {
            const { ObjectId } = require('mongodb');
            await db.collection('pedidos').updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status: status,
                        updated_at: new Date()
                    }
                }
            );
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    async update(id, updateData) {
        try {
            const { ObjectId } = require('mongodb');
            await db.collection('pedidos').updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    async getByNumero(numero_pedido) {
        try {
            return await db.collection('pedidos').findOne({ numero_pedido });
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            const { ObjectId } = require('mongodb');
            
            // Verificar se o ID é válido antes de tentar converter
            if (!id || (typeof id === 'string' && id.length !== 24)) {
                throw new Error('ID inválido');
            }
            
            const result = await db.collection('pedidos').deleteOne({ _id: new ObjectId(id) });
            
            if (result.deletedCount === 0) {
                throw new Error('Pedido não encontrado');
            }
            
            return { success: true };
        } catch (error) {
            console.error('Erro na função delete:', error);
            throw error;
        }
    },

    async deleteAll() {
        try {
            const result = await db.collection('pedidos').deleteMany({});
            
            return { 
                success: true, 
                deletedCount: result.deletedCount,
                message: `${result.deletedCount} pedidos foram apagados com sucesso`
            };
        } catch (error) {
            console.error('Erro na função deleteAll:', error);
            throw error;
        }
    }
};

// Funções para configurações
const configQueries = {
    async getAll() {
        try {
            return await db.collection('configuracoes')
                .find({})
                .sort({ chave: 1 })
                .toArray();
        } catch (error) {
            throw error;
        }
    },

    async getByKey(chave) {
        try {
            return await db.collection('configuracoes').findOne({ chave });
        } catch (error) {
            throw error;
        }
    },

    async update(chave, valor) {
        try {
            await db.collection('configuracoes').updateOne(
                { chave },
                { 
                    $set: { 
                        valor,
                        updated_at: new Date()
                    }
                },
                { upsert: true }
            );
            
            return { chave, valor };
        } catch (error) {
            throw error;
        }
    },

    async updateMultiple(configuracoes) {
        try {
            const operations = configuracoes.map(config => ({
                updateOne: {
                    filter: { chave: config.chave },
                    update: { 
                        $set: { 
                            valor: config.valor,
                            updated_at: new Date()
                        }
                    },
                    upsert: true
                }
            }));

            await db.collection('configuracoes').bulkWrite(operations);
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
};

// Função para fechar conexão
async function closeConnection() {
    if (client) {
        await client.close();
        console.log('Conexão com MongoDB fechada.');
    }
}

module.exports = {
    connectToMongoDB,
    closeConnection,
    produtoQueries,
    pedidoQueries,
    configQueries,
    getDb: () => db
};