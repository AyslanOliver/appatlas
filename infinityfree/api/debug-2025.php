<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Teste básico de PHP
$response = [
    'status' => 'success',
    'message' => 'PHP funcionando corretamente',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'php_version' => phpversion()
];

// Teste de conexão com banco
try {
    require_once '../config.php';
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $response['database'] = 'conectado';
    
    // Teste simples de consulta
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM pedidos");
    $result = $stmt->fetch();
    $response['total_pedidos'] = $result['total'];
    
} catch (Exception $e) {
    $response['database'] = 'erro: ' . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>