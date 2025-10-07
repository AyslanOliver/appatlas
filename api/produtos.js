import { MongoClient } from 'mongodb';

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
        const collection = db.collection('produtos');

        switch (req.method) {
            case 'GET':
                const produtos = await collection.find({}).toArray();
                return res.status(200).json(produtos);

            case 'POST':
                const { tipo, ...dados } = req.body;
                const novoProduto = {
                    tipo,
                    ...dados,
                    criadoEm: new Date(),
                    atualizadoEm: new Date()
                };
                const resultado = await collection.insertOne(novoProduto);
                return res.status(201).json({ 
                    id: resultado.insertedId, 
                    ...novoProduto 
                });

            case 'PUT':
                const { id } = req.query;
                const dadosAtualizacao = {
                    ...req.body,
                    atualizadoEm: new Date()
                };
                await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: dadosAtualizacao }
                );
                return res.status(200).json({ message: 'Produto atualizado com sucesso' });

            case 'DELETE':
                const { id: idDelete } = req.query;
                await collection.deleteOne({ _id: new ObjectId(idDelete) });
                return res.status(200).json({ message: 'Produto deletado com sucesso' });

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