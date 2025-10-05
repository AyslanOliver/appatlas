import { connectToDatabase } from '../../../lib/mongodb';
import Pedido from '../../../models/Pedido';

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        await connectToDatabase();

        switch (req.method) {
            case 'GET':
                const pedido = await Pedido.findById(id);
                if (!pedido) {
                    return res.status(404).json({ error: 'Pedido não encontrado' });
                }
                res.status(200).json(pedido);
                break;

            case 'PUT':
                const pedidoAtualizado = await Pedido.findByIdAndUpdate(id, req.body, {
                    new: true,
                    runValidators: true
                });
                if (!pedidoAtualizado) {
                    return res.status(404).json({ error: 'Pedido não encontrado' });
                }
                res.status(200).json(pedidoAtualizado);
                break;

            case 'DELETE':
                const pedidoDeletado = await Pedido.findByIdAndDelete(id);
                if (!pedidoDeletado) {
                    return res.status(404).json({ error: 'Pedido não encontrado' });
                }
                res.status(200).json({ message: 'Pedido deletado com sucesso' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a requisição' });
    }
}