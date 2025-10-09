// Serviço de Impressão Bluetooth para Cordova
class BluetoothPrinterService {
    constructor() {
        this.isConnected = false;
        this.connectedDevice = null;
        this.bluetoothSerial = null;
        this.isCordova = false;
        
        // Verificar se está rodando no Cordova
        this.isCordova = !!(window.cordova || window.PhoneGap || window.phonegap);
        
        if (this.isCordova) {
            // Inicializar quando o dispositivo estiver pronto
            document.addEventListener('deviceready', () => {
                this.bluetoothSerial = window.bluetoothSerial;
                console.log('Bluetooth Serial inicializado');
            });
        } else {
            console.log('Executando no navegador - funcionalidades Bluetooth simuladas');
        }
    }

    // Verificar se Bluetooth está disponível
    isBluetoothAvailable() {
        return new Promise((resolve, reject) => {
            if (!this.isCordova) {
                // Simular disponibilidade no navegador
                resolve(true);
                return;
            }

            if (!this.bluetoothSerial) {
                reject(new Error('Plugin Bluetooth não disponível'));
                return;
            }

            this.bluetoothSerial.isEnabled(
                () => resolve(true),
                () => reject(new Error('Bluetooth não está habilitado'))
            );
        });
    }

    // Habilitar Bluetooth
    enableBluetooth() {
        return new Promise((resolve, reject) => {
            if (!this.isCordova) {
                // Simular habilitação no navegador
                resolve(true);
                return;
            }

            if (!this.bluetoothSerial) {
                reject(new Error('Plugin Bluetooth não disponível'));
                return;
            }

            this.bluetoothSerial.enable(
                () => resolve(true),
                (error) => reject(new Error('Erro ao habilitar Bluetooth: ' + error))
            );
        });
    }

    // Listar dispositivos pareados
    listPairedDevices() {
        return new Promise((resolve, reject) => {
            if (!this.isCordova) {
                // Simular dispositivos no navegador
                const mockDevices = [
                    { id: 'mock-printer-1', name: 'Impressora Térmica 1', address: '00:11:22:33:44:55' },
                    { id: 'mock-printer-2', name: 'Impressora Térmica 2', address: '00:11:22:33:44:66' }
                ];
                resolve(mockDevices);
                return;
            }

            if (!this.bluetoothSerial) {
                reject(new Error('Plugin Bluetooth não disponível'));
                return;
            }

            this.bluetoothSerial.list(
                (devices) => {
                    console.log('Dispositivos pareados:', devices);
                    resolve(devices);
                },
                (error) => reject(new Error('Erro ao listar dispositivos: ' + error))
            );
        });
    }

    // Conectar a um dispositivo
    connect(deviceId) {
        return new Promise((resolve, reject) => {
            if (!this.isCordova) {
                // Simular conexão no navegador
                this.isConnected = true;
                this.connectedDevice = deviceId;
                resolve(true);
                return;
            }

            if (!this.bluetoothSerial) {
                reject(new Error('Plugin Bluetooth não disponível'));
                return;
            }

            this.bluetoothSerial.connect(
                deviceId,
                () => {
                    this.isConnected = true;
                    this.connectedDevice = deviceId;
                    console.log('Conectado ao dispositivo:', deviceId);
                    resolve(true);
                },
                (error) => {
                    this.isConnected = false;
                    this.connectedDevice = null;
                    reject(new Error('Erro ao conectar: ' + error));
                }
            );
        });
    }

