# Jogo da Velha

Jogo da velha para navegador, criado com HTML, CSS e JavaScript. Tem partidas locais, computador com três níveis de dificuldade, partidas online sincronizadas pelo Firebase e instalação como aplicativo da web (PWA).

## Acessar o jogo

[Jogar no Firebase Hosting](https://jogo-da-velha-online-a0599.web.app)

## Recursos

- **Humano vs Humano:** duas pessoas jogam no mesmo dispositivo.
- **Humano vs Computador:** escolha entre os níveis fácil, médio e difícil.
- **Modo Online:** crie uma sala e compartilhe o código, ou entre usando o código de outra pessoa.
- **Partidas sincronizadas:** tabuleiro, vez, resultado e placar da sala são atualizados para os dois jogadores.
- **Controles online:** copie o código da sala, reinicie a rodada, zere o placar ou saia da partida.
- **Menu Opções:** reúne o modo de jogo, a dificuldade, os controles online e as preferências de áudio.
- **Música ambiente:** trilha original em estilo arcade, criada com Web Audio, com frases musicais variadas, baixo, acordes e percussão leve.
- **Controles de áudio:** ligue ou desligue música e efeitos separadamente e ajuste seus volumes. As preferências ficam salvas neste navegador.
- **Interface responsiva:** layout cyberpunk adaptado para celular e computador.
- **Instalação como app:** em navegadores compatíveis, instale o jogo ou adicione-o à tela inicial.

A música começa após a primeira interação com a página, conforme as regras de reprodução de áudio dos navegadores. Para testar a versão mais recente, use o mesmo endereço nos navegadores que estiver comparando. A versão local e a publicada podem ser diferentes até que seja feito um novo deploy.

## Arquivos

- `index.html` — estrutura da página, metadados do app e registro do service worker.
- `style.css` — aparência cyberpunk e layout responsivo.
- `script.js` — regras do jogo, inteligência artificial, áudio e conexão com Firebase.
- `manifest.json` — nome, cores, modo de exibição e ícones do app instalado.
- `service-worker.js` — cache dos arquivos principais para a experiência de app.
- `icon-192.png` e `icon-512.png` — ícones do app em 192 × 192 e 512 × 512 pixels.
- `firebase.json` e `.firebaserc` — configuração do Firebase Hosting.

## Executar localmente

1. Abra a pasta do projeto no Visual Studio Code.
2. Inicie um servidor local, por exemplo com a extensão **Live Server**.
3. Abra o endereço HTTP fornecido pelo servidor, como `http://127.0.0.1:5500`.

O jogo usa módulos JavaScript e Firebase. Abra a página por um servidor HTTP/HTTPS; abrir `index.html` diretamente como arquivo pode impedir que alguns recursos funcionem.

## Instalar no celular

O jogo precisa estar publicado em HTTPS. No Android, abra o link do jogo em um navegador compatível, abra o menu e escolha **Instalar app** ou **Adicionar à tela inicial**. O nome da opção varia conforme o navegador.

Isso instala um app da web, não gera um APK. As partidas online precisam de conexão com a internet.

## Configuração do Firebase

O jogo usa o Firebase Authentication com login anônimo e o Realtime Database para as salas online. Para conectar outro projeto Firebase:

1. Crie um app Web no Firebase e habilite o login anônimo.
2. Crie um Realtime Database.
3. Atualize `firebaseConfig` em `script.js` com os dados do app e a URL do banco.
4. Configure regras do Realtime Database para limitar o acesso aos jogadores autenticados que pertencem à sala.

Não use regras públicas como `".read": true` ou `".write": true`.

## Publicar atualizações

O Firebase deste projeto é `jogo-da-velha-online-a0599`. No PowerShell, abra a pasta do projeto e selecione o projeto correto antes de publicar:

```powershell
cd C:\Users\leoal\OneDrive\Desktop\JogoVelha
firebase use jogo-da-velha-online-a0599
firebase deploy --only hosting
```

O deploy atualiza o site e os arquivos servidos pelo Hosting. Ele não publica alterações nas regras do Realtime Database. Depois do deploy, abra o site novamente; se um app instalado ainda mostrar a versão anterior, feche e abra o app para que o service worker atualize o cache.

## Tecnologias

- HTML5 e CSS3
- JavaScript com módulos ES
- Web Audio API
- Progressive Web App (manifest e service worker)
- Firebase Authentication
- Firebase Realtime Database
- Firebase Hosting