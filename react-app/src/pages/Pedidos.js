import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getPedidos, deletarPedido, atualizarPedido, deletarTodosPedidos } from '../services/api';
import BluetoothPrinter from '../components/BluetoothPrinter';

const Pedidos = () => {
    const { data: pedidos, loading, error, refetch } = useApi(getPedidos);
    const [showBluetoothPrinter, setShowBluetoothPrinter] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);

    // Função utilitária para converter valores para número
    const toNumber = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Remove símbolos de moeda e espaços
            const cleanValue = value.replace(/[R$\s]/g, '').replace(',', '.');
            const num = parseFloat(cleanValue);
            return isNaN(num) ? 0 : num;
        }
        return 0;
    };

    // Função utilitária para formatar moeda
    const formatCurrency = (value) => {
        const num = toNumber(value);
        return num.toFixed(2);
    };

    // Função para imprimir comanda da cozinha
    // eslint-disable-next-line no-unused-vars
    const imprimirComanda = (pedido) => {
        // Usar criado_em ou data_pedido, dependendo de qual estiver disponível
        const dataPedido = pedido.criado_em || pedido.data_pedido;
        const dataFormatada = dataPedido ? new Date(dataPedido).toLocaleDateString('pt-BR') : 'Data não disponível';
            
        const conteudoComanda = `
            COMANDA DA COZINHA
            ==================
            Pedido #${pedido.id || pedido._id}
            Data: ${dataFormatada}
            Cliente: ${pedido.cliente || 'Não informado'}
            Status: ${pedido.status || 'Pendente'}
            
            ITENS:
            ${pedido.itens && pedido.itens.length > 0 ? pedido.itens.map(item => 
                `- ${item.nome || 'Item'} (Qtd: ${item.quantidade || 1})`
            ).join('\n') : 'Nenhum item'}
            
            Total: R$ ${parseFloat(pedido.total || 0).toFixed(2)}
            ==================
        `;
        
        const janela = window.open('', '_blank');
        janela.document.write(`
            <html>
                <head>
                    <title>Comanda - Pedido #${pedido.id}</title>
                    <style>
                        body { font-family: monospace; white-space: pre-line; }
                    </style>
                </head>
                <body>${conteudoComanda}</body>
            </html>
        `);
        janela.document.close();
        janela.print();
    };

    // Função para copiar mensagem do WhatsApp
    // eslint-disable-next-line no-unused-vars
    const copiarWhatsApp = (pedido) => {
        // Utilitários para tratar números vindos como string (ex.: "12,50", "R$ 10")
        const toNumber = (val) => {
            if (val === null || val === undefined) return 0;
            const s = String(val).trim().replace(/^R\$\s*/, '');
            // Converte vírgula decimal para ponto quando não há ponto presente
            const normalized = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s;
            const num = parseFloat(normalized);
            return Number.isFinite(num) ? num : 0;
        };

        const formatCurrency = (val) => {
            const num = toNumber(val);
            return num.toFixed(2);
        };

        // Usar criadoEm ou data_pedido, dependendo de qual estiver disponível
        const dataPedido = pedido.criadoEm || pedido.data_pedido;
        let dataFormatada = 'Data não disponível';
        
        if (dataPedido) {
            try {
                const data = new Date(dataPedido);
                dataFormatada = data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                dataFormatada = 'Data inválida';
            }
        }
        
        // Formatar status de forma mais amigável
        const statusFormatado = {
            'pendente': 'Pendente',
            'preparo': 'Em Preparo',
            'entrega': 'Saiu para Entrega',
            'entregue': 'Entregue'
        }[pedido.status] || pedido.status || 'Pendente';
        
        const mensagem = `🍕 *PEDIDO CONFIRMADO* 🍕

📋 *Pedido:* #${pedido.id || pedido._id}
📅 *Data:* ${dataFormatada}
👤 *Cliente:* ${pedido.cliente || 'Não informado'}
📊 *Status:* ${statusFormatado}

🍽️ *ITENS:*
${pedido.itens ? pedido.itens.map(item => {
    const precoRaw = item.preco ?? item.preco_unitario ?? item.precoUnitario ?? 0;
    const precoNum = toNumber(precoRaw);
    const quantidadeNum = toNumber(item.quantidade) || 1;
    const subtotalNum = quantidadeNum * precoNum;
    return `• ${item.produto_nome || item.nome} (${quantidadeNum}x)\n  R$ ${precoNum.toFixed(2)} cada - Subtotal: R$ ${subtotalNum.toFixed(2)}`;
}).join('\n') : 'Nenhum item'}

💰 *Total:* R$ ${formatCurrency(pedido.total || 0)}

Obrigado pela preferência! 🙏`;

        navigator.clipboard.writeText(mensagem).then(() => {
            alert('Mensagem copiada para o WhatsApp!');
        }).catch(() => {
            alert('Erro ao copiar mensagem');
        });
    };

    // Função para abrir impressão Bluetooth
    const abrirImpressaoBluetooth = (pedido) => {
        setSelectedPedido(pedido);
        setShowBluetoothPrinter(true);
    };

    // Função para fechar impressão Bluetooth
    const fecharImpressaoBluetooth = () => {
        setShowBluetoothPrinter(false);
        setSelectedPedido(null);
    };

    // Função para excluir pedido
    // eslint-disable-next-line no-unused-vars
    const excluirPedido = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
            try {
                await deletarPedido(id);
                alert('Pedido excluído com sucesso!');
                refetch(); // Recarrega a lista de pedidos
            } catch (error) {
                console.error('Erro ao excluir pedido:', error);
                alert('Erro ao excluir pedido. Tente novamente.');
            }
        }
    };

    // Função para apagar todos os pedidos
    const apagarTodosPedidos = async () => {
        if (window.confirm('ATENÇÃO: Tem certeza que deseja apagar TODOS os pedidos? Esta ação não pode ser desfeita!')) {
            try {
                const resultado = await deletarTodosPedidos();
                alert(resultado.message || 'Todos os pedidos foram apagados com sucesso!');
                refetch(); // Recarrega a lista de pedidos
            } catch (error) {
                console.error('Erro ao apagar todos os pedidos:', error);
                alert('Erro ao apagar pedidos. Tente novamente.');
            }
        }
    };

    // eslint-disable-next-line no-unused-vars
    const atualizarStatus = async (id, novoStatus) => {
        try {
            await atualizarPedido(id, { status: novoStatus });
            refetch(); // Recarrega a lista de pedidos
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status. Tente novamente.');
        }
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Carregando...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="alert alert-danger" role="alert">
                    Erro ao carregar pedidos: {error}
                    <button className="btn btn-outline-danger btn-sm ml-2" onClick={refetch}>
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h3 mb-0 text-gray-800">Lista de Pedidos</h1>
                </div>
                <div>
                    <button 
                        className="btn btn-primary btn-sm mr-2"
                        onClick={refetch}
                    >
                        <i className="fas fa-sync-alt mr-1"></i>
                        Atualizar
                    </button>
                    <button 
                        className="btn btn-danger btn-sm"
                        onClick={apagarTodosPedidos}
                        title="Apagar todos os pedidos"
                    >
                        <i className="fas fa-trash-alt mr-1"></i>
                        Apagar Todos
                    </button>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Pedidos</h6>
                </div>
                <div className="card-body">
                    {pedidos && pedidos.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Data</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidos.map(pedido => (
                                        <tr key={pedido.id}>
                                            <td>{pedido.id}</td>
                                            <td>{pedido.cliente || 'Não informado'}</td>
                                            <td>
                                                <select 
                                                    className="form-control form-control-sm"
                                                    value={pedido.status}
                                                    onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    <option value="pendente">Pendente</option>
                                                    <option value="preparo">Em Preparo</option>
                                                    <option value="entrega">Saiu para Entrega</option>
                                                    <option value="entregue">Entregue</option>
                                                </select>
                                            </td>
                                            <td>R$ {parseFloat(pedido.total || 0).toFixed(2)}</td>
                                            <td>{new Date(pedido.criado_em || pedido.data_pedido).toLocaleDateString()}</td>
                                            <td>
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <button 
                                                        className="btn btn-success btn-sm" 
                                                        onClick={() => imprimirComanda(pedido)}
                                                        title="Imprimir Comanda (Navegador)"
                                                    >
                                                        <i className="fas fa-print"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-primary btn-sm" 
                                                        onClick={() => abrirImpressaoBluetooth(pedido)}
                                                        title="Imprimir via Bluetooth"
                                                    >
                                                        <i className="fas fa-bluetooth"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-info btn-sm" 
                                                        onClick={() => copiarWhatsApp(pedido)}
                                                        title="Copiar para WhatsApp"
                                                    >
                                                        <i className="fab fa-whatsapp"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm" 
                                                        onClick={() => excluirPedido(pedido.id)}
                                                        title="Excluir Pedido"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p>Nenhum pedido encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Impressão Bluetooth */}
            {showBluetoothPrinter && (
                <BluetoothPrinter 
                    pedido={selectedPedido}
                    onClose={fecharImpressaoBluetooth}
                />
            )}
        </div>
    );
};

export default Pedidos;