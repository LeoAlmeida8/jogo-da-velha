// Guarda de quem é a vez. X é controlado pela pessoa; O, pelo computador.
let jogadorAtual = "X";
let jogoEncerrado = false;

// Encontra os elementos da página que o JavaScript vai usar.
const casas = document.querySelectorAll(".casa");

const mensagem = document.querySelector("#mensagem");

const placar = document.querySelector("#placar");

const botaoReiniciar = document.querySelector("#reiniciar");

const botaoZerarPlacar = document.querySelector("#zerar-placar");


const seletorDificuldade = document.querySelector("#dificuldade");

const seletorModo = document.querySelector("#modo");

const pontuacaoSalva = localStorage.getItem("pontuacaoJogoDaVelha");

const pontuacao = pontuacaoSalva
    ? JSON.parse(pontuacaoSalva)
    : { X: 0, O: 0, empates: 0 };

// Atualiza o placar na página e salva os valores no navegador.
function atualizarPlacar() {
    placar.textContent =
        `X: ${pontuacao.X} | O: ${pontuacao.O} | Empates: ${pontuacao.empates}`;

    localStorage.setItem(
        "pontuacaoJogoDaVelha",
        JSON.stringify(pontuacao)
    );
}

atualizarPlacar();

// Cada trio representa uma combinação vencedora.
const combinacoesVencedoras = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
    [0, 4, 8], [2, 4, 6]             // diagonais
];

// Retorna a combinação vencedora do jogador atual, se houver.
function verificarVitoria() {
    return combinacoesVencedoras.find(function (combinacao) {
        const [a, b, c] = combinacao;

        return casas[a].textContent === jogadorAtual &&
            casas[b].textContent === jogadorAtual &&
            casas[c].textContent === jogadorAtual;
    });
}

// Avalia um tabuleiro: pontuação positiva favorece O, negativa favorece X.
function avaliarTabuleiro(tabuleiro, profundidade) {
    const combinacaoVencedora = combinacoesVencedoras.find(function (combinacao) {
        const [a, b, c] = combinacao;
        return tabuleiro[a] !== "" &&
            tabuleiro[a] === tabuleiro[b] &&
            tabuleiro[a] === tabuleiro[c];
    });

    if (combinacaoVencedora) {
        const vencedor = tabuleiro[combinacaoVencedora[0]];
        return vencedor === "O" ? 10 - profundidade : profundidade - 10;
    }

    if (tabuleiro.every(function (casa) { return casa !== ""; })) {
        return 0; // Empate
    }

    return null; // A partida ainda não terminou
}

// Minimax testa jogadas futuras: O tenta maximizar a pontuação e X minimizá-la.
function minimax(tabuleiro, profundidade, vezDoComputador) {
    const resultado = avaliarTabuleiro(tabuleiro, profundidade);

    if (resultado !== null) {
        return resultado;
    }

    if (vezDoComputador) {
        let melhorPontuacao = -Infinity;

        for (let indice = 0; indice < tabuleiro.length; indice++) {
            if (tabuleiro[indice] === "") {
                tabuleiro[indice] = "O";
                const pontuacaoDaJogada = minimax(tabuleiro, profundidade + 1, false);
                tabuleiro[indice] = "";
                melhorPontuacao = Math.max(melhorPontuacao, pontuacaoDaJogada);
            }
        }

        return melhorPontuacao;
    }

    let melhorPontuacao = Infinity;

    for (let indice = 0; indice < tabuleiro.length; indice++) {
        if (tabuleiro[indice] === "") {
            tabuleiro[indice] = "X";
            const pontuacaoDaJogada = minimax(tabuleiro, profundidade + 1, true);
            tabuleiro[indice] = "";
            melhorPontuacao = Math.min(melhorPontuacao, pontuacaoDaJogada);
        }
    }

    return melhorPontuacao;
}

// Procura uma jogada que complete uma vitória para o símbolo informado.
function encontrarJogadaTatica(tabuleiro, simbolo) {
    for (let indice = 0; indice < tabuleiro.length; indice++) {
        if (tabuleiro[indice] !== "") {
            continue;
        }

        tabuleiro[indice] = simbolo;
        const vence = combinacoesVencedoras.some(function (combinacao) {
            return combinacao.every(function (posicao) {
                return tabuleiro[posicao] === simbolo;
            });
        });
        tabuleiro[indice] = "";

        if (vence) {
            return indice;
        }
    }

    return null;
}

