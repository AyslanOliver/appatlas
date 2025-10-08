// Arquivo para gerenciar os pedidos
import { criarPedido } from './api.js';
import { GerenciadorImpressao } from './impressora-pos58.js';

// Adicionar CSS para animações e responsividade
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @media (max-width: 768px) {
        .sabores-grid {
            flex-direction: column !important;
            align-items: center !important;
        }
        
        .sabor-option {
            min-width: 280px !important;
            max-width: 320px !important;
        }
    }
    
    @media (max-width: 576px) {
        .sabor-option {
            min-width: 250px !important;
            max-width: 280px !important;
            padding: 15px !important;
        }
        
        .confirmation-badge {
            padding: 12px 20px !important;
            font-size: 0.9rem !important;
        }
    }
`;
document.head.appendChild(style);

// Sistema de carrinho de compras
let carrinho = [];
let contadorItens = 0;

// Nova estrutura de dados para categorias, tamanhos e sabores
const CATEGORIAS = {
    pizzas: {
        nome: 'Pizzas',
        descricao: 'Pizzas tradicionais e especiais',
        temTamanhos: true,
        temSabores: true
    },
    pasteis: {
        nome: 'Pastéis',
        descricao: 'Pastéis variados',
        temTamanhos: false,
        temSabores: false
    },
    salgados: {
        nome: 'Salgados',
        descricao: 'Salgados assados e fritos',
        temTamanhos: false,
        temSabores: false
    },
    bolo: {
        nome: 'Bolos',
        descricao: 'Bolos e doces',
        temTamanhos: false,
        temSabores: false
    },
    bebidas: {
        nome: 'Bebidas',
        descricao: 'Refrigerantes, sucos e águas',
        temTamanhos: false,
        temSabores: false
    },
    lanches_na_chapa: {
        nome: 'Lanches na Chapa',
        descricao: 'Lanches grelhados',
        temTamanhos: false,
        temSabores: false
    }
};

const TAMANHOS_PIZZA = [
    { id: 'P', nome: 'Pequena', descricao: '4 fatias', preco: 35.00 },
    { id: 'M', nome: 'Média', descricao: '6 fatias', preco: 45.00 },
    { id: 'G', nome: 'Grande', descricao: '8 fatias', preco: 55.00 },
    { id: 'GG', nome: 'Gigante', descricao: '12 fatias', preco: 65.00 }
];

const SABORES_PIZZAS = {
    tradicionais: [
        { id: 'mussarela', nome: 'Mussarela', descricao: 'Queijo mussarela e orégano', preco: 0 },
        { id: 'calabresa', nome: 'Calabresa', descricao: 'Calabresa fatiada e cebola', preco: 0 },
        { id: 'portuguesa', nome: 'Portuguesa', descricao: 'Presunto, ovo, cebola e ervilha', preco: 0 },
        { id: 'frango', nome: 'Frango com Catupiry', descricao: 'Frango desfiado e catupiry', preco: 0 },
        { id: 'margherita', nome: 'Margherita', descricao: 'Mussarela, tomate e manjericão', preco: 0 }
    ],
    especiais: [
        { id: 'atum', nome: 'ATUM', descricao: 'Atum, cebola e azeitonas', preco: 5.00 },
        { id: 'bacon', nome: 'BACON', descricao: 'Bacon crocante, cebola e catupiry', preco: 5.00 }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    const pedidoForm = document.getElementById('pedidoForm');
    const categoriaSelect = document.getElementById('categoria');
    const detalhesCategoria = document.getElementById('detalhesCategoria');
    
    // Event listener para mudança de categoria
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', function() {
            const categoriaSelecionada = this.value;
            
            if (categoriaSelecionada === 'pizzas') {
                mostrarSelecaoTamanhosPizza();
            } else if (categoriaSelecionada) {
                carregarProdutosCategoria(categoriaSelecionada);
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

// Função para mostrar seleção de tamanhos de pizza (primeiro passo)
function mostrarSelecaoTamanhosPizza() {
    const detalhesCategoria = document.getElementById('detalhesCategoria');
    
    let html = `
        <div class="mt-4">
            <div class="text-center mb-5">
                <h3 class="text-primary mb-3">
                    <i class="fas fa-pizza-slice"></i> Escolha o Tamanho da Pizza
                </h3>
                <p class="text-muted lead">Selecione o tamanho ideal para você</p>
            </div>
            
            <div class="tamanhos-container" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-bottom: 30px;">
    `;
    
    TAMANHOS_PIZZA.forEach((tamanho, index) => {
        const iconSize = ['fa-2x', 'fa-3x', 'fa-4x', 'fa-5x'][index] || 'fa-3x';
        html += `
            <div class="tamanho-option" style="
                background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
                border: 2px solid #e9ecef;
                border-radius: 20px;
                padding: 30px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.4s ease;
                min-width: 200px;
                max-width: 250px;
                flex: 1;
                position: relative;
                overflow: hidden;
            " onclick="selecionarTamanho('${tamanho.id}')" data-tamanho="${tamanho.id}">
                
                <div class="tamanho-icon mb-3" style="color: #007bff; transition: all 0.3s ease;">
                    <i class="fas fa-pizza-slice ${iconSize}"></i>
                </div>
                
                <h4 class="tamanho-nome mb-2" style="color: #495057; font-weight: 600;">
                    ${tamanho.nome}
                </h4>
                
                <p class="tamanho-desc mb-3" style="color: #6c757d; font-size: 0.9rem; line-height: 1.4;">
                    ${tamanho.descricao}
                </p>
                
                <div class="tamanho-preco" style="
                    background: linear-gradient(45deg, #28a745, #20c997);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin: 0 auto;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                ">
                    R$ ${tamanho.preco.toFixed(2)}
                </div>
                
                <div class="selection-indicator" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #28a745;
                    color: white;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                ">
                    <i class="fas fa-check"></i>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="text-center">
                <div class="alert alert-info d-inline-block" style="border-radius: 15px; border: none; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);">
                    <i class="fas fa-info-circle"></i> Clique no tamanho desejado para continuar
                </div>
            </div>
            
            <div id="saboresContainer" style="display: none;">
                <!-- Sabores serão carregados aqui -->
            </div>
            <div id="resumoPedido" style="display: none;"></div>
        </div>
    `;
    
    detalhesCategoria.innerHTML = html;
    
    // Adicionar efeitos interativos mais suaves
    document.querySelectorAll('.tamanho-option').forEach(option => {
        option.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 15px 35px rgba(0,123,255,0.15)';
            this.style.borderColor = '#007bff';
            this.querySelector('.tamanho-icon').style.transform = 'scale(1.1)';
            this.querySelector('.tamanho-preco').style.transform = 'scale(1.05)';
        });
        
        option.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                this.style.borderColor = '#e9ecef';
                this.querySelector('.tamanho-icon').style.transform = 'scale(1)';
                this.querySelector('.tamanho-preco').style.transform = 'scale(1)';
            }
        });
        
    });
}

// Função para selecionar tamanho
function selecionarTamanho(tamanhoId) {
    // Remover seleção anterior
    document.querySelectorAll('.tamanho-option').forEach(opt => {
        opt.classList.remove('selected');
        opt.style.borderColor = '#e9ecef';
        opt.style.background = 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)';
        opt.querySelector('.selection-indicator').style.display = 'none';
    });
    
    // Marcar como selecionado
    const selectedOption = document.querySelector(`[data-tamanho="${tamanhoId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        selectedOption.style.borderColor = '#28a745';
        selectedOption.style.background = 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)';
        selectedOption.querySelector('.selection-indicator').style.display = 'flex';
        
        // Animação de confirmação
        selectedOption.style.transform = 'scale(1.05)';
        setTimeout(() => {
            selectedOption.style.transform = 'translateY(-8px) scale(1.02)';
        }, 200);
    }
    
    // Mostrar seleção de sabores
    mostrarSelecaoSabores(tamanhoId);
}

