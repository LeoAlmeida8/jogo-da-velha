// Guarda de quem é a vez. O jogo começa com X.
let jogadorAtual = "X";

// Indica se a partida terminou.
let jogoEncerrado = false;

// Encontra elementos da página que o JavaScript vai usar.
const casas = document.querySelectorAll(".casa");
const mensagem = document.querySelector("#mensagem");
const placar = document.querySelector("#placar");
const botaoReiniciar = document.querySelector("#reiniciar");
const botaoZerarPlacar = document.querySelector("#zerar-placar");
const botaoTema = document.querySelector("#alternar-tema");

// Carrega o placar salvo no navegador, se houver.
const pontuacaoSalva = localStorage.getItem("pontuacaoJogoDaVelha");

const pontuacao = pontuacaoSalva
    ? JSON.parse(pontuacaoSalva)
    : { X: 0, O: 0, empates: 0 };

// Mostra o placar na página e salva os valores no navegador.
function atualizarPlacar() {
    placar.textContent =
        `X: ${pontuacao.X} | O: ${pontuacao.O} | Empates: ${pontuacao.empates}`;

    localStorage.setItem(
        "pontuacaoJogoDaVelha",
        JSON.stringify(pontuacao)
    );
}

// Exibe o placar salvo assim que a página abre.
atualizarPlacar();

// Cada trio representa uma combinação vencedora.
const combinacoesVencedoras = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
    [0, 4, 8], [2, 4, 6]             // diagonais
];

// Procura um trio em que todas as casas tenham o símbolo atual.
// Se encontrar, retorna os índices das três casas.
function verificarVitoria() {
    return combinacoesVencedoras.find(function (combinacao) {
        const [a, b, c] = combinacao;

        return casas[a].textContent === jogadorAtual &&
            casas[b].textContent === jogadorAtual &&
            casas[c].textContent === jogadorAtual;
    });
}

// Adiciona o comportamento de clique a cada casa.
casas.forEach(function (casa) {
    casa.addEventListener("click", function () {
        // Não faz nada se a casa estiver ocupada ou o jogo tiver terminado.
        if (casa.textContent !== "" || jogoEncerrado) {
            return;
        }

        // Coloca X ou O na casa clicada.
        casa.textContent = jogadorAtual;

        // Atualiza o nome acessível da casa.
        const numeroDaCasa = Number(casa.dataset.index) + 1;
        casa.setAttribute(
            "aria-label",
            `Casa ${numeroDaCasa}: ${jogadorAtual}`
        );

        // Adiciona a classe que define a cor do símbolo.
        if (jogadorAtual === "X") {
            casa.classList.add("jogada-x");
        } else {
            casa.classList.add("jogada-o");
        }

        // Procura uma combinação vencedora.
        const combinacaoVencedora = verificarVitoria();

        if (combinacaoVencedora) {
            // Aumenta e mostra os pontos do vencedor.
            pontuacao[jogadorAtual]++;
            atualizarPlacar();

            mensagem.textContent = `Jogador ${jogadorAtual} venceu!`;
            jogoEncerrado = true;

            // Destaca as três casas vencedoras.
            combinacaoVencedora.forEach(function (indice) {
                casas[indice].classList.add("vencedora");
            });

            return;
        }

        // Verifica se todas as casas estão preenchidas.
        const todasCasasPreenchidas = Array.from(casas).every(
            function (casa) {
                return casa.textContent !== "";
            }
        );

        if (todasCasasPreenchidas) {
            // Aumenta o contador de empates e encerra a partida.
            pontuacao.empates++;
            atualizarPlacar();

            mensagem.textContent = "Empate!";
            jogoEncerrado = true;
            return;
        }

        // Passa a vez para o outro jogador.
        if (jogadorAtual === "X") {
            jogadorAtual = "O";
        } else {
            jogadorAtual = "X";
        }

        mensagem.textContent = `Vez de ${jogadorAtual}`;
    });
});

// Reinicia o tabuleiro, mas mantém o placar.
botaoReiniciar.addEventListener("click", function () {
    casas.forEach(function (casa) {
        casa.textContent = "";

        const numeroDaCasa = Number(casa.dataset.index) + 1;
        casa.setAttribute("aria-label", `Casa ${numeroDaCasa}`);

        // Remove as cores e o destaque da partida anterior.
        casa.classList.remove("jogada-x", "jogada-o", "vencedora");
    });

    jogadorAtual = "X";
    jogoEncerrado = false;
    mensagem.textContent = "Vez de X";
});

// Zera o placar sem mexer no tabuleiro.
botaoZerarPlacar.addEventListener("click", function () {
    const confirmou = window.confirm("Deseja realmente zerar o placar?");

    if (!confirmou) {
        return;
    }
    
    pontuacao.X = 0;
    pontuacao.O = 0;
    pontuacao.empates = 0;

    atualizarPlacar();
});

// Carrega o tema salvo quando a página abre.
const temaSalvo = localStorage.getItem("temaJogoDaVelha");

if (temaSalvo === "escuro") {
    document.body.classList.add("tema-escuro");
    botaoTema.textContent = "Usar tema claro";
};

// Botão para alternar entre tema claro e escuro.
botaoTema.addEventListener("click", function () {
    const temaEscuroAtivo = document.body.classList.toggle("tema-escuro");

    if (temaEscuroAtivo) {
        botaoTema.textContent = "Usar tema claro";
        localStorage.setItem("temaJogoDaVelha", "escuro");
    } else {
        botaoTema.textContent = "Usar tema escuro";
        localStorage.setItem("temaJogoDaVelha", "claro");
    }
});