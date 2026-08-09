const campoBusca = document.querySelector("#campo_busca");
const botaoBusca = document.querySelector("#botao_busca");
const listaFilmes = document.querySelector("#lista_filmes");
const URL_IMAGEM = "https://image.tmdb.org/t/p/w500";
const modal = document.querySelector("#modal");
const fecharModal = document.querySelector("#fechar_modal");
const detalhesFilme = document.querySelector("#detalhes_filme");
const linkInicio = document.querySelector("#link_inicio");
const linkFavoritos = document.querySelector("#link_favoritos");
const tituloSecao = document.querySelector("#titulo_secao");

/* . = classe
   # = id */

function carregarFavoritosSalvos() {
    try {
        return JSON.parse(localStorage.getItem("moviebox_favoritos")) || [];
    } catch (erro) {
        console.warn("Não foi possível ler os favoritos salvos:", erro);
        return [];
    }
}

let favoritos = carregarFavoritosSalvos();

function salvarFavoritos() {
    localStorage.setItem(
        "moviebox_favoritos",
        JSON.stringify(favoritos)
    );
}

function filmeEstaFavoritado(id) {
    return favoritos.some(function (filme) {
        return filme.id === id;
    });
}

function atualizarBotaoFavorito(botao, id) {
    const estaFavoritado = filmeEstaFavoritado(id);

    botao.textContent = "♥";
    botao.classList.toggle("favorito_ativo", estaFavoritado);
    botao.setAttribute("aria-pressed", String(estaFavoritado));
    botao.setAttribute(
        "aria-label",
        estaFavoritado
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos"
    );
    botao.title = estaFavoritado
        ? "Remover dos favoritos"
        : "Adicionar aos favoritos";
}

function alternarFavorito(filme, botao) {
    const indice = favoritos.findIndex(function (favorito) {
        return favorito.id === filme.id;
    });

    if (indice === -1) {
        favoritos.push({
            id: filme.id,
            title: filme.title,
            poster_path: filme.poster_path,
            vote_average: filme.vote_average
        });
    } else {
        favoritos.splice(indice, 1);
    }

    salvarFavoritos();
    atualizarBotaoFavorito(botao, filme.id);

    if (tituloSecao.textContent === "Meus favoritos") {
        mostrarFavoritos();
    }
}

function carregarPlayerLocal() {
    if (
        typeof LOCAL_PLAYER_ENABLED === "undefined" ||
        LOCAL_PLAYER_ENABLED === false
    ) {
        return;
    }

    const script = document.createElement("script");
    script.src = "player.local.js";

    script.addEventListener("load", function () {
        console.log("Player local carregado.");
    });

    script.addEventListener("error", function () {
        console.warn("Player local não encontrado.");
    });

    document.head.appendChild(script);
}

carregarPlayerLocal();

function mostrarMensagem(texto) {
    listaFilmes.innerHTML = "";

    const mensagem = document.createElement("p");
    mensagem.classList.add("mensagem");
    mensagem.textContent = texto;

    listaFilmes.appendChild(mensagem);
}

async function carregarFilmesPopulares() {
    mostrarMensagem("Carregando filmes...");

    try {
        const url =
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os filmes.");
        }

        const dados = await resposta.json();
        mostrarFilmes(dados.results);

    } catch (erro) {
        console.error("Erro ao carregar filmes populares:", erro);
        mostrarMensagem("Não foi possível carregar os filmes.");
    }
}

function criarCardFilme(filme) {
    const card = document.createElement("article");
    card.classList.add("card_filme");

    if (filme.poster_path) {
        const capa = document.createElement("img");
        capa.classList.add("capa_filme");
        capa.src = `${URL_IMAGEM}${filme.poster_path}`;
        capa.alt = `Pôster de ${filme.title}`;
        card.appendChild(capa);
    } else {
        const semCapa = document.createElement("div");
        semCapa.classList.add("sem_capa");
        semCapa.textContent = "?";
        card.appendChild(semCapa);
    }

    const conteudo = document.createElement("div");
    conteudo.classList.add("card_conteudo");

    const titulo = document.createElement("h2");
    titulo.textContent = filme.title;

    const nota = document.createElement("p");
    const notaValor = Number(filme.vote_average);
    nota.textContent = Number.isFinite(notaValor)
        ? `⭐ ${notaValor.toFixed(1)}`
        : "⭐ —";

    conteudo.appendChild(titulo);
    conteudo.appendChild(nota);
    card.appendChild(conteudo);

    card.addEventListener("click", function () {
        carregarDetalhesFilme(filme.id);
    });

    return card;
}

