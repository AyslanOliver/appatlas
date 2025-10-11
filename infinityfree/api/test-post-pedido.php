<?php
require_once '../config.php';

// Habilitar exibição de erros para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

setCorsHeaders();

// Log de debug
function debugLog($message, $data = null) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if ($data) {
        $logMessage .= " - " . json_encode($data);
    }
    error_log($logMessage . "\n", 3, '../debug.log');
}

try {
    debugLog("Iniciando teste POST pedido");
    
    $pdo = getConnection();
    debugLog("Conexão com banco estabelecida");
    
    // Simular dados de POST
    $testData = [
        'cliente' => 'Teste Cliente',
        'telefone' => '(11) 99999-9999',
        'endereco' => 'Rua Teste, 123',
        'total' => 50.00,
        'status' => 'pendente',
        'itens' => [
            [
                'nome' => 'Pizza Teste',
                'quantidade' => 1,
                'preco' => 35.00
            ],
            [
                'nome' => 'Coca-Cola',
                'quantidade' => 1,
                'preco' => 8.00
            ]
        ]
    ];
    
    debugLog("Dados de teste preparados", $testData);
    
    $pdo->beginTransaction();
    debugLog("Transação iniciada");
    
    // Inserir pedido
    $stmt = $pdo->prepare("
        INSERT INTO pedidos (cliente, telefone, endereco, total, status) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    debugLog("Query preparada para inserir pedido");
    
    $result = $stmt->execute([
        $testData['cliente'],
        $testData['telefone'],
        $testData['endereco'],
        $testData['total'],
        $testData['status']
    ]);
    
    debugLog("Pedido inserido", ['result' => $result]);
    
    $pedidoId = $pdo->lastInsertId();
    debugLog("ID do pedido criado", ['pedido_id' => $pedidoId]);
    
    // Inserir itens do pedido
    $stmtItem = $pdo->prepare("
        INSERT INTO pedido_itens (pedido_id, nome, quantidade, preco) 
        VALUES (?, ?, ?, ?)
    ");
    
    debugLog("Query preparada para inserir itens");
    
    foreach ($testData['itens'] as $item) {
        $resultItem = $stmtItem->execute([
            $pedidoId,
            $item['nome'],
            $item['quantidade'],
            $item['preco']
        ]);
        debugLog("Item inserido", ['item' => $item, 'result' => $resultItem]);
    }
    
    $pdo->commit();
    debugLog("Transação commitada com sucesso");
    
    $response = [
        'success' => true,
        'message' => 'Pedido criado com sucesso',
        'pedido_id' => $pedidoId,
        'data' => $testData
    ];
    
    debugLog("Resposta preparada", $response);
    
    header('Content-Type: application/json');
    echo json_encode($response);
    
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    
    debugLog("ERRO CAPTURADO", [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>