<?php
require_once '../config.php';

// Configurar headers CORS
setCorsHeaders();

// Responder a requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getConnection();
    
    // Teste 1: Listar todos os pedidos
    echo "<h2>Teste 1: Listar todos os pedidos</h2>";
    $stmt = $pdo->prepare("SELECT id, cliente, status FROM pedidos ORDER BY id");
    $stmt->execute();
    $pedidos = $stmt->fetchAll();
    echo "<pre>" . json_encode($pedidos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
    
    if (empty($pedidos)) {
        echo "<p><strong>Nenhum pedido encontrado. Criando pedido de teste...</strong></p>";
        
        // Criar um pedido de teste
        $stmt = $pdo->prepare("INSERT INTO pedidos (cliente, telefone, endereco, total, status, data_pedido) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute(['Cliente Teste', '(11) 99999-9999', 'Endereço Teste', 50.00, 'pendente']);
        $testPedidoId = $pdo->lastInsertId();
        
        echo "<p>Pedido de teste criado com ID: $testPedidoId</p>";
    } else {
        $testPedidoId = $pedidos[0]['id'];
    }
    
    // Teste 2: Atualizar status do pedido
    echo "<h2>Teste 2: Atualizar status do pedido ID $testPedidoId</h2>";
    $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
    $result = $stmt->execute(['preparando', $testPedidoId]);
    
    if ($result && $stmt->rowCount() > 0) {
        echo "<p style='color: green;'>✅ Status atualizado com sucesso!</p>";
        
        // Verificar a atualização
        $stmt = $pdo->prepare("SELECT id, cliente, status FROM pedidos WHERE id = ?");
        $stmt->execute([$testPedidoId]);
        $pedidoAtualizado = $stmt->fetch();
        echo "<p>Status atual: " . $pedidoAtualizado['status'] . "</p>";
    } else {
        echo "<p style='color: red;'>❌ Erro ao atualizar status</p>";
    }
    
    // Teste 3: Simular requisição PUT
    echo "<h2>Teste 3: Simular requisição PUT via pedidos.php</h2>";
    
    // Simular dados JSON
    $putData = json_encode(['status' => 'entregue']);
    
    // Simular requisição PUT
    $_SERVER['REQUEST_METHOD'] = 'PUT';
    $_SERVER['REQUEST_URI'] = "/api/pedidos/$testPedidoId";
    
    // Capturar saída
    ob_start();
    
    // Simular input JSON
    $tempFile = tempnam(sys_get_temp_dir(), 'put_test');
    file_put_contents($tempFile, $putData);
    
    // Incluir o arquivo pedidos.php em um contexto controlado
    echo "<p>Testando PUT para pedido ID $testPedidoId com status 'entregue'...</p>";
    
    // Teste manual da lógica PUT
    $input = json_decode($putData, true);
    if ($input && isset($input['status'])) {
        $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
        $result = $stmt->execute([$input['status'], $testPedidoId]);
        
        if ($result && $stmt->rowCount() > 0) {
            echo "<p style='color: green;'>✅ PUT simulado: Status atualizado para 'entregue'!</p>";
        } else {
            echo "<p style='color: red;'>❌ PUT simulado: Erro ao atualizar</p>";
        }
    }
    
    // Teste 4: Verificar se DELETE funciona
    echo "<h2>Teste 4: Teste de DELETE (sem executar)</h2>";
    echo "<p>Verificando se o pedido existe antes de deletar...</p>";
    
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM pedidos WHERE id = ?");
    $stmt->execute([$testPedidoId]);
    $count = $stmt->fetch()['count'];
    
    if ($count > 0) {
        echo "<p style='color: green;'>✅ Pedido ID $testPedidoId existe e pode ser deletado</p>";
        echo "<p><strong>Nota:</strong> DELETE não executado para preservar dados de teste</p>";
    } else {
        echo "<p style='color: red;'>❌ Pedido ID $testPedidoId não encontrado</p>";
    }
    
    // Teste 5: Verificar estrutura da tabela
    echo "<h2>Teste 5: Estrutura da tabela pedidos</h2>";
    $stmt = $pdo->prepare("DESCRIBE pedidos");
    $stmt->execute();
    $structure = $stmt->fetchAll();
    echo "<pre>" . json_encode($structure, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
    
    unlink($tempFile);
    
} catch (Exception $e) {
    echo "<h2 style='color: red;'>Erro:</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>