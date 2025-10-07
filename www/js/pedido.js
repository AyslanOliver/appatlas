// Arquivo para gerenciar os pedidos
import { criarPedido } from './api.js';
import { GerenciadorImpressao } from './impressora-pos58.js';

// Sistema de carrinho de compras
let carrinho = [];
let contadorItens = 0;

// Configuração dos preços e sabores
const PRECOS_PIZZAS = {
    P: 35.00,
    M: 45.00,
    G: 55.00,
    GG: 65.00
};

const SABORES_PIZZAS = {
    tradicionais: [
        { id: 'mussarela', nome: 'Mussarela', descricao: 'Queijo mussarela e orégano' },
        { id: 'calabresa', nome: 'Calabresa', descricao: 'Calabresa fatiada e cebola' },
        { id: 'portuguesa', nome: 'Portuguesa', descricao: 'Presunto, ovo, cebola e ervilha' },
        { id: 'frango', nome: 'Frango com Catupiry', descricao: 'Frango desfiado e catupiry' },
        { id: 'margherita', nome: 'Margherita', descricao: 'Mussarela, tomate e manjericão' }
    ],
    especiais: [
        { id: 'atum', nome: 'Atum Especial', descricao: 'Atum, cebola e azeitonas', adicional: 5.00 },
        { id: 'bacon', nome: 'Bacon Supreme', descricao: 'Bacon crocante, cebola e catupiry', adicional: 5.00 }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    const pedidoForm = document.getElementById('pedidoForm');
    const categoriaSelect = document.getElementById('categoria');
    const detalhesCategoria = document.getElementById('detalhesCategoria');
    
    // Event listener para mudança de categoria
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', async function() {
            const categoriaSelecionada = this.value;
            
            if (categoriaSelecionada === 'pizzas') {
                await carregarProdutosPizza();
            } else if (categoriaSelecionada) {
                await carregarProdutosCategoria(categoriaSelecionada);
            } else {
                detalhesCategoria.innerHTML = '';
            }
        });
    }
    
    if (pedidoForm) {
        pedidoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Coletar dados do formulário
            const pedido = {
                cliente: {
                    nome: document.getElementById('nomeCliente').value,
                    telefone: document.getElementById('telefoneCliente').value,
                    endereco: {
                        rua: document.getElementById('rua').value,
                        numero: document.getElementById('numero').value,
                        complemento: document.getElementById('complemento').value,
                        bairro: document.getElementById('bairro').value,
                        cidade: document.getElementById('cidade').value,
                        estado: document.getElementById('estado').value
                    }
                },
                itens: [],
                status: 'pendente',
                dataPedido: new Date().toISOString()
            };

            try {
                // Enviar pedido para a API
                const pedidoCriado = await criarPedido(pedido);

                // Tentar imprimir o pedido automaticamente
                try {
                    const gerenciador = new GerenciadorImpressao();
                    await gerenciador.imprimirPedido(pedidoCriado);
                    console.log('Pedido enviado para impressão automaticamente');
                } catch (impressaoError) {
                    console.warn('Erro na impressão automática:', impressaoError);
                    // Não bloquear o fluxo se a impressão falhar
                }

                // Mostrar mensagem de sucesso
                alert('Pedido criado com sucesso!');

                // Redirecionar para a lista de pedidos
                window.location.href = 'lista-pedidos.html';
            } catch (error) {
                console.error('Erro ao criar pedido:', error);
                alert('Erro ao criar pedido. Por favor, tente novamente.');
            }
        });
    }
});

// Função para formatar a data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
}

// ===== FUNÇÕES DO CARRINHO DE COMPRAS =====

// Função para adicionar item ao carrinho
function adicionarAoCarrinho(item) {
    contadorItens++;
    const itemCarrinho = {
        id: contadorItens,
        ...item,
        dataAdicao: new Date().toISOString()
    };
    
    carrinho.push(itemCarrinho);
    atualizarContadorCarrinho();
    atualizarVisualizacaoCarrinho();
    
    // Mostrar mensagem de sucesso
    mostrarMensagemSucesso('Item adicionado ao carrinho!');
    
    // Limpar seleção atual
    limparSelecaoAtual();
}

