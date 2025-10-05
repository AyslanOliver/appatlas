import { connectToDatabase } from '../../../lib/mongodb';
import ItemCardapio from '../../../models/ItemCardapio';

export default async function handler(req, res) {
    try {
        await connectToDatabase();

        switch (req.method) {
            case 'GET':
                const { tipo } = req.query;
                const query = tipo ? { tipo } : {};
                const itens = await ItemCardapio.find(query);
                res.status(200).json(itens);
                break;

            case 'POST':
                const novoItem = await ItemCardapio.create(req.body);
                res.status(201).json(novoItem);
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a requisição' });
    }
}