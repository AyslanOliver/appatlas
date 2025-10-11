import React, { useState, useEffect } from 'react';

const Configuracoes = () => {
    // Estados para dados da empresa
    const [config, setConfig] = useState({
        nomeEmpresa: localStorage.getItem('nomeEmpresa') || '',
        telefone: localStorage.getItem('telefone') || '',
        endereco: localStorage.getItem('endereco') || '',
        taxaEntrega: localStorage.getItem('taxaEntrega') || '0',
        tempoMedioEntrega: localStorage.getItem('tempoMedioEntrega') || '30'
    });

    // Estados para configurações de impressora
    const [printerStatus, setPrinterStatus] = useState('disconnected'); // disconnected, connected, searching
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const [availablePrinters, setAvailablePrinters] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [testPrintStatus, setTestPrintStatus] = useState('idle'); // idle, printing, success, error
    const [printerSettings, setPrinterSettings] = useState({
        paperWidth: '58mm',
        fontSize: 'medium',
        printLogo: true,
        printQRCode: true,
        autoConnect: true
    });

    // Carregar configurações de impressora ao inicializar
    useEffect(() => {
        const printerConfig = localStorage.getItem('printerConfig');
        if (printerConfig) {
            const config = JSON.parse(printerConfig);
            setSelectedPrinter(config.selectedPrinter);
            setPrinterSettings(config.settings || printerSettings);
            if (config.selectedPrinter) {
                setPrinterStatus('connected');
            }
        }
    }, []);

    // Salvar dados da empresa
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

    // Salvar configurações de impressora
    const salvarConfiguracoesPrinter = () => {
        const printerConfig = {
            selectedPrinter,
            settings: printerSettings,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('printerConfig', JSON.stringify(printerConfig));
        alert('Configurações de impressora salvos com sucesso!');
    };

    // Buscar impressoras Bluetooth
    const buscarImpressoras = async () => {
        setIsSearching(true);
        setPrinterStatus('searching');
        
        try {
            // Simular busca por dispositivos Bluetooth
            // Em uma implementação real, você usaria a Web Bluetooth API
            setTimeout(() => {
                const mockPrinters = [
                    { id: '1', name: 'Impressora Térmica BT-001', address: '00:11:22:33:44:55', type: 'thermal' },
                    { id: '2', name: 'Mini Printer 58mm', address: '00:11:22:33:44:66', type: 'thermal' },
                    { id: '3', name: 'Bluetooth Printer Pro', address: '00:11:22:33:44:77', type: 'thermal' }
                ];
                setAvailablePrinters(mockPrinters);
                setIsSearching(false);
                setPrinterStatus('disconnected');
            }, 3000);
        } catch (error) {
            console.error('Erro ao buscar impressoras:', error);
            setIsSearching(false);
            setPrinterStatus('disconnected');
            alert('Erro ao buscar impressoras Bluetooth');
        }
    };

    // Conectar impressora
    const conectarImpressora = (printer) => {
        setSelectedPrinter(printer);
        setPrinterStatus('connected');
        
        // Salvar automaticamente
        const printerConfig = {
            selectedPrinter: printer,
            settings: printerSettings,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('printerConfig', JSON.stringify(printerConfig));
        
        alert(`Conectado à impressora: ${printer.name}`);
    };

    // Desconectar impressora
    const desconectarImpressora = () => {
        setSelectedPrinter(null);
        setPrinterStatus('disconnected');
        localStorage.removeItem('printerConfig');
        alert('Impressora desconectada');
    };

    // Teste de impressão
    const testarImpressao = () => {
        if (!selectedPrinter) {
            alert('Nenhuma impressora conectada');
            return;
        }

        setTestPrintStatus('printing');
        
        // Simular impressão de teste
        setTimeout(() => {
            setTestPrintStatus('success');
            setTimeout(() => {
                setTestPrintStatus('idle');
            }, 3000);
        }, 2000);
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Configurações</h1>
            </div>

            <div className="row">
                {/* Configurações da Empresa */}
                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-building mr-2"></i>
                                Dados da Empresa
                            </h6>
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
                </div>

                {/* Configurações de Impressora Bluetooth */}
                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fab fa-bluetooth mr-2"></i>
                                Impressora Bluetooth
                            </h6>
                        </div>
                        <div className="card-body">
                            {/* Status da Impressora */}
                            <div className="printer-config-section">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">Status da Impressora</h6>
                                    <span className={`printer-status ${printerStatus}`}>
                                        {printerStatus === 'connected' && (
                                            <>
                                                <i className="fas fa-check-circle mr-1"></i>
                                                Conectada
                                            </>
                                        )}
                                        {printerStatus === 'disconnected' && (
                                            <>
                                                <i className="fas fa-times-circle mr-1"></i>
                                                Desconectada
                                            </>
                                        )}
                                        {printerStatus === 'searching' && (
                                            <>
                                                <i className="fas fa-search mr-1 searching-animation"></i>
                                                Procurando...
                                            </>
                                        )}
                                    </span>
                                </div>

                                {selectedPrinter && (
                                    <div className="alert alert-success">
                                        <strong>Impressora Conectada:</strong><br />
                                        <i className="fas fa-print mr-2"></i>
                                        {selectedPrinter.name}<br />
                                        <small className="text-muted">Endereço: {selectedPrinter.address}</small>
                                    </div>
                                )}

                                <div className="btn-group w-100 mb-3" role="group">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={buscarImpressoras}
                                        disabled={isSearching}
                                    >
                                        <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} mr-2`}></i>
                                        {isSearching ? 'Procurando...' : 'Buscar Impressoras'}
                                    </button>
                                    
                                    {selectedPrinter && (
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={desconectarImpressora}
                                        >
                                            <i className="fas fa-unlink mr-2"></i>
                                            Desconectar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Lista de Impressoras Disponíveis */}
                            {availablePrinters.length > 0 && (
                                <div className="printer-config-section">
                                    <h6 className="mb-3">Impressoras Disponíveis</h6>
                                    {availablePrinters.map((printer) => (
                                        <div
                                            key={printer.id}
                                            className={`bluetooth-device-item ${selectedPrinter?.id === printer.id ? 'selected' : ''}`}
                                            onClick={() => conectarImpressora(printer)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{printer.name}</strong><br />
                                                    <small className="text-muted">{printer.address}</small>
                                                </div>
                                                <div>
                                                    {selectedPrinter?.id === printer.id ? (
                                                        <i className="fas fa-check-circle text-success"></i>
                                                    ) : (
                                                        <i className="fas fa-plus-circle text-primary"></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Configurações de Impressão */}
                            <div className="printer-config-section">
                                <h6 className="mb-3">Configurações de Impressão</h6>
                                
                                <div className="form-group">
                                    <label>Largura do Papel</label>
                                    <select
                                        className="form-control"
                                        value={printerSettings.paperWidth}
                                        onChange={(e) => setPrinterSettings({...printerSettings, paperWidth: e.target.value})}
                                    >
                                        <option value="58mm">58mm</option>
                                        <option value="80mm">80mm</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tamanho da Fonte</label>
                                    <select
                                        className="form-control"
                                        value={printerSettings.fontSize}
                                        onChange={(e) => setPrinterSettings({...printerSettings, fontSize: e.target.value})}
                                    >
                                        <option value="small">Pequena</option>
                                        <option value="medium">Média</option>
                                        <option value="large">Grande</option>
                                    </select>
                                </div>

                                <div className="form-check mb-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="printLogo"
                                        checked={printerSettings.printLogo}
                                        onChange={(e) => setPrinterSettings({...printerSettings, printLogo: e.target.checked})}
                                    />
                                    <label className="form-check-label" htmlFor="printLogo">
                                        Imprimir Logo da Empresa
                                    </label>
                                </div>

                                <div className="form-check mb-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="printQRCode"
                                        checked={printerSettings.printQRCode}
                                        onChange={(e) => setPrinterSettings({...printerSettings, printQRCode: e.target.checked})}
                                    />
                                    <label className="form-check-label" htmlFor="printQRCode">
                                        Imprimir QR Code nos Pedidos
                                    </label>
                                </div>

                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="autoConnect"
                                        checked={printerSettings.autoConnect}
                                        onChange={(e) => setPrinterSettings({...printerSettings, autoConnect: e.target.checked})}
                                    />
                                    <label className="form-check-label" htmlFor="autoConnect">
                                        Conectar Automaticamente
                                    </label>
                                </div>

                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={salvarConfiguracoesPrinter}
                                >
                                    <i className="fas fa-save mr-2"></i>
                                    Salvar Configurações
                                </button>
                            </div>

                            {/* Teste de Impressão */}
                            <div className={`test-print-area ${testPrintStatus === 'printing' ? 'printing' : ''}`}>
                                <h6 className="mb-3">Teste de Impressão</h6>
                                
                                {testPrintStatus === 'idle' && (
                                    <div>
                                        <p className="text-muted mb-3">
                                            Clique no botão abaixo para imprimir um cupom de teste
                                        </p>
                                        <button
                                            className="btn btn-info"
                                            onClick={testarImpressao}
                                            disabled={!selectedPrinter}
                                        >
                                            <i className="fas fa-print mr-2"></i>
                                            Imprimir Teste
                                        </button>
                                    </div>
                                )}

                                {testPrintStatus === 'printing' && (
                                    <div className="text-center">
                                        <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                                        <p className="text-primary">Imprimindo cupom de teste...</p>
                                    </div>
                                )}

                                {testPrintStatus === 'success' && (
                                    <div className="text-center">
                                        <i className="fas fa-check-circle fa-2x text-success mb-3"></i>
                                        <p className="text-success">Teste de impressão realizado com sucesso!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informações do Sistema */}
            <div className="row">
                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-info-circle mr-2"></i>
                                Informações do Sistema
                            </h6>
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
                            <div className="mb-3">
                                <strong>Suporte Bluetooth:</strong> 
                                <span className={`badge ml-1 ${navigator.bluetooth ? 'badge-success' : 'badge-warning'}`}>
                                    {navigator.bluetooth ? 'Disponível' : 'Não Disponível'}
                                </span>
                            </div>
                            <div className="mb-3">
                                <strong>Status Online:</strong> 
                                <span className={`badge ml-1 ${navigator.onLine ? 'badge-success' : 'badge-danger'}`}>
                                    {navigator.onLine ? 'Conectado' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-cogs mr-2"></i>
                                Ações do Sistema
                            </h6>
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
                                className="btn btn-info btn-block mb-2"
                                onClick={() => window.location.reload()}
                            >
                                <i className="fas fa-sync-alt mr-1"></i>
                                Recarregar Aplicação
                            </button>

                            <button 
                                className="btn btn-secondary btn-block"
                                onClick={() => {
                                    const data = {
                                        empresa: config,
                                        impressora: { selectedPrinter, settings: printerSettings },
                                        timestamp: new Date().toISOString()
                                    };
                                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'configuracoes-backup.json';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                <i className="fas fa-download mr-1"></i>
                                Exportar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;