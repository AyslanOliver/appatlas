import mongoose from 'mongoose';

const PedidoSchema = new mongoose.Schema({
    cliente: {
        nome: { type: String, required: true },
        telefone: { type: String, required: true },
        endereco: {
            rua: { type: String, required: true },
            numero: { type: String, required: true },
            complemento: String,
            bairro: { type: String, required: true },
            cidade: { type: String, required: true },
            estado: { type: String, required: true }
        }
    },
    itens: [{
        tipo: { type: String, required: true, enum: ['pizza', 'lanche', 'salgado', 'bebida'] },
        tamanho: String,
        sabores: [String],
        nome: String,
        ingredientes: [String],
        quantidade: Number,
        gelada: Boolean,
        observacoes: String
    }],
    status: {
        type: String,
        required: true,
        enum: ['pendente', 'preparo', 'entrega', 'entregue'],
        default: 'pendente'
    },
    dataPedido: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema);