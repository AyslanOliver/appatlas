<?php
// Configuração do banco de dados para InfinityFree
// IMPORTANTE: Substitua essas informações pelas suas credenciais do InfinityFree

// Configurações do banco de dados
define('DB_HOST', 'sql201.infinityfree.com'); // Host do InfinityFree
define('DB_NAME', 'if0_39733145_pizzaria'); // Nome do banco de dados
define('DB_USER', 'if0_39733145'); // Usuário do banco de dados
define('DB_PASS', 'CeEJrC6eOE'); // Senha do banco de dados

// Configurações gerais
define('API_BASE_URL', 'https://rotaexpress.free.nf/api/');
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
        // Log do erro para debug
        logError('Database connection failed', [
            'host' => DB_HOST,
            'database' => DB_NAME,
            'user' => DB_USER,
            'error' => $e->getMessage()
        ]);
        
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro de conexão com o banco de dados',
            'debug' => 'Verifique as credenciais do banco de dados',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }
}

// Função para configurar CORS
function setCorsHeaders() {
    // Permitir origem específica ou todas (*)
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = [
        'https://rotaexpress.free.nf',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    
    if (in_array($origin, $allowedOrigins) || CORS_ORIGIN === '*') {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: https://rotaexpress.free.nf');
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // Cache preflight por 24h
    
    // Definir Content-Type apenas se não for OPTIONS
    if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
        header('Content-Type: application/json; charset=utf-8');
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