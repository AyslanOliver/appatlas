# Instruções para Gerar APK - Pizzaria App

## Opção 1: Usando PWA Builder (Recomendado - Mais Fácil)

### Passo 1: Preparar o PWA
1. O aplicativo já está configurado como PWA com:
   - ✅ `manifest.json` configurado
   - ✅ Service Worker (`sw.js`) implementado
   - ✅ Meta tags PWA adicionadas
   - ✅ Ícones e configurações mobile

### Passo 2: Usar PWA Builder
1. Acesse: https://www.pwabuilder.com/
2. Digite a URL do seu aplicativo hospedado (ex: `https://seudominio.com`)
3. Clique em "Start" para analisar o PWA
4. Na aba "Publish", selecione "Android"
5. Configure as opções:
   - **Package ID**: `com.pizzaria.app`
   - **App Name**: `Pizzaria App`
   - **Version**: `1.0.0`
6. Clique em "Generate Package" para baixar o APK

## Opção 2: Usando Apache Cordova (Requer Android SDK)

### Pré-requisitos
1. **Node.js** (já instalado)
2. **Apache Cordova** (já instalado)
3. **Android Studio** com Android SDK
4. **Java JDK 8 ou superior**

### Configuração do Ambiente
1. Instale o Android Studio: https://developer.android.com/studio
2. Configure as variáveis de ambiente:
   ```
   ANDROID_HOME = C:\Users\[SEU_USUARIO]\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Java\jdk-[VERSAO]
   ```
3. Adicione ao PATH:
   ```
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\build-tools\[VERSAO]
   ```

### Passos para Gerar APK
1. Abra o terminal na pasta `pizzaria-app`
2. Execute os comandos:
   ```bash
   cordova platform add android
   cordova build android
   ```
3. O APK será gerado em: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Para APK de Produção (Assinado)
1. Gere uma keystore:
   ```bash
   keytool -genkey -v -keystore pizzaria-release-key.keystore -alias pizzaria -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Configure o arquivo `platforms/android/release-signing.properties`:
   ```
   storeFile=../../../pizzaria-release-key.keystore
   storeType=jks
   keyAlias=pizzaria
   storePassword=SUA_SENHA
   keyPassword=SUA_SENHA
   ```
3. Execute:
   ```bash
   cordova build android --release
   ```

## Opção 3: Usando Capacitor (Alternativa Moderna)

### Instalação
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Pizzaria App" "com.pizzaria.app"
npx cap add android
```

### Configuração
1. Copie os arquivos web para `www/`
2. Execute:
   ```bash
   npx cap copy
   npx cap open android
   ```
3. No Android Studio, clique em "Build" > "Generate Signed Bundle/APK"

## Opção 4: Usando Ferramentas Online

### AppsGeyser (Gratuito)
1. Acesse: https://appsgeyser.com/
2. Selecione "Website" como tipo de app
3. Digite a URL do seu aplicativo
4. Configure nome, ícone e descrição
5. Gere e baixe o APK

### Appy Pie (Freemium)
1. Acesse: https://www.appypie.com/
2. Selecione "Create App from Website"
3. Digite a URL e configure o app
4. Baixe o APK (pode ter marca d'água na versão gratuita)

## Arquivos Importantes Criados

### 📁 Estrutura PWA
- `www/manifest.json` - Configurações do PWA
- `www/sw.js` - Service Worker para funcionalidade offline
- Meta tags PWA adicionadas em todos os HTML

### 📁 Configuração Cordova
- `pizzaria-app/config.xml` - Configurações do Cordova
- `pizzaria-app/www/` - Arquivos da aplicação copiados

## Testando o PWA

### No Navegador
1. Acesse o aplicativo em HTTPS
2. Abra as ferramentas de desenvolvedor (F12)
3. Vá para "Application" > "Manifest" para verificar o PWA
4. Teste a funcionalidade offline desconectando a internet

### No Dispositivo Mobile
1. Acesse o aplicativo no navegador mobile
2. Toque no menu do navegador
3. Selecione "Adicionar à tela inicial"
4. O app será instalado como PWA

## Próximos Passos

1. **Hospedar o aplicativo** em um servidor HTTPS
2. **Testar o PWA** em dispositivos móveis
3. **Gerar o APK** usando uma das opções acima
4. **Testar o APK** em dispositivos Android
5. **Publicar na Google Play Store** (se necessário)

## Observações Importantes

- ✅ O aplicativo está otimizado para mobile
- ✅ Funciona offline com Service Worker
- ✅ Pode ser instalado como PWA
- ✅ Pronto para conversão em APK
- ⚠️ Requer HTTPS para funcionalidades PWA completas
- ⚠️ Teste sempre em dispositivos reais antes da publicação

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Teste em diferentes dispositivos e navegadores
3. Consulte a documentação oficial das ferramentas utilizadas