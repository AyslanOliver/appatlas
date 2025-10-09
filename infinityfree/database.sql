-- Script SQL para criar as tabelas da Pizzaria Atlas no InfinityFree
-- Execute este script no phpMyAdmin do seu painel InfinityFree

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo ENUM('pizza', 'bebida', 'sobremesa', 'entrada') NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    disponivel BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pendente', 'preparando', 'pronto', 'entregue', 'cancelado') DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT,
    nome VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
);

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir dados iniciais de produtos
INSERT INTO produtos (nome, tipo, preco, descricao) VALUES
('Pizza Margherita', 'pizza', 35.00, 'Molho de tomate, mussarela e manjericão'),
('Pizza Calabresa', 'pizza', 32.00, 'Molho de tomate, mussarela e calabresa'),
('Pizza Portuguesa', 'pizza', 38.00, 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona'),
('Pizza Quatro Queijos', 'pizza', 40.00, 'Molho de tomate, mussarela, parmesão, gorgonzola e catupiry'),
('Coca-Cola 2L', 'bebida', 8.00, 'Refrigerante Coca-Cola 2 litros'),
('Guaraná Antarctica 2L', 'bebida', 7.50, 'Refrigerante Guaraná Antarctica 2 litros'),
('Água Mineral', 'bebida', 3.00, 'Água mineral 500ml'),
('Suco de Laranja', 'bebida', 6.00, 'Suco natural de laranja 500ml');

-- Inserir configurações iniciais
INSERT INTO configuracoes (chave, valor) VALUES
('nome_estabelecimento', 'Pizzaria Atlas'),
('telefone', '(11) 99999-9999'),
('endereco', 'Rua Principal, 123'),
('horario_funcionamento', '18:00 - 23:00'),
('taxa_entrega', '5.00');

-- Inserir alguns pedidos de exemplo
INSERT INTO pedidos (cliente, telefone, endereco, total, status) VALUES
('João Silva', '(11) 99999-9999', 'Rua das Flores, 123', 35.00, 'pendente'),
('Maria Santos', '(11) 88888-8888', 'Av. Principal, 456', 64.00, 'preparando');

-- Inserir itens dos pedidos de exemplo
INSERT INTO pedido_itens (pedido_id, produto_id, nome, quantidade, preco) VALUES
(1, 1, 'Pizza Margherita', 1, 35.00),
(2, 2, 'Pizza Calabresa', 2, 32.00);