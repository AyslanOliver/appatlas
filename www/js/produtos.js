// Importar funções da API
import { getProdutos, criarProduto, atualizarProduto, deletarProduto } from './api.js';

// Armazenamento local dos dados
let produtos = [];
let tamanhos = [];
let sabores = [];
let categoriaAtual = 'pizza';

// Carregar dados ao iniciar a página
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await carregarDados();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados. Por favor, recarregue a página.');
    }
});

// Exportar funções para o escopo global
window.mostrarCategoria = function(categoria) {
    categoriaAtual = categoria;
    filtrarProdutosPorCategoria(categoria);
    document.querySelectorAll('.collapse-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[onclick="mostrarCategoria('${categoria}')"]`).classList.add('active');
};

// Função para carregar dados da API
async function carregarDados() {
    produtos = await getProdutos();
    filtrarProdutosPorCategoria(categoriaAtual);
}

// Função para filtrar produtos por categoria
window.mostrarCategoria = function(categoria) {
    categoriaAtual = categoria;
    filtrarProdutosPorCategoria(categoria);
    document.querySelectorAll('.collapse-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[onclick="mostrarCategoria('${categoria}')"]`).classList.add('active');
}

function filtrarProdutosPorCategoria(categoria) {
    const produtosFiltrados = produtos.filter(p => p.categoria === categoria);
    
    // Atualizar o conteúdo da página com base na categoria
    const containerProdutos = document.querySelector('.container-fluid');
    
    if (categoria === 'pizza') {
        tamanhos = produtos.filter(p => p.tipo === 'tamanho') || [];
        sabores = produtos.filter(p => p.tipo === 'sabor') || [];
        
        // Mostrar tabelas de tamanhos e sabores
        document.getElementById('tabelaTamanhos').closest('.card').style.display = 'block';
        document.getElementById('tabelaSabores').closest('.card').style.display = 'block';
        
        atualizarTabelaTamanhos();
        atualizarTabelaSabores();
    } else {
        // Esconder tabelas de tamanhos e sabores
        document.getElementById('tabelaTamanhos').closest('.card').style.display = 'none';
        document.getElementById('tabelaSabores').closest('.card').style.display = 'none';
        
        // Criar visualização para outros tipos de produtos
        const html = `
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                    <h6 class="m-0 font-weight-bold text-primary">${categoria.charAt(0).toUpperCase() + categoria.slice(1)}s</h6>
                    <button class="btn btn-primary btn-sm" onclick="abrirModalProduto('${categoria}')">
                        <i class="fas fa-plus"></i> Novo ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table" id="tabela${categoria.charAt(0).toUpperCase() + categoria.slice(1)}s">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th>Preço (R$)</th>
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
                                            <button class="btn btn-sm btn-info" onclick="editarProduto('${categoria}', '${produto._id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="excluirProduto('${categoria}', '${produto._id}')">
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
        
        // Atualizar o conteúdo
        containerProdutos.innerHTML = html;
    }
}

// Funções para Tamanhos
function atualizarTabelaTamanhos() {
    const tbody = document.querySelector('#tabelaTamanhos tbody');
    tbody.innerHTML = '';

    tamanhos.forEach(tamanho => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tamanho.nome}</td>
            <td>${tamanho.descricao}</td>
            <td>R$ ${tamanho.preco.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editarTamanho('${tamanho._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="excluirTamanho('${tamanho._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.abrirModalTamanho = function(id = null) {
    const modal = $('#modalTamanho');
    const form = document.getElementById('formTamanho');
    
    if (id) {
        const tamanho = tamanhos.find(t => t._id === id);
        if (tamanho) {
            document.getElementById('tamanhoId').value = tamanho._id;
            document.getElementById('tamanhoNome').value = tamanho.nome;
            document.getElementById('tamanhoDescricao').value = tamanho.descricao;
            document.getElementById('tamanhoPreco').value = tamanho.preco;
            document.getElementById('modalTamanhoTitulo').textContent = 'Editar Tamanho de Pizza';
        }
    } else {
        form.reset();
        document.getElementById('tamanhoId').value = '';
        document.getElementById('modalTamanhoTitulo').textContent = 'Novo Tamanho de Pizza';
    }
    
    modal.modal('show');
};

window.editarTamanho = function(id) {
    abrirModalTamanho(id);
};

window.excluirTamanho = async function(id) {
    if (confirm('Tem certeza que deseja excluir este tamanho?')) {
        try {
            await deletarProduto('tamanho', id);
            await carregarDados();
            alert('Tamanho excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir tamanho:', error);
            alert('Erro ao excluir tamanho. Por favor, tente novamente.');
        }
    }
};

// Funções para Sabores
function atualizarTabelaSabores() {
    const tbody = document.querySelector('#tabelaSabores tbody');
    tbody.innerHTML = '';

    sabores.forEach(sabor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sabor.nome}</td>
            <td>${sabor.categoria === 'tradicional' ? 'Tradicional' : 'Especial'}</td>
            <td>${sabor.descricao}</td>
            <td>${sabor.adicional ? 'R$ ' + sabor.adicional.toFixed(2) : '-'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editarSabor('${sabor._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="excluirSabor('${sabor._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.abrirModalSabor = function(id = null) {
    const modal = $('#modalSabor');
    const form = document.getElementById('formSabor');
    
    if (id) {
        const sabor = sabores.find(s => s._id === id);
        if (sabor) {
            document.getElementById('saborId').value = sabor._id;
            document.getElementById('saborNome').value = sabor.nome;
            document.getElementById('saborCategoria').value = sabor.categoria;
            document.getElementById('saborDescricao').value = sabor.descricao;
            document.getElementById('saborAdicional').value = sabor.adicional || 0;
            document.getElementById('modalSaborTitulo').textContent = 'Editar Sabor de Pizza';
        }
    } else {
        form.reset();
        document.getElementById('saborId').value = '';
        document.getElementById('modalSaborTitulo').textContent = 'Novo Sabor de Pizza';
    }
    
    modal.modal('show');
};

window.editarSabor = function(id) {
    abrirModalSabor(id);
};

window.excluirSabor = async function(id) {
    if (confirm('Tem certeza que deseja excluir este sabor?')) {
        try {
            await deletarProduto('sabor', id);
            await carregarDados();
            alert('Sabor excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir sabor:', error);
            alert('Erro ao excluir sabor. Por favor, tente novamente.');
        }
    }
};

// Event Listeners para os formulários
document.getElementById('formTamanho').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const tamanho = {
        nome: document.getElementById('tamanhoNome').value,
        descricao: document.getElementById('tamanhoDescricao').value,
        preco: parseFloat(document.getElementById('tamanhoPreco').value)
    };

    const id = document.getElementById('tamanhoId').value;

    try {
        if (id) {
            await atualizarProduto('tamanho', id, tamanho);
        } else {
            await criarProduto('tamanho', tamanho);
        }
        
        await carregarDados();
        $('#modalTamanho').modal('hide');
        alert('Tamanho salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar tamanho:', error);
        alert('Erro ao salvar tamanho. Por favor, tente novamente.');
    }
});

document.getElementById('formSabor').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const sabor = {
        nome: document.getElementById('saborNome').value,
        categoria: document.getElementById('saborCategoria').value,
        descricao: document.getElementById('saborDescricao').value,
        adicional: parseFloat(document.getElementById('saborAdicional').value || 0)
    };

    const id = document.getElementById('saborId').value;

    try {
        if (id) {
            await atualizarProduto('sabor', id, sabor);
        } else {
            await criarProduto('sabor', sabor);
        }
        
        await carregarDados();
        $('#modalSabor').modal('hide');
        alert('Sabor salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar sabor:', error);
        alert('Erro ao salvar sabor. Por favor, tente novamente.');
    }
});