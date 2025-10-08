# Configuração da Impressora Bluetooth POS58

## Visão Geral
O sistema agora suporta impressão via Bluetooth para impressoras POS58, funcionando tanto em navegadores modernos quanto em dispositivos Android através de PWA.

## Funcionalidades Implementadas

### 1. Classe BluetoothPrinter
- **Localização**: `src/services/bluetoothPrinter.js`
- **Suporte**: Web Bluetooth API (navegadores) e Cordova Bluetooth Serial (Android)
- **Comandos ESC/POS**: Implementados para impressoras POS58

### 2. Hook useBluetoothPrinter
- **Localização**: `src/hooks/useBluetoothPrinter.js`
- **Funcionalidades**:
  - Gerenciamento de conexão
  - Impressão de pedidos completos
  - Impressão de recibos da cozinha
  - Teste de impressão

### 3. Componente BluetoothPrinterManager
- **Localização**: `src/components/BluetoothPrinterManager.js`
- **Interface**: Botão flutuante para gerenciar a impressora
- **Recursos**: Conectar, desconectar, testar impressão

## Como Usar

### No Navegador (Desktop/Mobile)
1. **Requisitos**:
   - Navegador com suporte a Web Bluetooth API (Chrome, Edge, Opera)
   - Impressora POS58 com Bluetooth habilitado

2. **Passos**:
   - Acesse a página de Pedidos
   - Clique no ícone da impressora (🖨️) no canto superior direito
   - Clique em "Conectar" e selecione sua impressora
   - Use os botões de impressão na tabela de pedidos

### No Android (PWA)
1. **Instalação**:
   - Acesse o sistema pelo navegador Chrome
   - Toque em "Adicionar à tela inicial" quando solicitado
   - Abra o app instalado

2. **Configuração**:
   - Certifique-se de que o Bluetooth está ativado
   - Pareie a impressora POS58 nas configurações do Android
   - No app, conecte-se à impressora através do gerenciador

## Tipos de Impressão

### 1. Pedido Completo
- **Botão**: 🖨️ (azul)
- **Conteúdo**: 
  - Cabeçalho da pizzaria
  - Dados do pedido e cliente
  - Lista completa de itens
  - Total e observações

### 2. Recibo da Cozinha
- **Botão**: 👨‍🍳 (cinza)
- **Conteúdo**:
  - Cabeçalho "COZINHA"
  - Itens para preparo
  - Observações especiais

### 3. Teste de Impressão
- **Localização**: Painel do gerenciador
- **Função**: Verificar se a impressora está funcionando

## Comandos ESC/POS Suportados

- **Texto**: Normal, negrito, centralizado
- **Tamanhos**: Normal, grande
- **Formatação**: Separadores, quebras de linha
- **Corte**: Alimentação e corte automático

## Solução de Problemas

### Problemas Comuns

1. **"Bluetooth não disponível"**
   - Verifique se o dispositivo tem Bluetooth
   - No navegador, certifique-se de usar HTTPS

2. **"Erro ao conectar"**
   - Verifique se a impressora está ligada
   - Certifique-se de que está em modo de pareamento
   - Tente desconectar e conectar novamente

3. **"Impressão não funciona"**
   - Teste a conexão com o botão "Teste"
   - Verifique se a impressora tem papel
   - Reinicie a impressora se necessário

### Navegadores Suportados

✅ **Suportados**:
- Chrome (Desktop/Android)
- Edge (Desktop)
- Opera (Desktop/Android)

❌ **Não Suportados**:
- Firefox (sem Web Bluetooth API)
- Safari (sem Web Bluetooth API)
- Internet Explorer

## Configuração para Android (Cordova)

Para funcionalidade completa no Android, adicione ao `config.xml`:

```xml
<plugin name="cordova-plugin-bluetooth-serial" source="npm" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Estrutura de Arquivos

```
src/
├── services/
│   └── bluetoothPrinter.js      # Classe principal
├── hooks/
│   └── useBluetoothPrinter.js   # Hook React
├── components/
│   ├── BluetoothPrinterManager.js   # Componente UI
│   └── BluetoothPrinterManager.css  # Estilos
└── pages/
    └── Pedidos.js               # Integração na página
```

## PWA (Progressive Web App)

O sistema está configurado como PWA com:
- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Instalação**: Disponível em dispositivos móveis

## Próximos Passos

1. **Teste em dispositivos reais**
2. **Configuração para produção**
3. **Otimizações de performance**
4. **Suporte a mais modelos de impressora**

---

**Nota**: Esta funcionalidade requer HTTPS em produção para funcionar corretamente com a Web Bluetooth API.