// Configuração da API para InfinityFree
// Substitua este arquivo pelo conteúdo de react-app/src/services/api.js

import axios from 'axios';

// Configuração da API para InfinityFree
function getApiUrl() {
    // Se estiver rodando no Cordova (protocolo file:), usar a API do InfinityFree
    if (window.location.protocol === 'file:') {
        return 'https://rotaexpress.free.nf'; // URL do seu domínio
    }
    
    const hostname = window.location.hostname;
    
    // Se estiver no InfinityFree, usar a API local
    if (hostname.includes('infinityfreeapp.com') || hostname.includes('epizy.com')) {
        return window.location.origin;
    }
    
    // Para desenvolvimento local, usar servidor local
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) {
        return 'http://localhost:3001';
    }
    
    // Fallback para InfinityFree
    return 'https://rotaexpress.free.nf'; // URL do seu domínio
}

const API_URL = getApiUrl();

// Configuração do axios
const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // Aumentado para InfinityFree
    headers: {
        'Content-Type': 'application/json',
    }
});

// Debug: Log da configuração da API
console.log('API_URL configurado:', API_URL);
console.log('Protocolo atual:', window.location.protocol);
console.log('Hostname atual:', window.location.hostname);
console.log('Ambiente detectado:', 
    window.location.protocol === 'file:' ? 'Cordova' : 
    window.location.hostname.includes('infinityfreeapp.com') ? 'InfinityFree' : 'Local'
);

// Função para testar a conexão com a API
export const testarConexao = async () => {
    try {
        await api.get('/api/test.php');
        console.log('Conexão com a API InfinityFree estabelecida com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro de conexão:', error);
        throw new Error('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    }
};

// === PRODUTOS ===
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
        const response = await api.put(`/api/produtos.php?id=${id}`, dados);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
};

export const deletarProduto = async (id) => {
    try {
        const response = await api.delete(`/api/produtos.php?id=${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
    }
};

// === PEDIDOS ===
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
        const response = await api.get(`/api/pedidos.php?id=${id}`);
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
        const response = await api.put(`/api/pedidos.php?id=${id}`, dados);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
    }
};

export const deletarPedido = async (id) => {
    try {
        const response = await api.delete(`/api/pedidos.php?id=${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        throw error;
    }
};

export const deletarTodosPedidos = async () => {
    try {
        const response = await api.delete('/api/pedidos.php?deleteAll=true');
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar todos os pedidos:', error);
        throw error;
    }
};

// === CARDÁPIO ===
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

// === CONFIGURAÇÕES ===
export const getConfiguracoes = async () => {
    try {
        const response = await api.get('/api/configuracoes.php');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        throw error;
    }
};

export const atualizarConfiguracoes = async (dados) => {
    try {
        const response = await api.put('/api/configuracoes.php', dados);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        throw error;
    }
};

export default api;