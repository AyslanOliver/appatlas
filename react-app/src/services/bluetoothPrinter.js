/**
 * Classe para impressão via Bluetooth em impressoras POS58
 * Funciona tanto em navegadores (Web Bluetooth API) quanto em Android (Cordova)
 */
class BluetoothPrinter {
    constructor() {
        this.device = null;
        this.characteristic = null;
        this.isConnected = false;
        this.isAndroid = this.detectAndroid();
        
        // UUID padrão para impressoras POS (Serial Port Profile)
        this.SERVICE_UUID = '00001101-0000-1000-8000-00805f9b34fb';
        this.CHARACTERISTIC_UUID = '00001101-0000-1000-8000-00805f9b34fb';
    }

    /**
     * Detecta se está rodando em ambiente Android
     */
    detectAndroid() {
        return window.cordova !== undefined || 
               (window.device && window.device.platform === 'Android') ||
               navigator.userAgent.toLowerCase().indexOf('android') > -1;
    }

    /**
     * Verifica se Bluetooth está disponível
     */
    async isBluetoothAvailable() {
        if (this.isAndroid) {
            return new Promise((resolve) => {
                if (window.bluetoothSerial) {
                    window.bluetoothSerial.isEnabled(
                        () => resolve(true),
                        () => resolve(false)
                    );
                } else {
                    resolve(false);
                }
            });
        } else {
            // Web Bluetooth API
            if (!navigator.bluetooth) {
                return false;
            }
            try {
                return await navigator.bluetooth.getAvailability();
            } catch (error) {
                console.error('Erro ao verificar Bluetooth:', error);
                return false;
            }
        }
    }

    /**
     * Solicita permissão e conecta à impressora
     */
    async connect() {
        try {
            if (!await this.isBluetoothAvailable()) {
                throw new Error('Bluetooth não está disponível ou habilitado');
            }

            if (this.isAndroid) {
                return await this.connectAndroid();
            } else {
                return await this.connectWeb();
            }
        } catch (error) {
            console.error('Erro ao conectar:', error);
            throw error;
        }
    }

