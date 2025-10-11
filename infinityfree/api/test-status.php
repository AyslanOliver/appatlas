<?php
require_once '../config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = getConnection();
    
    echo "<h1>Teste de Status de Pedidos</h1>";
    
    // Verificar estrutura da tabela
    echo "<h2>Estrutura da Tabela Pedidos:</h2>";
    $stmt = $pdo->query("DESCRIBE pedidos");
    $columns = $stmt->fetchAll();
    
    echo "<table border='1'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Chave</th><th>Padrão</th><th>Extra</th></tr>";
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>{$column['Field']}</td>";
        echo "<td>{$column['Type']}</td>";
        echo "<td>{$column['Null']}</td>";
        echo "<td>{$column['Key']}</td>";
        echo "<td>{$column['Default']}</td>";
        echo "<td>{$column['Extra']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Listar pedidos existentes
    echo "<h2>Pedidos Existentes:</h2>";
    $stmt = $pdo->query("SELECT id, cliente, status, criado_em FROM pedidos ORDER BY criado_em DESC LIMIT 10");
    $pedidos = $stmt->fetchAll();
    
    if (empty($pedidos)) {
        echo "<p>Nenhum pedido encontrado.</p>";
        
        // Criar um pedido de teste
        echo "<h3>Criando pedido de teste...</h3>";
        $stmt = $pdo->prepare("INSERT INTO pedidos (cliente, telefone, total, status) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Cliente Teste', '11999999999', 25.50, 'pendente']);
        $testPedidoId = $pdo->lastInsertId();
        echo "<p>Pedido de teste criado com ID: $testPedidoId</p>";
        
        // Buscar novamente
        $stmt = $pdo->query("SELECT id, cliente, status, criado_em FROM pedidos ORDER BY criado_em DESC LIMIT 10");
        $pedidos = $stmt->fetchAll();
    }
    
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Cliente</th><th>Status</th><th>Criado em</th></tr>";
    foreach ($pedidos as $pedido) {
        echo "<tr>";
        echo "<td>{$pedido['id']}</td>";
        echo "<td>{$pedido['cliente']}</td>";
        echo "<td>{$pedido['status']}</td>";
        echo "<td>{$pedido['criado_em']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Teste de atualização de status
    if (!empty($pedidos)) {
        $primeiroId = $pedidos[0]['id'];
        $statusAtual = $pedidos[0]['status'];
        
        echo "<h2>Teste de Atualização de Status:</h2>";
        echo "<p>Pedido ID: $primeiroId</p>";
        echo "<p>Status atual: $statusAtual</p>";
        
        // Determinar novo status para teste
        $novosStatus = ['pendente', 'preparo', 'entrega', 'entregue'];
        $indiceAtual = array_search($statusAtual, $novosStatus);
        $novoStatus = $novosStatus[($indiceAtual + 1) % count($novosStatus)];
        
        echo "<p>Tentando alterar para: $novoStatus</p>";
        
        // Atualizar status
        $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
        $resultado = $stmt->execute([$novoStatus, $primeiroId]);
        $linhasAfetadas = $stmt->rowCount();
        
        echo "<p>Resultado da atualização: " . ($resultado ? 'Sucesso' : 'Falha') . "</p>";
        echo "<p>Linhas afetadas: $linhasAfetadas</p>";
        
        // Verificar se foi atualizado
        $stmt = $pdo->prepare("SELECT status FROM pedidos WHERE id = ?");
        $stmt->execute([$primeiroId]);
        $statusDepois = $stmt->fetchColumn();
        
        echo "<p>Status após atualização: $statusDepois</p>";
        echo "<p>Atualização " . ($statusDepois === $novoStatus ? 'FUNCIONOU' : 'FALHOU') . "!</p>";
    }
    
} catch (Exception $e) {
    echo "<h2>Erro:</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    logError('Erro no teste de status', ['error' => $e->getMessage()]);
}
?>