<?php
require_once '../config.php';

// Configurar headers CORS
setCorsHeaders();

// Responder imediatamente a requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Teste simples de CORS e conectividade
$response = [
    'status' => 'success',
    'message' => 'API funcionando corretamente',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => [
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'não definido',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'não definido'
    ],
    'cors_test' => 'OK'
];

jsonResponse($response);
?>