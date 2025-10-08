import React, { useState } from 'react';
import useBluetoothPrinter from '../hooks/useBluetoothPrinter';
import './BluetoothPrinterManager.css';

const BluetoothPrinterManager = ({ onPrintOrder, onPrintKitchen, showOrderButtons = true }) => {
  const {
    isConnected,
    isConnecting,
    connectedDevice,
    error,
    isBluetoothAvailable,
    connect,
    disconnect,
    printTest,
    clearError
  } = useBluetoothPrinter();

  const [showManager, setShowManager] = useState(false);

  const handleConnect = async () => {
    const success = await connect();
    if (success) {
      // Opcional: executar teste de impressão após conectar
      // await printTest();
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleTest = async () => {
    await printTest();
  };

  if (!isBluetoothAvailable) {
    return (
      <div className="bluetooth-manager-unavailable">
        <span>⚠️ Bluetooth não disponível</span>
      </div>
    );
  }

  return (
    <div className="bluetooth-manager">
      {/* Botão para mostrar/ocultar o gerenciador */}
      <button 
        className={`bluetooth-toggle ${isConnected ? 'connected' : 'disconnected'}`}
        onClick={() => setShowManager(!showManager)}
        title={isConnected ? `Conectado: ${connectedDevice?.name || 'Impressora'}` : 'Impressora Bluetooth'}
      >
        🖨️ {isConnected ? '✅' : '❌'}
      </button>

      {/* Painel do gerenciador */}
      {showManager && (
        <div className="bluetooth-panel">
          <div className="bluetooth-header">
            <h4>Impressora Bluetooth</h4>
            <button 
              className="close-btn"
              onClick={() => setShowManager(false)}
            >
              ✕
            </button>
          </div>

          <div className="bluetooth-content">
            {/* Status da conexão */}
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
              </span>
              {connectedDevice && (
                <span className="device-name">{connectedDevice.name}</span>
              )}
            </div>

            {/* Erro */}
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
                <button onClick={clearError} className="clear-error">✕</button>
              </div>
            )}

            {/* Dicas para o usuário */}
            {!isConnected && !error && (
              <div className="help-tips">
                <h5>💡 Dicas para conectar:</h5>
                <ul>
                  <li>Certifique-se que a impressora está ligada</li>
                  <li>Verifique se o Bluetooth está ativado</li>
                  <li>A impressora deve estar próxima (até 10m)</li>
                  <li>Alguns navegadores podem solicitar permissão</li>
                </ul>
              </div>
            )}

            {/* Botões de controle */}
            <div className="control-buttons">
              {!isConnected ? (
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="connect-btn"
                >
                  {isConnecting ? '🔄 Conectando...' : '🔗 Conectar'}
                </button>
              ) : (
                <button 
                  onClick={handleDisconnect}
                  className="disconnect-btn"
                >
                  🔌 Desconectar
                </button>
              )}

              {isConnected && (
                <button 
                  onClick={handleTest}
                  className="test-btn"
                >
                  🧪 Teste
                </button>
              )}
            </div>

            {/* Botões de impressão de pedidos (se habilitado) */}
            {showOrderButtons && isConnected && (
              <div className="print-buttons">
                <h5>Impressão Rápida:</h5>
                <button 
                  onClick={onPrintOrder}
                  className="print-order-btn"
                  disabled={!onPrintOrder}
                >
                  📄 Imprimir Pedido
                </button>
                <button 
                  onClick={onPrintKitchen}
                  className="print-kitchen-btn"
                  disabled={!onPrintKitchen}
                >
                  👨‍🍳 Recibo Cozinha
                </button>
              </div>
            )}

            {/* Instruções */}
            <div className="instructions">
              <small>
                💡 <strong>Dica:</strong> Certifique-se de que sua impressora POS58 
                está ligada e em modo de pareamento antes de conectar.
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BluetoothPrinterManager;