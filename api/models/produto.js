import mongoose from 'mongoose';

const ProdutoSchema = new mongoose.Schema({
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
}, {
    timestamps: true
});

const Produto = mongoose.models.Produto || mongoose.model('Produto', ProdutoSchema);

export async function getAllProdutos() {
    return await Produto.find({});
}

export async function getProdutoById(id) {
    return await Produto.findById(id);
}

export async function createProduto(produto) {
    const novoProduto = new Produto(produto);
    return await novoProduto.save();
}

export async function updateProduto(id, produto) {
    return await Produto.findByIdAndUpdate(id, produto, { new: true });
}

export async function deleteProduto(id) {
    return await Produto.findByIdAndDelete(id);
}