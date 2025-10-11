<?php
require_once '../config.php';

setCorsHeaders();

try {
    $pdo = getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Buscar todas as configurações
            $stmt = $pdo->prepare("SELECT chave, valor FROM configuracoes");
            $stmt->execute();
            $configuracoes = $stmt->fetchAll();
            
            // Converter para formato objeto
            $config = [];
            foreach ($configuracoes as $item) {
                $config[$item['chave']] = $item['valor'];
            }
            
            // Garantir que as configurações básicas existam
            $configPadrao = [
                'nomeEstabelecimento' => $config['nome_estabelecimento'] ?? 'Pizzaria Atlas',
                'telefone' => $config['telefone'] ?? '(11) 99999-9999',
                'endereco' => $config['endereco'] ?? 'Rua Principal, 123',
                'horarioFuncionamento' => $config['horario_funcionamento'] ?? '18:00 - 23:00',
                'taxaEntrega' => floatval($config['taxa_entrega'] ?? 2.00)
            ];
            
            jsonResponse($configPadrao);
            break;
            
        case 'POST':
        case 'PUT':
            // Atualizar configurações
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                jsonResponse(['error' => 'Dados inválidos'], 400);
            }
            
            $pdo->beginTransaction();
            
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO configuracoes (chave, valor) 
                    VALUES (?, ?) 
                    ON DUPLICATE KEY UPDATE valor = VALUES(valor)
                ");
                
                // Mapear campos do frontend para chaves do banco
                $mapeamento = [
                    'nomeEstabelecimento' => 'nome_estabelecimento',
                    'telefone' => 'telefone',
                    'endereco' => 'endereco',
                    'horarioFuncionamento' => 'horario_funcionamento',
                    'taxaEntrega' => 'taxa_entrega'
                ];
                
                foreach ($mapeamento as $campo => $chave) {
                    if (isset($input[$campo])) {
                        $stmt->execute([$chave, $input[$campo]]);
                    }
                }
                
                $pdo->commit();
                jsonResponse(['message' => 'Configurações atualizadas com sucesso']);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;
            
        default:
            jsonResponse(['error' => 'Método não permitido'], 405);
    }
    
} catch (Exception $e) {
    logError('Erro na API de configurações', ['error' => $e->getMessage()]);
    jsonResponse(['error' => 'Erro interno do servidor'], 500);
}
?>