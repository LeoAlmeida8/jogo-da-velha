import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getDatabase, ref, set, remove, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTZju0MVUUt8e5iDWUCaaYu6Cv-SWkMFs",
  authDomain: "jogo-da-velha-online-a0599.firebaseapp.com",
  databaseURL: "https://jogo-da-velha-online-a0599-default-rtdb.firebaseio.com/",
  projectId: "jogo-da-velha-online-a0599",
  storageBucket: "jogo-da-velha-online-a0599.firebasestorage.app",
  messagingSenderId: "608548884999",
  appId: "1:608548884999:web:4063a306f749b3e118d0a2",
  measurementId: "G-8NQ7GGXNYD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let usuarioAtual = null;
let codigoSalaAtual = null;
let meuSimboloOnline = null;
let pararDeOuvirSala = null;

signInAnonymously(auth)
    .then(function (credencial) {
        usuarioAtual = credencial.user;
        console.log("Jogador conectado ao Firebase.");
    })
    .catch(function (erro) {
        console.error("Erro ao conectar:", erro);
    });

const database = getDatabase(app);

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

const controlesOnline = document.querySelector("#controles-online");

const configuracaoDificuldade = document.querySelector(".configuracao-dificuldade");

// Elementos usados para criar uma sala online.
const botaoCriarSala = document.querySelector("#criar-sala");
const botaoEntrarSala = document.querySelector("#entrar-sala");
const botaoSairSala = document.querySelector("#sair-sala");
const botaoCopiarCodigo = document.querySelector("#copiar-codigo");
const campoCodigoSala = document.querySelector("#codigo-sala");
const statusSala = document.querySelector("#status-sala");

botaoCopiarCodigo.addEventListener("click", async function () {
    if (!codigoSalaAtual) {
        statusSala.textContent = "Crie ou entre em uma sala antes de copiar o código.";
        return;
    }

    try {
        await navigator.clipboard.writeText(codigoSalaAtual);
        statusSala.textContent = "Código copiado! Envie-o ao outro jogador.";
    } catch (erro) {
        console.error("Não foi possível copiar o código:", erro);
        campoCodigoSala.focus();
        campoCodigoSala.select();
        statusSala.textContent = "O código foi selecionado. Copie usando Ctrl+C.";
    }
});

// Limpa o vínculo desta janela com uma sala e deixa o jogo pronto no modo local.
function limparSalaLocal(textoMensagem) {
    if (pararDeOuvirSala) {
        pararDeOuvirSala();
        pararDeOuvirSala = null;
    }

    codigoSalaAtual = null;
    meuSimboloOnline = null;
    campoCodigoSala.value = "";

    casas.forEach(function (casa) {
        casa.textContent = "";
        const numeroDaCasa = Number(casa.dataset.index) + 1;
        casa.setAttribute("aria-label", `Casa ${numeroDaCasa}`);
        casa.classList.remove("jogada-x", "jogada-o", "vencedora");
    });

    jogadorAtual = "X";
    jogoEncerrado = false;
    mensagem.textContent = textoMensagem;
    atualizarPlacar();

    seletorModo.value = "humano";
    atualizarModo();
}

// Mantém o tabuleiro desta tela atualizado com os dados da sala no Firebase.
function ouvirSala(codigo) {
    // Para de observar uma sala anterior antes de entrar em outra.
    if (pararDeOuvirSala) {
        pararDeOuvirSala();
    }

    pararDeOuvirSala = onValue(ref(database, "salas/" + codigo), function (snapshot) {
        const sala = snapshot.val();

        if (!sala) {
            limparSalaLocal("A sala foi encerrada pelo criador. Você voltou ao modo local.");
            return;
        }

        const partida = sala.partida;

        if (!partida) {
            statusSala.textContent = "Esta sala usa um formato antigo. Crie uma sala nova.";
            return;
        }

        // No modo online, o placar fica salvo junto com a sala no Firebase.
        const placarOnline = partida.placar || { X: 0, O: 0, empates: 0 };
        placar.textContent =
            `X: ${placarOnline.X} | O: ${placarOnline.O} | Empates: ${placarOnline.empates}`;

        const tabuleiro = partida.tabuleiro || [];

        // Copia os símbolos recebidos do Firebase para as nove casas da página.
        casas.forEach(function (casa, indice) {
            const simbolo = tabuleiro[indice] || "";
            const numeroDaCasa = indice + 1;

            casa.textContent = simbolo;
            casa.setAttribute(
                "aria-label",
                simbolo ? `Casa ${numeroDaCasa}: ${simbolo}` : `Casa ${numeroDaCasa}`
            );
            casa.classList.toggle("jogada-x", simbolo === "X");
            casa.classList.toggle("jogada-o", simbolo === "O");
            casa.classList.remove("vencedora");
        });

        jogadorAtual = partida.jogadorAtual || "X";
        jogoEncerrado = partida.status === "encerrada" || partida.status === "empate";

        const combinacaoVencedora = partida.vencedor
            ? combinacoesVencedoras.find(function (combinacao) {
                return combinacao.every(function (indice) {
                    return tabuleiro[indice] === partida.vencedor;
                });
            })
            : null;

        if (combinacaoVencedora) {
            combinacaoVencedora.forEach(function (indice) {
                casas[indice].classList.add("vencedora");
            });
        }

        if (partida.status === "aguardando") {
            mensagem.textContent = "Aguardando o jogador O";
        } else if (partida.status === "encerrada") {
            mensagem.textContent = `Jogador ${partida.vencedor} venceu!`;
        } else if (partida.status === "empate") {
            mensagem.textContent = "Empate!";
        } else {
            mensagem.textContent = `Vez de ${jogadorAtual}`;
        }
    }, function (erro) {
        console.error("A conexão com a sala foi encerrada:", erro);
        limparSalaLocal("Você não está mais nesta sala. Voltou ao modo local.");
    });
}

