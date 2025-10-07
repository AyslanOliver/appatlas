import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await client.connect();
        const db = client.db('pizzaria');
        const collection = db.collection('configuracoes');

        switch (req.method) {
            case 'GET':
                const configuracoes = await collection.findOne({ tipo: 'geral' }) || {
                    tipo: 'geral',
                    impressora: {
                        bluetooth: {
                            habilitado: false,
                            dispositivo: '',
                            nome: 'POS58'
                        }
                    },
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
                const novasConfiguracoes = {
                    tipo: 'geral',
                    ...req.body,
                    atualizadoEm: new Date()
                };

                const resultado = await collection.replaceOne(
                    { tipo: 'geral' },
                    novasConfiguracoes,
                    { upsert: true }
                );

                return res.status(200).json({ 
                    message: 'Configurações salvas com sucesso',
                    configuracoes: novasConfiguracoes
                });

            default:
                return res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        await client.close();
    }
}