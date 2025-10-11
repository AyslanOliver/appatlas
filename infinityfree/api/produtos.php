<?php
require_once '../config.php';

setCorsHeaders();

try {
    $pdo = getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $input = null;
    
    // Workaround para InfinityFree: aceitar PUT/DELETE via POST com _method
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['_method'])) {
            $method = strtoupper($input['_method']);
        } elseif (isset($_POST['_method'])) {
            $method = strtoupper($_POST['_method']);
        }
        // Se o corpo JSON vier vazio, usar dados de formulário
        if (!$input && !empty($_POST)) {
            $input = $_POST;
        }
        // Remover a chave de controle
        if (is_array($input) && isset($input['_method'])) {
            unset($input['_method']);
        }
    }
    
    switch ($method) {
        case 'GET':
            // Buscar todos os produtos
            $stmt = $pdo->prepare("SELECT * FROM produtos ORDER BY tipo, nome");
            $stmt->execute();
            $produtos = $stmt->fetchAll();
            
            // Converter id para string para compatibilidade
            foreach ($produtos as &$produto) {
                $produto['id'] = (string)$produto['id'];
                $produto['disponivel'] = (bool)$produto['disponivel'];
            }
            
            jsonResponse($produtos);
            break;
            
        case 'POST':
            // Criar novo produto
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['nome']) || !isset($input['tipo']) || !isset($input['preco'])) {
                jsonResponse(['error' => 'Dados inválidos. Nome, tipo e preço são obrigatórios'], 400);
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO produtos (nome, tipo, preco, descricao, disponivel) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['nome'],
                $input['tipo'],
                $input['preco'],
                $input['descricao'] ?? '',
                isset($input['disponivel']) ? (int)$input['disponivel'] : 1
            ]);
            
            $produtoId = $pdo->lastInsertId();
            
            $novoProduto = array_merge($input, [
                'id' => (string)$produtoId,
                'criado_em' => date('Y-m-d H:i:s'),
                'atualizado_em' => date('Y-m-d H:i:s')
            ]);
            
            jsonResponse($novoProduto, 201);
            break;
            
        case 'PUT':
            // Atualizar produto
            $id = $_GET['id'] ?? null;
            if (!$id) {
                jsonResponse(['error' => 'ID do produto é obrigatório'], 400);
            }
            
            // Se não temos input ainda (requisição PUT direta), ler agora
            if (!$input) {
                $input = json_decode(file_get_contents('php://input'), true);
                if (!$input && !empty($_POST)) {
                    $input = $_POST;
                }
            }
            
            if (!$input) {
                jsonResponse(['error' => 'Dados inválidos'], 400);
            }
            
            $fields = [];
            $values = [];
            
            foreach (['nome', 'tipo', 'preco', 'descricao', 'disponivel'] as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    if ($field === 'disponivel') {
                        $values[] = (int)$input[$field];
                    } else {
                        $values[] = $input[$field];
                    }
                }
            }
            
            if (empty($fields)) {
                jsonResponse(['error' => 'Nenhum campo para atualizar'], 400);
            }
            
            $values[] = $id;
            $sql = "UPDATE produtos SET " . implode(', ', $fields) . " WHERE id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            
            if ($stmt->rowCount() > 0) {
                jsonResponse(['message' => 'Produto atualizado com sucesso']);
            } else {
                jsonResponse(['error' => 'Produto não encontrado'], 404);
            }
            break;
            
        case 'DELETE':
            // Deletar produto
            $id = $_GET['id'] ?? null;
            if (!$id) {
                jsonResponse(['error' => 'ID do produto é obrigatório'], 400);
            }
            
            $stmt = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                jsonResponse(['message' => 'Produto deletado com sucesso']);
            } else {
                jsonResponse(['error' => 'Produto não encontrado'], 404);
            }
            break;
            
        default:
            jsonResponse(['error' => 'Método não permitido'], 405);
    }
    
} catch (Exception $e) {
    logError('Erro na API de produtos', ['error' => $e->getMessage()]);
    jsonResponse(['error' => 'Erro interno do servidor'], 500);
}
?>