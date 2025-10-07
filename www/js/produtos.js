// Produtos.js - Versão atualizada em 2024
// Importar funções da API
import { getProdutos, criarProduto, atualizarProduto, deletarProduto } from './api.js';

// Variáveis globais
let produtos = [];
let categoriaAtual = 'pasteis';

// Mapeamento de categorias para nomes amigáveis
const nomesCategorias = {
    'pasteis': 'Pastéis',
    'salgados': 'Salgados',
    'bolo': 'Bolos',
    'bebidas': 'Bebidas',
    'pizzas': 'Pizzas',
    'lanches_na_chapa': 'Lanches na Chapa'
};

// Aguardar o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
    inicializar();
});

// Função de inicialização
async function inicializar() {
    try {
        console.log('Iniciando aplicação...');
        
        // Carregar dados
        await carregarDados();
        console.log('Dados carregados:', produtos.length, 'produtos');
        
        // Mostrar categoria inicial
        exibirProdutosPorCategoria('pasteis');
        
        // Configurar event listeners
        configurarEventListeners();
        
        console.log('Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        mostrarAlerta('Erro ao carregar a página. Tente recarregar.', 'danger');
    }
}

// Configurar event listeners
function configurarEventListeners() {
    const form = document.getElementById('formProduto');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarProduto();
        });
        console.log('Event listener do formulário configurado');
    } else {
        console.warn('Formulário não encontrado');
    }
}

// Carregar dados da API
async function carregarDados() {
    try {
        produtos = await getProdutos();
        console.log('Produtos carregados da API:', produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        produtos = [];
        throw error;
    }
}

// Função global para mostrar produtos por categoria
window.exibirProdutosPorCategoria = function(categoria) {
    console.log('Exibindo categoria:', categoria);
    categoriaAtual = categoria;
    
    // Atualizar botões ativos
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Marcar botão ativo
    const botaoAtivo = document.querySelector(`[onclick*="${categoria}"]`);
    if (botaoAtivo) {
        botaoAtivo.classList.add('active');
    }
    
    // Filtrar e renderizar produtos
    const produtosFiltrados = produtos.filter(p => p.categoria === categoria);
    renderizarProdutos(produtosFiltrados);
};

// Renderizar produtos na tela
function renderizarProdutos(produtosFiltrados) {
    const container = document.getElementById('containerProdutos');
    if (!container) {
        console.error('Container de produtos não encontrado');
        return;
    }
    
    if (produtosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                Nenhum produto encontrado para esta categoria.
            </div>
        `;
        return;
    }
    
    const html = `
        <div class="card shadow mb-4">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 class="m-0 font-weight-bold text-primary">
                    ${nomesCategorias[categoriaAtual] || categoriaAtual}
                </h6>
                <button class="btn btn-primary btn-sm" onclick="abrirModalNovoProduto()">
                    <i class="fas fa-plus"></i> Adicionar Produto
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Preço</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${produtosFiltrados.map(produto => `
                                <tr>
                                    <td>${produto.nome}</td>
                                    <td>${produto.descricao || '-'}</td>
                                    <td>R$ ${produto.preco.toFixed(2)}</td>
                                    <td>
                                        <span class="badge badge-${(produto.ativo || produto.disponivel) ? 'success' : 'secondary'}">
                                            ${(produto.ativo || produto.disponivel) ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="editarProduto('${produto._id}')" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger ml-1" onclick="excluirProduto('${produto._id}')" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Função global para abrir modal de novo produto
window.abrirModalNovoProduto = function() {
    console.log('Abrindo modal para novo produto');
    
    // Limpar formulário
    const form = document.getElementById('formProduto');
    if (form) {
        form.reset();
    }
    
    // Configurar campos
    document.getElementById('produtoId').value = '';
    document.getElementById('produtoCategoria').value = categoriaAtual;
    
    // Configurar título
    const titulo = document.getElementById('modalProdutoTitulo');
    if (titulo) {
        titulo.textContent = 'Adicionar Novo Produto';
    }
    
    // Abrir modal
    $('#modalProduto').modal('show');
};

// Função global para editar produto
window.editarProduto = function(id) {
    console.log('Editando produto:', id);
    
    const produto = produtos.find(p => p._id === id);
    if (!produto) {
        mostrarAlerta('Produto não encontrado!', 'danger');
        return;
    }
    
    // Preencher formulário
    document.getElementById('produtoId').value = produto._id;
    document.getElementById('produtoCategoria').value = produto.categoria;
    document.getElementById('produtoNome').value = produto.nome;
    document.getElementById('produtoDescricao').value = produto.descricao || '';
    document.getElementById('produtoPreco').value = produto.preco;
    document.getElementById('produtoAtivo').checked = produto.ativo;
    
    // Configurar título
    const titulo = document.getElementById('modalProdutoTitulo');
    if (titulo) {
        titulo.textContent = 'Editar Produto';
    }
    
    // Abrir modal
    $('#modalProduto').modal('show');
};

// Função global para excluir produto
window.excluirProduto = async function(id) {
    console.log('Excluindo produto:', id);
    
    const produto = produtos.find(p => p._id === id);
    if (!produto) {
        mostrarAlerta('Produto não encontrado!', 'danger');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) {
        return;
    }
    
    try {
        await deletarProduto(produto.categoria, id);
        mostrarAlerta('Produto excluído com sucesso!', 'success');
        
        // Recarregar dados
        await carregarDados();
        exibirProdutosPorCategoria(categoriaAtual);
        
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        mostrarAlerta('Erro ao excluir produto. Tente novamente.', 'danger');
    }
};

// Salvar produto (criar ou editar)
async function salvarProduto() {
    console.log('Salvando produto...');
    
    const form = document.getElementById('formProduto');
    const formData = new FormData(form);
    
    const produto = {
        nome: formData.get('produtoNome'),
        descricao: formData.get('produtoDescricao'),
        preco: parseFloat(formData.get('produtoPreco')),
        ativo: formData.get('produtoAtivo') === 'on'
    };
    
    const produtoId = formData.get('produtoId');
    const categoria = formData.get('produtoCategoria');
    
    try {
        if (produtoId) {
            // Editar
            await atualizarProduto(categoria, produtoId, produto);
            mostrarAlerta('Produto atualizado com sucesso!', 'success');
        } else {
            // Criar
            produto.categoria = categoria;
            await criarProduto(categoria, produto);
            mostrarAlerta('Produto criado com sucesso!', 'success');
        }
        
        // Fechar modal e recarregar
        $('#modalProduto').modal('hide');
        await carregarDados();
        exibirProdutosPorCategoria(categoriaAtual);
        
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        mostrarAlerta('Erro ao salvar produto. Tente novamente.', 'danger');
    }
}

// Mostrar alertas
function mostrarAlerta(mensagem, tipo) {
    // Remover alertas existentes
    document.querySelectorAll('.alert').forEach(alert => {
        if (alert.parentNode) {
            alert.remove();
        }
    });
    
    // Criar novo alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    // Inserir no container
    const container = document.querySelector('.container-fluid');
    if (container && container.firstChild) {
        container.insertBefore(alerta, container.firstChild);
    }
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.remove();
        }
    }, 5000);
}