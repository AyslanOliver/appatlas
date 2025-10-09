import axios from 'axios';

// Configuração da API - função que retorna a URL baseada no ambiente atual
function getApiUrl() {
    console.log('=== DEBUG getApiUrl ===');
    
    // Se estiver rodando no Cordova (protocolo file:), usar a API do InfinityFree
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        console.log('Ambiente detectado: Cordova');
        return 'https://rotaexpress.free.nf'; // URL do seu domínio
    }
    
    // Detectar o ambiente baseado no hostname
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        
        console.log('Hostname:', hostname);
        console.log('Protocol:', protocol);
        console.log('Port:', port);
        
        // Para desenvolvimento local, usar servidor local
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        if (isLocal) {
            console.log('Ambiente detectado: Local');
            const apiUrl = 'http://localhost:3001';
            console.log('URL da API retornada:', apiUrl);
            return apiUrl;
        }
        
        // Se estiver no InfinityFree, usar a API local
        if (hostname.includes('infinityfreeapp.com') || hostname.includes('epizy.com') || hostname === 'rotaexpress.free.nf' || hostname.includes('free.nf')) {
            console.log('Ambiente detectado: InfinityFree');
            console.log('URL da API retornada:', window.location.origin);
            return window.location.origin;
        }
    }
    
    // Fallback para InfinityFree
    console.log('Ambiente detectado: Fallback');
    return 'https://rotaexpress.free.nf'; // URL do seu domínio
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
    console.log('Ambiente detectado:', 
        window.location.protocol === 'file:' ? 'Cordova' : 
        window.location.hostname.includes('infinityfreeapp.com') || window.location.hostname.includes('epizy.com') || window.location.hostname === 'rotaexpress.free.nf' ? 'InfinityFree' : 
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'Local' : 'Outro'
    );
}
console.log('Build timestamp:', new Date().toISOString());

// Função para testar a conexão com a API
export const testarConexao = async () => {
    try {
        const response = await api.get('/api/test');
        return response.data;
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        throw error;
    }
};

// Funções para gerenciamento de produtos
export const getProdutos = async () => {
    try {
        const response = await api.get('/api/produtos');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
    }
};

export const criarProduto = async (dados) => {
    try {
        const response = await api.post('/api/produtos', dados);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
    }
};

export const atualizarProduto = async (id, dados) => {
    try {
        const response = await api.put(`/api/produtos/${id}`, dados);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
};

export const deletarProduto = async (id) => {
    try {
        const response = await api.delete(`/api/produtos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
    }
};

// Funções para gerenciamento de pedidos
export const getPedidos = async () => {
    try {
        const response = await api.get('/api/pedidos');
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
        const response = await api.post('/api/pedidos', pedido);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
    }
};

export const atualizarPedido = async (id, dados) => {
    try {
        const response = await api.put(`/api/pedidos/${id}`, dados);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
    }
};

export const deletarPedido = async (id) => {
    try {
        const response = await api.delete(`/api/pedidos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        throw error;
    }
};

export const deletarTodosPedidos = async () => {
    try {
        const response = await api.delete('/api/pedidos?deleteAll=true');
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar todos os pedidos:', error);
        throw error;
    }
};

export const getCardapio = async (tipo = '') => {
    try {
        const url = tipo ? `/api/cardapio?tipo=${tipo}` : '/api/cardapio';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar cardápio:', error);
        throw error;
    }
};

export default api;