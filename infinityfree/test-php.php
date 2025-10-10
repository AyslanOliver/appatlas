<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'PHP funcionando',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME'] ?? 'unknown'
]);
?>