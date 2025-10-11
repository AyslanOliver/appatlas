<?php
require_once '../config.php';

setCorsHeaders();

try {
    $pdo = getConnection();
    
    // Testar conexão com o banco
    $stmt = $pdo->query("SELECT 1");
    $dbStatus = $stmt ? 'Conectado' : 'Erro';
    
    $response = [
        'message' => 'API da Pizzaria Atlas funcionando!',
        'timestamp' => date('Y-m-d H:i:s'),
        'database' => $dbStatus,
        'php_version' => phpversion(),
        'server_info' => [
            'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'N/A',
            'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'N/A',
            'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'N/A'
        ]
    ];
    
    jsonResponse($response);
    
} catch (Exception $e) {
    logError('Erro no teste da API', ['error' => $e->getMessage()]);
    jsonResponse([
        'error' => 'Erro no teste da API',
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ], 500);
}
?>