function mostrarFilmes(filmes) {
    listaFilmes.innerHTML = "";

    if (!filmes || filmes.length === 0) {
        mostrarMensagem("Nenhum filme encontrado.");
        return;
    }

    filmes.forEach(function (filme) {
        const card = criarCardFilme(filme);
        listaFilmes.appendChild(card);
    });
}

async function buscarFilmes() {
    const termo = campoBusca.value.trim();

    if (termo === "") {
        mostrarInicio();
        return;
    }

    tituloSecao.textContent = `Resultados para "${termo}"`;
    mostrarMensagem("Buscando filmes...");

    try {
        const url =
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(termo)}`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Não foi possível pesquisar os filmes.");
        }

        const dados = await resposta.json();
        mostrarFilmes(dados.results);

    } catch (erro) {
        console.error("Erro ao pesquisar filmes:", erro);
        mostrarMensagem("Não foi possível realizar a pesquisa.");
    }
}

async function carregarDetalhesFilme(id) {
    abrirModal();
    detalhesFilme.innerHTML = "<p class=\"mensagem_modal\">Carregando detalhes...</p>";

    try {
        const url =
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os detalhes.");
        }

        const filme = await resposta.json();
        mostrarDetalhesFilme(filme);

    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
        detalhesFilme.innerHTML =
            "<p class=\"mensagem_modal\">Não foi possível carregar os detalhes do filme.</p>";
    }
}

function abrirModal() {
    modal.classList.add("ativo");
}

function mostrarDetalhesFilme(filme) {
    detalhesFilme.innerHTML = "";

    const acoes = document.createElement("div");
    acoes.classList.add("acoes_filme");

    const botaoTrailer = document.createElement("button");
    botaoTrailer.type = "button";
    botaoTrailer.classList.add("botao_assistir");
    botaoTrailer.textContent = "▶ Assistir trailer";

    botaoTrailer.addEventListener("click", function () {
        abrirTrailer(filme);
    });

    acoes.appendChild(botaoTrailer);

    const botaoFavorito = document.createElement("button");
    botaoFavorito.type = "button";
    botaoFavorito.classList.add("botao_favorito_icone");

    atualizarBotaoFavorito(botaoFavorito, filme.id);

    botaoFavorito.addEventListener("click", function () {
        alternarFavorito(filme, botaoFavorito);
    });

    acoes.appendChild(botaoFavorito);

    if (typeof window.criarBotaoPlayerLocal === "function") {
        const botaoLocal = window.criarBotaoPlayerLocal(filme);

        if (botaoLocal) {
            acoes.appendChild(botaoLocal);
        }
    }

    const backdrop = document.createElement("div");
    backdrop.classList.add("modal_backdrop");

    if (filme.backdrop_path) {
        backdrop.style.backgroundImage =
            `url(${URL_IMAGEM}${filme.backdrop_path})`;
    }

    const layout = document.createElement("div");
    layout.classList.add("detalhes_layout");

    const poster = document.createElement("img");
    poster.classList.add("detalhes_poster");

    if (filme.poster_path) {
        poster.src = `${URL_IMAGEM}${filme.poster_path}`;
    }

    poster.alt = `Pôster de ${filme.title}`;

    const info = document.createElement("div");
    info.classList.add("detalhes_info");

    const titulo = document.createElement("h2");
    titulo.textContent = filme.title;

    const meta = document.createElement("div");
    meta.classList.add("detalhes_meta");

    const ano = filme.release_date
        ? filme.release_date.slice(0, 4)
        : "Ano não informado";

    const duracao = filme.runtime
        ? formatarDuracao(filme.runtime)
        : "Duração não informada";

    const nota = Number(filme.vote_average);
    const notaTexto = Number.isFinite(nota)
        ? `⭐ ${nota.toFixed(1)}`
        : "Sem avaliação";

    const anoElemento = document.createElement("span");
    anoElemento.textContent = ano;

    const duracaoElemento = document.createElement("span");
    duracaoElemento.textContent = `• ${duracao}`;

    const notaElemento = document.createElement("span");
    notaElemento.textContent = `• ${notaTexto}`;

    meta.appendChild(anoElemento);
    meta.appendChild(duracaoElemento);
    meta.appendChild(notaElemento);

    const generos = document.createElement("div");
    generos.classList.add("detalhes_generos");

    (filme.genres || []).forEach(function (genero) {
        const generoElemento = document.createElement("span");
        generoElemento.classList.add("genero");
        generoElemento.textContent = genero.name;
        generos.appendChild(generoElemento);
    });

    const tituloSinopse = document.createElement("h3");
    tituloSinopse.classList.add("titulo_sinopse");
    tituloSinopse.textContent = "Sinopse";

    const sinopse = document.createElement("p");
    sinopse.classList.add("sinopse");
    sinopse.textContent =
        filme.overview ||
        "Sinopse não disponível para este filme.";

    info.appendChild(titulo);
    info.appendChild(meta);
    info.appendChild(generos);
    info.appendChild(acoes);
    info.appendChild(tituloSinopse);
    info.appendChild(sinopse);

    layout.appendChild(poster);
    layout.appendChild(info);

    detalhesFilme.appendChild(backdrop);
    detalhesFilme.appendChild(layout);
}

function mostrarFavoritos() {
    tituloSecao.textContent = "Meus favoritos";

    if (favoritos.length === 0) {
        mostrarMensagem(
            "Você ainda não adicionou nenhum filme aos favoritos."
        );
        return;
    }

    mostrarFilmes(favoritos);
}

function formatarDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    return `${horas}h ${minutosRestantes}min`;
}

function encontrarTrailer(filme) {
    const videos = filme.videos?.results || [];

    const trailerOficial = videos.find(function (video) {
        return (
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official === true
        );
    });

    if (trailerOficial) {
        return trailerOficial;
    }

    const trailer = videos.find(function (video) {
        return (
            video.site === "YouTube" &&
            video.type === "Trailer"
        );
    });

    if (trailer) {
        return trailer;
    }

    const teaser = videos.find(function (video) {
        return (
            video.site === "YouTube" &&
            video.type === "Teaser"
        );
    });

    return teaser || null;
}

function abrirTrailer(filme) {
    const trailer = encontrarTrailer(filme);

    if (!trailer) {
        alert("Nenhum trailer disponível para este filme.");
        return;
    }

    detalhesFilme.innerHTML = "";

    const playerContainer = document.createElement("div");
    playerContainer.classList.add("player_container");

    const topoPlayer = document.createElement("div");
    topoPlayer.classList.add("player_topo");

    const voltar = document.createElement("button");
    voltar.type = "button";
    voltar.classList.add("botao_voltar");
    voltar.textContent = "← Voltar";

    const titulo = document.createElement("h2");
    titulo.textContent = `Trailer — ${filme.title}`;

    voltar.addEventListener("click", function () {
        mostrarDetalhesFilme(filme);
    });

    topoPlayer.appendChild(voltar);
    topoPlayer.appendChild(titulo);

    const iframe = document.createElement("iframe");
    iframe.classList.add("player_filme");
    iframe.src =
        `https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1`;
    iframe.allowFullscreen = true;
    iframe.setAttribute(
        "allow",
        "autoplay; encrypted-media; picture-in-picture; fullscreen"
    );
    iframe.setAttribute(
        "referrerpolicy",
        "strict-origin-when-cross-origin"
    );

    playerContainer.appendChild(topoPlayer);
    playerContainer.appendChild(iframe);
    detalhesFilme.appendChild(playerContainer);
}

function fecharModalFilme() {
    const players = detalhesFilme.querySelectorAll("iframe");

    players.forEach(function (player) {
        player.src = "about:blank";
        player.remove();
    });

    detalhesFilme.innerHTML = "";
    modal.classList.remove("ativo");
}

function mostrarInicio() {
    campoBusca.value = "";
    tituloSecao.textContent = "Filmes populares";
    carregarFilmesPopulares();
}

linkInicio.addEventListener("click", function (event) {
    event.preventDefault();
    mostrarInicio();
});

linkFavoritos.addEventListener("click", function (event) {
    event.preventDefault();
    mostrarFavoritos();
});

fecharModal.addEventListener("click", fecharModalFilme);
botaoBusca.addEventListener("click", buscarFilmes);

campoBusca.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        buscarFilmes();
    }
});

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        fecharModalFilme();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        fecharModalFilme();
    }
});

carregarFilmesPopulares();
