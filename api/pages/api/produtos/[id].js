import { connectToDatabase } from '../../../lib/mongodb';
import Produto from '../../../models/Produto';

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        await connectToDatabase();

        switch (req.method) {
            case 'PUT':
                const produtoAtualizado = await Produto.findByIdAndUpdate(id, req.body, {
                    new: true,
                    runValidators: true
                });
                if (!produtoAtualizado) {
                    return res.status(404).json({ error: 'Produto não encontrado' });
                }
                res.status(200).json(produtoAtualizado);
                break;

            case 'DELETE':
                const produtoDeletado = await Produto.findByIdAndDelete(id);
                if (!produtoDeletado) {
                    return res.status(404).json({ error: 'Produto não encontrado' });
                }
                res.status(200).json({ message: 'Produto deletado com sucesso' });
                break;

            default:
                res.setHeader('Allow', ['PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a requisição' });
    }
}