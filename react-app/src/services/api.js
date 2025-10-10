import axios from 'axios';

// Configuração da API - função que retorna a URL baseada no ambiente atual
function getApiUrl() {
    console.log('=== DEBUG getApiUrl ===');
    
    // Detectar o ambiente baseado no hostname
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        console.log('Hostname:', hostname);
        console.log('Protocol:', protocol);
        
        // Para desenvolvimento local, usar servidor local
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        if (isLocal) {
            console.log('Ambiente detectado: Local');
            const apiUrl = 'http://localhost:3001';
            console.log('URL da API retornada:', apiUrl);
            return apiUrl;
        }
    }
    
    // Para todos os outros casos (InfinityFree, Cordova, etc.), usar InfinityFree
    console.log('Ambiente detectado: InfinityFree');
    const apiUrl = 'https://rotaexpress.free.nf';
    console.log('URL da API retornada:', apiUrl);
    return apiUrl;
}

// Configuração do axios
const API_URL = getApiUrl();
const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // Aumentado para InfinityFree
    headers: {
        'Content-Type': 'application/json',
    }
});

// Debug: Log da configuração da API
console.log('API_URL configurado:', API_URL);
if (typeof window !== 'undefined') {
    console.log('Protocolo atual:', window.location.protocol);
    console.log('Hostname atual:', window.location.hostname);
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    console.log('Ambiente detectado:', isLocal ? 'Local' : 'InfinityFree');
}

// Função para testar a conexão com a API
export const testarConexao = async () => {
    try {
        const response = await api.get('/api/test.php');
        return response.data;
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        throw error;
    }
};

// Funções para gerenciamento de produtos
export const getProdutos = async () => {
    try {
        const response = await api.get('/api/produtos.php');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
    }
};

export const criarProduto = async (dados) => {
    try {
        const response = await api.post('/api/produtos.php', dados);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
    }
};

export const atualizarProduto = async (id, dados) => {
    try {
        // Workaround para InfinityFree: usar POST com _method=PUT
        const response = await api.post(`/api/produtos/${id}`, { ...dados, _method: 'PUT' });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
};

export const deletarProduto = async (id) => {
    try {
        // Workaround para InfinityFree: usar POST com _method=DELETE
        const response = await api.post(`/api/produtos/${id}`, { _method: 'DELETE' });
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
    }
};

// Funções para gerenciamento de pedidos
export const getPedidos = async () => {
    try {
        const response = await api.get('/api/pedidos.php');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        throw error;
    }
};

export const getPedidoById = async (id) => {
    try {
        const response = await api.get(`/api/pedidos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        throw error;
    }
};

export const criarPedido = async (pedido) => {
    try {
        const response = await api.post('/api/pedidos.php', pedido);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
    }
};

export const atualizarPedido = async (id, dados) => {
    try {
        // Workaround para InfinityFree: usar POST com _method=PUT
        const response = await api.post(`/api/pedidos/${id}`, { ...dados, _method: 'PUT' });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
    }
};

export const deletarPedido = async (id) => {
    try {
        // Workaround para InfinityFree: usar POST com _method=DELETE
        const response = await api.post(`/api/pedidos/${id}`, { _method: 'DELETE' });
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        throw error;
    }
};

export const deletarTodosPedidos = async () => {
    try {
        // Workaround para InfinityFree: usar POST com _method=DELETE
        const response = await api.post('/api/pedidos', { _method: 'DELETE', deleteAll: 'true' });
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar todos os pedidos:', error);
        throw error;
    }
};

export const getCardapio = async (tipo = '') => {
    try {
        const url = tipo ? `/api/cardapio.php?tipo=${tipo}` : '/api/cardapio.php';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar cardápio:', error);
        throw error;
    }
};

export default api;