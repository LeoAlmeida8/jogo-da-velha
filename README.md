# Jogo da Velha

Jogo da velha feito com HTML, CSS e JavaScript. Inclui partidas locais, uma inteligência artificial e partidas online sincronizadas pelo Firebase Realtime Database.

## Acessar o jogo

[Jogar no Firebase Hosting](https://jogo-da-velha-online-a0599.web.app)

## Recursos

- **Humano vs Humano:** duas pessoas jogam no mesmo dispositivo.
- **Humano vs Computador:** escolha entre os níveis fácil, médio e difícil.
- **Modo Online:** crie uma sala e compartilhe o código, ou entre usando o código de outra pessoa.
- **Sincronização em tempo real:** jogadas, vez atual, vitória e placar são compartilhados pela sala.
- **Controles da sala:** copie o código, reinicie a rodada ou zere o placar compartilhado.
- **Sair da sala:** O pode liberar a vaga; se X sair, a sala é encerrada.
- **Layout responsivo:** a interface se ajusta a telas de celular.
- **Tema cyberpunk:** cores neon e painel com efeito acrílico.

## Arquivos

- `index.html` — estrutura da página e controles.
- `style.css` — aparência e layout responsivo.
- `script.js` — regras do jogo, IA e conexão com Firebase.
- `firebase.json` e `.firebaserc` — configuração do Firebase Hosting.

## Executar localmente

1. Abra a pasta do projeto no Visual Studio Code.
2. Inicie um servidor local, por exemplo com a extensão **Live Server**.
3. Abra o endereço local indicado pelo servidor, como `http://127.0.0.1:5500`.

O jogo usa módulos JavaScript e Firebase; por isso, abra a página por um servidor HTTP/HTTPS, não diretamente pelo arquivo `index.html`.

## Configuração do Firebase

O projeto usa o Firebase Authentication com login anônimo e o Realtime Database para salas online. Para usar outro projeto Firebase:

1. Crie um app Web no Firebase e habilite o login anônimo.
2. Crie um Realtime Database.
3. Atualize `firebaseConfig` em `script.js` com os dados do seu app e a URL do banco.
4. Configure regras do Realtime Database que permitam acesso somente aos jogadores autenticados que pertencem à sala.

Não use regras públicas como `".read": true` ou `".write": true`.

## Publicar atualizações

O projeto está associado ao Firebase `jogo-da-velha-online-a0599`. Depois de editar os arquivos, abra o terminal na pasta do projeto e execute:

```powershell
firebase deploy --only hosting
```

O comando publica o conteúdo configurado para Hosting. Ele não publica as regras do Realtime Database.

## Tecnologias

- HTML5
- CSS3
- JavaScript (ES modules)
- Firebase Authentication
- Firebase Realtime Database
- Firebase Hosting