<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // Retornar pedidos de teste
        echo json_encode([
            'status' => 'success',
            'data' => [
                [
                    'id' => 1,
                    'cliente' => 'Cliente Teste',
                    'telefone' => '11999999999',
                    'total' => 25.50,
                    'status' => 'pendente',
                    'criado_em' => date('Y-m-d H:i:s')
                ]
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'message' => "Método $method recebido com sucesso",
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>