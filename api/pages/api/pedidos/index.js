import { connectToDatabase } from '../../../lib/mongodb';
import Pedido from '../../../models/Pedido';

export default async function handler(req, res) {
    try {
        await connectToDatabase();

        switch (req.method) {
            case 'GET':
                const pedidos = await Pedido.find().sort({ dataPedido: -1 });
                res.status(200).json(pedidos);
                break;

            case 'POST':
                const novoPedido = await Pedido.create(req.body);
                res.status(201).json(novoPedido);
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