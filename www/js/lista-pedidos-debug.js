// Versão simplificada para debug
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando carregamento de pedidos...');
    carregarPedidosDebug();
});

async function carregarPedidosDebug() {
    console.log('Função carregarPedidosDebug iniciada');
    
    try {
        const tbody = document.getElementById('corpoPedidos');
        console.log('Elemento tbody encontrado:', tbody);

        // Testar conexão direta
        console.log('Fazendo requisição para:', `${API_URL}/api/pedidos`);
        const response = await fetch(`${API_URL}/api/pedidos`);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const pedidos = await response.json();
        console.log('Pedidos recebidos:', pedidos);
        console.log('Número de pedidos:', pedidos.length);

        // Limpar tabela
        tbody.innerHTML = '';

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum pedido encontrado</td></tr>';
            return;
        }

        // Preencher tabela com pedidos
        pedidos.forEach((pedido, index) => {
            console.log(`Processando pedido ${index}:`, pedido);
            
            const tr = document.createElement('tr');
            
            // Simplificar a exibição dos itens
            let descricaoItens = 'Sem itens';
            if (pedido.itens && pedido.itens.length > 0) {
                descricaoItens = `${pedido.itens.length} item(s)`;
            }

            tr.innerHTML = `
                <td>#${pedido._id ? pedido._id.slice(-6) : index + 1}</td>
                <td>${pedido.cliente ? pedido.cliente.nome : 'Cliente não informado'}</td>
                <td>${descricaoItens}</td>
                <td>
                    <span class="badge badge-primary">${pedido.status || 'Sem status'}</span>
                </td>
                <td>${pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleString() : 'Data não informada'}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="alert('Pedido: ${pedido._id}')">
                        Ver
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
            console.log(`Pedido ${index} adicionado à tabela`);
        });

        console.log('Todos os pedidos foram adicionados à tabela');

    } catch (error) {
        console.error('Erro detalhado ao carregar pedidos:', error);
        
        const tbody = document.getElementById('corpoPedidos');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro: ${error.message}</td></tr>`;
        }
        
        alert(`Erro ao carregar pedidos: ${error.message}`);
    }
}