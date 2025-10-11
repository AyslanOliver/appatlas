<?php
/**
 * Arquivo de configuração para a API da Pizzaria Atlas
 */

// Configurações do banco de dados
define('DB_HOST', 'sql201.infinityfree.com');
define('DB_NAME', 'if0_39733145_pizzaria');
define('DB_USER', 'if0_39733145');
define('DB_PASS', 'CeEJrC6eOE');

/**
 * Função para estabelecer conexão com o banco de dados
 */
function getConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        logError('Erro de conexão com banco de dados', ['error' => $e->getMessage()]);
        throw new Exception('Erro de conexão com o banco de dados');
    }
}

/**
 * Função para definir cabeçalhos CORS
 */
function setCorsHeaders() {
    // Permitir origens específicas
    $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://pizzariaatlas.infinityfreeapp.com',
        'https://your-domain.com'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Responder a requisições OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Função para enviar resposta JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Função para registrar erros
 */
function logError($message, $context = []) {
    $logFile = __DIR__ . '/logs/error.log';
    $logDir = dirname($logFile);
    
    // Criar diretório de logs se não existir
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? json_encode($context, JSON_UNESCAPED_UNICODE) : '';
    $logEntry = "[$timestamp] $message";
    
    if ($contextStr) {
        $logEntry .= " | Context: $contextStr";
    }
    
    $logEntry .= PHP_EOL;
    
    // Escrever no arquivo de log
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    
    // Também registrar no error_log do PHP para debug
    error_log("Pizzaria Atlas API: $message" . ($contextStr ? " | $contextStr" : ""));
}

/**
 * Função para validar dados de entrada
 */
function validateInput($data, $requiredFields = []) {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Campo '$field' é obrigatório";
        }
    }
    
    return $errors;
}

/**
 * Função para sanitizar dados
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Função para formatar preço
 */
function formatPrice($price) {
    return number_format((float)$price, 2, '.', '');
}

/**
 * Função para debug (apenas em desenvolvimento)
 */
function debugLog($message, $data = null) {
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        $logFile = __DIR__ . '/logs/debug.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] DEBUG: $message";
        
        if ($data !== null) {
            $logEntry .= " | Data: " . json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        
        $logEntry .= PHP_EOL;
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
}

// Definir modo de debug (desabilitar em produção)
define('DEBUG_MODE', false);

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurar exibição de erros (desabilitar em produção)
if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}