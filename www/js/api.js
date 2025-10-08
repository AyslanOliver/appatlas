// Arquivo para gerenciar as chamadas à API
// Configuração da API
// Detecta automaticamente se está em produção ou desenvolvimento
function getApiUrl() {
    // Se estiver rodando no Cordova (protocolo file:), usar sempre a API do Vercel
    if (window.location.protocol === 'file:') {
        return 'https://pizzaria-app-atlas.vercel.app';
    }
    
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocal) {
        // Em desenvolvimento local, sempre usar porta 3000 para a API
        return 'http://localhost:3000';
    } else {
        // Em produção, usar a mesma origem
        return window.location.origin;
    }
}

const API_URL = getApiUrl();

// Debug: Log da configuração da API
console.log('API_URL configurado:', API_URL);
console.log('Protocolo atual:', window.location.protocol);
console.log('Hostname atual:', window.location.hostname);
console.log('Ambiente detectado:', window.location.protocol === 'file:' ? 'Cordova' : 'Web');

// Função para testar a conexão com a API
async function testarConexao() {
    try {
        const response = await fetch(`${API_URL}/api/produtos`);
        if (!response.ok) throw new Error('Erro ao conectar com a API');
        console.log('Conexão com a API estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    }
}

// Funções para gerenciamento de produtos
export async function getProdutos() {
    try {
        const response = await fetch(`${API_URL}/api/produtos`);
        if (!response.ok) throw new Error('Erro ao buscar produtos');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function criarProduto(tipo, dados) {
    try {
        const response = await fetch(`${API_URL}/api/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tipo, ...dados }),
        });
        if (!response.ok) throw new Error('Erro ao criar produto');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function atualizarProduto(tipo, id, dados) {
    try {
        const response = await fetch(`${API_URL}/api/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tipo, ...dados }),
        });
        if (!response.ok) throw new Error('Erro ao atualizar produto');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function deletarProduto(tipo, id) {
    try {
        const response = await fetch(`${API_URL}/api/produtos/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao deletar produto');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function getPedidos() {
    try {
        const url = `${API_URL}/api/pedidos`;
        console.log('=== DEBUG getPedidos ===');
        console.log('URL da requisição:', url);
        console.log('API_URL base:', API_URL);
        console.log('Protocolo:', window.location.protocol);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            console.error('Erro HTTP:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        console.log('=== FIM DEBUG getPedidos ===');
        return data;
    } catch (error) {
        console.error('=== ERRO getPedidos ===');
        console.error('Erro ao buscar pedidos:', error);
        console.error('Tipo do erro:', error.name);
        console.error('Mensagem:', error.message);
        console.error('=== FIM ERRO ===');
        throw error;
    }
}

export async function getPedidoById(id) {
    try {
        const url = `${API_URL}/api/pedidos/${id}`;
        console.log('getPedidoById - URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) throw new Error(`Erro ao buscar pedido: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('getPedidoById - Erro:', error);
        throw error;
    }
}

export async function criarPedido(pedido) {
    try {
        const response = await fetch(`${API_URL}/api/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedido),
        });
        if (!response.ok) throw new Error('Erro ao criar pedido');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function atualizarPedido(id, dados) {
    try {
        const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });
        if (!response.ok) throw new Error('Erro ao atualizar pedido');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function deletarPedido(id) {
    try {
        const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erro ao deletar pedido');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function getCardapio(tipo = '') {
    try {
        const url = tipo ? `${API_URL}/api/cardapio?tipo=${tipo}` : `${API_URL}/api/cardapio`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao buscar cardápio');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}