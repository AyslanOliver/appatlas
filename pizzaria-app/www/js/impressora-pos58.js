// Módulo para integração com impressora POS58 via Bluetooth
// Detecta automaticamente se está em produção ou desenvolvimento
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : window.location.origin;

class ImpressoraPOS58 {
    constructor() {
        this.device = null;
        this.characteristic = null;
        this.isConnected = false;
        this.serviceUUID = '000018f0-0000-1000-8000-00805f9b34fb'; // UUID padrão para impressoras POS
        this.characteristicUUID = '00002af1-0000-1000-8000-00805f9b34fb';
    }

    // Comandos ESC/POS
    static get COMANDOS() {
        return {
            INIT: new Uint8Array([0x1B, 0x40]),           // Inicializar impressora
            FEED_LINE: new Uint8Array([0x0A]),            // Nova linha
            CUT: new Uint8Array([0x1D, 0x56, 0x00]),      // Cortar papel
            ALIGN_CENTER: new Uint8Array([0x1B, 0x61, 0x01]), // Centralizar
            ALIGN_LEFT: new Uint8Array([0x1B, 0x61, 0x00]),   // Alinhar à esquerda
            BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]),      // Negrito ligado
            BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]),     // Negrito desligado
            SIZE_NORMAL: new Uint8Array([0x1D, 0x21, 0x00]),  // Tamanho normal
            SIZE_DOUBLE: new Uint8Array([0x1D, 0x21, 0x11]),  // Tamanho duplo
        };
    }

    // Verificar se o navegador suporta Web Bluetooth
    static isBluetoothSupported() {
        return 'bluetooth' in navigator;
    }

    // Conectar com a impressora
    async conectar(deviceId = null) {
        try {
            if (!ImpressoraPOS58.isBluetoothSupported()) {
                throw new Error('Web Bluetooth API não suportada neste navegador');
            }

            // Solicitar dispositivo Bluetooth
            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { namePrefix: 'POS' },
                    { namePrefix: 'Printer' },
                    { namePrefix: 'BT' }
                ],
                optionalServices: [this.serviceUUID, 'generic_access']
            });

            console.log('Dispositivo selecionado:', this.device.name);

            // Conectar ao dispositivo
            const server = await this.device.gatt.connect();
            console.log('Conectado ao servidor GATT');

            // Obter serviço
            const service = await server.getPrimaryService(this.serviceUUID);
            console.log('Serviço obtido');

            // Obter característica
            this.characteristic = await service.getCharacteristic(this.characteristicUUID);
            console.log('Característica obtida');

            this.isConnected = true;
            return true;

        } catch (error) {
            console.error('Erro ao conectar com a impressora:', error);
            this.isConnected = false;
            throw error;
        }
    }

    // Desconectar da impressora
    async desconectar() {
        try {
            if (this.device && this.device.gatt.connected) {
                await this.device.gatt.disconnect();
            }
            this.isConnected = false;
            this.device = null;
            this.characteristic = null;
            console.log('Desconectado da impressora');
        } catch (error) {
            console.error('Erro ao desconectar:', error);
        }
    }

    // Enviar dados para a impressora
    async enviarDados(dados) {
        try {
            if (!this.isConnected || !this.characteristic) {
                throw new Error('Impressora não conectada');
            }

            // Converter string para Uint8Array se necessário
            let buffer;
            if (typeof dados === 'string') {
                buffer = new TextEncoder().encode(dados);
            } else if (dados instanceof Uint8Array) {
                buffer = dados;
            } else {
                throw new Error('Tipo de dados inválido');
            }

            // Enviar dados em chunks de 20 bytes (limitação do Bluetooth LE)
            const chunkSize = 20;
            for (let i = 0; i < buffer.length; i += chunkSize) {
                const chunk = buffer.slice(i, i + chunkSize);
                await this.characteristic.writeValue(chunk);
                // Pequeno delay entre chunks
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            return true;
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            throw error;
        }
    }

    // Imprimir texto simples
    async imprimirTexto(texto) {
        try {
            await this.enviarDados(ImpressoraPOS58.COMANDOS.INIT);
            await this.enviarDados(texto);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.FEED_LINE);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.FEED_LINE);
            return true;
        } catch (error) {
            console.error('Erro ao imprimir texto:', error);
            throw error;
        }
    }

    // Imprimir pedido completo
    async imprimirPedido(pedido) {
        try {
            // Inicializar impressora
            await this.enviarDados(ImpressoraPOS58.COMANDOS.INIT);

            // Cabeçalho
            await this.enviarDados(ImpressoraPOS58.COMANDOS.ALIGN_CENTER);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.SIZE_DOUBLE);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.BOLD_ON);
            await this.enviarDados('PIZZARIA ADMIN\n');
            await this.enviarDados(ImpressoraPOS58.COMANDOS.BOLD_OFF);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.SIZE_NORMAL);
            await this.enviarDados('================================\n');

            // Informações do pedido
            await this.enviarDados(ImpressoraPOS58.COMANDOS.ALIGN_LEFT);
            await this.enviarDados(`Pedido: #${pedido.numero || pedido._id}\n`);
            await this.enviarDados(`Data: ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}\n`);
            await this.enviarDados(`Cliente: ${pedido.cliente?.nome || 'N/A'}\n`);
            
            if (pedido.cliente?.telefone) {
                await this.enviarDados(`Telefone: ${pedido.cliente.telefone}\n`);
            }
            
            await this.enviarDados('--------------------------------\n');

            // Itens do pedido
            await this.enviarDados(ImpressoraPOS58.COMANDOS.BOLD_ON);
            await this.enviarDados('ITENS:\n');
            await this.enviarDados(ImpressoraPOS58.COMANDOS.BOLD_OFF);

            let total = 0;
            if (pedido.itens && pedido.itens.length > 0) {
                for (const item of pedido.itens) {
                    const subtotal = (item.preco || 0) * (item.quantidade || 1);
                    total += subtotal;

                    await this.enviarDados(`${item.quantidade}x ${item.nome}\n`);
                    
                    if (item.tamanho) {
                        await this.enviarDados(`   Tamanho: ${item.tamanho}\n`);
                    }
                    
                    if (item.observacoes) {
                        await this.enviarDados(`   Obs: ${item.observacoes}\n`);
                    }
                    
                    await this.enviarDados(`   R$ ${subtotal.toFixed(2)}\n`);
                    await this.enviarDados('--------------------------------\n');
                }
            }

            // Total
            await this.enviarDados(ImpressoraPOS58.COMANDOS.BOLD_ON);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.SIZE_DOUBLE);
            await this.enviarDados(`TOTAL: R$ ${total.toFixed(2)}\n`);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.SIZE_NORMAL);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.BOLD_OFF);

            // Rodapé
            await this.enviarDados('================================\n');
            await this.enviarDados(ImpressoraPOS58.COMANDOS.ALIGN_CENTER);
            await this.enviarDados('Obrigado pela preferencia!\n');
            await this.enviarDados(ImpressoraPOS58.COMANDOS.FEED_LINE);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.FEED_LINE);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.CUT);

            return true;
        } catch (error) {
            console.error('Erro ao imprimir pedido:', error);
            throw error;
        }
    }

    // Teste de impressão
    async testeImpressao() {
        try {
            await this.enviarDados(ImpressoraPOS58.COMANDOS.INIT);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.ALIGN_CENTER);
            await this.enviarDados('TESTE DE IMPRESSORA\n');
            await this.enviarDados('POS58 via Bluetooth\n');
            await this.enviarDados(ImpressoraPOS58.COMANDOS.FEED_LINE);
            await this.enviarDados(ImpressoraPOS58.COMANDOS.CUT);
            return true;
        } catch (error) {
            console.error('Erro no teste de impressão:', error);
            throw error;
        }
    }
}

