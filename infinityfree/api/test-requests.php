<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log da requisição
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'query_string' => $_SERVER['QUERY_STRING'] ?? '',
    'headers' => getallheaders(),
    'input' => file_get_contents('php://input'),
    'get' => $_GET,
    'post' => $_POST
];

// Salvar log em arquivo
file_put_contents('request_log.txt', json_encode($logData, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

// Resposta baseada no método
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        echo json_encode([
            'success' => true,
            'message' => 'GET request received successfully',
            'data' => $logData
        ]);
        break;
        
    case 'POST':
        echo json_encode([
            'success' => true,
            'message' => 'POST request received successfully',
            'data' => $logData
        ]);
        break;
        
    case 'PUT':
        echo json_encode([
            'success' => true,
            'message' => 'PUT request received successfully',
            'data' => $logData
        ]);
        break;
        
    case 'DELETE':
        echo json_encode([
            'success' => true,
            'message' => 'DELETE request received successfully',
            'data' => $logData
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed',
            'method' => $_SERVER['REQUEST_METHOD']
        ]);
        break;
}
?>