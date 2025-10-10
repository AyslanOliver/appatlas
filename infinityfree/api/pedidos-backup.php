<?php
require_once '../config.php';

setCorsHeaders();

try {
    $pdo = getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Extrair ID da URL se presente (ex: /api/pedidos/1)
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', trim($requestUri, '/'));
    $pedidoId = null;
    
    // Procurar por ID numérico após 'pedidos'
    $pedidosIndex = array_search('pedidos', $pathParts);
    if ($pedidosIndex !== false && isset($pathParts[$pedidosIndex + 1]) && is_numeric($pathParts[$pedidosIndex + 1])) {
        $pedidoId = $pathParts[$pedidosIndex + 1];
    }
    
    // Fallback para $_GET['id'] se não encontrou na URL
    if (!$pedidoId) {
        $pedidoId = $_GET['id'] ?? null;
    }
    
    switch ($method) {
        case 'GET':
            if ($pedidoId) {
                // Buscar pedido específico por ID
                $stmt = $pdo->prepare("
                    SELECT p.*, 
                           GROUP_CONCAT(
                               JSON_OBJECT(
                                   'nome', pi.nome,
                                   'quantidade', pi.quantidade,
                                   'preco', pi.preco
                               )
                           ) as itens
                    FROM pedidos p
                    LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
                    WHERE p.id = ?
                    GROUP BY p.id
                ");
                $stmt->execute([$pedidoId]);
                $pedido = $stmt->fetch();
                
                if (!$pedido) {
                    jsonResponse(['error' => 'Pedido não encontrado'], 404);
                }
                
                // Processar os itens do pedido
                $pedido['id'] = (string)$pedido['id'];
                $pedido['data_pedido'] = $pedido['criado_em'];
                
                if ($pedido['itens']) {
                    $itens = explode(',', $pedido['itens']);
                    $pedido['itens'] = array_map('json_decode', $itens);
                } else {
                    $pedido['itens'] = [];
                }
                
                jsonResponse($pedido);
            } else {
                // Buscar todos os pedidos
                $stmt = $pdo->prepare("
                    SELECT p.*, 
                           GROUP_CONCAT(
                               JSON_OBJECT(
                                   'nome', pi.nome,
                                   'quantidade', pi.quantidade,
                                   'preco', pi.preco
                               )
                           ) as itens
                    FROM pedidos p
                    LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
                    GROUP BY p.id
                    ORDER BY p.criado_em DESC
                ");
                $stmt->execute();
                $pedidos = $stmt->fetchAll();
                
                // Processar os itens de cada pedido
                foreach ($pedidos as &$pedido) {
                    $pedido['id'] = (string)$pedido['id'];
                    $pedido['data_pedido'] = $pedido['criado_em'];
                    
                    if ($pedido['itens']) {
                        $itens = explode(',', $pedido['itens']);
                        $pedido['itens'] = array_map('json_decode', $itens);
                    } else {
                        $pedido['itens'] = [];
                    }
                }
                
                jsonResponse($pedidos);
            }
            break;
            
        case 'POST':
            // Criar novo pedido
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['cliente']) || !isset($input['total'])) {
                jsonResponse(['error' => 'Dados inválidos'], 400);
            }
            
            $pdo->beginTransaction();
            
            try {
                // Mapear campos do frontend para o backend
                $telefone = $input['telefone'] ?? $input['cliente_telefone'] ?? '';
                $endereco = $input['endereco'] ?? $input['cliente_endereco'] ?? '';
                
                // Inserir pedido
                $stmt = $pdo->prepare("
                    INSERT INTO pedidos (cliente, telefone, endereco, total, status) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['cliente'],
                    $telefone,
                    $endereco,
                    $input['total'],
                    $input['status'] ?? 'pendente'
                ]);
                
                $pedidoId = $pdo->lastInsertId();
                
                // Inserir itens do pedido
                if (isset($input['itens']) && is_array($input['itens'])) {
                    $stmtItem = $pdo->prepare("
                        INSERT INTO pedido_itens (pedido_id, nome, quantidade, preco) 
                        VALUES (?, ?, ?, ?)
                    ");
                    
                    foreach ($input['itens'] as $item) {
                        // Mapear campos do item (frontend pode enviar produto_nome ou nome)
                        $nomeItem = $item['nome'] ?? $item['produto_nome'] ?? 'Item sem nome';
                        $quantidadeItem = $item['quantidade'] ?? 1;
                        $precoItem = $item['preco'] ?? 0;
                        
                        $stmtItem->execute([
                            $pedidoId,
                            $nomeItem,
                            $quantidadeItem,
                            $precoItem
                        ]);
                    }
                }
                
                $pdo->commit();
                
                $novoPedido = array_merge($input, [
                    'id' => (string)$pedidoId,
                    'criado_em' => date('Y-m-d H:i:s'),
                    'data_pedido' => date('Y-m-d H:i:s')
                ]);
                
                jsonResponse($novoPedido, 201);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                logError('Erro ao criar pedido', ['error' => $e->getMessage(), 'input' => $input]);
                jsonResponse(['error' => 'Erro ao criar pedido'], 500);
            }
            break;
            
        case 'PUT':
            // Atualizar pedido
            if (!$pedidoId) {
                jsonResponse(['error' => 'ID do pedido é obrigatório'], 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                jsonResponse(['error' => 'Dados inválidos'], 400);
            }
            
            $fields = [];
            $values = [];
            
            foreach (['cliente', 'telefone', 'endereco', 'total', 'status'] as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                jsonResponse(['error' => 'Nenhum campo para atualizar'], 400);
            }
            
            $values[] = $pedidoId;
            $sql = "UPDATE pedidos SET " . implode(', ', $fields) . " WHERE id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            
            jsonResponse(['message' => 'Pedido atualizado com sucesso']);
            break;
            
        case 'DELETE':
            $deleteAll = $_GET['deleteAll'] ?? false;
            
            if ($deleteAll === 'true') {
                // Deletar todos os pedidos
                $stmt = $pdo->prepare("DELETE FROM pedidos");
                $stmt->execute();
                $count = $stmt->rowCount();
                
                jsonResponse([
                    'message' => "$count pedidos foram apagados com sucesso",
                    'deletedCount' => $count
                ]);
            } else {
                // Deletar pedido específico
                if (!$pedidoId) {
                    jsonResponse(['error' => 'ID do pedido é obrigatório'], 400);
                }
                
                $stmt = $pdo->prepare("DELETE FROM pedidos WHERE id = ?");
                $stmt->execute([$pedidoId]);
                
                if ($stmt->rowCount() > 0) {
                    jsonResponse(['message' => 'Pedido deletado com sucesso']);
                } else {
                    jsonResponse(['error' => 'Pedido não encontrado'], 404);
                }
            }
            break;
            
        default:
            jsonResponse(['error' => 'Método não permitido'], 405);
    }
    
} catch (Exception $e) {
    logError('Erro na API de pedidos', ['error' => $e->getMessage()]);
    jsonResponse(['error' => 'Erro interno do servidor'], 500);
}
?>