// Classe para gerenciar a impressão via API (fallback)
class ImpressoraAPI {
    constructor() {
        this.apiUrl = API_URL;
    }

    async imprimirPedido(pedidoId) {
        try {
            const response = await fetch(`${this.apiUrl}/api/impressora`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    acao: 'imprimir_pedido',
                    pedidoId: pedidoId
                })
            });

            if (!response.ok) {
                throw new Error('Erro na API de impressão');
            }

            const resultado = await response.json();
            return resultado;
        } catch (error) {
            console.error('Erro ao imprimir via API:', error);
            throw error;
        }
    }

    async testeImpressao() {
        try {
            const response = await fetch(`${this.apiUrl}/api/impressora`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    acao: 'testar_impressora'
                })
            });

            if (!response.ok) {
                throw new Error('Erro na API de teste');
            }

            const resultado = await response.json();
            return resultado;
        } catch (error) {
            console.error('Erro ao testar via API:', error);
            throw error;
        }
    }
}

// Classe principal para gerenciar impressão
export class GerenciadorImpressao {
    constructor() {
        this.impressoraBluetooth = new ImpressoraPOS58();
        this.impressoraAPI = new ImpressoraAPI();
        this.configuracoes = null;
    }

    async carregarConfiguracoes() {
        try {
            const response = await fetch(`${API_URL}/api/configuracoes`);
            if (response.ok) {
                this.configuracoes = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    async imprimirPedido(pedidoId) {
        await this.carregarConfiguracoes();

        // Verificar se impressão Bluetooth está habilitada
        if (this.configuracoes?.impressora?.bluetooth?.habilitado) {
            try {
                // Tentar impressão via Bluetooth
                if (!this.impressoraBluetooth.isConnected) {
                    await this.impressoraBluetooth.conectar();
                }

                // Buscar dados do pedido
                const response = await fetch(`${API_URL}/api/pedidos`);
                const pedidos = await response.json();
                const pedido = pedidos.find(p => p._id === pedidoId);

                if (pedido) {
                    await this.impressoraBluetooth.imprimirPedido(pedido);
                    return { success: true, metodo: 'bluetooth' };
                }
            } catch (error) {
                console.warn('Falha na impressão Bluetooth, tentando via API:', error);
            }
        }

        // Fallback para impressão via API
        try {
            const resultado = await this.impressoraAPI.imprimirPedido(pedidoId);
            return { success: true, metodo: 'api', ...resultado };
        } catch (error) {
            throw new Error('Falha em todos os métodos de impressão');
        }
    }

    async testeImpressao() {
        await this.carregarConfiguracoes();

        if (this.configuracoes?.impressora?.bluetooth?.habilitado) {
            try {
                if (!this.impressoraBluetooth.isConnected) {
                    await this.impressoraBluetooth.conectar();
                }
                await this.impressoraBluetooth.testeImpressao();
                return { success: true, metodo: 'bluetooth' };
            } catch (error) {
                console.warn('Falha no teste Bluetooth, tentando via API:', error);
            }
        }

        // Fallback para teste via API
        const resultado = await this.impressoraAPI.testeImpressao();
        return { success: true, metodo: 'api', ...resultado };
    }
}

// Exportar classes
export { ImpressoraPOS58, ImpressoraAPI };