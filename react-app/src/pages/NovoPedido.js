import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getProdutos, criarPedido } from '../services/api';

const NovoPedido = () => {
    const { data: produtos, loading: loadingProdutos } = useApi(getProdutos);
    const [pedido, setPedido] = useState({
        cliente: '',
        cliente_telefone: '',
        cliente_endereco: '',
        observacoes: '',
        itens: []
    });
    const [loading, setLoading] = useState(false);
    const [categoriaAtual, setCategoriaAtual] = useState(null);
    const [tamanhoAtual, setTamanhoAtual] = useState(null);
    const [saboresSelecionados, setSaboresSelecionados] = useState([]);
    const [modoSelecaoSabores, setModoSelecaoSabores] = useState(false);
    
    // Categorias disponíveis
    const categorias = [
        { id: 'pastel', nome: 'Pastel', icone: '🥟' },
        { id: 'pizza', nome: 'Pizza', icone: '🍕' },
        { id: 'bebida', nome: 'Bebidas', icone: '🥤' },
        { id: 'lanche', nome: 'Lanches', icone: '🍔' },
        { id: 'doce', nome: 'Doces', icone: '🍰' },
        { id: 'outros', nome: 'Outros', icone: '🍽️' }
    ];
    
    // Tamanhos de pizza com preços
    const tamanhosPizza = [
        { id: 'brotinho', nome: 'Brotinho', preco: 9.00, icone: '🍕' },
        { id: 'brotao', nome: 'Brotão', preco: 12.00, icone: '🍕' },
        { id: 'pequena', nome: 'Pequena', preco: 25.00, icone: '🍕' },
        { id: 'media', nome: 'Média', preco: 38.00, icone: '🍕' },
        { id: 'grande', nome: 'Grande', preco: 45.00, icone: '🍕' },
        { id: 'familia', nome: 'Família', preco: 55.00, icone: '🍕' }
    ];
    
    // Sabores especiais com preços adicionais
    const saboresEspeciais = {
        'bacon': { nome: 'Bacon', adicional: 5.00 },
        'atum': { nome: 'Atum', adicional: 4.00 }
    };
    
    // Função para verificar se um produto é sabor especial
    const verificarSaborEspecial = (nomeProduto) => {
        const nome = nomeProduto.toLowerCase();
        for (const [key, sabor] of Object.entries(saboresEspeciais)) {
            if (nome.includes(key) || nome.includes(sabor.nome.toLowerCase())) {
                return sabor;
            }
        }
        return null;
    };

    // Função para selecionar/deselecionar sabor
    const toggleSaborSelecionado = (produto) => {
        setSaboresSelecionados(prev => {
            const jaExiste = prev.find(s => s.id === produto.id);
            if (jaExiste) {
                return prev.filter(s => s.id !== produto.id);
            } else if (prev.length < 3) {
                return [...prev, produto];
            }
            return prev;
        });
    };

    // Função para calcular preço de pizza com múltiplos sabores
    const calcularPrecoPizzaMultipla = (sabores = [], tamanho = null) => {
        if (!tamanho || !tamanho.preco) {
            return 0;
        }
        
        let precoBase = tamanho.preco;
        const tamanhosEspeciais = ['media', 'grande', 'familia'];
        
        // Verificar se algum sabor é especial
        const temSaborEspecial = sabores.some(sabor => verificarSaborEspecial(sabor.nome));
        
        if (temSaborEspecial && tamanhosEspeciais.includes(tamanho.id)) {
            const precosEspeciais = {
                'media': 45.00,
                'grande': 55.00,
                'familia': 60.00
            };
            precoBase = precosEspeciais[tamanho.id];
        }
        
        return precoBase;
    };

    // Função para adicionar pizza com múltiplos sabores
    const adicionarPizzaMultipla = () => {
        if (saboresSelecionados.length < 2 || !tamanhoAtual) return;
        
        const tamanho = tamanhosPizza.find(t => t.id === tamanhoAtual);
        const preco = calcularPrecoPizzaMultipla(saboresSelecionados, tamanho);
        
        const nomesSabores = saboresSelecionados.map(s => s.nome).join(' + ');
        const temEspecial = saboresSelecionados.some(sabor => verificarSaborEspecial(sabor.nome));
        const tamanhosEspeciais = ['media', 'grande', 'familia'];
        
        let nome = `Pizza ${nomesSabores} - ${tamanho.nome}`;
        if (temEspecial && tamanhosEspeciais.includes(tamanho.id)) {
            nome += ' (Especial)';
        }
        
        const itemId = `pizza_multipla_${saboresSelecionados.map(s => s.id).join('_')}_${tamanho.id}`;
        
        setPedido(prev => ({
            ...prev,
            itens: [...prev.itens, {
                produto_id: itemId,
                produto_nome: nome,
                preco: preco,
                quantidade: 1
            }]
        }));
        
        // Resetar seleção
        setSaboresSelecionados([]);
        setModoSelecaoSabores(false);
        setTamanhoAtual(null);
        setCategoriaAtual(null);
    };
    
    // Filtrar produtos por categoria
    const produtosFiltrados = produtos?.filter(produto => {
        if (!categoriaAtual) return false;
        // Aqui você pode implementar a lógica de filtro baseada no nome do produto
        // ou adicionar um campo categoria no banco de dados
        const nome = produto.nome.toLowerCase();
        switch(categoriaAtual) {
            case 'pastel':
                return nome.includes('pastel');
            case 'pizza':
                return nome.includes('pizza');
            case 'bebida':
                return nome.includes('refrigerante') || nome.includes('suco') || nome.includes('água') || nome.includes('coca') || nome.includes('pepsi') || nome.includes('fanta') || nome.includes('sprite');
            case 'lanche':
                return nome.includes('hambúrguer') || nome.includes('sanduíche') || nome.includes('lanche');
            case 'doce':
                return nome.includes('bolo') || nome.includes('torta') || nome.includes('doce') || nome.includes('pudim');
            default:
                return true;
        }
    }) || [];

    const adicionarItem = (produto, tamanho = null) => {
        let preco = produto.preco;
        let nome = produto.nome;
        let itemId = produto.id;
        
        // Se for pizza, usar preço do tamanho
        if (categoriaAtual === 'pizza' && tamanho) {
            preco = tamanho.preco;
            
            // Verificar se é sabor especial (Atum ou Bacon) e se é tamanho elegível (Média, Grande, Família)
            const saborEspecial = verificarSaborEspecial(produto.nome);
            const tamanhosEspeciais = ['media', 'grande', 'familia'];
            
            if (saborEspecial && tamanhosEspeciais.includes(tamanho.id)) {
                // Preços especiais fixos para sabores especiais
                const precosEspeciais = {
                    'media': 45.00,
                    'grande': 55.00,
                    'familia': 60.00
                };
                preco = precosEspeciais[tamanho.id];
                nome = `${produto.nome} - ${tamanho.nome} (Especial)`;
            } else {
                nome = `${produto.nome} - ${tamanho.nome}`;
            }
            
            itemId = `${produto.id}_${tamanho.id}`;
        }
        
        const itemExistente = pedido.itens.find(item => item.produto_id === itemId);
        
        if (itemExistente) {
            setPedido(prev => ({
                ...prev,
                itens: prev.itens.map(item =>
                    item.produto_id === itemId
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                )
            }));
        } else {
            setPedido(prev => ({
                ...prev,
                itens: [...prev.itens, {
                    produto_id: itemId,
                    produto_nome: nome,
                    preco: preco,
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
                cliente: '',
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
                                                value={pedido.cliente}
                                        onChange={(e) => setPedido(prev => ({ ...prev, cliente: e.target.value }))}
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
                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">
                                {!categoriaAtual ? 'Categorias' : 
                                 categoriaAtual === 'pizza' && !tamanhoAtual ? 'Tamanhos de Pizza' :
                                 categoriaAtual === 'pizza' && tamanhoAtual ? `Sabores - ${tamanhosPizza.find(t => t.id === tamanhoAtual)?.nome}` :
                                 `Produtos - ${categorias.find(c => c.id === categoriaAtual)?.nome}`}
                            </h6>
                            {(categoriaAtual || tamanhoAtual) && (
                                <button 
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => {
                                        if (tamanhoAtual) {
                                            setTamanhoAtual(null);
                                            setModoSelecaoSabores(false);
                                            setSaboresSelecionados([]);
                                        } else {
                                            setCategoriaAtual(null);
                                        }
                                    }}
                                >
                                    <i className="fas fa-arrow-left mr-1"></i>
                                    Voltar
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {loadingProdutos ? (
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Carregando...</span>
                                    </div>
                                </div>
                            ) : !categoriaAtual ? (
                                // Mostrar categorias
                                <div className="categorias-lista">
                                    {categorias.map(categoria => (
                                        <div 
                                            key={categoria.id} 
                                            className="categoria-item"
                                            onClick={() => setCategoriaAtual(categoria.id)}
                                        >
                                            <div className="categoria-icon">{categoria.icone}</div>
                                            <div className="categoria-nome">{categoria.nome}</div>
                                            <div className="categoria-arrow">
                                                <i className="fas fa-chevron-right"></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : categoriaAtual === 'pizza' && !tamanhoAtual ? (
                                // Mostrar tamanhos de pizza
                                <div className="categorias-lista">
                                    {tamanhosPizza.map(tamanho => (
                                        <div 
                                            key={tamanho.id} 
                                            className="categoria-item"
                                            onClick={() => {
                                                setTamanhoAtual(tamanho.id);
                                                setModoSelecaoSabores(true);
                                                setSaboresSelecionados([]);
                                            }}
                                        >
                                            <div className="categoria-icon">{tamanho.icone}</div>
                                            <div className="categoria-info">
                                                <div className="categoria-nome">{tamanho.nome}</div>
                                                <div className="categoria-preco">R$ {tamanho.preco.toFixed(2)}</div>
                                            </div>
                                            <div className="categoria-arrow">
                                                <i className="fas fa-chevron-right"></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : categoriaAtual === 'pizza' && tamanhoAtual && modoSelecaoSabores ? (
                                // Interface de seleção múltipla de sabores
                                <div>
                                    <div className="mb-3">
                                        <div className="alert alert-info">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            Selecione de 2 a 3 sabores para sua pizza
                                            <div className="mt-1">
                                                <small>Sabores selecionados: {saboresSelecionados.length}/3</small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="produtos-lista">
                                        {produtosFiltrados.length > 0 ? (
                                            produtosFiltrados.map(produto => {
                                                const isSelected = saboresSelecionados.some(s => s.id === produto.id);
                                                const saborEspecial = verificarSaborEspecial(produto.nome);
                                                const tamanhosEspeciais = ['media', 'grande', 'familia'];
                                                
                                                return (
                                                    <div 
                                                        key={produto.id} 
                                                        className={`produto-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => toggleSaborSelecionado(produto)}
                                                        style={{
                                                            backgroundColor: isSelected ? '#e3f2fd' : 'white',
                                                            border: isSelected ? '2px solid #2196f3' : '1px solid #dee2e6'
                                                        }}
                                                    >
                                                        <div className="produto-info">
                                                            <h6 className="produto-nome">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isSelected}
                                                                    onChange={() => {}}
                                                                    className="mr-2"
                                                                />
                                                                {produto.nome}
                                                                {saborEspecial && tamanhosEspeciais.includes(tamanhoAtual) && (
                                                                    <span className="badge badge-warning ml-2">Especial</span>
                                                                )}
                                                            </h6>
                                                            <p className="produto-preco text-muted">
                                                                {saborEspecial && tamanhosEspeciais.includes(tamanhoAtual) ? (
                                                                    <small>Sabor especial - aumenta o preço</small>
                                                                ) : (
                                                                    <small>Sabor normal</small>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-muted">
                                                <p>Nenhum sabor encontrado.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {saboresSelecionados.length >= 2 && (
                                        <div className="mt-3">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h6>Resumo da Pizza:</h6>
                                                    <p><strong>Tamanho:</strong> {tamanhosPizza.find(t => t.id === tamanhoAtual)?.nome}</p>
                                                    <p><strong>Sabores:</strong> {saboresSelecionados.map(s => s.nome).join(', ')}</p>
                                                    <p><strong>Preço Total:</strong> R$ {calcularPrecoPizzaMultipla(saboresSelecionados, tamanhosPizza.find(t => t.id === tamanhoAtual)).toFixed(2)}</p>
                                                    <button 
                                                        className="btn btn-success btn-block"
                                                        onClick={adicionarPizzaMultipla}
                                                    >
                                                        <i className="fas fa-plus mr-2"></i>
                                                        Adicionar ao Pedido
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Mostrar produtos da categoria selecionada (não pizza)
                                <div className="produtos-lista">
                                    {produtosFiltrados.length > 0 ? (
                                        produtosFiltrados.map(produto => (
                                            <div 
                                                key={produto.id} 
                                                className="produto-item"
                                                onClick={() => adicionarItem(produto)}
                                            >
                                                <div className="produto-info">
                                                    <h6 className="produto-nome">{produto.nome}</h6>
                                                    <p className="produto-preco">R$ {parseFloat(produto.preco).toFixed(2)}</p>
                                                </div>
                                                <button className="btn btn-primary btn-sm">
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted">
                                            <p>Nenhum produto encontrado nesta categoria.</p>
                                        </div>
                                    )}
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
                                        <div key={`${item.produto_id}-${index}`} className="d-flex justify-content-between align-items-start mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                                            <div className="flex-grow-1">
                                                <strong>{item.produto_nome}</strong>
                                                {item.sabores && item.sabores.length > 1 && (
                                                    <div className="mt-1">
                                                        <small className="text-muted">
                                                            <i className="fas fa-pizza-slice mr-1"></i>
                                                            Sabores: {item.sabores.join(', ')}
                                                        </small>
                                                        {item.sabores.some(sabor => ['Atum', 'Bacon'].includes(sabor)) && (
                                                            <div>
                                                                <span className="badge badge-warning badge-sm">
                                                                    <i className="fas fa-star mr-1"></i>
                                                                    Com sabor especial
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <small className="text-muted">
                                                    Qtd: {item.quantidade} x R$ {parseFloat(item.preco).toFixed(2)}
                                                </small>
                                            </div>
                                            <div className="text-right">
                                                <div className="mb-1">
                                                    <strong>R$ {(item.preco * item.quantidade).toFixed(2)}</strong>
                                                </div>
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