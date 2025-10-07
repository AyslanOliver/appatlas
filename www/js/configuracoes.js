// Configurações da aplicação
// Detecta automaticamente se está em produção ou desenvolvimento
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : window.location.origin;

class ConfiguracoesManager {
    constructor() {
        this.configuracoes = {};
        this.init();
    }

    async init() {
        await this.carregarConfiguracoes();
        this.setupEventListeners();
        this.preencherFormularios();
    }

    async carregarConfiguracoes() {
        try {
            const response = await fetch(`${API_URL}/api/configuracoes`);
            if (!response.ok) throw new Error('Erro ao carregar configurações');
            this.configuracoes = await response.json();
            console.log('Configurações carregadas:', this.configuracoes);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            this.mostrarAlerta('Erro ao carregar configurações', 'danger');
        }
    }

    preencherFormularios() {
        // Preencher informações da pizzaria
        if (this.configuracoes.pizzaria) {
            document.getElementById('nome-pizzaria').value = this.configuracoes.pizzaria.nome || '';
            document.getElementById('endereco-pizzaria').value = this.configuracoes.pizzaria.endereco || '';
            document.getElementById('telefone-pizzaria').value = this.configuracoes.pizzaria.telefone || '';
            document.getElementById('email-pizzaria').value = this.configuracoes.pizzaria.email || '';
        }

        // Preencher configurações da impressora
        if (this.configuracoes.impressora?.bluetooth) {
            const bluetooth = this.configuracoes.impressora.bluetooth;
            document.getElementById('impressora-habilitada').checked = bluetooth.habilitado || false;
            document.getElementById('nome-impressora').value = bluetooth.nome || 'POS58';
            document.getElementById('dispositivo-bluetooth').value = bluetooth.dispositivo || '';
        }

        // Preencher configurações do sistema
        if (this.configuracoes.sistema) {
            document.getElementById('moeda-sistema').value = this.configuracoes.sistema.moeda || 'R$';
            document.getElementById('timezone-sistema').value = this.configuracoes.sistema.timezone || 'America/Sao_Paulo';
            document.getElementById('idioma-sistema').value = this.configuracoes.sistema.idioma || 'pt-BR';
        }
    }

    setupEventListeners() {
        // Salvar configurações
        document.getElementById('btn-salvar-configuracoes').addEventListener('click', () => {
            this.salvarConfiguracoes();
        });

        // Resetar configurações
        document.getElementById('btn-resetar-configuracoes').addEventListener('click', () => {
            this.resetarConfiguracoes();
        });

        // Testar impressora
        document.getElementById('btn-testar-impressora').addEventListener('click', () => {
            this.testarImpressora();
        });

        // Buscar dispositivos Bluetooth
        document.getElementById('btn-buscar-dispositivos').addEventListener('click', () => {
            this.buscarDispositivosBluetooth();
        });

        // Habilitar/desabilitar campos da impressora
        document.getElementById('impressora-habilitada').addEventListener('change', (e) => {
            this.toggleCamposImpressora(e.target.checked);
        });
    }

    toggleCamposImpressora(habilitado) {
        const campos = ['nome-impressora', 'dispositivo-bluetooth'];
        const botoes = ['btn-testar-impressora', 'btn-buscar-dispositivos'];
        
        campos.forEach(id => {
            document.getElementById(id).disabled = !habilitado;
        });
        
        botoes.forEach(id => {
            document.getElementById(id).disabled = !habilitado;
        });
    }

    async salvarConfiguracoes() {
        try {
            const novasConfiguracoes = {
                pizzaria: {
                    nome: document.getElementById('nome-pizzaria').value,
                    endereco: document.getElementById('endereco-pizzaria').value,
                    telefone: document.getElementById('telefone-pizzaria').value,
                    email: document.getElementById('email-pizzaria').value
                },
                impressora: {
                    bluetooth: {
                        habilitado: document.getElementById('impressora-habilitada').checked,
                        nome: document.getElementById('nome-impressora').value,
                        dispositivo: document.getElementById('dispositivo-bluetooth').value
                    }
                },
                sistema: {
                    moeda: document.getElementById('moeda-sistema').value,
                    timezone: document.getElementById('timezone-sistema').value,
                    idioma: document.getElementById('idioma-sistema').value
                }
            };

            const response = await fetch(`${API_URL}/api/configuracoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novasConfiguracoes)
            });

            if (!response.ok) throw new Error('Erro ao salvar configurações');

            const resultado = await response.json();
            this.configuracoes = resultado.configuracoes;
            
            this.mostrarAlerta('Configurações salvas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            this.mostrarAlerta('Erro ao salvar configurações', 'danger');
        }
    }

    resetarConfiguracoes() {
        if (confirm('Tem certeza que deseja resetar todas as configurações?')) {
            // Limpar formulários
            document.getElementById('form-pizzaria').reset();
            document.getElementById('form-impressora').reset();
            document.getElementById('form-sistema').reset();
            
            // Valores padrão
            document.getElementById('nome-impressora').value = 'POS58';
            document.getElementById('moeda-sistema').value = 'R$';
            document.getElementById('timezone-sistema').value = 'America/Sao_Paulo';
            document.getElementById('idioma-sistema').value = 'pt-BR';
            
            this.mostrarAlerta('Configurações resetadas', 'info');
        }
    }

    async testarImpressora() {
        try {
            const response = await fetch(`${API_URL}/api/impressora`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    acao: 'testar_impressora'
                })
            });

            if (!response.ok) throw new Error('Erro ao testar impressora');

            const resultado = await response.json();
            
            if (resultado.success) {
                this.mostrarAlerta('Teste de impressora enviado com sucesso!', 'success');
                console.log('Comandos de teste:', resultado.comandos);
            } else {
                this.mostrarAlerta('Erro no teste da impressora', 'warning');
            }
        } catch (error) {
            console.error('Erro ao testar impressora:', error);
            this.mostrarAlerta('Erro ao testar impressora', 'danger');
        }
    }

    async buscarDispositivosBluetooth() {
        this.mostrarAlerta('Buscando dispositivos Bluetooth...', 'info');
        
        try {
            // Verificar se o navegador suporta Web Bluetooth API
            if (!navigator.bluetooth) {
                throw new Error('Web Bluetooth API não suportada neste navegador');
            }

            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['generic_access']
            });

            if (device) {
                document.getElementById('dispositivo-bluetooth').value = device.id;
                document.getElementById('nome-impressora').value = device.name || 'POS58';
                this.mostrarAlerta(`Dispositivo encontrado: ${device.name}`, 'success');
            }
        } catch (error) {
            console.error('Erro ao buscar dispositivos:', error);
            
            if (error.name === 'NotFoundError') {
                this.mostrarAlerta('Nenhum dispositivo selecionado', 'warning');
            } else if (error.message.includes('não suportada')) {
                this.mostrarAlerta('Web Bluetooth não suportado. Insira o endereço manualmente.', 'warning');
            } else {
                this.mostrarAlerta('Erro ao buscar dispositivos Bluetooth', 'danger');
            }
        }
    }

    mostrarAlerta(mensagem, tipo = 'info') {
        // Remover alertas existentes
        const alertasExistentes = document.querySelectorAll('.alert-configuracoes');
        alertasExistentes.forEach(alerta => alerta.remove());

        // Criar novo alerta
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show alert-configuracoes`;
        alerta.innerHTML = `
            ${mensagem}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;

        // Inserir no topo da página
        const container = document.querySelector('.container-fluid');
        container.insertBefore(alerta, container.firstChild);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 5000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ConfiguracoesManager();
});