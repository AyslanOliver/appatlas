import axios from 'axios';

// Configuração da API
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

// Configuração do axios
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Debug: Log da configuração da API
console.log('API_URL configurado:', API_URL);
console.log('Protocolo atual:', window.location.protocol);
console.log('Hostname atual:', window.location.hostname);
console.log('Ambiente detectado:', window.location.protocol === 'file:' ? 'Cordova' : 'Web');

// Função para testar a conexão com a API
export const testarConexao = async () => {
    try {
        await api.get('/api/produtos');
        console.log('Conexão com a API estabelecida com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro de conexão:', error);
        throw new Error('Erro ao conectar com o servidor. Verifique se a API está rodando.');
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