// Função para mostrar seleção de sabores (segundo passo)
function mostrarSelecaoSabores(tamanhoSelecionado) {
    const saboresContainer = document.getElementById('saboresContainer');
    const tamanhoInfo = TAMANHOS_PIZZA.find(t => t.id === tamanhoSelecionado);
    
    let html = `
        <div class="mt-4">
            <div class="text-center mb-4">
                <div class="alert alert-primary">
                    <h5 class="mb-1">
                        <i class="fas fa-check-circle"></i> Pizza ${tamanhoInfo.nome} Selecionada
                    </h5>
                    <p class="mb-0">${tamanhoInfo.descricao} - <strong>R$ ${tamanhoInfo.preco.toFixed(2)}</strong></p>
                </div>
                <h5 class="text-secondary">
                    <i class="fas fa-utensils"></i> Agora escolha os sabores (1 a 3)
                </h5>
            </div>
            
            <!-- Sabores Tradicionais -->
            <div class="card mb-3">
                <div class="card-header bg-light">
                    <h6 class="mb-0 text-secondary">
                        <i class="fas fa-pizza-slice"></i> Sabores Tradicionais
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
    `;
    
    // Sabores tradicionais
    SABORES_PIZZAS.tradicionais.forEach((sabor, index) => {
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card sabor-card h-100" style="cursor: pointer; transition: all 0.3s;">
                    <div class="card-body p-3">
                        <div class="form-check">
                            <input class="form-check-input sabor-checkbox" type="checkbox" 
                                   id="sabor_trad_${index}" value="${sabor.id}" 
                                   data-nome="${sabor.nome}" data-preco="${sabor.preco}">
                            <label class="form-check-label w-100" for="sabor_trad_${index}" style="cursor: pointer;">
                                <h6 class="mb-1">${sabor.nome}</h6>
                                <small class="text-muted">${sabor.descricao}</small>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
            </div>
            
            <!-- Sabores Especiais -->
            <div class="card mb-3">
                <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0">
                        <i class="fas fa-star"></i> Sabores Especiais <span class="badge badge-dark">+R$ 5,00</span>
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
    `;
    
    // Sabores especiais
    SABORES_PIZZAS.especiais.forEach((sabor, index) => {
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card sabor-card sabor-especial h-100" style="cursor: pointer; transition: all 0.3s; border-color: #ffc107;">
                    <div class="card-body p-3">
                        <div class="form-check">
                            <input class="form-check-input sabor-checkbox sabor-especial" type="checkbox" 
                                   id="sabor_esp_${index}" value="${sabor.id}" 
                                   data-nome="${sabor.nome}" data-preco="${sabor.preco}">
                            <label class="form-check-label w-100" for="sabor_esp_${index}" style="cursor: pointer;">
                                <h6 class="mb-1 text-warning">
                                    ${sabor.nome} <i class="fas fa-star text-warning"></i>
                                </h6>
                                <small class="text-muted">${sabor.descricao}</small>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
            </div>
            
            <!-- Info e Botão -->
            <div class="text-center">
                <div class="alert alert-info" id="saboresInfo">
                    <i class="fas fa-info-circle"></i> Selecione de 1 a 3 sabores para sua pizza
                </div>
                
                <button type="button" class="btn btn-success btn-lg px-5" id="adicionarPizzaBtn" 
                        style="display: none;" onclick="adicionarPizzaAoCarrinho('${tamanhoSelecionado}')">
                    <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `;
    
    saboresContainer.innerHTML = html;
    saboresContainer.style.display = 'block';
    
    // Adicionar event listeners para seleção de sabores
    document.querySelectorAll('.sabor-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            validarSelecaoSaboresPizza(tamanhoSelecionado);
            
            // Efeito visual no card
            const card = this.closest('.sabor-card');
            if (this.checked) {
                card.style.backgroundColor = '#e3f2fd';
                card.style.borderColor = '#2196f3';
                card.style.transform = 'scale(1.02)';
            } else {
                card.style.backgroundColor = '';
                card.style.borderColor = '';
                card.style.transform = '';
            }
        });
    });
    
    // Adicionar efeitos hover nos cards
    document.querySelectorAll('.sabor-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.querySelector('input').checked) {
                this.style.backgroundColor = '#f8f9fa';
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.querySelector('input').checked) {
                this.style.backgroundColor = '';
                this.style.transform = '';
            }
        });
        
        // Permitir clicar no card para selecionar
        card.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.click();
            }
        });
    });
}

