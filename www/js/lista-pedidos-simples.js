// Versão sem imports ES6 para teste
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado - versão simples');
    carregarPedidosSimples();
});

async function carregarPedidosSimples() {
    console.log('🔄 Iniciando carregamento simples...');
    
    try {
        const tbody = document.getElementById('corpoPedidos');
        console.log('📋 Tbody encontrado:', tbody);

        // Fazer requisição direta
        console.log('🌐 Fazendo fetch para:', `${API_URL}/api/pedidos`);
        const response = await fetch(`${API_URL}/api/pedidos`);
        console.log('📡 Response recebido:', response.status, response.ok);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const pedidos = await response.json();
        console.log('📦 Dados recebidos:', pedidos);
        console.log('📊 Quantidade:', pedidos.length);

        // Limpar tabela
        tbody.innerHTML = '';

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum pedido encontrado</td></tr>';
            return;
        }

        // Renderizar pedidos
        pedidos.forEach((pedido, index) => {
            console.log(`📝 Renderizando pedido ${index}:`, pedido);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${pedido._id ? pedido._id.slice(-6) : index + 1}</td>
                <td>${pedido.cliente ? pedido.cliente.nome : 'N/A'}</td>
                <td>${pedido.itens ? pedido.itens.length + ' itens' : 'Sem itens'}</td>
                <td><span class="badge badge-info">${pedido.status || 'N/A'}</span></td>
                <td>${pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="alert('ID: ${pedido._id}')">
                        Ver
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
            console.log(`✅ Pedido ${index} adicionado`);
        });

        console.log('🎉 Renderização concluída!');

    } catch (error) {
        console.error('❌ Erro:', error);
        const tbody = document.getElementById('corpoPedidos');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro: ${error.message}</td></tr>`;
        }
    }
}