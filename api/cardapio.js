import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        await client.connect();
        const db = client.db('pizzaria');
        const collection = db.collection('produtos');

        const { tipo } = req.query;
        
        let filtro = {};
        if (tipo) {
            filtro.tipo = tipo;
        }

        const cardapio = await collection.find(filtro).toArray();
        
        // Organizar por tipo para melhor apresentação
        const cardapioOrganizado = cardapio.reduce((acc, item) => {
            if (!acc[item.tipo]) {
                acc[item.tipo] = [];
            }
            acc[item.tipo].push(item);
            return acc;
        }, {});

        return res.status(200).json(cardapioOrganizado);
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        await client.close();
    }
}