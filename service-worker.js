const CACHE_NAME = "jogo-da-velha-v10";
const APP_FILES = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json",
    "/icon-192.png",
    "/icon-512.png"
];

self.addEventListener("install", function (evento) {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(APP_FILES);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", function (evento) {
    evento.waitUntil(
        caches.keys()
            .then(function (nomes) {
                return Promise.all(
                    nomes
                        .filter(function (nome) {
                            return nome.startsWith("jogo-da-velha-") && nome !== CACHE_NAME;
                        })
                        .map(function (nome) {
                            return caches.delete(nome);
                        })
                );
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});

self.addEventListener("fetch", function (evento) {
    const requisicao = evento.request;
    const url = new URL(requisicao.url);

    // As chamadas ao Firebase são externas e passam direto pela rede.
    if (requisicao.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    if (requisicao.mode === "navigate") {
        evento.respondWith(
            fetch(requisicao)
                .then(function (resposta) {
                    const copia = resposta.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put("/index.html", copia);
                    });
                    return resposta;
                })
                .catch(function () {
                    return caches.match("/index.html").then(function (respostaSalva) {
                        return respostaSalva || new Response("Você está offline.", { status: 503 });
                    });
                })
        );
        return;
    }

    evento.respondWith(
        fetch(requisicao)
            .then(function (resposta) {
                if (resposta.ok) {
                    const copia = resposta.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(requisicao, copia);
                    });
                }
                return resposta;
            })
            .catch(function () {
                return caches.match(requisicao).then(function (respostaSalva) {
                    return respostaSalva || new Response("Recurso indisponível offline.", { status: 503 });
                });
            })
    );
});