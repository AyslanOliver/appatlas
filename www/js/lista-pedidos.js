import { getPedidos, atualizarPedido } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Carregar pedidos iniciais
    carregarPedidos();

    // Adicionar listeners para os filtros
    document.getElementById('filtroStatus').addEventListener('change', carregarPedidos);
    document.getElementById('filtroPeriodo').addEventListener('change', carregarPedidos);
});

async function carregarPedidos() {
    try {
        const tbody = document.getElementById('corpoPedidos');
        const filtroStatus = document.getElementById('filtroStatus').value;
        const filtroPeriodo = document.getElementById('filtroPeriodo').value;

        // Recuperar pedidos da API
        let pedidos = await getPedidos();

        // Aplicar filtros
        pedidos = filtrarPedidos(pedidos, filtroStatus, filtroPeriodo);

        // Limpar tabela
        tbody.innerHTML = '';

        // Preencher tabela com pedidos filtrados
        pedidos.forEach((pedido, index) => {
            const tr = document.createElement('tr');
            
            // Definir classe de cor baseada no status
            tr.className = getStatusClass(pedido.status);

        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td>${pedido.cliente.nome}</td>
            <td>${pedido.pizza.tamanho} - ${pedido.pizza.sabor1}${pedido.pizza.sabor2 ? ' / ' + pedido.pizza.sabor2 : ''}</td>
            <td>
                <select class="form-control status-select" onchange="atualizarStatus(${index}, this.value)">
                    <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="preparo" ${pedido.status === 'preparo' ? 'selected' : ''}>Em Preparo</option>
                    <option value="entrega" ${pedido.status === 'entrega' ? 'selected' : ''}>Saiu para Entrega</option>
                    <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                </select>
            </td>
            <td>${formatarData(pedido.dataPedido)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="mostrarDetalhesPedido(${index})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;

            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        alert('Erro ao carregar pedidos. Por favor, recarregue a página.');
    }
}

function filtrarPedidos(pedidos, status, periodo) {
    return pedidos.filter(pedido => {
        const dataPedido = new Date(pedido.dataPedido);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Filtrar por status
        if (status && pedido.status !== status) {
            return false;
        }

        // Filtrar por período
        switch(periodo) {
            case 'hoje':
                return dataPedido >= hoje;
            case 'semana':
                const semanaAtras = new Date(hoje);
                semanaAtras.setDate(hoje.getDate() - 7);
                return dataPedido >= semanaAtras;
            case 'mes':
                const mesAtras = new Date(hoje);
                mesAtras.setMonth(hoje.getMonth() - 1);
                return dataPedido >= mesAtras;
            default:
                return true;
        }
    });
}

function getStatusClass(status) {
    switch(status) {
        case 'pendente':
            return 'table-warning';
        case 'preparo':
            return 'table-info';
        case 'entrega':
            return 'table-primary';
        case 'entregue':
            return 'table-success';
        default:
            return '';
    }
}

async function atualizarStatus(id, novoStatus) {
    try {
        await atualizarPedido(id, { status: novoStatus });
        await carregarPedidos();
        atualizarContadores();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status. Por favor, tente novamente.');
    }
}

async function mostrarDetalhesPedido(id) {
    try {
        const pedido = (await getPedidos()).find(p => p._id === id);

        if (pedido) {
        const modalBody = document.getElementById('modalDetalhesPedidoBody');
        modalBody.innerHTML = `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="m-0 font-weight-bold text-primary">Informações do Cliente</h6>
                </div>
                <div class="card-body">
                    <p><strong>Nome:</strong> ${pedido.cliente.nome}</p>
                    <p><strong>Telefone:</strong> ${pedido.cliente.telefone}</p>
                    <p><strong>Endereço:</strong> ${pedido.cliente.endereco.rua}, ${pedido.cliente.endereco.numero}
                        ${pedido.cliente.endereco.complemento ? ' - ' + pedido.cliente.endereco.complemento : ''}<br>
                        ${pedido.cliente.endereco.bairro} - ${pedido.cliente.endereco.cidade}/${pedido.cliente.endereco.estado}</p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h6 class="m-0 font-weight-bold text-primary">Detalhes do Pedido</h6>
                </div>
                <div class="card-body">
                    <p><strong>Tamanho:</strong> ${pedido.pizza.tamanho}</p>
                    <p><strong>Sabor 1:</strong> ${pedido.pizza.sabor1}</p>
                    ${pedido.pizza.sabor2 ? `<p><strong>Sabor 2:</strong> ${pedido.pizza.sabor2}</p>` : ''}
                    ${pedido.pizza.observacoes ? `<p><strong>Observações:</strong> ${pedido.pizza.observacoes}</p>` : ''}
                    <p><strong>Status:</strong> ${pedido.status}</p>
                    <p><strong>Data/Hora:</strong> ${formatarData(pedido.dataPedido)}</p>
                </div>
            </div>
        `;

            $('#modalDetalhesPedido').modal('show');
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        alert('Erro ao carregar detalhes do pedido. Por favor, tente novamente.');
    }
}

// Função para formatar a data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
}