# Deploy no Vercel - Pizzaria App

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Banco de dados MongoDB (recomendado: MongoDB Atlas)
3. Node.js instalado localmente

## Configuração das Variáveis de Ambiente

### 1. No Vercel Dashboard

Acesse seu projeto no Vercel e vá em **Settings > Environment Variables**. Adicione as seguintes variáveis:

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/pizzaria?retryWrites=true&w=majority
```

### 2. Para desenvolvimento local

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações reais.

## Deploy

### Opção 1: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### Opção 2: Deploy via GitHub

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. O deploy será automático a cada push

## Estrutura da API

As seguintes rotas estarão disponíveis após o deploy:

- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos` - Atualizar produto
- `DELETE /api/produtos` - Deletar produto

- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `PUT /api/pedidos` - Atualizar pedido
- `DELETE /api/pedidos` - Deletar pedido

- `GET /api/cardapio` - Obter cardápio organizado
- `GET /api/configuracoes` - Obter configurações
- `POST /api/configuracoes` - Criar configurações
- `PUT /api/configuracoes` - Atualizar configurações

- `POST /api/impressora` - Imprimir pedido
- `GET /api/impressora` - Obter logs de impressão

## Configuração do MongoDB

Certifique-se de que seu banco MongoDB tenha as seguintes collections:

- `produtos` - Produtos da pizzaria
- `pedidos` - Pedidos dos clientes
- `configuracoes` - Configurações do sistema

## Testando a API

Após o deploy, teste as rotas usando:

```bash
# Testar conexão
curl https://seu-projeto.vercel.app/api/produtos

# Testar criação de produto
curl -X POST https://seu-projeto.vercel.app/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Pizza Margherita","preco":35.00,"categoria":"tradicional"}'
```

## Troubleshooting

### Erro de conexão com MongoDB
- Verifique se a variável `MONGODB_URI` está configurada corretamente
- Confirme se o IP do Vercel está na whitelist do MongoDB Atlas

### Erro de CORS
- Verifique as configurações de CORS nas funções serverless
- Adicione seu domínio nas origens permitidas

### Timeout nas funções
- As funções serverless têm limite de 10 segundos
- Para operações longas, considere otimizar as queries do MongoDB