// Escolhe uma jogada conforme o nível selecionado.
function escolherJogadaDoComputador() {
    const tabuleiro = Array.from(casas).map(function (casa) {
        return casa.textContent;
    });

    const casasVazias = tabuleiro
        .map(function (valor, indice) { return valor === "" ? indice : null; })
        .filter(function (indice) { return indice !== null; });

    if (casasVazias.length === 0) {
        return null;
    }

    const nivel = seletorDificuldade.value;

    // Fácil: tenta vencer; se não puder, escolhe a primeira casa vazia.
    if (nivel === "facil") {
        const indiceVencedor = encontrarJogadaTatica(tabuleiro, "O");
        const indiceEscolhido = indiceVencedor === null
            ? casasVazias[0]
            : indiceVencedor;

        return casas[indiceEscolhido];
    }

    // Médio: vence, bloqueia X, prioriza o centro e depois os cantos.
    if (nivel === "medio") {
        let melhorIndice = encontrarJogadaTatica(tabuleiro, "O");

        if (melhorIndice === null) {
            melhorIndice = encontrarJogadaTatica(tabuleiro, "X");
        }

        if (melhorIndice === null && tabuleiro[4] === "") {
            melhorIndice = 4;
        }

        if (melhorIndice === null) {
            const cantos = [0, 2, 6, 8];
            melhorIndice = cantos.find(function (indice) {
                return tabuleiro[indice] === "";
            });
        }

        if (melhorIndice === null || melhorIndice === undefined) {
            melhorIndice = casasVazias[0];
        }

        return casas[melhorIndice];
    }
    // Difícil: minimax compara os resultados de todas as continuações possíveis.
    let melhorPontuacao = -Infinity;
    let melhorIndice = null;

    for (let indice = 0; indice < tabuleiro.length; indice++) {
        if (tabuleiro[indice] === "") {
            tabuleiro[indice] = "O";
            const pontuacaoDaJogada = minimax(tabuleiro, 0, false);
            tabuleiro[indice] = "";

            if (pontuacaoDaJogada > melhorPontuacao) {
                melhorPontuacao = pontuacaoDaJogada;
                melhorIndice = indice;
            }
        }
    }

    return melhorIndice === null ? null : casas[melhorIndice];
}
// Registra jogadas e conecta a pessoa contra o computador.
casas.forEach(function (casa) {
    casa.addEventListener("click", function () {
        if (casa.textContent !== "" || jogoEncerrado) {
            return;
        }

        casa.textContent = jogadorAtual;

        const numeroDaCasa = Number(casa.dataset.index) + 1;
        casa.setAttribute("aria-label", `Casa ${numeroDaCasa}: ${jogadorAtual}`);
        casa.classList.add(jogadorAtual === "X" ? "jogada-x" : "jogada-o");

        const combinacaoVencedora = verificarVitoria();

        if (combinacaoVencedora) {
            pontuacao[jogadorAtual]++;
            atualizarPlacar();
            mensagem.textContent = `Jogador ${jogadorAtual} venceu!`;
            jogoEncerrado = true;

            combinacaoVencedora.forEach(function (indice) {
                casas[indice].classList.add("vencedora");
            });

            return;
        }

        const todasCasasPreenchidas = Array.from(casas).every(function (casa) {
            return casa.textContent !== "";
        });

        if (todasCasasPreenchidas) {
            pontuacao.empates++;
            atualizarPlacar();
            mensagem.textContent = "Empate!";
            jogoEncerrado = true;
            return;
        }

        jogadorAtual = jogadorAtual === "X" ? "O" : "X";
        mensagem.textContent = `Vez de ${jogadorAtual}`;

        // Quando a vez passa para O, o computador usa minimax para escolher.
        if (jogadorAtual === "O" && seletorModo.value === "computador") {
            const casaComputador = escolherJogadaDoComputador();

            if (casaComputador !== null) {
                casaComputador.click();
            }
        }
    });
});

// Reinicia o tabuleiro, mas mantém o placar.
botaoReiniciar.addEventListener("click", function () {
    casas.forEach(function (casa) {
        casa.textContent = "";
        const numeroDaCasa = Number(casa.dataset.index) + 1;
        casa.setAttribute("aria-label", `Casa ${numeroDaCasa}`);
        casa.classList.remove("jogada-x", "jogada-o", "vencedora");
    });

    jogadorAtual = "X";
    jogoEncerrado = false;
    mensagem.textContent = "Vez de X";
});

// Zera o placar depois da confirmação.
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

