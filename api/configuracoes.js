import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verificar se a URI do MongoDB está configurada
    if (!uri) {
        console.error('MONGODB_URI não está configurada');
        return res.status(500).json({ 
            error: 'Configuração do banco de dados não encontrada',
            details: 'MONGODB_URI não está definida nas variáveis de ambiente'
        });
    }

    const client = new MongoClient(uri);

    try {
        console.log('Conectando ao MongoDB...');
        await client.connect();
        console.log('Conectado ao MongoDB com sucesso');
        
        const db = client.db('pizzaria');
        const collection = db.collection('configuracoes');

        switch (req.method) {
            case 'GET':
                const configuracoes = await collection.findOne({ tipo: 'geral' }) || {
                    tipo: 'geral',
                    pizzaria: {
                        nome: 'Pizzaria Admin',
                        endereco: '',
                        telefone: '',
                        email: ''
                    },
                    sistema: {
                        moeda: 'R$',
                        timezone: 'America/Sao_Paulo',
                        idioma: 'pt-BR'
                    }
                };
                return res.status(200).json(configuracoes);

            case 'POST':
            case 'PUT':
                console.log('Salvando configurações:', req.body);
                
                // Validar dados de entrada
                if (!req.body || typeof req.body !== 'object') {
                    return res.status(400).json({ 
                        error: 'Dados inválidos',
                        details: 'Corpo da requisição deve ser um objeto JSON válido'
                    });
                }

                const novasConfiguracoes = {
                    tipo: 'geral',
                    ...req.body,
                    atualizadoEm: new Date()
                };

                console.log('Configurações a serem salvas:', novasConfiguracoes);

                const resultado = await collection.replaceOne(
                    { tipo: 'geral' },
                    novasConfiguracoes,
                    { upsert: true }
                );

                console.log('Resultado da operação:', resultado);

                if (resultado.acknowledged) {
                    console.log('Configurações salvas com sucesso');
                    return res.status(200).json({ 
                        message: 'Configurações salvas com sucesso',
                        configuracoes: novasConfiguracoes,
                        operacao: {
                            modificados: resultado.modifiedCount,
                            inseridos: resultado.upsertedCount
                        }
                    });
                } else {
                    throw new Error('Operação não foi confirmada pelo banco de dados');
                }

            default:
                return res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro na API de configurações:', error);
        
        // Diferentes tipos de erro
        if (error.name === 'MongoNetworkError') {
            return res.status(503).json({ 
                error: 'Erro de conexão com o banco de dados',
                details: 'Não foi possível conectar ao MongoDB. Verifique a configuração.'
            });
        }
        
        if (error.name === 'MongoParseError') {
            return res.status(500).json({ 
                error: 'Erro de configuração do banco de dados',
                details: 'URI do MongoDB inválida'
            });
        }
        
        return res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message,
            type: error.name
        });
    } finally {
        try {
            await client.close();
            console.log('Conexão com MongoDB fechada');
        } catch (closeError) {
            console.error('Erro ao fechar conexão:', closeError);
        }
    }
}