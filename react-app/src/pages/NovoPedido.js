import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getProdutos, criarPedido } from '../services/api';

const NovoPedido = () => {
    const { data: produtos, loading: loadingProdutos } = useApi(getProdutos);
    const [pedido, setPedido] = useState({
        cliente_nome: '',
        cliente_telefone: '',
        cliente_endereco: '',
        observacoes: '',
        itens: []
    });
    const [loading, setLoading] = useState(false);

    const adicionarItem = (produto) => {
        const itemExistente = pedido.itens.find(item => item.produto_id === produto.id);
        
        if (itemExistente) {
            setPedido(prev => ({
                ...prev,
                itens: prev.itens.map(item =>
                    item.produto_id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                )
            }));
        } else {
            setPedido(prev => ({
                ...prev,
                itens: [...prev.itens, {
                    produto_id: produto.id,
                    produto_nome: produto.nome,
                    preco: produto.preco,
                    quantidade: 1
                }]
            }));
        }
    };

    const removerItem = (produtoId) => {
        setPedido(prev => ({
            ...prev,
            itens: prev.itens.filter(item => item.produto_id !== produtoId)
        }));
    };

    const calcularTotal = () => {
        return pedido.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const novoPedido = {
                ...pedido,
                total: calcularTotal(),
                status: 'pendente'
            };
            
            await criarPedido(novoPedido);
            alert('Pedido criado com sucesso!');
            
            // Reset form
            setPedido({
                cliente_nome: '',
                cliente_telefone: '',
                cliente_endereco: '',
                observacoes: '',
                itens: []
            });
        } catch (error) {
            alert('Erro ao criar pedido: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Novo Pedido</h1>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Dados do Cliente</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Nome do Cliente</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={pedido.cliente_nome}
                                                onChange={(e) => setPedido(prev => ({ ...prev, cliente_nome: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Telefone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={pedido.cliente_telefone}
                                                onChange={(e) => setPedido(prev => ({ ...prev, cliente_telefone: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Endereço</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={pedido.cliente_endereco}
                                        onChange={(e) => setPedido(prev => ({ ...prev, cliente_endereco: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Observações</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={pedido.observacoes}
                                        onChange={(e) => setPedido(prev => ({ ...prev, observacoes: e.target.value }))}
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Produtos</h6>
                        </div>
                        <div className="card-body">
                            {loadingProdutos ? (
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Carregando...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="row">
                                    {produtos && produtos.map(produto => (
                                        <div key={produto.id} className="col-md-4 mb-3">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h6 className="card-title">{produto.nome}</h6>
                                                    <p className="card-text">R$ {parseFloat(produto.preco).toFixed(2)}</p>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => adicionarItem(produto)}
                                                    >
                                                        Adicionar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Resumo do Pedido</h6>
                        </div>
                        <div className="card-body">
                            {pedido.itens.length > 0 ? (
                                <>
                                    {pedido.itens.map((item, index) => (
                                        <div key={`${item.produto_id}-${index}`} className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <strong>{item.produto_nome}</strong><br />
                                                <small>Qtd: {item.quantidade} x R$ {parseFloat(item.preco).toFixed(2)}</small>
                                            </div>
                                            <div>
                                                <span className="mr-2">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removerItem(item.produto_id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <strong>Total: R$ {calcularTotal().toFixed(2)}</strong>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-block mt-3"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? 'Criando...' : 'Criar Pedido'}
                                    </button>
                                </>
                            ) : (
                                <p className="text-muted">Nenhum item adicionado</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovoPedido;