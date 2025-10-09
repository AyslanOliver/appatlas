<?php
// Configuração do banco de dados para InfinityFree
// IMPORTANTE: Substitua essas informações pelas suas credenciais do InfinityFree

// Configurações do banco de dados
define('DB_HOST', 'sql201.infinityfree.com'); // Substitua pelo seu host
define('DB_NAME', 'if0_39733145_pastelaria'); // Substitua pelo nome do seu banco
define('DB_USER', 'if0_39733145'); // Substitua pelo seu usuário
define('DB_PASS', 'CeEJrC6eOE'); // Substitua pela sua senha

// Configurações gerais
define('API_BASE_URL', 'https://seudominio.infinityfreeapp.com/api');
define('CORS_ORIGIN', '*'); // Em produção, especifique o domínio exato

// Função para conectar ao banco de dados
function getConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro de conexão com o banco de dados']);
        exit;
    }
}

// Função para configurar CORS
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Função para resposta JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Função para log de erros
function logError($message, $context = []) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if (!empty($context)) {
        $log .= " - Context: " . json_encode($context);
    }
    error_log($log . "\n", 3, __DIR__ . '/error.log');
}
?>