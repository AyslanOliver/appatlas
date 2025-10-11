<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Simular exatamente o que o frontend envia
$frontendData = [
    'cliente' => 'Teste Frontend',
    'cliente_telefone' => '(11) 99999-9999',
    'cliente_endereco' => 'Rua Teste Frontend, 123',
    'observacoes' => 'Teste de correção do erro 500',
    'total' => 43.00,
    'status' => 'pendente',
    'itens' => [
        [
            'produto_id' => 1,
            'produto_nome' => 'Pizza Margherita',
            'preco' => 35.00,
            'quantidade' => 1
        ],
        [
            'produto_id' => 5,
            'produto_nome' => 'Coca-Cola 2L',
            'preco' => 8.00,
            'quantidade' => 1
        ]
    ]
];

// Fazer a requisição POST para o endpoint real
$url = 'https://rotaexpress.free.nf/api/pedidos';
$data = json_encode($frontendData);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo json_encode([
    'test_data' => $frontendData,
    'http_code' => $httpCode,
    'response' => json_decode($response, true),
    'raw_response' => $response,
    'curl_error' => $error
], JSON_PRETTY_PRINT);
?>