import mongoose from 'mongoose';

const ItemCardapioSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        enum: ['pizza', 'lanche', 'salgado', 'bebida']
    },
    nome: {
        type: String,
        required: true
    },
    descricao: String,
    preco: {
        type: Number,
        required: true
    },
    disponivel: {
        type: Boolean,
        default: true
    },
    categoria: String,
    opcoes: {
        tamanhos: [String],
        sabores: [String],
        ingredientes: [String]
    }
});

export default mongoose.models.ItemCardapio || mongoose.model('ItemCardapio', ItemCardapioSchema);