botaoCriarSala.addEventListener("click", async function () {
    if (!usuarioAtual) {
        statusSala.textContent = "Conectando ao Firebase. Tente novamente em instantes.";
        return;
    }

    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    const sala = {
        jogadorX: usuarioAtual.uid,
        jogadorO: null,
        partida: {
            tabuleiro: ["", "", "", "", "", "", "", "", ""],
            jogadorAtual: "X",
            status: "aguardando",
            vencedor: null,
            placar: { X: 0, O: 0, empates: 0 }
        }
    };

    try {
        await set(ref(database, "salas/" + codigo), sala);
        codigoSalaAtual = codigo;
        meuSimboloOnline = "X";
        ouvirSala(codigo);
        campoCodigoSala.value = codigo;
        statusSala.textContent = "Sala criada! Compartilhe o código com o outro jogador.";
    } catch (erro) {
        console.error("Erro ao criar a sala:", erro);
        statusSala.textContent = "Não foi possível criar a sala.";
    }
});

botaoEntrarSala.addEventListener("click", async function () {
    const codigo = campoCodigoSala.value.trim().toUpperCase();

    if (!usuarioAtual) {
        statusSala.textContent = "Conectando ao Firebase. Tente novamente em instantes.";
        return;
    }

    if (codigo.length !== 6) {
        statusSala.textContent = "Digite um código de sala com 6 caracteres.";
        return;
    }

    try {
        // As regras do Firebase só permitem ocupar a vaga de O uma vez.
        await set(ref(database, "salas/" + codigo + "/jogadorO"), usuarioAtual.uid);

        // A partida começa quando o segundo jogador entra.
        await set(
            ref(database, "salas/" + codigo + "/partida/status"),
            "jogando"
        );

        codigoSalaAtual = codigo;
        meuSimboloOnline = "O";
        ouvirSala(codigo);
        statusSala.textContent = "Você entrou na sala! Você joga como O.";
    } catch (erro) {
        console.error("Erro ao entrar na sala:", erro);
        statusSala.textContent = "Não foi possível entrar. Confira o código: a sala pode não existir, já ter começado ou estar cheia.";
    }
});

// Libera a vaga de O ou encerra a sala quando quem sai é o criador X.
botaoSairSala.addEventListener("click", async function () {
    if (!codigoSalaAtual || !meuSimboloOnline) {
        limparSalaLocal("Você saiu da sala. Vez de X");
        return;
    }

    const codigo = codigoSalaAtual;
    const simbolo = meuSimboloOnline;
    const confirmou = window.confirm(
        simbolo === "X"
            ? "Você criou esta sala. Sair vai encerrá-la para os dois jogadores. Continuar?"
            : "Sair vai liberar a vaga de O e reiniciar o tabuleiro para o jogador X. Continuar?"
    );

    if (!confirmou) {
        return;
    }

    try {
        if (simbolo === "X") {
            // X é o criador; apagar a sala encerra a partida para ambos.
            await remove(ref(database, "salas/" + codigo));
        } else {
            // Primeiro põe a sala em espera enquanto O ainda tem permissão.
            const resultado = await runTransaction(
                ref(database, "salas/" + codigo + "/partida"),
                function (partida) {
                    if (!partida) {
                        return;
                    }

                    return {
                        ...partida,
                        tabuleiro: ["", "", "", "", "", "", "", "", ""],
                        jogadorAtual: "X",
                        status: "aguardando",
                        vencedor: null
                    };
                },
                { applyLocally: false }
            );

            if (!resultado.committed) {
                throw new Error("A partida não pôde ser reiniciada antes da saída.");
            }

            // Para de ouvir antes de apagar a própria vaga e perder acesso à sala.
            if (pararDeOuvirSala) {
                pararDeOuvirSala();
                pararDeOuvirSala = null;
            }

            await set(ref(database, "salas/" + codigo + "/jogadorO"), null);
        }

        limparSalaLocal("Você saiu da sala. Vez de X");
    } catch (erro) {
        console.error("Erro ao sair da sala:", erro);

        // Se a liberação falhar, restabelece a escuta desta sala.
        if (codigoSalaAtual === codigo && !pararDeOuvirSala) {
            ouvirSala(codigo);
        }

        statusSala.textContent = "Não foi possível sair da sala. Confira as regras do Firebase.";
    }
});

