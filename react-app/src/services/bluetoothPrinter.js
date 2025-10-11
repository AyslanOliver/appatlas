/**
 * Serviço de Impressão Bluetooth para Impressoras Térmicas
 * Baseado na Web Bluetooth API para dispositivos Android
 */

class BluetoothPrinterService {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isConnected = false;
    this.autoReconnect = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // UUIDs comuns para impressoras térmicas ESC/POS
    this.serviceUUIDs = [
      '000018f0-0000-1000-8000-00805f9b34fb', // Nordic UART Service
      '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip Data Service
      '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service Alternative
      'serial_port' // Fallback para porta serial
    ];
    
    this.characteristicUUIDs = [
      '000018f1-0000-1000-8000-00805f9b34fb', // Nordic UART TX
      '49535343-1e4d-4bd9-ba61-23c647249616', // Microchip Data TX
      '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART TX Alternative
    ];

    // Configurações da impressora
    this.printerConfig = {
      width: 48, // Largura em caracteres (58mm = 48 chars)
      encoding: 'utf-8',
      language: 'esc-pos'
    };

    // Event listeners
    this.eventListeners = {
      connected: [],
      disconnected: [],
      error: [],
      printing: []
    };
  }

  /**
   * Verifica se o navegador suporta Web Bluetooth
   */
  isBluetoothSupported() {
    if (!navigator.bluetooth) {
      console.error('Web Bluetooth não é suportado neste navegador');
      return false;
    }
    return true;
  }

  /**
   * Conecta à impressora Bluetooth
   */
  async connect() {
    if (!this.isBluetoothSupported()) {
      throw new Error('Bluetooth não suportado neste dispositivo');
    }

    try {
      console.log('Procurando impressoras Bluetooth...');
      
      // Solicita dispositivo Bluetooth
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: this.serviceUUIDs },
          { namePrefix: 'POS' },
          { namePrefix: 'Printer' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'ESC' }
        ],
        optionalServices: this.serviceUUIDs
      });

      console.log('Dispositivo selecionado:', this.device.name);

      // Conecta ao servidor GATT
      this.server = await this.device.gatt.connect();
      console.log('Conectado ao servidor GATT');

      // Procura pelo serviço de impressão
      await this.findPrintService();

      // Configura eventos de desconexão
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      this.emit('connected', {
        name: this.device.name,
        id: this.device.id,
        language: this.printerConfig.language
      });

      console.log('Impressora conectada com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao conectar à impressora:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Procura pelo serviço de impressão na impressora
   */
  async findPrintService() {
    for (const serviceUUID of this.serviceUUIDs) {
      try {
        this.service = await this.server.getPrimaryService(serviceUUID);
        console.log('Serviço encontrado:', serviceUUID);
        
        // Procura pela característica de escrita
        for (const charUUID of this.characteristicUUIDs) {
          try {
            this.characteristic = await this.service.getCharacteristic(charUUID);
            console.log('Característica encontrada:', charUUID);
            return;
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    throw new Error('Serviço de impressão não encontrado na impressora');
  }

  /**
   * Reconecta automaticamente à impressora
   */
  async reconnect() {
    if (!this.device || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return false;
    }

    try {
      this.reconnectAttempts++;
      console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      this.server = await this.device.gatt.connect();
      await this.findPrintService();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      this.emit('connected', {
        name: this.device.name,
        id: this.device.id,
        language: this.printerConfig.language
      });

      return true;
    } catch (error) {
      console.error('Erro na reconexão:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.reconnect(), 2000);
      }
      
      return false;
    }
  }

  /**
   * Desconecta da impressora
   */
  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
  }

  /**
   * Evento de desconexão
   */
  onDisconnected() {
    console.log('Impressora desconectada');
    this.isConnected = false;
    this.emit('disconnected');
    
    if (this.autoReconnect) {
      setTimeout(() => this.reconnect(), 1000);
    }
  }

  /**
   * Envia dados para a impressora
   */
  async sendData(data) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Impressora não conectada');
    }

    try {
      // Converte string para Uint8Array se necessário
      let bytes;
      if (typeof data === 'string') {
        bytes = new TextEncoder().encode(data);
      } else if (data instanceof Array) {
        bytes = new Uint8Array(data);
      } else {
        bytes = data;
      }

      // Envia dados em chunks de 20 bytes (limitação BLE)
      const chunkSize = 20;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        
        // Pequeno delay entre chunks
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Comandos ESC/POS básicos
   */
  getESCPOSCommands() {
    return {
      // Comandos de inicialização
      INIT: [0x1B, 0x40], // ESC @
      
      // Comandos de texto
      BOLD_ON: [0x1B, 0x45, 0x01], // ESC E 1
      BOLD_OFF: [0x1B, 0x45, 0x00], // ESC E 0
      UNDERLINE_ON: [0x1B, 0x2D, 0x01], // ESC - 1
      UNDERLINE_OFF: [0x1B, 0x2D, 0x00], // ESC - 0
      
      // Comandos de alinhamento
      ALIGN_LEFT: [0x1B, 0x61, 0x00], // ESC a 0
      ALIGN_CENTER: [0x1B, 0x61, 0x01], // ESC a 1
      ALIGN_RIGHT: [0x1B, 0x61, 0x02], // ESC a 2
      
      // Comandos de tamanho
      SIZE_NORMAL: [0x1B, 0x21, 0x00], // ESC ! 0
      SIZE_DOUBLE_HEIGHT: [0x1B, 0x21, 0x10], // ESC ! 16
      SIZE_DOUBLE_WIDTH: [0x1B, 0x21, 0x20], // ESC ! 32
      SIZE_DOUBLE: [0x1B, 0x21, 0x30], // ESC ! 48
      
      // Comandos de linha
      NEWLINE: [0x0A], // LF
      FEED_LINE: [0x1B, 0x64, 0x01], // ESC d 1
      
      // Comandos de corte
      CUT_FULL: [0x1D, 0x56, 0x00], // GS V 0
      CUT_PARTIAL: [0x1D, 0x56, 0x01], // GS V 1
      
      // Comandos de gaveta
      OPEN_DRAWER: [0x1B, 0x70, 0x00, 0x19, 0xFA] // ESC p 0 25 250
    };
  }

  /**
   * Formata comanda para impressão térmica
   */
  formatOrderReceipt(pedido) {
    const commands = this.getESCPOSCommands();
    let receipt = [];

    // Inicializar impressora
    receipt.push(...commands.INIT);
    
    // Cabeçalho centralizado
    receipt.push(...commands.ALIGN_CENTER);
    receipt.push(...commands.SIZE_DOUBLE);
    receipt.push(...commands.BOLD_ON);
    receipt.push(...new TextEncoder().encode('ROTA EXPRESS'));
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.BOLD_OFF);
    receipt.push(...commands.SIZE_NORMAL);
    
    // Linha separadora
    receipt.push(...new TextEncoder().encode('================================'));
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.NEWLINE);
    
    // Informações do pedido
    receipt.push(...commands.ALIGN_LEFT);
    receipt.push(...commands.BOLD_ON);
    receipt.push(...new TextEncoder().encode(`PEDIDO #${pedido.id}`));
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.BOLD_OFF);
    
    // Data e hora
    const dataHora = new Date(pedido.data_pedido).toLocaleString('pt-BR');
    receipt.push(...new TextEncoder().encode(`Data: ${dataHora}`));
    receipt.push(...commands.NEWLINE);
    
    // Cliente
    if (pedido.cliente_nome) {
      receipt.push(...new TextEncoder().encode(`Cliente: ${pedido.cliente_nome}`));
      receipt.push(...commands.NEWLINE);
    }
    
    // Telefone
    if (pedido.cliente_telefone) {
      receipt.push(...new TextEncoder().encode(`Tel: ${pedido.cliente_telefone}`));
      receipt.push(...commands.NEWLINE);
    }
    
    // Endereço
    if (pedido.endereco_entrega) {
      receipt.push(...new TextEncoder().encode(`Endereço: ${pedido.endereco_entrega}`));
      receipt.push(...commands.NEWLINE);
    }
    
    receipt.push(...commands.NEWLINE);
    
    // Linha separadora
    receipt.push(...new TextEncoder().encode('--------------------------------'));
    receipt.push(...commands.NEWLINE);
    
    // Itens do pedido
    receipt.push(...commands.BOLD_ON);
    receipt.push(...new TextEncoder().encode('ITENS:'));
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.BOLD_OFF);
    
    if (pedido.itens && pedido.itens.length > 0) {
      pedido.itens.forEach(item => {
        // Nome do produto
        receipt.push(...new TextEncoder().encode(`${item.quantidade}x ${item.produto_nome}`));
        receipt.push(...commands.NEWLINE);
        
        // Preço
        const preco = parseFloat(item.preco_unitario || 0).toFixed(2);
        receipt.push(...new TextEncoder().encode(`   R$ ${preco} cada`));
        receipt.push(...commands.NEWLINE);
        
        // Observações
        if (item.observacoes) {
          receipt.push(...new TextEncoder().encode(`   Obs: ${item.observacoes}`));
          receipt.push(...commands.NEWLINE);
        }
        
        receipt.push(...commands.NEWLINE);
      });
    }
    
    // Linha separadora
    receipt.push(...new TextEncoder().encode('--------------------------------'));
    receipt.push(...commands.NEWLINE);
    
    // Total
    receipt.push(...commands.ALIGN_RIGHT);
    receipt.push(...commands.SIZE_DOUBLE_HEIGHT);
    receipt.push(...commands.BOLD_ON);
    const total = parseFloat(pedido.valor_total || 0).toFixed(2);
    receipt.push(...new TextEncoder().encode(`TOTAL: R$ ${total}`));
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.BOLD_OFF);
    receipt.push(...commands.SIZE_NORMAL);
    
    // Observações gerais
    if (pedido.observacoes) {
      receipt.push(...commands.ALIGN_LEFT);
      receipt.push(...commands.NEWLINE);
      receipt.push(...commands.BOLD_ON);
      receipt.push(...new TextEncoder().encode('OBSERVAÇÕES:'));
      receipt.push(...commands.NEWLINE);
      receipt.push(...commands.BOLD_OFF);
      receipt.push(...new TextEncoder().encode(pedido.observacoes));
      receipt.push(...commands.NEWLINE);
    }
    
    // Rodapé
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.ALIGN_CENTER);
    receipt.push(...new TextEncoder().encode('Obrigado pela preferência!'));
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.NEWLINE);
    receipt.push(...commands.NEWLINE);
    
    // Cortar papel
    receipt.push(...commands.CUT_PARTIAL);
    
    return new Uint8Array(receipt);
  }

  /**
   * Imprime comanda do pedido
   */
  async printOrder(pedido) {
    try {
      if (!this.isConnected) {
        throw new Error('Impressora não conectada');
      }

      this.emit('printing', { status: 'iniciando', pedido: pedido.id });
      
      const receiptData = this.formatOrderReceipt(pedido);
      await this.sendData(receiptData);
      
      this.emit('printing', { status: 'concluido', pedido: pedido.id });
      
      console.log(`Comanda do pedido #${pedido.id} impressa com sucesso`);
      return true;
      
    } catch (error) {
      console.error('Erro ao imprimir comanda:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Imprime teste de conexão
   */
  async printTest() {
    try {
      if (!this.isConnected) {
        throw new Error('Impressora não conectada');
      }

      const commands = this.getESCPOSCommands();
      let testData = [];
      
      testData.push(...commands.INIT);
      testData.push(...commands.ALIGN_CENTER);
      testData.push(...commands.SIZE_DOUBLE);
      testData.push(...commands.BOLD_ON);
      testData.push(...new TextEncoder().encode('TESTE DE IMPRESSÃO'));
      testData.push(...commands.NEWLINE);
      testData.push(...commands.BOLD_OFF);
      testData.push(...commands.SIZE_NORMAL);
      testData.push(...commands.NEWLINE);
      testData.push(...new TextEncoder().encode('Impressora conectada com sucesso!'));
      testData.push(...commands.NEWLINE);
      testData.push(...new TextEncoder().encode(new Date().toLocaleString('pt-BR')));
      testData.push(...commands.NEWLINE);
      testData.push(...commands.NEWLINE);
      testData.push(...commands.CUT_PARTIAL);
      
      await this.sendData(new Uint8Array(testData));
      
      console.log('Teste de impressão realizado com sucesso');
      return true;
      
    } catch (error) {
      console.error('Erro no teste de impressão:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Adiciona event listener
   */
  addEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(callback);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Emite evento
   */
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Verifica status da conexão
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      deviceName: this.device?.name || null,
      deviceId: this.device?.id || null,
      autoReconnect: this.autoReconnect,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Instância singleton
const bluetoothPrinter = new BluetoothPrinterService();

export default bluetoothPrinter;