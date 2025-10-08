import React from 'react';
import { useApi } from '../hooks/useApi';
import { getPedidos, deletarPedido, atualizarPedido, deletarTodosPedidos } from '../services/api';
import BluetoothPrinterManager from '../components/BluetoothPrinterManager';
import useBluetoothPrinter from '../hooks/useBluetoothPrinter';

const Pedidos = () => {
    const { data: pedidos, loading, error, refetch } = useApi(getPedidos);
    const { printOrder, printKitchenReceipt } = useBluetoothPrinter();

    // Função para imprimir comanda da cozinha
    // eslint-disable-next-line no-unused-vars
    const imprimirComanda = (pedido) => {
        const conteudoComanda = `
            COMANDA DA COZINHA
            ==================
            Pedido #${pedido.id}
            Data: ${new Date(pedido.data_pedido).toLocaleDateString()}
            Cliente: ${pedido.cliente || 'Não informado'}
            Status: ${pedido.status}
            
            ITENS:
            ${pedido.itens ? pedido.itens.map(item => 
                `- ${item.nome} (Qtd: ${item.quantidade})`
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
        const mensagem = `🍕 *PEDIDO CONFIRMADO* 🍕

📋 *Pedido:* #${pedido.id}
📅 *Data:* ${new Date(pedido.data_pedido).toLocaleDateString()}
👤 *Cliente:* ${pedido.cliente || 'Não informado'}
📊 *Status:* ${pedido.status}

🍽️ *ITENS:*
${pedido.itens ? pedido.itens.map(item => 
    `• ${item.nome} (${item.quantidade}x)`
).join('\n') : 'Nenhum item'}

💰 *Total:* R$ ${parseFloat(pedido.total || 0).toFixed(2)}

Obrigado pela preferência! 🙏`;

        navigator.clipboard.writeText(mensagem).then(() => {
            alert('Mensagem copiada para o WhatsApp!');
        }).catch(() => {
            alert('Erro ao copiar mensagem');
        });
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
                <h1 className="h3 mb-0 text-gray-800">Lista de Pedidos</h1>
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
                                            <td>{pedido.cliente_nome}</td>
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
                                            <td>{new Date(pedido.data_pedido).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-success btn-sm mr-1" 
                                                    onClick={() => imprimirComanda(pedido)}
                                                    title="Imprimir Comanda"
                                                >
                                                    <i className="fas fa-print"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-primary btn-sm mr-1" 
                                                    onClick={() => printOrder(pedido)}
                                                    title="Imprimir via Bluetooth"
                                                >
                                                    🖨️
                                                </button>
                                                <button 
                                                    className="btn btn-secondary btn-sm mr-1" 
                                                    onClick={() => printKitchenReceipt(pedido)}
                                                    title="Imprimir Recibo Cozinha via Bluetooth"
                                                >
                                                    👨‍🍳
                                                </button>
                                                <button 
                                                    className="btn btn-info btn-sm mr-1" 
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
            
            {/* Gerenciador da Impressora Bluetooth */}
            <BluetoothPrinterManager 
                showOrderButtons={false}
            />
        </div>
    );
};

export default Pedidos;