    /**
     * Conecta via Web Bluetooth API (navegador)
     */
    async connectWeb() {
        try {
            console.log('Conectando via Web Bluetooth...');
            
            // Solicita dispositivo Bluetooth
            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [this.SERVICE_UUID] },
                    { namePrefix: 'POS' },
                    { namePrefix: 'Printer' },
                    { namePrefix: 'BT' }
                ],
                optionalServices: [this.SERVICE_UUID]
            });

            console.log('Dispositivo selecionado:', this.device.name);

            // Conecta ao GATT server
            const server = await this.device.gatt.connect();
            console.log('Conectado ao GATT server');

            // Obtém o serviço
            const service = await server.getPrimaryService(this.SERVICE_UUID);
            console.log('Serviço obtido');

            // Obtém a característica
            this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);
            console.log('Característica obtida');

            this.isConnected = true;
            return { success: true, message: `Conectado à ${this.device.name}` };

        } catch (error) {
            console.error('Erro na conexão Web Bluetooth:', error);
            
            // Tratamento específico para diferentes tipos de erro
            if (error.name === 'NotFoundError' && error.message.includes('User cancelled')) {
                throw new Error('Seleção de dispositivo cancelada pelo usuário');
            } else if (error.name === 'NotFoundError') {
                throw new Error('Nenhuma impressora encontrada. Verifique se está ligada e pareada.');
            } else if (error.name === 'NotAllowedError') {
                throw new Error('Permissão negada. Verifique as configurações do navegador.');
            } else if (error.name === 'NotSupportedError') {
                throw new Error('Bluetooth não suportado neste navegador.');
            } else if (error.name === 'NetworkError') {
                throw new Error('Erro de conexão. Verifique se a impressora está próxima.');
            } else {
                throw new Error(`Erro ao conectar: ${error.message}`);
            }
        }
    }

    /**
     * Conecta via Cordova Bluetooth Serial (Android)
     */
    async connectAndroid() {
        return new Promise((resolve, reject) => {
            console.log('Conectando via Cordova Bluetooth...');

            // Lista dispositivos pareados
            window.bluetoothSerial.list(
                (devices) => {
                    console.log('Dispositivos encontrados:', devices);
                    
                    // Procura por impressoras conhecidas
                    const printer = devices.find(device => 
                        device.name && (
                            device.name.toLowerCase().includes('pos') ||
                            device.name.toLowerCase().includes('printer') ||
                            device.name.toLowerCase().includes('bt')
                        )
                    );

                    if (!printer) {
                        reject(new Error('Nenhuma impressora encontrada. Certifique-se de que a impressora está pareada.'));
                        return;
                    }

                    // Conecta à impressora
                    window.bluetoothSerial.connect(
                        printer.address,
                        () => {
                            console.log('Conectado à impressora:', printer.name);
                            this.device = printer;
                            this.isConnected = true;
                            resolve({ 
                                success: true, 
                                message: `Conectado à ${printer.name}` 
                            });
                        },
                        (error) => {
                            console.error('Erro ao conectar:', error);
                            reject(new Error(`Erro ao conectar à ${printer.name}: ${error}`));
                        }
                    );
                },
                (error) => {
                    console.error('Erro ao listar dispositivos:', error);
                    reject(new Error('Erro ao buscar dispositivos Bluetooth'));
                }
            );
        });
    }

    /**
     * Desconecta da impressora
     */
    async disconnect() {
        try {
            if (!this.isConnected) {
                return { success: true, message: 'Já desconectado' };
            }

            if (this.isAndroid) {
                return new Promise((resolve) => {
                    window.bluetoothSerial.disconnect(
                        () => {
                            this.isConnected = false;
                            this.device = null;
                            resolve({ success: true, message: 'Desconectado com sucesso' });
                        },
                        (error) => {
                            console.error('Erro ao desconectar:', error);
                            resolve({ success: false, message: 'Erro ao desconectar' });
                        }
                    );
                });
            } else {
                if (this.device && this.device.gatt.connected) {
                    this.device.gatt.disconnect();
                }
                this.isConnected = false;
                this.device = null;
                this.characteristic = null;
                return { success: true, message: 'Desconectado com sucesso' };
            }
        } catch (error) {
            console.error('Erro ao desconectar:', error);
            return { success: false, message: 'Erro ao desconectar' };
        }
    }

    /**
     * Envia dados para a impressora
     */
    async sendData(data) {
        if (!this.isConnected) {
            throw new Error('Impressora não conectada');
        }

        try {
            if (this.isAndroid) {
                return await this.sendDataAndroid(data);
            } else {
                return await this.sendDataWeb(data);
            }
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            throw error;
        }
    }

    /**
     * Envia dados via Web Bluetooth
     */
    async sendDataWeb(data) {
        try {
            const encoder = new TextEncoder();
            const dataArray = encoder.encode(data);
            await this.characteristic.writeValue(dataArray);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar dados via Web Bluetooth:', error);
            throw new Error(`Erro ao imprimir: ${error.message}`);
        }
    }

    /**
     * Envia dados via Cordova Bluetooth
     */
    async sendDataAndroid(data) {
        return new Promise((resolve, reject) => {
            window.bluetoothSerial.write(
                data,
                () => {
                    resolve({ success: true });
                },
                (error) => {
                    console.error('Erro ao enviar dados via Cordova:', error);
                    reject(new Error(`Erro ao imprimir: ${error}`));
                }
            );
        });
    }

    /**
     * Comandos ESC/POS para impressora POS58
     */
    getESCPOSCommands() {
        return {
            // Comandos básicos
            ESC: '\x1B',
            GS: '\x1D',
            
            // Inicialização
            INIT: '\x1B\x40',
            
            // Alimentação de papel
            LF: '\x0A',
            CR: '\x0D',
            FF: '\x0C',
            
            // Corte de papel
            CUT: '\x1D\x56\x00',
            PARTIAL_CUT: '\x1D\x56\x01',
            
            // Alinhamento
            ALIGN_LEFT: '\x1B\x61\x00',
            ALIGN_CENTER: '\x1B\x61\x01',
            ALIGN_RIGHT: '\x1B\x61\x02',
            
            // Formatação de texto
            BOLD_ON: '\x1B\x45\x01',
            BOLD_OFF: '\x1B\x45\x00',
            UNDERLINE_ON: '\x1B\x2D\x01',
            UNDERLINE_OFF: '\x1B\x2D\x00',
            
            // Tamanho da fonte
            FONT_SIZE_NORMAL: '\x1D\x21\x00',
            FONT_SIZE_DOUBLE_HEIGHT: '\x1D\x21\x01',
            FONT_SIZE_DOUBLE_WIDTH: '\x1D\x21\x10',
            FONT_SIZE_DOUBLE: '\x1D\x21\x11',
            
            // Densidade
            DENSITY_0: '\x1D\x7C\x00',
            DENSITY_1: '\x1D\x7C\x01',
            DENSITY_2: '\x1D\x7C\x02',
            DENSITY_3: '\x1D\x7C\x03',
            DENSITY_4: '\x1D\x7C\x04',
            DENSITY_5: '\x1D\x7C\x05',
            DENSITY_6: '\x1D\x7C\x06',
            DENSITY_7: '\x1D\x7C\x07'
        };
    }

    /**
     * Imprime texto simples
     */
    async printText(text, options = {}) {
        const commands = this.getESCPOSCommands();
        let output = commands.INIT;

        // Aplicar formatação
        if (options.align === 'center') output += commands.ALIGN_CENTER;
        else if (options.align === 'right') output += commands.ALIGN_RIGHT;
        else output += commands.ALIGN_LEFT;

        if (options.bold) output += commands.BOLD_ON;
        if (options.underline) output += commands.UNDERLINE_ON;

        if (options.fontSize === 'large') output += commands.FONT_SIZE_DOUBLE;
        else if (options.fontSize === 'medium') output += commands.FONT_SIZE_DOUBLE_HEIGHT;
        else output += commands.FONT_SIZE_NORMAL;

        // Adicionar texto
        output += text;

        // Resetar formatação
        if (options.bold) output += commands.BOLD_OFF;
        if (options.underline) output += commands.UNDERLINE_OFF;
        output += commands.FONT_SIZE_NORMAL;
        output += commands.ALIGN_LEFT;

        // Quebra de linha
        if (options.newLine !== false) output += commands.LF;

        return await this.sendData(output);
    }

    /**
     * Imprime linha separadora
     */
    async printSeparator(char = '-', length = 32) {
        const separator = char.repeat(length);
        return await this.printText(separator, { align: 'center' });
    }

    /**
     * Alimenta papel e corta
     */
    async feedAndCut(lines = 3) {
        const commands = this.getESCPOSCommands();
        let output = commands.LF.repeat(lines) + commands.CUT;
        return await this.sendData(output);
    }
}

export default BluetoothPrinter;