<?php
// Arquivo de debug para testar conexão com banco de dados
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

$debug_info = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'config' => [
        'DB_HOST' => DB_HOST,
        'DB_NAME' => DB_NAME,
        'DB_USER' => DB_USER,
        'DB_PASS' => '***' // Não mostrar senha
    ],
    'connection_test' => null,
    'tables_check' => null,
    'error' => null
];

try {
    // Teste de conexão
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    
    $debug_info['connection_test'] = 'SUCCESS';
    
    // Verificar se as tabelas existem
    $tables = ['pedidos', 'pedido_itens', 'produtos', 'configuracoes'];
    $existing_tables = [];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
            if ($stmt->rowCount() > 0) {
                $existing_tables[] = $table;
            }
        } catch (Exception $e) {
            // Tabela não existe ou erro
        }
    }
    
    $debug_info['tables_check'] = [
        'expected' => $tables,
        'existing' => $existing_tables,
        'missing' => array_diff($tables, $existing_tables)
    ];
    
    // Teste simples de query
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM pedidos");
        $result = $stmt->fetch();
        $debug_info['pedidos_count'] = $result['total'];
    } catch (Exception $e) {
        $debug_info['pedidos_error'] = $e->getMessage();
    }
    
} catch (PDOException $e) {
    $debug_info['connection_test'] = 'FAILED';
    $debug_info['error'] = $e->getMessage();
}

echo json_encode($debug_info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>