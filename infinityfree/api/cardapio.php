<?php
require_once '../config.php';

setCorsHeaders();

try {
    $pdo = getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method !== 'GET') {
        jsonResponse(['error' => 'Método não permitido'], 405);
    }
    
    // Buscar produtos disponíveis
    $tipo = $_GET['tipo'] ?? null;
    
    $sql = "SELECT * FROM produtos WHERE disponivel = 1";
    $params = [];
    
    if ($tipo) {
        $sql .= " AND tipo = ?";
        $params[] = $tipo;
    }
    
    $sql .= " ORDER BY tipo, nome";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $produtos = $stmt->fetchAll();
    
    // Converter id para string e organizar por tipo
    $cardapioOrganizado = [];
    
    foreach ($produtos as $produto) {
        $produto['id'] = (string)$produto['id'];
        $produto['disponivel'] = (bool)$produto['disponivel'];
        
        if (!isset($cardapioOrganizado[$produto['tipo']])) {
            $cardapioOrganizado[$produto['tipo']] = [];
        }
        
        $cardapioOrganizado[$produto['tipo']][] = $produto;
    }
    
    jsonResponse($cardapioOrganizado);
    
} catch (Exception $e) {
    logError('Erro na API de cardápio', ['error' => $e->getMessage()]);
    jsonResponse(['error' => 'Erro interno do servidor'], 500);
}
?>