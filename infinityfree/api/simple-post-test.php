<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Teste básico de conexão
    require_once '../config.php';
    
    $pdo = getConnection();
    
    // Teste simples de inserção
    $stmt = $pdo->prepare("INSERT INTO pedidos (cliente, telefone, endereco, total, status) VALUES (?, ?, ?, ?, ?)");
    $result = $stmt->execute(['Teste Simples', '123456789', 'Endereço Teste', 25.00, 'pendente']);
    
    $pedidoId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Teste de inserção bem-sucedido',
        'pedido_id' => $pedidoId,
        'result' => $result
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => $e->getFile()
    ]);
}
?>