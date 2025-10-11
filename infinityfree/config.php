<?php
// Configurações do banco de dados
$host = 'sql201.infinityfree.com';
$dbname = 'if0_39733145_pizzaria';
$username = 'if0_39733145';
$password = 'CeEJrC6eOE';

// Configurações de debug
$debug = true;
$logFile = __DIR__ . '/logs/error.log';

// Configurar relatório de erros
if ($debug) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Função para conectar ao banco de dados
function getConnection() {
    global $host, $dbname, $username, $password;
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        logError('Erro de conexão com banco de dados', ['error' => $e->getMessage()]);
        throw new Exception('Erro de conexão com banco de dados');
    }
}

// Função para configurar headers CORS
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Content-Type: application/json; charset=utf-8');
}

// Função para retornar resposta JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Função para log de erros
function logError($message, $context = []) {
    global $logFile;
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message";
    
    if (!empty($context)) {
        $logEntry .= ' - Context: ' . json_encode($context, JSON_UNESCAPED_UNICODE);
    }
    
    $logEntry .= PHP_EOL;
    
    // Criar diretório de logs se não existir
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// Função para validar entrada
function validateInput($data, $required = []) {
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return false;
        }
    }
    return true;
}

// Função para sanitizar entrada
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Função para formatar preço
function formatPrice($price) {
    return number_format((float)$price, 2, '.', '');
}

// Função para debug
function debugLog($message, $data = null) {
    global $debug;
    if ($debug) {
        error_log("DEBUG: $message" . ($data ? ' - ' . json_encode($data) : ''));
    }
}

// Inicializar tabelas se não existirem
function initializeTables() {
    try {
        $pdo = getConnection();
        
        // Criar tabela de pedidos
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS pedidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cliente VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                endereco TEXT,
                total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                status ENUM('pendente', 'preparo', 'entrega', 'entregue') DEFAULT 'pendente',
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Criar tabela de itens do pedido
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS pedido_itens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pedido_id INT NOT NULL,
                nome VARCHAR(255) NOT NULL,
                quantidade INT NOT NULL DEFAULT 1,
                preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Criar tabela de produtos
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS produtos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                descricao TEXT,
                disponivel BOOLEAN DEFAULT TRUE,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        debugLog('Tabelas inicializadas com sucesso');
        
    } catch (Exception $e) {
        logError('Erro ao inicializar tabelas', ['error' => $e->getMessage()]);
        throw $e;
    }
}

// Inicializar tabelas automaticamente
try {
    initializeTables();
} catch (Exception $e) {
    // Log do erro, mas não interrompe a execução
    logError('Falha na inicialização automática das tabelas', ['error' => $e->getMessage()]);
}
?>