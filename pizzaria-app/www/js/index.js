// Dashboard da Pizzaria - Sistema de Pedidos
// Inicialização e carregamento de dados

// Importar configuração da API
import { getPedidos } from './api.js';

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard inicializado');
    
    // Carregar dados do dashboard
    carregarDashboard();
    
    // Atualizar dados a cada 30 segundos
    setInterval(carregarDashboard, 30000);
});

// Função principal para carregar dados do dashboard
async function carregarDashboard() {
    try {
        await Promise.all([
            atualizarContadoresPedidos(),
            carregarPedidosRecentes(),
            atualizarEstatisticasVendas()
        ]);
        
        console.log('Dashboard atualizado com sucesso');
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        mostrarErro('Erro ao carregar dados do dashboard');
    }
}

// Função para atualizar contadores de pedidos
async function atualizarContadoresPedidos() {
    try {
        const pedidos = await getPedidos();
        
        // Contar pedidos por status
        const contadores = {
            pendentes: 0,
            preparo: 0,
            entrega: 0,
            entregues: 0
        };
        
        const hoje = new Date().toDateString();
        
        pedidos.forEach(pedido => {
            const dataPedido = new Date(pedido.dataPedido).toDateString();
            
            switch (pedido.status) {
                case 'pendente':
                    contadores.pendentes++;
                    break;
                case 'preparo':
                case 'preparando':
                    contadores.preparo++;
                    break;
                case 'entrega':
                case 'saiu_para_entrega':
                    contadores.entrega++;
                    break;
                case 'entregue':
                case 'finalizado':
                    if (dataPedido === hoje) {
                        contadores.entregues++;
                    }
                    break;
            }
        });
        
        // Atualizar elementos na tela
        atualizarElementoContador('pedidos-pendentes', contadores.pendentes);
        atualizarElementoContador('pedidos-preparo', contadores.preparo);
        atualizarElementoContador('pedidos-entrega', contadores.entrega);
        atualizarElementoContador('pedidos-entregues', contadores.entregues);
        
    } catch (error) {
        console.error('Erro ao atualizar contadores:', error);
    }
}

// Função para atualizar elemento contador na tela
function atualizarElementoContador(classe, valor) {
    const elementos = document.querySelectorAll(`.${classe}`);
    elementos.forEach(elemento => {
        elemento.textContent = valor;
    });
}

// Função para carregar pedidos recentes
async function carregarPedidosRecentes() {
    try {
        const pedidos = await getPedidos();
        
        // Ordenar por data mais recente e pegar os últimos 5
        const pedidosRecentes = pedidos
            .sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido))
            .slice(0, 5);
        
        exibirPedidosRecentes(pedidosRecentes);
        
    } catch (error) {
        console.error('Erro ao carregar pedidos recentes:', error);
    }
}

// Função para exibir pedidos recentes
function exibirPedidosRecentes(pedidos) {
    const container = document.getElementById('pedidos-recentes-lista');
    if (!container) return;
    
    if (pedidos.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum pedido encontrado</p>';
        return;
    }
    
    let html = '';
    pedidos.forEach(pedido => {
        const data = new Date(pedido.dataPedido).toLocaleString('pt-BR');
        const statusClass = obterClasseStatus(pedido.status);
        const statusTexto = obterTextoStatus(pedido.status);
        
        html += `
            <div class="card mb-2">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">Pedido #${pedido.id}</h6>
                            <small class="text-muted">${pedido.cliente?.nome || 'Cliente não informado'}</small>
                            <div class="mt-1">
                                <small class="text-muted">${data}</small>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="badge ${statusClass}">${statusTexto}</span>
                            <div class="mt-1">
                                <strong class="text-success">R$ ${(pedido.total || 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Função para obter classe CSS do status
function obterClasseStatus(status) {
    switch (status) {
        case 'pendente': return 'badge-primary';
        case 'preparo':
        case 'preparando': return 'badge-warning';
        case 'entrega':
        case 'saiu_para_entrega': return 'badge-info';
        case 'entregue':
        case 'finalizado': return 'badge-success';
        default: return 'badge-secondary';
    }
}

// Função para obter texto do status
function obterTextoStatus(status) {
    switch (status) {
        case 'pendente': return 'Pendente';
        case 'preparo':
        case 'preparando': return 'Preparando';
        case 'entrega':
        case 'saiu_para_entrega': return 'Entrega';
        case 'entregue':
        case 'finalizado': return 'Entregue';
        default: return 'Desconhecido';
    }
}

// Função para atualizar estatísticas de vendas
async function atualizarEstatisticasVendas() {
    try {
        const pedidos = await getPedidos();
        
        // Calcular estatísticas do dia
        const hoje = new Date().toDateString();
        const pedidosHoje = pedidos.filter(pedido => 
            new Date(pedido.dataPedido).toDateString() === hoje
        );
        
        const vendaHoje = pedidosHoje.reduce((total, pedido) => total + (pedido.total || 0), 0);
        const ticketMedio = pedidosHoje.length > 0 ? vendaHoje / pedidosHoje.length : 0;
        
        // Atualizar elementos na tela
        const vendaElement = document.getElementById('venda-hoje');
        if (vendaElement) {
            vendaElement.textContent = `R$ ${vendaHoje.toFixed(2)}`;
        }
        
        const ticketElement = document.getElementById('ticket-medio');
        if (ticketElement) {
            ticketElement.textContent = `R$ ${ticketMedio.toFixed(2)}`;
        }
        
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

// Função para mostrar erro
function mostrarErro(mensagem) {
    console.error(mensagem);
    
    // Criar notificação de erro
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(alerta);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.parentNode.removeChild(alerta);
        }
    }, 5000);
}

// Função para atualizar manualmente o dashboard
function atualizarDashboard() {
    carregarDashboard();
}
