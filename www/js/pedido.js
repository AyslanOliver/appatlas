// Arquivo para gerenciar os pedidos
import { criarPedido } from './api.js';

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
                await criarPedido(pedido);

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