    // Desconectar
    disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.isCordova) {
                // Simular desconexão no navegador
                this.isConnected = false;
                this.connectedDevice = null;
                resolve(true);
                return;
            }

            if (!this.bluetoothSerial) {
                reject(new Error('Plugin Bluetooth não disponível'));
                return;
            }

            this.bluetoothSerial.disconnect(
                () => {
                    this.isConnected = false;
                    this.connectedDevice = null;
                    console.log('Desconectado');
                    resolve(true);
                },
                (error) => reject(new Error('Erro ao desconectar: ' + error))
            );
        });
    }

    // Enviar dados para impressora
    print(data) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Não conectado a nenhuma impressora'));
                return;
            }

            if (!this.isCordova) {
                // Simular impressão no navegador
                console.log('Simulando impressão:', data);
                resolve(true);
                return;
            }

            if (!this.bluetoothSerial) {
                reject(new Error('Plugin Bluetooth não disponível'));
                return;
            }

            this.bluetoothSerial.write(
                data,
                () => {
                    console.log('Dados enviados para impressora');
                    resolve(true);
                },
                (error) => reject(new Error('Erro ao imprimir: ' + error))
            );
        });
    }

    // Comandos ESC/POS para impressoras térmicas
    getESCPOSCommands() {
        return {
            // Comandos básicos
            INIT: '\x1B\x40',           // Inicializar impressora
            LF: '\x0A',                 // Line Feed
            CR: '\x0D',                 // Carriage Return
            CUT: '\x1D\x56\x00',        // Cortar papel
            
            // Formatação de texto
            BOLD_ON: '\x1B\x45\x01',    // Negrito ligado
            BOLD_OFF: '\x1B\x45\x00',   // Negrito desligado
            UNDERLINE_ON: '\x1B\x2D\x01', // Sublinhado ligado
            UNDERLINE_OFF: '\x1B\x2D\x00', // Sublinhado desligado
            
            // Alinhamento
            ALIGN_LEFT: '\x1B\x61\x00',   // Alinhar à esquerda
            ALIGN_CENTER: '\x1B\x61\x01', // Centralizar
            ALIGN_RIGHT: '\x1B\x61\x02',  // Alinhar à direita
            
            // Tamanho da fonte
            FONT_NORMAL: '\x1B\x21\x00',  // Fonte normal
            FONT_DOUBLE_HEIGHT: '\x1B\x21\x10', // Altura dupla
            FONT_DOUBLE_WIDTH: '\x1B\x21\x20',  // Largura dupla
            FONT_DOUBLE: '\x1B\x21\x30',        // Altura e largura dupla
        };
    }

    // Formatar cupom de pedido
    formatOrderReceipt(pedido) {
        const cmd = this.getESCPOSCommands();
        let receipt = '';

        // Inicializar impressora
        receipt += cmd.INIT;
        
        // Cabeçalho
        receipt += cmd.ALIGN_CENTER;
        receipt += cmd.FONT_DOUBLE;
        receipt += cmd.BOLD_ON;
        receipt += 'PIZZARIA ATLAS\n';
        receipt += cmd.BOLD_OFF;
        receipt += cmd.FONT_NORMAL;
        receipt += 'Rua das Pizzas, 123\n';
        receipt += 'Tel: (11) 99999-9999\n';
        receipt += cmd.LF;

        // Linha separadora
        receipt += cmd.ALIGN_LEFT;
        receipt += '================================\n';
        
        // Informações do pedido
        receipt += cmd.BOLD_ON;
        receipt += `PEDIDO #${pedido.id || 'N/A'}\n`;
        receipt += cmd.BOLD_OFF;
        receipt += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
        receipt += `Cliente: ${pedido.cliente || 'Balcão'}\n`;
        if (pedido.telefone) {
            receipt += `Telefone: ${pedido.telefone}\n`;
        }
        receipt += cmd.LF;

        // Itens do pedido
        receipt += cmd.BOLD_ON;
        receipt += 'ITENS:\n';
        receipt += cmd.BOLD_OFF;
        receipt += '--------------------------------\n';

        let total = 0;
        if (pedido.itens && pedido.itens.length > 0) {
            pedido.itens.forEach(item => {
                const subtotal = (item.preco || 0) * (item.quantidade || 1);
                total += subtotal;
                
                receipt += `${item.nome || 'Item'}\n`;
                receipt += `  ${item.quantidade || 1}x R$ ${(item.preco || 0).toFixed(2)} = R$ ${subtotal.toFixed(2)}\n`;
                
                if (item.observacoes) {
                    receipt += `  Obs: ${item.observacoes}\n`;
                }
                receipt += cmd.LF;
            });
        }

        // Total
        receipt += '--------------------------------\n';
        receipt += cmd.FONT_DOUBLE_HEIGHT;
        receipt += cmd.BOLD_ON;
        receipt += cmd.ALIGN_RIGHT;
        receipt += `TOTAL: R$ ${total.toFixed(2)}\n`;
        receipt += cmd.BOLD_OFF;
        receipt += cmd.FONT_NORMAL;
        receipt += cmd.ALIGN_LEFT;

        // Observações gerais
        if (pedido.observacoes) {
            receipt += cmd.LF;
            receipt += cmd.BOLD_ON;
            receipt += 'OBSERVAÇÕES:\n';
            receipt += cmd.BOLD_OFF;
            receipt += pedido.observacoes + '\n';
        }

        // Rodapé
        receipt += cmd.LF;
        receipt += cmd.ALIGN_CENTER;
        receipt += 'Obrigado pela preferência!\n';
        receipt += 'Volte sempre!\n';
        receipt += cmd.LF + cmd.LF;

        // Cortar papel
        receipt += cmd.CUT;

        return receipt;
    }

    // Imprimir pedido
    async printOrder(pedido) {
        try {
            if (!this.isConnected) {
                throw new Error('Impressora não conectada');
            }

            const receipt = this.formatOrderReceipt(pedido);
            await this.print(receipt);
            
            console.log('Pedido impresso com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao imprimir pedido:', error);
            throw error;
        }
    }

    // Teste de impressão
    async printTest() {
        try {
            if (!this.isConnected) {
                throw new Error('Impressora não conectada');
            }

            const cmd = this.getESCPOSCommands();
            let testPrint = '';
            
            testPrint += cmd.INIT;
            testPrint += cmd.ALIGN_CENTER;
            testPrint += cmd.FONT_DOUBLE;
            testPrint += cmd.BOLD_ON;
            testPrint += 'TESTE DE IMPRESSÃO\n';
            testPrint += cmd.BOLD_OFF;
            testPrint += cmd.FONT_NORMAL;
            testPrint += cmd.LF;
            testPrint += 'Impressora funcionando!\n';
            testPrint += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
            testPrint += cmd.LF + cmd.LF;
            testPrint += cmd.CUT;

            await this.print(testPrint);
            console.log('Teste de impressão realizado');
            return true;
        } catch (error) {
            console.error('Erro no teste de impressão:', error);
            throw error;
        }
    }
}

// Instância singleton
const bluetoothPrinter = new BluetoothPrinterService();

export default bluetoothPrinter;