// Função para remover item do carrinho
function removerDoCarrinho(itemId) {
    carrinho = carrinho.filter(item => item.id !== itemId);
    atualizarContadorCarrinho();
    atualizarVisualizacaoCarrinho();
    mostrarMensagemSucesso('Item removido do carrinho!');
}

// Função para atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const contador = document.getElementById('contadorCarrinho');
    const total = calcularTotalCarrinho();
    
    if (contador) {
        contador.textContent = carrinho.length;
        contador.style.display = carrinho.length > 0 ? 'inline' : 'none';
    }
    
    // Atualizar total
    const totalElement = document.getElementById('totalCarrinho');
    if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Função para calcular total do carrinho
function calcularTotalCarrinho() {
    return carrinho.reduce((total, item) => total + item.preco, 0);
}

// Função para atualizar visualização do carrinho
function atualizarVisualizacaoCarrinho() {
    const carrinhoContainer = document.getElementById('carrinhoItens');
    if (!carrinhoContainer) return;
    
    if (carrinho.length === 0) {
        carrinhoContainer.innerHTML = '<p class="text-muted">Carrinho vazio</p>';
        return;
    }
    
    let html = '';
    carrinho.forEach(item => {
        html += `
            <div class="card mb-2" id="item-${item.id}">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${item.nome}</h6>
                            <small class="text-muted">${item.descricao}</small>
                            <div class="mt-1">
                                <strong class="text-success">R$ ${item.preco.toFixed(2)}</strong>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="removerDoCarrinho(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    carrinhoContainer.innerHTML = html;
}

// Função para limpar seleção atual
function limparSelecaoAtual() {
    // Limpar checkboxes de sabores
    document.querySelectorAll('.sabor-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Limpar seleção de tamanho
    document.querySelectorAll('input[name="tamanho"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Limpar resumo
    const resumoPedido = document.getElementById('resumoPedido');
    if (resumoPedido) {
        resumoPedido.innerHTML = '';
    }
    
    // Esconder container de tamanhos
    const tamanhoContainer = document.getElementById('tamanhoContainer');
    if (tamanhoContainer) {
        tamanhoContainer.style.display = 'none';
    }
}

// Função para mostrar mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(alerta);
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.parentNode.removeChild(alerta);
        }
    }, 3000);
}

// Função para finalizar pedido com todos os itens do carrinho
function finalizarPedidoCompleto() {
    if (carrinho.length === 0) {
        alert('Adicione pelo menos um item ao carrinho antes de finalizar o pedido.');
        return;
    }
    
    // Coletar dados do formulário
    const pedido = {
        cliente: {
            nome: document.getElementById('nomeCliente').value,
            telefone: document.getElementById('telefoneCliente').value,
            endereco: {
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value
            }
        },
        itens: carrinho.map(item => ({
            nome: item.nome,
            descricao: item.descricao,
            preco: item.preco,
            categoria: item.categoria || 'outros',
            sabores: item.sabores || [],
            tamanho: item.tamanho || null
        })),
        total: calcularTotalCarrinho(),
        status: 'pendente',
        dataPedido: new Date().toISOString()
    };
    
    // Enviar pedido
    enviarPedidoCompleto(pedido);
}

// Função para enviar pedido completo
async function enviarPedidoCompleto(pedido) {
    try {
        // Enviar pedido para a API
        const pedidoCriado = await criarPedido(pedido);

        // Tentar imprimir o pedido automaticamente
        try {
            const gerenciador = new GerenciadorImpressao();
            await gerenciador.imprimirPedido(pedidoCriado);
            console.log('Pedido enviado para impressão automaticamente');
        } catch (impressaoError) {
            console.warn('Erro na impressão automática:', impressaoError);
        }

        // Limpar carrinho
        carrinho = [];
        contadorItens = 0;
        atualizarContadorCarrinho();
        atualizarVisualizacaoCarrinho();

        // Mostrar mensagem de sucesso
        alert('Pedido criado com sucesso!');

        // Redirecionar para a lista de pedidos
        window.location.href = 'lista-pedidos.html';
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        alert('Erro ao criar pedido. Por favor, tente novamente.');
    }
}

// Função para atualizar contadores no dashboard
async function atualizarContadores() {
    try {
        const pedidos = await getPedidos();
        
        const contadores = {
            pendentes: 0,
            preparo: 0,
            entrega: 0,
            entregues: 0
        };

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        pedidos.forEach(pedido => {
            const dataPedido = new Date(pedido.dataPedido);
            
            switch(pedido.status) {
                case 'pendente':
                    contadores.pendentes++;
                    break;
                case 'preparo':
                    contadores.preparo++;
                    break;
                case 'entrega':
                    contadores.entrega++;
                    break;
                case 'entregue':
                    if (dataPedido >= hoje) {
                        contadores.entregues++;
                    }
                    break;
            }
        });

        // Atualizar elementos no DOM se existirem
        document.querySelectorAll('[data-contador]').forEach(elemento => {
            const tipo = elemento.getAttribute('data-contador');
            if (contadores[tipo] !== undefined) {
                elemento.textContent = contadores[tipo];
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar contadores:', error);
    }
}

// Função para carregar produtos de pizza com tamanhos
async function carregarProdutosPizza() {
    try {
        const response = await fetch('http://localhost:3000/api/produtos');
        const produtos = await response.json();
        
        // Verificar se produtos é um array
        if (!Array.isArray(produtos)) {
            console.error('Dados de produtos não são um array:', produtos);
            return;
        }
        
        const pizzas = produtos.filter(produto => produto.categoria === 'pizzas');
        console.log('Pizzas encontradas:', pizzas.length);
        
        if (pizzas.length > 0) {
            mostrarSelecaoPizza(pizzas);
        } else {
            console.log('Nenhuma pizza encontrada');
            const detalhesCategoria = document.getElementById('detalhesCategoria');
            detalhesCategoria.innerHTML = '<p class="text-muted">Nenhuma pizza disponível no momento.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar pizzas:', error);
        const detalhesCategoria = document.getElementById('detalhesCategoria');
        detalhesCategoria.innerHTML = '<p class="text-danger">Erro ao carregar pizzas. Tente novamente.</p>';
    }
}

// Função para carregar produtos de outras categorias
async function carregarProdutosCategoria(categoria) {
    try {
        const response = await fetch('http://localhost:3000/api/produtos');
        const todosProdutos = await response.json();
        
        // Verificar se produtos é um array
        if (!Array.isArray(todosProdutos)) {
            console.error('Dados de produtos não são um array:', todosProdutos);
            return;
        }
        
        const produtos = todosProdutos.filter(produto => produto.categoria === categoria);
        console.log(`Produtos encontrados para categoria ${categoria}:`, produtos.length);
        
        if (produtos.length > 0) {
            mostrarSelecaoProdutos(produtos);
        } else {
            const detalhesCategoria = document.getElementById('detalhesCategoria');
            detalhesCategoria.innerHTML = '<p class="text-muted">Nenhum produto disponível nesta categoria.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        const detalhesCategoria = document.getElementById('detalhesCategoria');
        detalhesCategoria.innerHTML = '<p class="text-danger">Erro ao carregar produtos. Tente novamente.</p>';
    }
}

// Função para mostrar seleção de pizza (agora vai direto para sabores)
function mostrarSelecaoPizza(pizzas) {
    // Ir direto para a seleção de sabores e tamanhos
    mostrarTamanhosPizza(pizzas);
}

// Função para mostrar tamanhos de pizza e seleção de sabores
function mostrarTamanhosPizza(pizzas) {
    const detalhesCategoria = document.getElementById('detalhesCategoria');
    
    // Primeiro, mostrar seleção de sabores
    let html = `
        <div class="mt-3">
            <h6>Escolha de 1 a 3 sabores:</h6>
            <div class="form-group" id="saboresContainer">
    `;
    
    pizzas.forEach((pizza, index) => {
        // Verificar se é pizza especial
        const pizzasEspeciais = ['Atum', 'Bacon'];
        const isEspecial = pizzasEspeciais.includes(pizza.sabor);
        const labelClass = isEspecial ? 'text-warning font-weight-bold' : '';
        const especialTag = isEspecial ? ' <span class="badge badge-warning">Especial</span>' : '';
        
        html += `
            <div class="form-check">
                <input class="form-check-input sabor-checkbox" type="checkbox" id="sabor${index}" value="${JSON.stringify(pizza).replace(/"/g, '&quot;')}" data-sabor="${pizza.sabor}">
                <label class="form-check-label ${labelClass}" for="sabor${index}">
                    ${pizza.sabor} - ${pizza.nome}${especialTag}
                </label>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="alert alert-info mt-2" id="saboresInfo">
                <small>Selecione entre 1 e 3 sabores para sua pizza.</small>
            </div>
            <div id="tamanhoContainer" style="display: none;">
                <h6 class="mt-3">Escolha o tamanho:</h6>
                <div class="form-group" id="tamanhosRadios">
                </div>
            </div>
            <div id="resumoPedido"></div>
        </div>
    `;
    
    detalhesCategoria.innerHTML = html;
    
    // Adicionar event listeners para seleção de sabores
    const saboresCheckboxes = document.querySelectorAll('.sabor-checkbox');
    saboresCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            validarSelecaoSabores();
        });
    });
}

// Função para validar seleção de sabores
function validarSelecaoSabores() {
    const saboresSelecionados = document.querySelectorAll('.sabor-checkbox:checked');
    const saboresInfo = document.getElementById('saboresInfo');
    const tamanhoContainer = document.getElementById('tamanhoContainer');
    
    if (saboresSelecionados.length === 0) {
        saboresInfo.innerHTML = '<small>Selecione entre 1 e 3 sabores para sua pizza.</small>';
        saboresInfo.className = 'alert alert-info mt-2';
        tamanhoContainer.style.display = 'none';
    } else if (saboresSelecionados.length > 3) {
        // Desmarcar o último selecionado se exceder 3
        saboresSelecionados[saboresSelecionados.length - 1].checked = false;
        saboresInfo.innerHTML = '<small><strong>Máximo de 3 sabores permitidos!</strong></small>';
        saboresInfo.className = 'alert alert-warning mt-2';
        return;
    } else {
        saboresInfo.innerHTML = `<small>${saboresSelecionados.length} sabor(es) selecionado(s). ${saboresSelecionados.length < 3 ? 'Você pode selecionar mais ' + (3 - saboresSelecionados.length) + ' sabor(es).' : 'Máximo atingido.'}</small>`;
        saboresInfo.className = 'alert alert-success mt-2';
        
        // Mostrar seleção de tamanhos
        mostrarTamanhosParaSabores(saboresSelecionados);
        tamanhoContainer.style.display = 'block';
    }
}

// Função para calcular preço baseado nos sabores selecionados
function calcularPrecoMultiSabores(saboresSelecionados, tamanhoIndex) {
    const pizzasEspeciais = ['Atum', 'Bacon'];
    let temEspecial = false;
    let precoBase = 0;
    
    // Verificar se há sabores especiais selecionados
    saboresSelecionados.forEach(checkbox => {
        const pizza = JSON.parse(checkbox.value.replace(/&quot;/g, '"'));
        if (pizzasEspeciais.includes(pizza.sabor)) {
            temEspecial = true;
        }
    });
    
    // Pegar o preço base da primeira pizza
    const primeiraPizza = JSON.parse(saboresSelecionados[0].value.replace(/&quot;/g, '"'));
    precoBase = primeiraPizza.tamanhos[tamanhoIndex].preco;
    
    // Se tem sabor especial, usar o preço da pizza especial
    if (temEspecial) {
        // Buscar uma pizza especial para pegar o preço correto
        saboresSelecionados.forEach(checkbox => {
            const pizza = JSON.parse(checkbox.value.replace(/&quot;/g, '"'));
            if (pizzasEspeciais.includes(pizza.sabor)) {
                precoBase = Math.max(precoBase, pizza.tamanhos[tamanhoIndex].preco);
            }
        });
    }
    
    return precoBase;
}

// Função para mostrar tamanhos baseado nos sabores selecionados
function mostrarTamanhosParaSabores(saboresSelecionados) {
    const tamanhosRadios = document.getElementById('tamanhosRadios');
    
    // Pegar os tamanhos da primeira pizza (assumindo que todas têm os mesmos tamanhos)
    const primeiraPizza = JSON.parse(saboresSelecionados[0].value.replace(/&quot;/g, '"'));
    
    let html = '';
    primeiraPizza.tamanhos.forEach((tamanho, index) => {
        // Calcular preço baseado nos sabores selecionados
        const precoCalculado = calcularPrecoMultiSabores(saboresSelecionados, index);
        
        html += `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="tamanho" id="tamanho${index}" value="${index}" data-preco="${precoCalculado}">
                <label class="form-check-label" for="tamanho${index}">
                    ${tamanho.nome} - R$ ${precoCalculado.toFixed(2)} (${tamanho.descricao})
                </label>
            </div>
        `;
    });
    
    tamanhosRadios.innerHTML = html;
    
    // Adicionar event listener para seleção de tamanho
    document.querySelectorAll('input[name="tamanho"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const tamanhoIndex = parseInt(this.value);
                const precoCalculado = parseFloat(this.dataset.preco);
                const primeiraPizza = JSON.parse(saboresSelecionados[0].value.replace(/&quot;/g, '"'));
                const tamanhoInfo = primeiraPizza.tamanhos[tamanhoIndex];
                
                // Criar objeto tamanho com preço calculado
                const tamanhoComPreco = {
                    ...tamanhoInfo,
                    preco: precoCalculado
                };
                
                const saboresSelecionados = document.querySelectorAll('.sabor-checkbox:checked');
                mostrarResumoPedidoPizza(saboresSelecionados, tamanhoComPreco);
            }
        });
    });
}

// Função para mostrar resumo do pedido com múltiplos sabores
function mostrarResumoPedidoPizza(saboresSelecionados, tamanho) {
    const resumoPedido = document.getElementById('resumoPedido');
    
    const sabores = Array.from(saboresSelecionados).map(checkbox => {
        const pizza = JSON.parse(checkbox.value.replace(/&quot;/g, '"'));
        return pizza.sabor;
    });
    
    // Verificar se há sabores especiais
    const pizzasEspeciais = ['Atum', 'Bacon'];
    const saboresEspeciais = sabores.filter(sabor => pizzasEspeciais.includes(sabor));
    const saboresNormais = sabores.filter(sabor => !pizzasEspeciais.includes(sabor));
    
    let detalhesPreco = '';
    if (saboresEspeciais.length > 0) {
        detalhesPreco = `
            <div class="alert alert-info mt-2">
                <small>
                    <strong>Preço especial aplicado!</strong><br>
                    ${saboresEspeciais.length > 0 ? `Sabores especiais: ${saboresEspeciais.join(', ')}` : ''}
                    ${saboresNormais.length > 0 ? `<br>Sabores normais: ${saboresNormais.join(', ')}` : ''}
                </small>
            </div>
        `;
    }
    
    // Criar objeto do item para o carrinho
    const itemPizza = {
        nome: `Pizza ${sabores.length === 1 ? sabores[0] : 'Mista'}`,
        descricao: `${sabores.join(', ')} - ${tamanho.nome} (${tamanho.descricao})`,
        preco: tamanho.preco,
        categoria: 'pizza',
        sabores: sabores,
        tamanho: tamanho.nome,
        tamanhoDetalhes: tamanho
    };
    
    const html = `
        <div class="card bg-light mt-3">
            <div class="card-body">
                <h6 class="card-title">Resumo do Item</h6>
                <p><strong>Pizza:</strong> ${sabores.length === 1 ? sabores[0] : sabores.join(', ')}</p>
                <p><strong>Sabores:</strong> ${sabores.length} sabor(es)</p>
                <p><strong>Tamanho:</strong> ${tamanho.nome}</p>
                <p><strong>Preço:</strong> R$ ${tamanho.preco.toFixed(2)}</p>
                <p><strong>Descrição:</strong> ${tamanho.descricao}</p>
                ${detalhesPreco}
                <div class="mt-3">
                    <button class="btn btn-primary btn-block" onclick="adicionarAoCarrinho(${JSON.stringify(itemPizza).replace(/"/g, '&quot;')})">
                        <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `;
    
    resumoPedido.innerHTML = html;
}

// Função para mostrar resumo do pedido (mantida para compatibilidade)
function mostrarResumoPedido(pizza, tamanho) {
    const resumoPedido = document.getElementById('resumoPedido');
    const detalhesItem = document.getElementById('detalhesItem');
    
    const html = `
        <p><strong>Pizza:</strong> ${pizza.nome}</p>
        <p><strong>Tamanho:</strong> ${tamanho.nome} (${tamanho.descricao})</p>
        <p><strong>Preço:</strong> R$ ${tamanho.preco.toFixed(2)}</p>
        <p><strong>Descrição:</strong> ${pizza.descricao}</p>
    `;
    
    detalhesItem.innerHTML = html;
    resumoPedido.style.display = 'block';
}

// Função para mostrar seleção de produtos de outras categorias
function mostrarSelecaoProdutos(produtos) {
    const detalhesCategoria = document.getElementById('detalhesCategoria');
    
    let html = `
        <div class="form-group">
            <label for="produtoSelecionado">Escolha o Produto</label>
            <select class="form-control" id="produtoSelecionado" required>
                <option value="">Selecione um produto</option>
                ${produtos.map(produto => `
                    <option value="${produto._id}" data-produto='${JSON.stringify(produto)}'>
                        ${produto.nome} - R$ ${produto.preco.toFixed(2)}
                    </option>
                `).join('')}
            </select>
        </div>
        <div id="resumoProduto" style="display: none;">
            <div class="card bg-light">
                <div class="card-body">
                    <h6 class="card-title">Detalhes do Produto</h6>
                    <div id="detalhesProduto"></div>
                </div>
            </div>
        </div>
    `;
    
    detalhesCategoria.innerHTML = html;
    
    // Event listener para seleção de produto
    document.getElementById('produtoSelecionado').addEventListener('change', function() {
        const produtoData = this.options[this.selectedIndex].getAttribute('data-produto');
        if (produtoData) {
            const produto = JSON.parse(produtoData);
            mostrarResumoProduto(produto);
        } else {
            document.getElementById('resumoProduto').style.display = 'none';
        }
    });
}

// Função para mostrar resumo do produto
function mostrarResumoProduto(produto) {
    const resumoProduto = document.getElementById('resumoProduto');
    const detalhesProduto = document.getElementById('detalhesProduto');
    
    // Criar objeto do item para o carrinho
    const itemProduto = {
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        categoria: produto.categoria || 'outros',
        tempoPreparacao: produto.tempoPreparacao
    };
    
    const html = `
        <p><strong>Produto:</strong> ${produto.nome}</p>
        <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
        <p><strong>Descrição:</strong> ${produto.descricao}</p>
        ${produto.tempoPreparacao ? `<p><strong>Tempo de Preparo:</strong> ${produto.tempoPreparacao} minutos</p>` : ''}
        <div class="mt-3">
            <button class="btn btn-primary btn-block" onclick="adicionarAoCarrinho(${JSON.stringify(itemProduto).replace(/"/g, '&quot;')})">
                <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
            </button>
        </div>
    `;
    
    detalhesProduto.innerHTML = html;
    resumoProduto.style.display = 'block';
}