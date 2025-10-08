import React, { useState } from 'react';
import BluetoothPrinterManager from '../components/BluetoothPrinterManager';

const Configuracoes = () => {
    const [config, setConfig] = useState({
        nomeEmpresa: localStorage.getItem('nomeEmpresa') || '',
        telefone: localStorage.getItem('telefone') || '',
        endereco: localStorage.getItem('endereco') || '',
        taxaEntrega: localStorage.getItem('taxaEntrega') || '0',
        tempoMedioEntrega: localStorage.getItem('tempoMedioEntrega') || '30',
        impressoraHabilitada: localStorage.getItem('impressoraHabilitada') === 'true',
        impressoraNome: localStorage.getItem('impressoraNome') || '',
        impressoraLargura: localStorage.getItem('impressoraLargura') || '48'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Salvar no localStorage
        Object.keys(config).forEach(key => {
            localStorage.setItem(key, config[key]);
        });
        
        alert('Configurações salvas com sucesso!');
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Configurações</h1>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Dados da Empresa</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Nome da Empresa</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={config.nomeEmpresa}
                                        onChange={(e) => handleChange('nomeEmpresa', e.target.value)}
                                        placeholder="Digite o nome da sua empresa"
                                    />
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Telefone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={config.telefone}
                                                onChange={(e) => handleChange('telefone', e.target.value)}
                                                placeholder="(11) 99999-9999"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Taxa de Entrega (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                value={config.taxaEntrega}
                                                onChange={(e) => handleChange('taxaEntrega', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Endereço</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={config.endereco}
                                        onChange={(e) => handleChange('endereco', e.target.value)}
                                        placeholder="Endereço completo da empresa"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tempo Médio de Entrega (minutos)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={config.tempoMedioEntrega}
                                        onChange={(e) => handleChange('tempoMedioEntrega', e.target.value)}
                                        placeholder="30"
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save mr-1"></i>
                                    Salvar Configurações
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Seção de Configurações de Impressora */}
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-print mr-2"></i>
                                Configurações de Impressora
                            </h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="impressoraHabilitada"
                                            checked={config.impressoraHabilitada}
                                            onChange={(e) => handleChange('impressoraHabilitada', e.target.checked)}
                                        />
                                        <label className="custom-control-label" htmlFor="impressoraHabilitada">
                                            Habilitar Impressora Bluetooth
                                        </label>
                                    </div>
                                    <small className="form-text text-muted">
                                        Ative para usar impressora POS58 via Bluetooth
                                    </small>
                                </div>

                                {config.impressoraHabilitada && (
                                    <>
                                        <div className="form-group">
                                            <label>Nome da Impressora</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={config.impressoraNome}
                                                onChange={(e) => handleChange('impressoraNome', e.target.value)}
                                                placeholder="Nome da impressora Bluetooth"
                                            />
                                            <small className="form-text text-muted">
                                                Nome da impressora como aparece nas configurações Bluetooth
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>Largura do Papel (caracteres)</label>
                                            <select
                                                className="form-control"
                                                value={config.impressoraLargura}
                                                onChange={(e) => handleChange('impressoraLargura', e.target.value)}
                                            >
                                                <option value="32">32 caracteres (58mm)</option>
                                                <option value="48">48 caracteres (80mm)</option>
                                            </select>
                                            <small className="form-text text-muted">
                                                Largura do papel da sua impressora térmica
                                            </small>
                                        </div>
                                    </>
                                )}

                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save mr-1"></i>
                                    Salvar Configurações de Impressora
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Informações do Sistema</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <strong>Versão:</strong> 1.0.0
                            </div>
                            <div className="mb-3">
                                <strong>Última Atualização:</strong> {new Date().toLocaleDateString()}
                            </div>
                            <div className="mb-3">
                                <strong>Status da API:</strong> 
                                <span className="badge badge-success ml-1">Conectado</span>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Ações</h6>
                        </div>
                        <div className="card-body">
                            <button 
                                className="btn btn-warning btn-block mb-2"
                                onClick={() => {
                                    if (window.confirm('Tem certeza que deseja limpar o cache?')) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                            >
                                <i className="fas fa-broom mr-1"></i>
                                Limpar Cache
                            </button>
                            
                            <button 
                                className="btn btn-info btn-block"
                                onClick={() => window.location.reload()}
                            >
                                <i className="fas fa-sync-alt mr-1"></i>
                                Recarregar Aplicação
                            </button>
                        </div>
                    </div>

                    {/* Gerenciador de Impressora Bluetooth */}
                    {config.impressoraHabilitada && (
                        <div className="card shadow mb-4">
                            <div className="card-header py-3">
                                <h6 className="m-0 font-weight-bold text-primary">
                                    <i className="fas fa-bluetooth mr-2"></i>
                                    Gerenciar Impressora
                                </h6>
                            </div>
                            <div className="card-body">
                                <BluetoothPrinterManager showOrderButtons={false} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;