// Função para validar seleção de sabores da pizza
function validarSelecaoSaboresPizza(tamanhoSelecionado) {
    const saboresSelecionados = document.querySelectorAll('.sabor-checkbox:checked');
    const saboresInfo = document.getElementById('saboresInfo');
    const adicionarBtn = document.getElementById('adicionarPizzaBtn');
    
    if (saboresSelecionados.length === 0) {
        saboresInfo.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            <strong>Atenção:</strong> Selecione pelo menos 1 sabor para continuar
        `;
        saboresInfo.className = 'alert alert-warning';
        adicionarBtn.style.display = 'none';
    } else if (saboresSelecionados.length > 3) {
        saboresInfo.innerHTML = `
            <i class="fas fa-times-circle"></i> 
            <strong>Limite excedido:</strong> Máximo de 3 sabores permitidos
        `;
        saboresInfo.className = 'alert alert-danger';
        adicionarBtn.style.display = 'none';
        
        // Desmarcar o último checkbox selecionado
        saboresSelecionados[saboresSelecionados.length - 1].checked = false;
        
        // Remover efeito visual do card desmarcado
        const ultimoCard = saboresSelecionados[saboresSelecionados.length - 1].closest('.sabor-card');
        ultimoCard.style.backgroundColor = '';
        ultimoCard.style.borderColor = '';
        ultimoCard.style.transform = '';
        return;
    } else {
        // Mostrar informações dos sabores selecionados
        let precoTotal = TAMANHOS_PIZZA.find(t => t.id === tamanhoSelecionado).preco;
        let saboresTexto = [];
        let precoAdicional = 0;
        
        saboresSelecionados.forEach(checkbox => {
            const nome = checkbox.getAttribute('data-nome');
            const preco = parseFloat(checkbox.getAttribute('data-preco'));
            
            if (preco > 0) {
                saboresTexto.push(`${nome} <span class="text-warning">(+R$ ${preco.toFixed(2)})</span>`);
                precoAdicional += preco;
                precoTotal += preco;
            } else {
                saboresTexto.push(nome);
            }
        });
        
        let infoHTML = `
            <div class="row align-items-center">
                <div class="col-md-8">
                    <i class="fas fa-check-circle text-success"></i> 
                    <strong>Sabores selecionados (${saboresSelecionados.length}/3):</strong><br>
                    <small>${saboresTexto.join(' • ')}</small>
                </div>
                <div class="col-md-4 text-right">
                    <div class="text-muted small">
                        Pizza: R$ ${TAMANHOS_PIZZA.find(t => t.id === tamanhoSelecionado).preco.toFixed(2)}
                        ${precoAdicional > 0 ? `<br>Especiais: +R$ ${precoAdicional.toFixed(2)}` : ''}
                    </div>
                    <div class="h5 mb-0 text-success">
                        <strong>Total: R$ ${precoTotal.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `;
        
        saboresInfo.innerHTML = infoHTML;
        saboresInfo.className = 'alert alert-success';
        adicionarBtn.style.display = 'block';
        
        // Animar o botão quando aparecer
        setTimeout(() => {
            adicionarBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                adicionarBtn.style.transform = 'scale(1)';
            }, 200);
        }, 100);
    }
}

// Função para calcular preço da pizza com sabores especiais
function calcularPrecoPizza(tamanhoId, saboresSelecionados) {
    const tamanho = TAMANHOS_PIZZA.find(t => t.id === tamanhoId);
    let precoBase = tamanho.preco;
    let adicionalEspeciais = 0;
    
    // Verificar se há sabores especiais
    saboresSelecionados.forEach(checkbox => {
        const precoSabor = parseFloat(checkbox.getAttribute('data-preco'));
        if (precoSabor > 0) {
            adicionalEspeciais = 5.00; // Adicional fixo se houver pelo menos um sabor especial
        }
    });
    
    return precoBase + adicionalEspeciais;
}

// Função para adicionar pizza ao carrinho
function adicionarPizzaAoCarrinho(tamanhoId) {
    const saboresSelecionados = document.querySelectorAll('.sabor-checkbox:checked');
    const tamanho = TAMANHOS_PIZZA.find(t => t.id === tamanhoId);
    
    const sabores = Array.from(saboresSelecionados).map(checkbox => ({
        id: checkbox.value,
        nome: checkbox.getAttribute('data-nome'),
        preco: parseFloat(checkbox.getAttribute('data-preco'))
    }));
    
    const precoTotal = calcularPrecoPizza(tamanhoId, saboresSelecionados);
    
    const itemPizza = {
        nome: `Pizza ${tamanho.nome}`,
        descricao: `${sabores.map(s => s.nome).join(', ')} - ${tamanho.descricao}`,
        preco: precoTotal,
        categoria: 'pizzas',
        tamanho: tamanho,
        sabores: sabores
    };
    
    adicionarAoCarrinho(itemPizza);
}

// Função para carregar produtos de outras categorias
function carregarProdutosCategoria(categoria) {
    const detalhesCategoria = document.getElementById('detalhesCategoria');
    
    if (!CATEGORIAS[categoria]) {
        detalhesCategoria.innerHTML = '<div class="alert alert-warning">Categoria não encontrada!</div>';
        return;
    }
    
    const categoriaInfo = CATEGORIAS[categoria];
    
    let html = `
        <div class="mt-3">
            <div class="text-center mb-4">
                <h4 class="text-primary mb-2">
                    <i class="fas fa-utensils"></i> ${categoriaInfo.nome}
                </h4>
                <p class="text-muted">${categoriaInfo.descricao}</p>
            </div>
    `;
    
    // Se a categoria tem tamanhos, mostrar seleção de tamanhos
    if (categoriaInfo.tamanhos && categoriaInfo.tamanhos.length > 0) {
        html += `
            <div class="card mb-3">
                <div class="card-header bg-light">
                    <h6 class="mb-0 text-secondary">
                        <i class="fas fa-expand-arrows-alt"></i> Escolha o Tamanho
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
        `;
        
        categoriaInfo.tamanhos.forEach((tamanho, index) => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card tamanho-card h-100" style="cursor: pointer; transition: all 0.3s;">
                        <div class="card-body p-3 text-center">
                            <div class="form-check">
                                <input class="form-check-input tamanho-radio" type="radio" name="tamanho_${categoria}" id="tamanho_${categoria}_${index}" value="${index}" data-preco="${tamanho.preco}">
                                <label class="form-check-label w-100" for="tamanho_${categoria}_${index}" style="cursor: pointer;">
                                    <h6 class="mb-1">${tamanho.nome}</h6>
                                    <div class="text-success font-weight-bold">R$ ${tamanho.preco.toFixed(2)}</div>
                                    <small class="text-muted">${tamanho.descricao}</small>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
            <div id="saboresContainer_${categoria}" style="display: none;">
                <!-- Sabores serão carregados aqui se necessário -->
            </div>
        `;
    }
    
    // Se a categoria tem sabores, mostrar seleção de sabores
    if (categoriaInfo.sabores && categoriaInfo.sabores.length > 0) {
        html += `
            <div class="card mb-3">
                <div class="card-header bg-light">
                    <h6 class="mb-0 text-secondary">
                        <i class="fas fa-palette"></i> Escolha o Sabor
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
        `;
        
        categoriaInfo.sabores.forEach((sabor, index) => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card sabor-card h-100" style="cursor: pointer; transition: all 0.3s;">
                        <div class="card-body p-3 text-center">
                            <div class="form-check">
                                <input class="form-check-input sabor-radio" type="radio" name="sabor_${categoria}" id="sabor_${categoria}_${index}" value="${sabor}">
                                <label class="form-check-label w-100" for="sabor_${categoria}_${index}" style="cursor: pointer;">
                                    <h6 class="mb-1">${sabor}</h6>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="text-center">
            <div class="alert alert-info" id="resumoItem_${categoria}" style="display: none;">
                <!-- Resumo do item será mostrado aqui -->
            </div>
            <button type="button" class="btn btn-success btn-lg px-5" onclick="adicionarItemCategoria('${categoria}')" style="display: none;" id="btnAdicionar_${categoria}">
                <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
            </button>
        </div>
        </div>
    `;
    
    detalhesCategoria.innerHTML = html;
    
    // Adicionar event listeners
    adicionarEventListenersCategoria(categoria);
}

// Função para adicionar event listeners para categorias
function adicionarEventListenersCategoria(categoria) {
    const categoriaInfo = CATEGORIAS[categoria];
    
    // Event listeners para tamanhos
    if (categoriaInfo.tamanhos && categoriaInfo.tamanhos.length > 0) {
        document.querySelectorAll(`input[name="tamanho_${categoria}"]`).forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    // Remover seleção visual de outros cards
                    document.querySelectorAll('.tamanho-card').forEach(card => {
                        card.style.backgroundColor = '';
                        card.style.borderColor = '';
                        card.style.transform = '';
                    });
                    
                    // Aplicar seleção visual ao card atual
                    const card = this.closest('.tamanho-card');
                    card.style.backgroundColor = '#e3f2fd';
                    card.style.borderColor = '#2196f3';
                    card.style.transform = 'scale(1.02)';
                    
                    mostrarResumoItemCategoria(categoria);
                }
            });
        });
        
        // Adicionar efeitos hover para cards de tamanho
        document.querySelectorAll('.tamanho-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!this.querySelector('input').checked) {
                    this.style.backgroundColor = '#f8f9fa';
                    this.style.transform = 'translateY(-2px)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.querySelector('input').checked) {
                    this.style.backgroundColor = '';
                    this.style.transform = '';
                }
            });
            
            // Permitir clicar no card para selecionar
            card.addEventListener('click', function(e) {
                if (e.target.type !== 'radio') {
                    const radio = this.querySelector('input[type="radio"]');
                    radio.click();
                }
            });
        });
    }
    
    // Event listeners para sabores
    if (categoriaInfo.sabores && categoriaInfo.sabores.length > 0) {
        document.querySelectorAll(`input[name="sabor_${categoria}"]`).forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    // Remover seleção visual de outros cards
                    document.querySelectorAll('.sabor-card').forEach(card => {
                        card.style.backgroundColor = '';
                        card.style.borderColor = '';
                        card.style.transform = '';
                    });
                    
                    // Aplicar seleção visual ao card atual
                    const card = this.closest('.sabor-card');
                    card.style.backgroundColor = '#e8f5e8';
                    card.style.borderColor = '#28a745';
                    card.style.transform = 'scale(1.02)';
                    
                    mostrarResumoItemCategoria(categoria);
                }
            });
        });
        
        // Adicionar efeitos hover para cards de sabor
        document.querySelectorAll('.sabor-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!this.querySelector('input').checked) {
                    this.style.backgroundColor = '#f8f9fa';
                    this.style.transform = 'translateY(-2px)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.querySelector('input').checked) {
                    this.style.backgroundColor = '';
                    this.style.transform = '';
                }
            });
            
            // Permitir clicar no card para selecionar
            card.addEventListener('click', function(e) {
                if (e.target.type !== 'radio') {
                    const radio = this.querySelector('input[type="radio"]');
                    radio.click();
                }
            });
        });
    }
    
    // Se não tem tamanhos nem sabores, mostrar botão diretamente
    if ((!categoriaInfo.tamanhos || categoriaInfo.tamanhos.length === 0) && 
        (!categoriaInfo.sabores || categoriaInfo.sabores.length === 0)) {
        document.getElementById(`btnAdicionar_${categoria}`).style.display = 'block';
    }
}

// Função para mostrar resumo do item da categoria
function mostrarResumoItemCategoria(categoria) {
    const categoriaInfo = CATEGORIAS[categoria];
    const resumoContainer = document.getElementById(`resumoItem_${categoria}`);
    const btnAdicionar = document.getElementById(`btnAdicionar_${categoria}`);
    
    let tamanhoSelecionado = null;
    let saborSelecionado = null;
    let preco = 0;
    let nome = categoriaInfo.nome;
    let descricao = '';
    
    // Verificar tamanho selecionado
    if (categoriaInfo.tamanhos && categoriaInfo.tamanhos.length > 0) {
        const tamanhoRadio = document.querySelector(`input[name="tamanho_${categoria}"]:checked`);
        if (tamanhoRadio) {
            const tamanhoIndex = parseInt(tamanhoRadio.value);
            tamanhoSelecionado = categoriaInfo.tamanhos[tamanhoIndex];
            preco = tamanhoSelecionado.preco;
            nome += ` ${tamanhoSelecionado.nome}`;
            descricao = tamanhoSelecionado.descricao;
        } else {
            resumoContainer.style.display = 'none';
            btnAdicionar.style.display = 'none';
            return;
        }
    }
    
    // Verificar sabor selecionado
    if (categoriaInfo.sabores && categoriaInfo.sabores.length > 0) {
        const saborRadio = document.querySelector(`input[name="sabor_${categoria}"]:checked`);
        if (saborRadio) {
            saborSelecionado = saborRadio.value;
            nome += ` de ${saborSelecionado}`;
        } else {
            resumoContainer.style.display = 'none';
            btnAdicionar.style.display = 'none';
            return;
        }
    }
    
    // Mostrar resumo
    const html = `
        <div class="alert alert-success">
            <h6>Resumo do Item:</h6>
            <p><strong>Produto:</strong> ${nome}</p>
            ${descricao ? `<p><strong>Descrição:</strong> ${descricao}</p>` : ''}
            ${saborSelecionado ? `<p><strong>Sabor:</strong> ${saborSelecionado}</p>` : ''}
            <p><strong>Preço:</strong> R$ ${preco.toFixed(2)}</p>
        </div>
    `;
    
    resumoContainer.innerHTML = html;
    resumoContainer.style.display = 'block';
    btnAdicionar.style.display = 'block';
}

// Função para adicionar item da categoria ao carrinho
function adicionarItemCategoria(categoria) {
    const categoriaInfo = CATEGORIAS[categoria];
    let tamanhoSelecionado = null;
    let saborSelecionado = null;
    let preco = 0;
    let nome = categoriaInfo.nome;
    let descricao = '';
    
    // Verificar tamanho selecionado
    if (categoriaInfo.tamanhos && categoriaInfo.tamanhos.length > 0) {
        const tamanhoRadio = document.querySelector(`input[name="tamanho_${categoria}"]:checked`);
        if (tamanhoRadio) {
            const tamanhoIndex = parseInt(tamanhoRadio.value);
            tamanhoSelecionado = categoriaInfo.tamanhos[tamanhoIndex];
            preco = tamanhoSelecionado.preco;
            nome += ` ${tamanhoSelecionado.nome}`;
            descricao = tamanhoSelecionado.descricao;
        }
    }
    
    // Verificar sabor selecionado
    if (categoriaInfo.sabores && categoriaInfo.sabores.length > 0) {
        const saborRadio = document.querySelector(`input[name="sabor_${categoria}"]:checked`);
        if (saborRadio) {
            saborSelecionado = saborRadio.value;
            nome += ` de ${saborSelecionado}`;
        }
    }
    
    const item = {
        nome: nome,
        descricao: descricao || categoriaInfo.descricao,
        preco: preco,
        categoria: categoria,
        tamanho: tamanhoSelecionado,
        sabor: saborSelecionado
    };
    
    adicionarAoCarrinho(item);
    
    // Limpar seleções
    document.querySelectorAll(`input[name="tamanho_${categoria}"]`).forEach(radio => radio.checked = false);
    document.querySelectorAll(`input[name="sabor_${categoria}"]`).forEach(radio => radio.checked = false);
    
    // Esconder resumo e botão
    document.getElementById(`resumoItem_${categoria}`).style.display = 'none';
    document.getElementById(`btnAdicionar_${categoria}`).style.display = 'none';
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