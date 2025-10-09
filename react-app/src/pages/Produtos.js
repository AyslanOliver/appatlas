import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getProdutos, criarProduto, atualizarProduto, deletarProduto } from '../services/api';

const Produtos = () => {
    const { data: produtos, loading, error, refetch } = useApi(getProdutos);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        preco: '',
        descricao: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingProduct) {
                await atualizarProduto(editingProduct.id, formData);
            } else {
                await criarProduto(formData);
            }
            
            setShowModal(false);
            setEditingProduct(null);
            setFormData({ nome: '', preco: '', descricao: '' });
            refetch();
        } catch (error) {
            alert('Erro ao salvar produto: ' + error.message);
        }
    };

    const handleEdit = (produto) => {
        setEditingProduct(produto);
        setFormData({
            nome: produto.nome,
            preco: produto.preco,
            descricao: produto.descricao || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await deletarProduto(id);
                refetch();
            } catch (error) {
                alert('Erro ao excluir produto: ' + error.message);
            }
        }
    };

    const openNewProductModal = () => {
        setEditingProduct(null);
        setFormData({ nome: '', preco: '', descricao: '' });
        setShowModal(true);
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
                    Erro ao carregar produtos: {error}
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
                <h1 className="h3 mb-0 text-gray-800">Produtos</h1>
                <div>
                    <button 
                        className="btn btn-success btn-sm mr-2"
                        onClick={openNewProductModal}
                    >
                        <i className="fas fa-plus mr-1"></i>
                        Novo Produto
                    </button>
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={refetch}
                    >
                        <i className="fas fa-sync-alt mr-1"></i>
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Lista de Produtos</h6>
                </div>
                <div className="card-body">
                    {produtos && produtos.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Preço</th>
                                        <th>Descrição</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map((produto, index) => (
                                        <tr key={produto.id}>
                                            <td>{produto.id}</td>
                                            <td>{produto.nome}</td>
                                            <td>R$ {parseFloat(produto.preco).toFixed(2)}</td>
                                            <td>{produto.descricao || '-'}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-warning btn-sm mr-1"
                                                    onClick={() => handleEdit(produto)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(produto.id)}
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
                            <p>Nenhum produto encontrado.</p>
                            <button 
                                className="btn btn-success"
                                onClick={openNewProductModal}
                            >
                                <i className="fas fa-plus mr-1"></i>
                                Adicionar Primeiro Produto
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setShowModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Nome</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.nome}
                                            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Preço</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={formData.preco}
                                            onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Descrição</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.descricao}
                                            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingProduct ? 'Atualizar' : 'Criar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Produtos;