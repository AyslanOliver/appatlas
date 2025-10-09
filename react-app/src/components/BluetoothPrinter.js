import React, { useState, useEffect } from 'react';
import bluetoothPrinter from '../services/bluetoothPrinter';
// import './BluetoothPrinter.css';

const BluetoothPrinter = ({ pedido, onClose }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        checkBluetoothStatus();
        loadPairedDevices();
    }, []);

    const checkBluetoothStatus = async () => {
        try {
            await bluetoothPrinter.isBluetoothAvailable();
            setStatus('Bluetooth disponível');
        } catch (error) {
            setError('Bluetooth não disponível: ' + error.message);
            console.error('Erro Bluetooth:', error);
        }
    };

    const loadPairedDevices = async () => {
        setIsLoading(true);
        try {
            const pairedDevices = await bluetoothPrinter.listPairedDevices();
            setDevices(pairedDevices);
            setStatus(`${pairedDevices.length} dispositivos encontrados`);
        } catch (error) {
            setError('Erro ao listar dispositivos: ' + error.message);
            console.error('Erro ao listar dispositivos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const connectToDevice = async () => {
        if (!selectedDevice) {
            setError('Selecione um dispositivo');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await bluetoothPrinter.connect(selectedDevice);
            setIsConnected(true);
            setStatus('Conectado à impressora');
        } catch (error) {
            setError('Erro ao conectar: ' + error.message);
            console.error('Erro de conexão:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const disconnect = async () => {
        setIsLoading(true);
        try {
            await bluetoothPrinter.disconnect();
            setIsConnected(false);
            setStatus('Desconectado');
        } catch (error) {
            setError('Erro ao desconectar: ' + error.message);
            console.error('Erro ao desconectar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const printTest = async () => {
        setIsLoading(true);
        setError('');
        try {
            await bluetoothPrinter.printTest();
            setStatus('Teste de impressão enviado');
        } catch (error) {
            setError('Erro no teste: ' + error.message);
            console.error('Erro no teste:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const printOrder = async () => {
        if (!pedido) {
            setError('Nenhum pedido para imprimir');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await bluetoothPrinter.printOrder(pedido);
            setStatus('Pedido impresso com sucesso!');
            setTimeout(() => {
                onClose && onClose();
            }, 2000);
        } catch (error) {
            setError('Erro ao imprimir pedido: ' + error.message);
            console.error('Erro ao imprimir:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const enableBluetooth = async () => {
        setIsLoading(true);
        try {
            await bluetoothPrinter.enableBluetooth();
            setStatus('Bluetooth habilitado');
            await loadPairedDevices();
        } catch (error) {
            setError('Erro ao habilitar Bluetooth: ' + error.message);
            console.error('Erro ao habilitar Bluetooth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bluetooth-printer-modal">
            <div className="bluetooth-printer-content">
                <div className="bluetooth-printer-header">
                    <h3>🖨️ Impressão Bluetooth</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="bluetooth-printer-body">
                    {/* Status */}
                    <div className="status-section">
                        {status && (
                            <div className="status-message success">
                                ✅ {status}
                            </div>
                        )}
                        {error && (
                            <div className="status-message error">
                                ❌ {error}
                            </div>
                        )}
                    </div>

                    {/* Controles Bluetooth */}
                    <div className="bluetooth-controls">
                        <button 
                            className="btn btn-secondary"
                            onClick={enableBluetooth}
                            disabled={isLoading}
                        >
                            📶 Habilitar Bluetooth
                        </button>
                        
                        <button 
                            className="btn btn-secondary"
                            onClick={loadPairedDevices}
                            disabled={isLoading}
                        >
                            🔄 Atualizar Dispositivos
                        </button>
                    </div>

                    {/* Lista de Dispositivos */}
                    <div className="devices-section">
                        <label htmlFor="device-select">Selecionar Impressora:</label>
                        <select 
                            id="device-select"
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                            disabled={isLoading || isConnected}
                        >
                            <option value="">Selecione um dispositivo...</option>
                            {devices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.name} ({device.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Controles de Conexão */}
                    <div className="connection-controls">
                        {!isConnected ? (
                            <button 
                                className="btn btn-primary"
                                onClick={connectToDevice}
                                disabled={isLoading || !selectedDevice}
                            >
                                {isLoading ? '🔄 Conectando...' : '🔗 Conectar'}
                            </button>
                        ) : (
                            <button 
                                className="btn btn-danger"
                                onClick={disconnect}
                                disabled={isLoading}
                            >
                                {isLoading ? '🔄 Desconectando...' : '🔌 Desconectar'}
                            </button>
                        )}
                    </div>

                    {/* Controles de Impressão */}
                    {isConnected && (
                        <div className="print-controls">
                            <button 
                                className="btn btn-secondary"
                                onClick={printTest}
                                disabled={isLoading}
                            >
                                {isLoading ? '🔄 Imprimindo...' : '🧪 Teste de Impressão'}
                            </button>

                            {pedido && (
                                <button 
                                    className="btn btn-success"
                                    onClick={printOrder}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '🔄 Imprimindo...' : '🖨️ Imprimir Pedido'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Informações do Pedido */}
                    {pedido && (
                        <div className="order-info">
                            <h4>📋 Pedido a Imprimir:</h4>
                            <div className="order-details">
                                <p><strong>ID:</strong> {pedido.id || 'N/A'}</p>
                                <p><strong>Cliente:</strong> {pedido.cliente || 'Balcão'}</p>
                                <p><strong>Itens:</strong> {pedido.itens?.length || 0}</p>
                                <p><strong>Total:</strong> R$ {
                                    pedido.itens?.reduce((total, item) => 
                                        total + (item.preco || 0) * (item.quantidade || 1), 0
                                    ).toFixed(2) || '0.00'
                                }</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bluetooth-printer-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BluetoothPrinter;