DROP DATABASE IF EXISTS saep_db;
CREATE DATABASE saep_db;
USE saep_db;

-- ==========================================
-- Tabela de Usuários
-- ==========================================
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(20) NOT NULL
);

-- ==========================================
-- Tabela de Produtos
-- ==========================================
CREATE TABLE estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(30),
    tensao INT,
    dimencoes VARCHAR(20),
    resolucao VARCHAR(20),
    capacidade INT,
    conectividade VARCHAR(20),
    quantidade INT DEFAULT 0
);

-- ==========================================
-- Histórico de operações
-- ==========================================
CREATE TABLE historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    responsavel_id INT NOT NULL,
    produto_id INT NOT NULL,
    tipo_operacao VARCHAR(10),  -- entrada / saída
    quantidade INT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsavel_id) REFERENCES usuario(id),
    FOREIGN KEY (produto_id) REFERENCES estoque(id)
);

-- ==========================================
-- Inserindo Usuários
-- ==========================================
INSERT INTO usuario (email, senha) VALUES
('joao@email.com', 'senha123'),
('maria@email.com', 'senha456'),
('admin@email.com', 'admin123');

-- ==========================================
-- Inserindo Produtos
-- ==========================================
INSERT INTO estoque (nome, tipo, tensao, dimencoes, resolucao, capacidade, conectividade, quantidade) VALUES
('Galaxy S21', 'smartphones', 5, '15x7x0.8', '1080x2400', 128, 'WiFi/5G', 50),
('iPhone 14', 'smartphones', 5, '16x8x0.9', '1440x3200', 256, 'WiFi/5G', 30),
('Dell Inspiron', 'notebooks', 110, '35x25x2', '1920x1080', 512, 'WiFi', 25),
('MacBook Pro', 'notebooks', 110, '36x26x1.8', '2560x1600', 1024, 'WiFi', 15),
('LG 55"', 'smart TVs', 110, '120x70x5', '3840x2160', 16, 'WiFi', 20),
('Samsung 65"', 'smart TVs', 110, '140x80x6', '3840x2160', 32, 'WiFi/BT', 10);

-- ==========================================
-- Histórico inicial
-- ==========================================
INSERT INTO historico (responsavel_id, produto_id, tipo_operacao, quantidade) VALUES
(1, 1, 'entrada', 50),
(1, 2, 'entrada', 30),
(2, 3, 'entrada', 25),
(2, 4, 'entrada', 15),
(3, 5, 'entrada', 20),
(3, 6, 'entrada', 10),
(1, 1, 'saida', 5),
(2, 3, 'saida', 3),
(3, 5, 'saida', 2);

-- ==========================================
-- ⭐ EDITAR PRODUTO
-- ==========================================
UPDATE estoque
SET nome = 'Galaxy S23',
    tipo = 'smartphones',
    tensao = 5,
    dimencoes = '15x7x0.7',
    resolucao = '1440x3040',
    capacidade = 256,
    conectividade = 'WiFi/5G',
    quantidade = 60
WHERE id = 1;

-- ==========================================
-- ⭐ EXCLUIR PRODUTO
-- ==========================================
DELETE FROM estoque WHERE id = 6;

-- ==========================================
-- ⭐ ADICIONAR QUANTIDADE (ENTRADA)
-- ==========================================
UPDATE estoque
SET quantidade = quantidade + 10
WHERE id = 3;

INSERT INTO historico (responsavel_id, produto_id, tipo_operacao, quantidade)
VALUES (1, 3, 'entrada', 10);

-- ==========================================
-- ⭐ RETIRAR QUANTIDADE (SAÍDA)
-- ==========================================
UPDATE estoque
SET quantidade = quantidade - 5
WHERE id = 3 AND quantidade >= 5;

INSERT INTO historico (responsavel_id, produto_id, tipo_operacao, quantidade)
VALUES (1, 3, 'saida', 5);

-- ==========================================
-- ⭐ ORDEM ALFABÉTICA FIXA (A → Z)
-- ==========================================
SELECT *
FROM estoque
ORDER BY nome ASC;

-- ==========================================
-- ⭐ FILTRO POR NOME (A → Z)
-- ==========================================
SELECT *
FROM estoque
WHERE nome LIKE '%galaxy%'
ORDER BY nome ASC;
