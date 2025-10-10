<?php
require_once '../config.php';

// Configurar headers CORS
setCorsHeaders();

// Responder a requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function debugLog($message, $data = null) {
    echo "<p><strong>DEBUG:</strong> $message</p>";
    if ($data !== null) {
        echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
    }
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getConnection();
    
    echo "<h1>Debug PUT e DELETE - Pedidos</h1>";
    
    // Verificar se temos pedidos na base
    debugLog("Verificando pedidos existentes...");
    $stmt = $pdo->prepare("SELECT id, cliente, status FROM pedidos ORDER BY id LIMIT 5");
    $stmt->execute();
    $pedidos = $stmt->fetchAll();
    debugLog("Pedidos encontrados:", $pedidos);
    
    if (empty($pedidos)) {
        debugLog("Criando pedido de teste...");
        $stmt = $pdo->prepare("INSERT INTO pedidos (cliente, telefone, endereco, total, status, data_pedido) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute(['Cliente Debug', '(11) 99999-9999', 'Endereço Debug', 25.50, 'pendente']);
        $testId = $pdo->lastInsertId();
        debugLog("Pedido criado com ID: $testId");
    } else {
        $testId = $pedidos[0]['id'];
        debugLog("Usando pedido existente ID: $testId");
    }
    
    // Teste PUT - Atualizar Status
    echo "<h2>Teste PUT - Atualizar Status</h2>";
    
    debugLog("Testando atualização de status para 'preparando'...");
    
    // Simular dados PUT
    $putData = ['status' => 'preparando'];
    debugLog("Dados PUT:", $putData);
    
    // Executar UPDATE
    $fields = [];
    $values = [];
    
    foreach (['cliente', 'telefone', 'endereco', 'total', 'status'] as $field) {
        if (isset($putData[$field])) {
            $fields[] = "$field = ?";
            $values[] = $putData[$field];
        }
    }
    
    if (!empty($fields)) {
        $values[] = $testId;
        $sql = "UPDATE pedidos SET " . implode(', ', $fields) . " WHERE id = ?";
        debugLog("SQL gerado:", $sql);
        debugLog("Valores:", $values);
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($values);
        $rowCount = $stmt->rowCount();
        
        debugLog("Resultado da execução: " . ($result ? 'true' : 'false'));
        debugLog("Linhas afetadas: $rowCount");
        
        if ($result && $rowCount > 0) {
            echo "<p style='color: green;'>✅ PUT bem-sucedido!</p>";
        } else {
            echo "<p style='color: red;'>❌ PUT falhou</p>";
        }
        
        // Verificar o resultado
        $stmt = $pdo->prepare("SELECT id, cliente, status FROM pedidos WHERE id = ?");
        $stmt->execute([$testId]);
        $pedidoAtualizado = $stmt->fetch();
        debugLog("Pedido após PUT:", $pedidoAtualizado);
    }
    
    // Teste PUT com múltiplos campos
    echo "<h2>Teste PUT - Múltiplos Campos</h2>";
    
    $putDataMultiple = [
        'status' => 'entregue',
        'total' => 30.00
    ];
    debugLog("Dados PUT múltiplos:", $putDataMultiple);
    
    $fields = [];
    $values = [];
    
    foreach (['cliente', 'telefone', 'endereco', 'total', 'status'] as $field) {
        if (isset($putDataMultiple[$field])) {
            $fields[] = "$field = ?";
            $values[] = $putDataMultiple[$field];
        }
    }
    
    if (!empty($fields)) {
        $values[] = $testId;
        $sql = "UPDATE pedidos SET " . implode(', ', $fields) . " WHERE id = ?";
        debugLog("SQL múltiplos campos:", $sql);
        debugLog("Valores múltiplos:", $values);
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($values);
        $rowCount = $stmt->rowCount();
        
        debugLog("Resultado múltiplos: " . ($result ? 'true' : 'false'));
        debugLog("Linhas afetadas múltiplos: $rowCount");
        
        if ($result && $rowCount > 0) {
            echo "<p style='color: green;'>✅ PUT múltiplos campos bem-sucedido!</p>";
        } else {
            echo "<p style='color: red;'>❌ PUT múltiplos campos falhou</p>";
        }
    }
    
    // Teste DELETE (simulado - não vamos deletar realmente)
    echo "<h2>Teste DELETE - Simulado</h2>";
    
    debugLog("Verificando se pedido existe antes de DELETE...");
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM pedidos WHERE id = ?");
    $stmt->execute([$testId]);
    $count = $stmt->fetch()['count'];
    debugLog("Pedidos com ID $testId encontrados: $count");
    
    if ($count > 0) {
        echo "<p style='color: green;'>✅ Pedido existe e pode ser deletado</p>";
        
        // Simular DELETE sem executar
        $sqlDelete = "DELETE FROM pedidos WHERE id = ?";
        debugLog("SQL DELETE que seria executado:", $sqlDelete);
        debugLog("Parâmetro DELETE:", [$testId]);
        
        echo "<p><strong>Nota:</strong> DELETE não executado para preservar dados</p>";
    } else {
        echo "<p style='color: red;'>❌ Pedido não encontrado para DELETE</p>";
    }
    
    // Informações do ambiente
    echo "<h2>Informações do Ambiente</h2>";
    debugLog("REQUEST_METHOD:", $_SERVER['REQUEST_METHOD']);
    debugLog("REQUEST_URI:", $_SERVER['REQUEST_URI']);
    debugLog("PHP Version:", phpversion());
    debugLog("PDO Driver:", $pdo->getAttribute(PDO::ATTR_DRIVER_NAME));
    
} catch (Exception $e) {
    echo "<h2 style='color: red;'>Erro:</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>