function atualizarModo() {
    const modoOnline = seletorModo.value === "online";

    controlesOnline.hidden = !modoOnline;
    configuracaoDificuldade.hidden = modoOnline;
}

seletorModo.addEventListener("change", atualizarModo);
atualizarModo();

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

// Envia uma jogada ao Firebase. A transação confere o estado mais recente
// antes de gravar, mesmo que os dois jogadores cliquem quase ao mesmo tempo.
async function enviarJogadaOnline(indice) {
    if (!codigoSalaAtual || !meuSimboloOnline) {
        statusSala.textContent = "Crie uma sala ou entre em uma sala antes de jogar.";
        return;
    }

    try {
        const resultado = await runTransaction(
            ref(database, "salas/" + codigoSalaAtual + "/partida"),
            function (partida) {
                if (
                    !partida ||
                    partida.status !== "jogando" ||
                    partida.jogadorAtual !== meuSimboloOnline ||
                    partida.tabuleiro[indice] !== ""
                ) {
                    return;
                }

                const novoTabuleiro = [...partida.tabuleiro];
                novoTabuleiro[indice] = meuSimboloOnline;

                const venceu = combinacoesVencedoras.some(function (combinacao) {
                    return combinacao.every(function (posicao) {
                        return novoTabuleiro[posicao] === meuSimboloOnline;
                    });
                });

                const empatou = novoTabuleiro.every(function (casa) {
                    return casa !== "";
                });

                const placarAtual = partida.placar || { X: 0, O: 0, empates: 0 };
                const novoPlacar = { ...placarAtual };

                if (venceu) {
                    novoPlacar[meuSimboloOnline]++;
                } else if (empatou) {
                    novoPlacar.empates++;
                }

                return {
                    ...partida,
                    tabuleiro: novoTabuleiro,
                    jogadorAtual: venceu || empatou
                        ? partida.jogadorAtual
                        : (meuSimboloOnline === "X" ? "O" : "X"),
                    status: venceu ? "encerrada" : empatou ? "empate" : "jogando",
                    vencedor: venceu ? meuSimboloOnline : null,
                    placar: novoPlacar
                };
            },
            { applyLocally: false }
        );

        if (!resultado.committed) {
            statusSala.textContent = "Aguarde a sua vez ou a entrada do outro jogador.";
        }
    } catch (erro) {
        console.error("Erro ao enviar a jogada:", erro);
        statusSala.textContent = "Não foi possível enviar a jogada.";
    }
}

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
        if (seletorModo.value === "online") {
            if (casa.textContent === "") {
                enviarJogadaOnline(Number(casa.dataset.index));
            }
            return;
        }

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
botaoReiniciar.addEventListener("click", async function () {
    if (seletorModo.value === "online") {
        if (!codigoSalaAtual || !meuSimboloOnline) {
            statusSala.textContent = "Crie ou entre em uma sala antes de reiniciar a partida online.";
            return;
        }

        try {
            const resultado = await runTransaction(
                ref(database, "salas/" + codigoSalaAtual + "/partida"),
                function (partida) {
                    // Não começa uma partida enquanto o segundo jogador não entrou.
                    if (!partida || partida.status === "aguardando") {
                        return;
                    }

                    // Grava o novo estado em uma única operação para sincronizar as telas.
                    return {
                        ...partida,
                        tabuleiro: ["", "", "", "", "", "", "", "", ""],
                        jogadorAtual: "X",
                        status: "jogando",
                        vencedor: null
                    };
                },
                { applyLocally: false }
            );

            if (resultado.committed) {
                statusSala.textContent = "Nova rodada iniciada para os dois jogadores!";
            } else {
                statusSala.textContent = "Aguarde o outro jogador entrar antes de começar a partida.";
            }
        } catch (erro) {
            console.error("Erro ao reiniciar a partida online:", erro);
            statusSala.textContent = "Não foi possível reiniciar a partida online.";
        }
        return;
    }

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
botaoZerarPlacar.addEventListener("click", async function () {
    const confirmou = window.confirm("Deseja realmente zerar o placar?");

    if (!confirmou) {
        return;
    }

    if (seletorModo.value === "online") {
        if (!codigoSalaAtual || !meuSimboloOnline) {
            statusSala.textContent = "Crie ou entre em uma sala antes de zerar o placar online.";
            return;
        }

        try {
            const resultado = await runTransaction(
                ref(database, "salas/" + codigoSalaAtual + "/partida"),
                function (partida) {
                    if (!partida) {
                        return;
                    }

                    // Muda somente o placar; tabuleiro e rodada continuam iguais.
                    return {
                        ...partida,
                        placar: { X: 0, O: 0, empates: 0 }
                    };
                },
                { applyLocally: false }
            );

            statusSala.textContent = resultado.committed
                ? "Placar da sala zerado para os dois jogadores."
                : "Não foi possível zerar o placar desta sala.";
        } catch (erro) {
            console.error("Erro ao zerar o placar online:", erro);
            statusSala.textContent = "Não foi possível zerar o placar online.";
        }

        return;
    }

    pontuacao.X = 0;
    pontuacao.O = 0;
    pontuacao.empates = 0;
    atualizarPlacar();
});

