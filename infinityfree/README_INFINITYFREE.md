# 🍕 Pizzaria Atlas - Guia de Hospedagem no InfinityFree

Este guia contém todas as instruções necessárias para hospedar a Pizzaria Atlas no InfinityFree.

## 📋 Pré-requisitos

1. Conta no InfinityFree (gratuita)
2. Acesso ao painel de controle (cPanel)
3. Conhecimento básico de FTP ou File Manager

## 🚀 Passo a Passo para Hospedagem

### 1. Configuração do Banco de Dados

1. **Acesse o cPanel** do seu InfinityFree
2. **Clique em "MySQL Databases"**
3. **Crie um novo banco de dados:**
   - Nome: `pizzaria_atlas` (ou similar)
   - Anote o nome completo (ex: `if0_37000000_pizzaria_atlas`)

4. **Crie um usuário para o banco:**
   - Nome: `pizzaria_user` (ou similar)
   - Senha: Crie uma senha forte
   - Anote as credenciais

5. **Associe o usuário ao banco** com todas as permissões

6. **Execute o script SQL:**
   - Acesse **phpMyAdmin**
   - Selecione seu banco de dados
   - Vá na aba **SQL**
   - Copie e cole o conteúdo do arquivo `database.sql`
   - Clique em **Executar**

### 2. Configuração dos Arquivos

1. **Edite o arquivo `config.php`:**
   ```php
   define('DB_HOST', 'sql200.infinityfree.com'); // Seu host MySQL
   define('DB_NAME', 'if0_37000000_pizzaria_atlas'); // Seu banco
   define('DB_USER', 'if0_37000000'); // Seu usuário
   define('DB_PASS', 'sua_senha_aqui'); // Sua senha
   ```

2. **Edite o arquivo `js/config.js`:**
   ```javascript
   API_URL: 'https://seudominio.infinityfreeapp.com/api'
   ```
   Substitua `seudominio` pelo seu subdomínio do InfinityFree.

### 3. Upload dos Arquivos

1. **Acesse o File Manager** no cPanel
2. **Navegue até a pasta `htdocs`** (ou `public_html`)
3. **Faça upload de todos os arquivos** desta pasta (`infinityfree/`)
4. **Mantenha a estrutura de pastas:**
   ```
   htdocs/
   ├── api/
   │   ├── pedidos.php
   │   ├── produtos.php
   │   ├── cardapio.php
   │   ├── configuracoes.php
   │   └── test.php
   ├── static/
   ├── js/
   ├── css/
   ├── config.php
   ├── .htaccess
   └── index.html
   ```

### 4. Configuração de Permissões

1. **Defina permissões para arquivos PHP:** 644
2. **Defina permissões para pastas:** 755
3. **Arquivo .htaccess:** 644

### 5. Teste da Instalação

1. **Acesse:** `https://seudominio.infinityfreeapp.com/api/test.php`
2. **Deve retornar:** JSON com status da API
3. **Acesse:** `https://seudominio.infinityfreeapp.com`
4. **Deve carregar:** A aplicação da pizzaria

## 🔧 Configurações Importantes

### Limites do InfinityFree
- **Largura de banda:** 5GB/mês
- **Espaço em disco:** 5GB
- **Bancos MySQL:** 400 (limite por conta)
- **Subdomínios:** Ilimitados

### Otimizações Recomendadas
1. **Ative compressão GZIP** (já configurado no .htaccess)
2. **Configure cache** para arquivos estáticos
3. **Otimize imagens** antes do upload
4. **Minimize arquivos CSS/JS**

## 🛠️ Estrutura da API

### Endpoints Disponíveis:

- **GET** `/api/test.php` - Teste da API
- **GET** `/api/pedidos.php` - Listar pedidos
- **POST** `/api/pedidos.php` - Criar pedido
- **PUT** `/api/pedidos.php?id=X` - Atualizar pedido
- **DELETE** `/api/pedidos.php?id=X` - Deletar pedido
- **GET** `/api/produtos.php` - Listar produtos
- **POST** `/api/produtos.php` - Criar produto
- **PUT** `/api/produtos.php?id=X` - Atualizar produto
- **DELETE** `/api/produtos.php?id=X` - Deletar produto
- **GET** `/api/cardapio.php` - Cardápio organizado
- **GET** `/api/configuracoes.php` - Configurações

## 🔍 Solução de Problemas

### Erro 500 - Internal Server Error
1. Verifique as credenciais do banco em `config.php`
2. Confirme que o banco foi criado corretamente
3. Verifique permissões dos arquivos
4. Consulte o log de erros no cPanel

### Erro de Conexão com Banco
1. Confirme o host MySQL correto
2. Verifique usuário e senha
3. Certifique-se que o usuário tem permissões no banco

### CORS Errors
1. Verifique se o arquivo `.htaccess` foi enviado
2. Confirme que o módulo `mod_headers` está ativo
3. Ajuste as configurações CORS se necessário

### Aplicação não carrega
1. Verifique se `index.html` está na raiz
2. Confirme que todos os arquivos foram enviados
3. Teste a URL da API separadamente

## 📱 Aplicativo Mobile (APK)

Para que o APK funcione com a API hospedada:

1. **Edite** `react-app/src/services/api.js`
2. **Altere a URL da API** para seu domínio InfinityFree
3. **Rebuild** o projeto React: `npm run build`
4. **Copie** os novos arquivos para Cordova
5. **Gere** novo APK: `cordova build android`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro no cPanel
2. Teste cada endpoint individualmente
3. Confirme as configurações do banco
4. Consulte a documentação do InfinityFree

## 🎉 Pronto!

Sua Pizzaria Atlas agora está hospedada no InfinityFree e pronta para uso!

**URL da aplicação:** `https://seudominio.infinityfreeapp.com`
**URL da API:** `https://seudominio.infinityfreeapp.com/api/`