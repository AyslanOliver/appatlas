import { useState, useEffect, useCallback } from 'react';
import BluetoothPrinter from '../services/bluetoothPrinter';

const useBluetoothPrinter = () => {
  const [printer, setPrinter] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [error, setError] = useState(null);
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState(false);

  // Inicializar printer e verificar disponibilidade do Bluetooth
  useEffect(() => {
    const initPrinter = async () => {
      try {
        const printerInstance = new BluetoothPrinter();
        setPrinter(printerInstance);
        
        const available = await printerInstance.isBluetoothAvailable();
        setIsBluetoothAvailable(available);
        
        if (!available) {
          setError('Bluetooth não está disponível neste dispositivo');
        }
      } catch (err) {
        setError('Erro ao inicializar impressora: ' + err.message);
      }
    };

    initPrinter();
  }, []);

  // Conectar à impressora
  const connect = useCallback(async () => {
    if (!printer || !isBluetoothAvailable) {
      setError('Impressora não inicializada ou Bluetooth indisponível');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const device = await printer.connect();
      setConnectedDevice(device);
      setIsConnected(true);
      setError(null);
      return true;
    } catch (err) {
      // Tratamento específico para cancelamento pelo usuário
      if (err.message.includes('User cancelled') || err.name === 'NotFoundError') {
        setError('Conexão cancelada pelo usuário. Tente novamente.');
      } else if (err.name === 'NotAllowedError') {
        setError('Permissão negada. Verifique as configurações do navegador.');
      } else if (err.name === 'NotSupportedError') {
        setError('Bluetooth não suportado neste navegador.');
      } else {
        setError('Erro ao conectar: ' + err.message);
      }
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [printer, isBluetoothAvailable]);

  // Desconectar da impressora
  const disconnect = useCallback(async () => {
    if (!printer) return;

    try {
      await printer.disconnect();
      setIsConnected(false);
      setConnectedDevice(null);
      setError(null);
    } catch (err) {
      setError('Erro ao desconectar: ' + err.message);
    }
  }, [printer]);

  // Imprimir texto simples
  const printText = useCallback(async (text) => {
    if (!printer || !isConnected) {
      setError('Impressora não conectada');
      return false;
    }

    try {
      await printer.printText(text);
      return true;
    } catch (err) {
      setError('Erro ao imprimir: ' + err.message);
      return false;
    }
  }, [printer, isConnected]);

  // Imprimir pedido completo
  const printOrder = useCallback(async (pedido) => {
    if (!printer || !isConnected) {
      setError('Impressora não conectada');
      return false;
    }

    try {
      // Cabeçalho
      await printer.printText('PIZZARIA ATLAS\n', { align: 'center', bold: true });
      await printer.printSeparator();
      
      // Informações do pedido
      await printer.printText(`PEDIDO #${pedido.id}\n`, { bold: true });
      await printer.printText(`Data: ${new Date(pedido.data_pedido).toLocaleString()}\n`);
      await printer.printText(`Cliente: ${pedido.nome_cliente}\n`);
      
      if (pedido.telefone) {
        await printer.printText(`Telefone: ${pedido.telefone}\n`);
      }
      
      if (pedido.endereco) {
        await printer.printText(`Endereço: ${pedido.endereco}\n`);
      }
      
      await printer.printSeparator();
      
      // Itens do pedido
      await printer.printText('ITENS:\n', { bold: true });
      
      let total = 0;
      for (const item of pedido.itens) {
        const subtotal = item.quantidade * item.preco_unitario;
        total += subtotal;
        
        await printer.printText(`${item.quantidade}x ${item.nome_produto}\n`);
        await printer.printText(`  R$ ${item.preco_unitario.toFixed(2)} cada\n`);
        await printer.printText(`  Subtotal: R$ ${subtotal.toFixed(2)}\n`);
        
        if (item.observacoes) {
          await printer.printText(`  Obs: ${item.observacoes}\n`);
        }
        await printer.printText('\n');
      }
      
      await printer.printSeparator();
      
      // Total
      await printer.printText(`TOTAL: R$ ${total.toFixed(2)}\n`, { 
        bold: true, 
        align: 'center',
        size: 'large'
      });
      
      await printer.printSeparator();
      
      // Status
      await printer.printText(`Status: ${pedido.status}\n`, { bold: true });
      
      if (pedido.observacoes_gerais) {
        await printer.printText(`\nObservações:\n${pedido.observacoes_gerais}\n`);
      }
      
      // Rodapé
      await printer.printText('\nObrigado pela preferência!\n', { align: 'center' });
      await printer.feedAndCut();
      
      return true;
    } catch (err) {
      setError('Erro ao imprimir pedido: ' + err.message);
      return false;
    }
  }, [printer, isConnected]);

  // Imprimir recibo de cozinha (versão simplificada)
  const printKitchenReceipt = useCallback(async (pedido) => {
    if (!printer || !isConnected) {
      setError('Impressora não conectada');
      return false;
    }

    try {
      // Cabeçalho da cozinha
      await printer.printText('=== COZINHA ===\n', { align: 'center', bold: true });
      await printer.printText(`PEDIDO #${pedido.id}\n`, { bold: true, size: 'large' });
      await printer.printText(`${new Date(pedido.data_pedido).toLocaleString()}\n`);
      await printer.printSeparator();
      
      // Itens para preparo
      for (const item of pedido.itens) {
        await printer.printText(`${item.quantidade}x ${item.nome_produto}\n`, { bold: true });
        
        if (item.observacoes) {
          await printer.printText(`*** ${item.observacoes} ***\n`);
        }
        await printer.printText('\n');
      }
      
      if (pedido.observacoes_gerais) {
        await printer.printSeparator();
        await printer.printText('OBSERVAÇÕES GERAIS:\n', { bold: true });
        await printer.printText(`${pedido.observacoes_gerais}\n`);
      }
      
      await printer.feedAndCut();
      return true;
    } catch (err) {
      setError('Erro ao imprimir recibo da cozinha: ' + err.message);
      return false;
    }
  }, [printer, isConnected]);

  // Teste de impressão
  const printTest = useCallback(async () => {
    if (!printer || !isConnected) {
      setError('Impressora não conectada');
      return false;
    }

    try {
      await printer.printText('TESTE DE IMPRESSÃO\n', { align: 'center', bold: true });
      await printer.printSeparator();
      await printer.printText('Esta é uma impressão de teste.\n');
      await printer.printText(`Data: ${new Date().toLocaleString()}\n`);
      await printer.printSeparator();
      await printer.printText('Impressora funcionando corretamente!\n', { align: 'center' });
      await printer.feedAndCut();
      return true;
    } catch (err) {
      setError('Erro no teste de impressão: ' + err.message);
      return false;
    }
  }, [printer, isConnected]);

  return {
    // Estados
    isConnected,
    isConnecting,
    connectedDevice,
    error,
    isBluetoothAvailable,
    
    // Funções
    connect,
    disconnect,
    printText,
    printOrder,
    printKitchenReceipt,
    printTest,
    
    // Limpar erro
    clearError: () => setError(null)
  };
};

export default useBluetoothPrinter;