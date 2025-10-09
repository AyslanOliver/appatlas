// Configuração da API para InfinityFree
const API_CONFIG = {
    // URL da API para rotaexpress.free.nf
    API_URL: 'https://rotaexpress.free.nf/api',
    
    ENDPOINTS: {
        PEDIDOS: '/pedidos.php',
        PRODUTOS: '/produtos.php',
        CARDAPIO: '/cardapio.php',
        CONFIGURACOES: '/configuracoes.php',
        TEST: '/test.php'
    }
};

// Função helper para obter URL completa da API
function getInfinityFreeApiUrl(endpoint) {
    return API_CONFIG.API_URL + (API_CONFIG.ENDPOINTS[endpoint] || endpoint);
}

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, getInfinityFreeApiUrl };
}