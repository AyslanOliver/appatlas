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
    // Verificar se o config.php existe
    if (!file_exists('../config.php')) {
        throw new Exception('Arquivo config.php não encontrado');
    }
    
    require_once '../config.php';
    
    // Testar conexão
    $pdo = getConnection();
    
    // Testar se as tabelas existem
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    
    // Testar consulta simples na tabela pedidos
    $pedidosCount = 0;
    if (in_array('pedidos', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM pedidos");
        $pedidosCount = $stmt->fetchColumn();
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Conexão com banco de dados funcionando',
        'database_info' => [
            'tables' => $tables,
            'pedidos_count' => $pedidosCount,
            'php_version' => phpversion(),
            'pdo_available' => class_exists('PDO'),
            'mysql_available' => in_array('mysql', PDO::getAvailableDrivers())
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>