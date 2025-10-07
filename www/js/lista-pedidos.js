import { getPedidos, atualizarPedido } from './api.js';
import { GerenciadorImpressao } from './impressora-pos58.js';

document.addEventListener('DOMContentLoaded', function() {
    // Carregar pedidos iniciais
    carregarPedidos();

    // Adicionar listeners para os filtros
    document.getElementById('filtroStatus').addEventListener('change', carregarPedidos);
    document.getElementById('filtroPeriodo').addEventListener('change', carregarPedidos);
});

async function carregarPedidos() {
    console.log('🔄 Iniciando carregamento de pedidos...');
    try {
        const tbody = document.getElementById('corpoPedidos');
        console.log('📋 Elemento tbody encontrado:', tbody);
        
        const filtroStatus = document.getElementById('filtroStatus').value;
        const filtroPeriodo = document.getElementById('filtroPeriodo').value;
        console.log('🔍 Filtros aplicados - Status:', filtroStatus, 'Período:', filtroPeriodo);

        // Recuperar pedidos da API
        console.log('🌐 Chamando getPedidos()...');
        let pedidos = await getPedidos();
        console.log('✅ Pedidos recebidos:', pedidos);
        console.log('📊 Número de pedidos:', pedidos ? pedidos.length : 'undefined');

        // Aplicar filtros
        console.log('🔍 Aplicando filtros...');
        pedidos = filtrarPedidos(pedidos, filtroStatus, filtroPeriodo);
        console.log('📋 Pedidos após filtros:', pedidos);
        console.log('📊 Número de pedidos filtrados:', pedidos ? pedidos.length : 'undefined');

        // Limpar tabela
        console.log('🧹 Limpando tabela...');
        tbody.innerHTML = '';

        if (!pedidos || pedidos.length === 0) {
            console.log('⚠️ Nenhum pedido para exibir');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum pedido encontrado</td></tr>';
            return;
        }

        // Preencher tabela com pedidos filtrados
        console.log('🎨 Renderizando pedidos na tabela...');
        pedidos.forEach((pedido, index) => {
            console.log(`📝 Processando pedido ${index}:`, pedido);
            const tr = document.createElement('tr');
            
            // Definir classe de cor baseada no status
            tr.className = getStatusClass(pedido.status);

        // Melhorar exibição dos itens
        let descricaoItens = 'Nenhum item';
        if (pedido.itens && pedido.itens.length > 0) {
            const itensTexto = pedido.itens.map(item => {
                if (item.tipo === 'pizza') {
                    return `Pizza ${item.tamanho} - ${item.sabores ? item.sabores.join(' / ') : 'Sabor não especificado'}`;
                } else {
                    return item.nome || 'Produto não especificado';
                }
            });
            
            if (itensTexto.length > 1) {
                descricaoItens = `${itensTexto[0]} (+${itensTexto.length - 1} item${itensTexto.length > 2 ? 's' : ''})`;
            } else {
                descricaoItens = itensTexto[0];
            }
        } else if (pedido.pizza) {
            // Compatibilidade com formato antigo
            descricaoItens = `Pizza ${pedido.pizza.tamanho} - ${pedido.pizza.sabor1}${pedido.pizza.sabor2 ? ' / ' + pedido.pizza.sabor2 : ''}`;
        }

        // Calcular valor total
        let valorTotal = 0;
        if (pedido.total) {
            valorTotal = pedido.total;
        } else if (pedido.itens && pedido.itens.length > 0) {
            valorTotal = pedido.itens.reduce((total, item) => {
                const preco = item.preco || 0;
                const quantidade = item.quantidade || 1;
                return total + (preco * quantidade);
            }, 0);
        }

        tr.innerHTML = `
            <td>#${pedido._id ? pedido._id.slice(-6) : index + 1}</td>
            <td>${pedido.cliente.nome}</td>
            <td title="${pedido.itens && pedido.itens.length > 1 ? pedido.itens.map(item => item.tipo === 'pizza' ? `Pizza ${item.tamanho} - ${item.sabores ? item.sabores.join(' / ') : 'Sabor não especificado'}` : item.nome).join(', ') : ''}">${descricaoItens}</td>
            <td><strong class="text-success">R$ ${valorTotal.toFixed(2)}</strong></td>
            <td>
                <select class="form-control status-select" data-pedido-id="${pedido._id}" data-status-atual="${pedido.status}">
                    <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="preparo" ${pedido.status === 'preparo' ? 'selected' : ''}>Em Preparo</option>
                    <option value="entrega" ${pedido.status === 'entrega' ? 'selected' : ''}>Saiu para Entrega</option>
                    <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                </select>
            </td>
            <td>${formatarData(pedido.dataPedido)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="mostrarDetalhesPedido('${pedido._id}')" title="Ver Detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-success btn-sm ml-1" onclick="imprimirPedido('${pedido._id}')" title="Imprimir Pedido">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-info btn-sm ml-1" onclick="encaminharWhatsApp('${pedido._id}')" title="Encaminhar via WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button class="btn btn-danger btn-sm ml-1" onclick="apagarPedido('${pedido._id}')" title="Apagar Pedido">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

            tbody.appendChild(tr);
            console.log(`✅ Pedido ${index} adicionado à tabela`);
        });

        console.log('🎉 Todos os pedidos foram renderizados com sucesso!');

        // Adicionar event listeners para os selects de status
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', function() {
                const pedidoId = this.getAttribute('data-pedido-id');
                const novoStatus = this.value;
                const statusAtual = this.getAttribute('data-status-atual');
                
                // Desabilitar o select temporariamente
                this.disabled = true;
                
                atualizarStatus(pedidoId, novoStatus, this, statusAtual);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        alert('Erro ao carregar pedidos. Por favor, recarregue a página.');
    }
}

function filtrarPedidos(pedidos, status, periodo) {
    console.log('🔍 Função filtrarPedidos chamada com:', { pedidos: pedidos?.length, status, periodo });
    
    if (!pedidos || !Array.isArray(pedidos)) {
        console.error('❌ Pedidos inválidos para filtrar:', pedidos);
        return [];
    }
    
    const resultado = pedidos.filter(pedido => {
        const dataPedido = new Date(pedido.dataPedido);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Filtrar por status
        if (status && pedido.status !== status) {
            console.log(`⏭️ Pedido ${pedido._id} filtrado por status: ${pedido.status} !== ${status}`);
            return false;
        }

        // Filtrar por período
        let passouFiltro = true;
        switch(periodo) {
            case 'hoje':
                passouFiltro = dataPedido >= hoje;
                break;
            case 'semana':
                const semanaAtras = new Date(hoje);
                semanaAtras.setDate(hoje.getDate() - 7);
                passouFiltro = dataPedido >= semanaAtras;
                break;
            case 'mes':
                const mesAtras = new Date(hoje);
                mesAtras.setMonth(hoje.getMonth() - 1);
                passouFiltro = dataPedido >= mesAtras;
                break;
            default:
                passouFiltro = true;
        }
        
        if (!passouFiltro) {
            console.log(`⏭️ Pedido ${pedido._id} filtrado por período: ${periodo}`);
        }
        
        return passouFiltro;
    });
    
    console.log(`✅ Filtros aplicados: ${resultado.length} pedidos restantes`);
    return resultado;
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

async function atualizarStatus(id, novoStatus, selectElement, statusAnterior) {
    try {
        // Atualizar o pedido na API
        await atualizarPedido(id, { status: novoStatus });
        
        // Atualizar o atributo data-status-atual
        selectElement.setAttribute('data-status-atual', novoStatus);
        
        // Reabilitar o select
        selectElement.disabled = false;
        
        // Atualizar a classe da linha
        const tr = selectElement.closest('tr');
        tr.className = getStatusClass(novoStatus);
        
        // Mostrar mensagem de sucesso
        mostrarMensagemSucesso(`Status atualizado para: ${obterTextoStatus(novoStatus)}`);
        
        // Atualizar contadores se a função existir
        if (typeof atualizarContadores === 'function') {
            atualizarContadores();
        }
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        
        // Reverter o select para o status anterior em caso de erro
        selectElement.value = statusAnterior;
        selectElement.disabled = false;
        
        alert('Erro ao atualizar status. Por favor, tente novamente.');
    }
}

// Função para obter texto do status
function obterTextoStatus(status) {
    switch (status) {
        case 'pendente': return 'Pendente';
        case 'preparo': return 'Em Preparo';
        case 'entrega': return 'Saiu para Entrega';
        case 'entregue': return 'Entregue';
        default: return 'Desconhecido';
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

// Função para imprimir pedido
async function imprimirPedido(id) {
    try {
        const pedido = (await getPedidos()).find(p => p._id === id);
        
        if (pedido) {
            const gerenciador = new GerenciadorImpressao();
            
            try {
                const resultado = await gerenciador.imprimirPedido(id);
                
                if (resultado.success) {
                    alert(`Pedido impresso com sucesso via ${resultado.metodo}!`);
                } else {
                    alert('Erro ao imprimir pedido. Verifique a conexão com a impressora.');
                }
            } catch (impressaoError) {
                console.error('Erro na impressão:', impressaoError);
                alert('Erro ao imprimir pedido. Verifique a conexão com a impressora.');
            }
        } else {
            alert('Pedido não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao imprimir pedido:', error);
        alert('Erro ao imprimir pedido. Por favor, tente novamente.');
    }
}

// Função para apagar pedido
async function apagarPedido(id) {
    if (!confirm('Tem certeza que deseja apagar este pedido? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`/api/pedidos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            mostrarMensagemSucesso('Pedido apagado com sucesso!');
            // Recarregar a lista de pedidos
            carregarPedidos();
        } else {
            // Verificar se a resposta tem conteúdo antes de tentar fazer parse JSON
            let errorMessage = 'Erro desconhecido';
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } else {
                    const textError = await response.text();
                    errorMessage = textError || `Erro HTTP ${response.status}`;
                }
            } catch (parseError) {
                errorMessage = `Erro HTTP ${response.status}`;
            }
            alert(`Erro ao apagar pedido: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Erro ao apagar pedido:', error);
        alert(`Erro ao apagar pedido: ${error.message || 'Verifique sua conexão.'}`);
    }
}

// Função para encaminhar via WhatsApp
async function encaminharWhatsApp(id) {
    try {
        // Buscar os detalhes do pedido
        const response = await fetch(`/api/pedidos/${id}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes do pedido');
        }
        
        const pedido = await response.json();
        
        // Gerar mensagem do pedido
        let mensagem = `🍕 *PEDIDO #${pedido._id.slice(-6)}*\n\n`;
        mensagem += `👤 *Cliente:* ${pedido.cliente.nome}\n`;
        mensagem += `📞 *Telefone:* ${pedido.cliente.telefone}\n`;
        mensagem += `📍 *Endereço:* ${pedido.cliente.endereco}\n\n`;
        
        mensagem += `🛒 *Itens do Pedido:*\n`;
        if (pedido.itens && pedido.itens.length > 0) {
            pedido.itens.forEach((item, index) => {
                if (item.tipo === 'pizza') {
                    mensagem += `${index + 1}. Pizza ${item.tamanho} - ${item.sabores ? item.sabores.join(' / ') : 'Sabor não especificado'}\n`;
                    mensagem += `   R$ ${(item.preco || 0).toFixed(2)}\n`;
                } else {
                    mensagem += `${index + 1}. ${item.nome || 'Produto não especificado'}\n`;
                    mensagem += `   Qtd: ${item.quantidade || 1} - R$ ${(item.preco || 0).toFixed(2)}\n`;
                }
            });
        }
        
        mensagem += `\n💰 *Total: R$ ${(pedido.total || 0).toFixed(2)}*\n`;
        mensagem += `📅 *Data: ${formatarData(pedido.dataPedido)}*\n`;
        mensagem += `📋 *Status: ${obterTextoStatus(pedido.status)}*`;
        
        // Copiar para a área de transferência
        await navigator.clipboard.writeText(mensagem);
        mostrarMensagemSucesso('Mensagem copiada para a área de transferência! Cole no WhatsApp.');
        
    } catch (error) {
        console.error('Erro ao gerar mensagem do WhatsApp:', error);
        alert('Erro ao gerar mensagem do WhatsApp. Tente novamente.');
    }
}

// Tornar as funções disponíveis globalmente
window.imprimirPedido = imprimirPedido;
window.apagarPedido = apagarPedido;
window.encaminharWhatsApp = encaminharWhatsApp;