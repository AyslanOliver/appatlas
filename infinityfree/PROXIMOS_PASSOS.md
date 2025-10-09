# 🚀 Próximos Passos - Hospedagem InfinityFree

## ✅ O que já foi preparado:

1. **Estrutura PHP completa** - Todos os endpoints da API convertidos
2. **Banco de dados MySQL** - Script SQL pronto para execução
3. **Arquivos do React** - Build copiado e pronto para upload
4. **Configurações** - .htaccess, config.php e configurações prontas
5. **Documentação completa** - README com instruções detalhadas

## 📋 O que você precisa fazer agora:

### 1. Criar conta no InfinityFree
- Acesse: https://infinityfree.net/
- Crie uma conta gratuita
- Escolha um subdomínio (ex: pizzariaatlas.infinityfreeapp.com)

### 2. Configurar o banco de dados
- No cPanel, crie um banco MySQL
- Execute o script `database.sql`
- Anote as credenciais do banco

### 3. Editar configurações
- **Arquivo `config.php`**: Adicione suas credenciais do banco
- **Arquivo `js/config.js`**: Adicione seu domínio do InfinityFree

### 4. Fazer upload dos arquivos
- Faça upload de TODOS os arquivos da pasta `infinityfree/`
- Mantenha a estrutura de pastas
- Coloque na pasta `htdocs` do seu InfinityFree

### 5. Testar a aplicação
- Acesse: `https://seudominio.infinityfreeapp.com/api/test.php`
- Deve retornar JSON com status da API
- Acesse: `https://seudominio.infinityfreeapp.com`
- Deve carregar a aplicação da pizzaria

## 📁 Arquivos importantes:

- **`README_INFINITYFREE.md`** - Instruções completas e detalhadas
- **`config.php`** - Configurações do banco (EDITAR ANTES DO UPLOAD)
- **`database.sql`** - Script para criar o banco de dados
- **`api-config-infinityfree.js`** - Configuração da API para produção
- **`.htaccess`** - Configurações do servidor web

## 🔧 Para o aplicativo mobile (APK):

1. Substitua o conteúdo de `react-app/src/services/api.js` pelo conteúdo de `api-config-infinityfree.js`
2. Edite a URL da API no arquivo substituído
3. Execute: `npm run build` no React
4. Copie os arquivos para Cordova
5. Gere novo APK: `cordova build android`

## 📞 Precisa de ajuda?

Consulte o arquivo `README_INFINITYFREE.md` para instruções detalhadas e solução de problemas.

**Boa sorte com a hospedagem! 🍕**