# Jogo da Velha
https://jogo-da-velha-online-a0599.web.app/


Jogo da velha cyberpunk para navegador e Android, com partidas locais, computador em três níveis, modo online pelo Firebase e áudio personalizável.

## Acessar o jogo

[Jogar no Firebase Hosting](https://jogo-da-velha-online-a0599.web.app)

## Recursos

- Humano vs Humano e Humano vs Computador.
- Computador com níveis fácil, médio e difícil.
- Modo online com código de sala e sincronização pelo Firebase.
- Placar, reinício de rodada e controles de sala.
- Menu Opções com modo, dificuldade, música e efeitos.
- Layout responsivo para celulares, tablets e computadores.
- PWA instalável e versão nativa Android em APK.
- Ícone neon e tela de abertura personalizados no Android.

A música começa após a primeira interação com a tela, como exigem os navegadores e o Android WebView. As partidas online precisam de conexão com a internet.

## APK para Android

O app Android é criado com Capacitor e mantém a versão web como origem do código. Para compilar no Windows, instale:

- Node.js 22 ou superior.
- Android Studio 2025.2.1 ou superior.
- Android SDK pelo SDK Manager do Android Studio: instale Android API 36, Build-Tools 36.0.0 e Platform-Tools. O APK aceita Android 7.0 (API 24) ou superior.

O Android Studio fornece o JDK usado pelo Gradle. Na primeira compilação, o Gradle pode baixar componentes adicionais. Abra a pasta android/ no Android Studio uma vez e deixe a sincronização terminar; isso configura o caminho local do SDK para este computador.

### Preparar o projeto

No PowerShell, entre na pasta do projeto e instale as dependências:

    cd C:\Users\leoal\OneDrive\Desktop\JogoVelha
    npm install

### Gerar o APK de teste

    npm run build:apk

O APK de depuração aparece em:

    android\app\build\outputs\apk\debug\jogo-da-velha-debug.apk

Copie esse arquivo para o celular Android e abra-o para instalar. Talvez seja necessário permitir a instalação de aplicativos dessa origem nas configurações do aparelho.

Para abrir o projeto nativo no Android Studio:

    npm run open:android

Depois de alterar index.html, style.css ou script.js, rode novamente npm run build:apk para preparar os arquivos web e gerar o APK atualizado.

O comando cria uma chave de depuração local automaticamente, que não é enviada ao GitHub. O APK de depuração serve para instalar e compartilhar diretamente. A publicação na Google Play exige uma versão de lançamento assinada e normalmente usa um Android App Bundle (AAB).
### Gerar uma versão assinada de lançamento

A chave de lançamento é a identidade permanente do app. Guarde uma cópia segura do arquivo `.jks` e das senhas. Sem a chave original, não será possível assinar atualizações compatíveis para quem instalou o APK diretamente.

1. Na pasta do projeto, gere uma chave privada. O comando pedirá uma senha e dados do certificado:

       keytool -genkeypair -v -keystore android\jogo-da-velha-release.jks -alias jogo-da-velha -keyalg RSA -keysize 2048 -validity 10000

   Se o PowerShell não reconhecer `keytool`, use o `keytool.exe` que fica na pasta `jbr\bin` do Android Studio.

2. Crie `android\keystore.properties` localmente com estes dados, substituindo os valores de exemplo pelas informações da sua chave:

       storeFile=jogo-da-velha-release.jks
       storePassword=SUA_SENHA_DA_CHAVE
       keyAlias=jogo-da-velha
       keyPassword=SUA_SENHA_DA_CHAVE

   O arquivo de propriedades e a chave `.jks` estão excluídos do Git. Não os envie ao GitHub nem compartilhe as senhas.

3. Para criar um APK assinado para instalação direta:

       npm run build:release

   O arquivo será salvo em `android\app\build\outputs\apk\release\jogo-da-velha-release.apk`.

4. Para preparar o formato recomendado para envio à Google Play:

       npm run build:release-bundle

   O Android App Bundle será salvo em `android\app\build\outputs\bundle\release\app-release.aab`. Para a primeira publicação, configure a assinatura de app do Google Play Console.

A versão de lançamento não usa a chave de depuração. Aumente `versionCode` em `android\app\build.gradle` antes de cada atualização publicada.

## Instalar a versão web (PWA)

A versão PWA precisa estar publicada em HTTPS. No Android, abra o link do jogo no navegador e escolha **Instalar app** ou **Adicionar à tela inicial**. Essa opção instala o site como app; para gerar um APK, use os passos acima.

## Arquivos principais

- index.html, style.css, script.js — interface, layout, regras, IA, som e Firebase.
- manifest.json e service-worker.js — recursos da versão PWA.
- icon-192.png e icon-512.png — ícones da versão web.
- capacitor.config.json e android/ — configuração e projeto Android nativo.
- scripts/prepare-web.mjs, scripts/ensure-debug-keystore.mjs e scripts/build-apk.mjs — preparam o app e compilam versões de teste ou lançamento.
- assets/icon.png — ícone de origem usado na versão Android.
- firebase.json e .firebaserc — configuração do Firebase Hosting.

## Executar localmente

1. Abra a pasta do projeto no Visual Studio Code.
2. Inicie um servidor local, por exemplo com a extensão Live Server.
3. Acesse o endereço HTTP informado pelo servidor, como http://127.0.0.1:5500.

Abrir index.html diretamente como arquivo pode impedir que módulos JavaScript e recursos do Firebase funcionem.

## Firebase

O jogo usa Firebase Authentication com login anônimo e Realtime Database para partidas online. As regras devem permitir acesso apenas aos jogadores autenticados que pertencem à sala. Não use regras públicas como ".read": true ou ".write": true.

O site deste projeto é publicado pelo Firebase Hosting no projeto jogo-da-velha-online-a0599. Para publicar uma atualização web:

    firebase use jogo-da-velha-online-a0599
    firebase deploy --only hosting

Isso atualiza o site. A versão APK precisa ser recompilada separadamente.

## Tecnologias

- HTML, CSS e JavaScript com módulos ES.
- Capacitor para o app Android.
- Música de fundo em assets/audio/MusicaFundo.ogg e efeitos gerados pela Web Audio API.
- Firebase Authentication e Realtime Database.
- Firebase Hosting.
