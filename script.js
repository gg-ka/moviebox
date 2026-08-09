const campoBusca = document.querySelector("#campo_busca");
const botaoBusca = document.querySelector("#botao_busca");
const listaFilmes = document.querySelector("#lista_filmes");

const modal = document.querySelector("#modal");
const fecharModal = document.querySelector("#fechar_modal");
const detalhesFilme = document.querySelector("#detalhes_filme");

const linkInicio = document.querySelector("#link_inicio");
const linkFavoritos = document.querySelector("#link_favoritos");
const tituloSecao = document.querySelector("#titulo_secao");

const destaque = document.querySelector("#destaque");
const destaqueTitulo = document.querySelector("#destaque_titulo");
const destaqueAno = document.querySelector("#destaque_ano");
const destaqueNota = document.querySelector("#destaque_nota");
const destaqueSinopse = document.querySelector("#destaque_sinopse");
const destaqueTrailer = document.querySelector("#destaque_trailer");
const destaqueDetalhes = document.querySelector("#destaque_detalhes");

const catalogoHome = document.querySelector("#catalogo_home");
const resultadosView = document.querySelector("#resultados_view");
const listaPopulares = document.querySelector("#lista_populares");
const listaAvaliados = document.querySelector("#lista_avaliados");
const listaCartaz = document.querySelector("#lista_cartaz");
const listaLancamentos = document.querySelector("#lista_lancamentos");

const URL_IMAGEM = "https://image.tmdb.org/t/p/w500";
const URL_BACKDROP = "https://image.tmdb.org/t/p/w1280";

let filmeDestaqueAtual = null;


/*
    . = classe
    # = id
*/


// marca no menu qual parte do site esta aberta
function atualizarMenuAtivo(linkAtivo = null) {

    linkInicio.classList.remove("ativo");
    linkFavoritos.classList.remove("ativo");

    linkInicio.removeAttribute("aria-current");
    linkFavoritos.removeAttribute("aria-current");

    if (linkAtivo) {

        linkAtivo.classList.add("ativo");

        linkAtivo.setAttribute(
            "aria-current",
            "page"
        );
    }
}


function mostrarTelaHome() {

    catalogoHome.classList.remove(
        "oculto"
    );

    resultadosView.classList.add(
        "oculto"
    );

    destaque.classList.remove(
        "destaque_oculto"
    );

    atualizarMenuAtivo(
        linkInicio
    );
}


function mostrarTelaResultados() {

    catalogoHome.classList.add(
        "oculto"
    );

    resultadosView.classList.remove(
        "oculto"
    );

    destaque.classList.add(
        "destaque_oculto"
    );

    // pesquisa nao eh inicio nem favoritos, entao nao marco nenhum
    atualizarMenuAtivo();
}


/* =========================
   HOME / CATEGORIAS
========================= */


function mostrarCarrossel(
    filmes,
    container
) {

    container.innerHTML = "";


    filmes.forEach(
        function (filme) {

            const card =
                criarCardFilme(filme);

            card.classList.add(
                "card_carrossel"
            );

            container.appendChild(
                card
            );
        }
    );


    container.scrollLeft = 0;


    requestAnimationFrame(
        function () {

            atualizarBotoesCarrossel(
                container
            );
        }
    );
}


async function buscarCategoria(
    endpoint
) {

    const url =
        `https://api.themoviedb.org/3${endpoint}?api_key=${API_KEY}&language=pt-BR&region=BR`;


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            `Não foi possível carregar ${endpoint}`
        );
    }


    const dados =
        await resposta.json();


    return dados.results;
}


/*
    o upcoming da tmdb as vezes traz filme que ja saiu,
    entao filtro pela data aq
*/

function filtrarProximosLancamentos(
    filmes
) {

    const hoje =
        new Date();


    return filmes.filter(
        function (filme) {

            if (!filme.release_date) {

                return false;
            }


            const dataLancamento =
                new Date(
                    filme.release_date +
                    "T00:00:00"
                );


            return dataLancamento > hoje;
        }
    );
}


async function carregarHome() {

    mostrarTelaHome();


    try {

        const [
            populares,
            avaliados,
            cartaz,
            lancamentos
        ] = await Promise.all([

            buscarCategoria(
                "/movie/popular"
            ),

            buscarCategoria(
                "/movie/top_rated"
            ),

            buscarCategoria(
                "/movie/now_playing"
            ),

            buscarCategoria(
                "/movie/upcoming"
            )

        ]);


        mostrarDestaque(
            populares
        );


        mostrarCarrossel(
            populares,
            listaPopulares
        );


        mostrarCarrossel(
            avaliados,
            listaAvaliados
        );


        mostrarCarrossel(
            cartaz,
            listaCartaz
        );


        const proximosLancamentos =
            filtrarProximosLancamentos(
                lancamentos
            );


        mostrarCarrossel(
            proximosLancamentos,
            listaLancamentos
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar a home:",
            erro
        );
    }
}


/* =========================
   CARROSSEIS
========================= */


function atualizarBotoesCarrossel(
    carrossel
) {

    const container =
        carrossel.closest(
            ".carrossel_container"
        );


    if (!container) {

        return;
    }


    const botaoAnterior =
        container.querySelector(
            ".botao_anterior"
        );


    const botaoProximo =
        container.querySelector(
            ".botao_proximo"
        );


    const estaNoInicio =
        carrossel.scrollLeft <= 5;


    const estaNoFim =
        carrossel.scrollLeft +
        carrossel.clientWidth >=
        carrossel.scrollWidth - 5;


    botaoAnterior.disabled =
        estaNoInicio;


    botaoProximo.disabled =
        estaNoFim;
}


function configurarCarrosseis() {

    const containers =
        document.querySelectorAll(
            ".carrossel_container"
        );


    containers.forEach(
        function (container) {

            const carrossel =
                container.querySelector(
                    ".carrossel_filmes"
                );


            const botaoAnterior =
                container.querySelector(
                    ".botao_anterior"
                );


            const botaoProximo =
                container.querySelector(
                    ".botao_proximo"
                );


            botaoAnterior.addEventListener(
                "click",
                function () {

                    const distancia =
                        carrossel.clientWidth *
                        0.8;


                    carrossel.scrollBy({

                        left:
                            -distancia,

                        behavior:
                            "smooth"
                    });
                }
            );


            botaoProximo.addEventListener(
                "click",
                function () {

                    const distancia =
                        carrossel.clientWidth *
                        0.8;


                    carrossel.scrollBy({

                        left:
                            distancia,

                        behavior:
                            "smooth"
                    });
                }
            );


            carrossel.addEventListener(
                "scroll",
                function () {

                    atualizarBotoesCarrossel(
                        carrossel
                    );
                }
            );
        }
    );
}


/* =========================
   FAVORITOS
========================= */


function carregarFavoritosSalvos() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "moviebox_favoritos"
            )
        ) || [];

    } catch (erro) {

        console.warn(
            "Não foi possível ler os favoritos salvos:",
            erro
        );


        return [];
    }
}


let favoritos =
    carregarFavoritosSalvos();


function salvarFavoritos() {

    localStorage.setItem(
        "moviebox_favoritos",
        JSON.stringify(
            favoritos
        )
    );
}


function filmeEstaFavoritado(id) {

    return favoritos.some(
        function (filme) {

            return filme.id === id;
        }
    );
}


/*
    atualiza todos os coracoes pq o mesmo filme pode
    aparecer em mais de uma fileira
*/

function atualizarCoracoesCards() {

    const botoes =
        document.querySelectorAll(
            ".favorito_card"
        );


    botoes.forEach(
        function (botao) {

            const id =
                Number(
                    botao.dataset.filmeId
                );


            const estaFavoritado =
                filmeEstaFavoritado(
                    id
                );


            botao.classList.toggle(
                "favorito_card_ativo",
                estaFavoritado
            );


            botao.setAttribute(
                "aria-pressed",
                String(
                    estaFavoritado
                )
            );


            botao.setAttribute(
                "aria-label",

                estaFavoritado
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
            );


            botao.title =
                estaFavoritado
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos";
        }
    );
}


function atualizarBotaoFavorito(
    botao,
    id
) {

    const estaFavoritado =
        filmeEstaFavoritado(
            id
        );


    botao.textContent =
        "♥";


    botao.classList.toggle(
        "favorito_ativo",
        estaFavoritado
    );


    botao.setAttribute(
        "aria-pressed",
        String(
            estaFavoritado
        )
    );


    botao.setAttribute(
        "aria-label",

        estaFavoritado
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos"
    );


    botao.title =
        estaFavoritado
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos";
}


function alternarFavorito(
    filme,
    botao = null
) {

    const indice =
        favoritos.findIndex(
            function (favorito) {

                return (
                    favorito.id ===
                    filme.id
                );
            }
        );


    if (indice === -1) {

        favoritos.push({

            id:
                filme.id,

            title:
                filme.title,

            poster_path:
                filme.poster_path,

            vote_average:
                filme.vote_average
        });

    } else {

        favoritos.splice(
            indice,
            1
        );
    }


    salvarFavoritos();


    atualizarCoracoesCards();


    // no modal eu passo o proprio botao pra atualizar ele tb
    if (botao) {

        atualizarBotaoFavorito(
            botao,
            filme.id
        );
    }


    if (
        tituloSecao.textContent ===
        "Meus favoritos"
    ) {

        mostrarFavoritos();
    }
}


/* =========================
   PLAYER LOCAL
========================= */


function carregarPlayerLocal() {

    if (
        typeof LOCAL_PLAYER_ENABLED ===
            "undefined" ||
        LOCAL_PLAYER_ENABLED ===
            false
    ) {

        return;
    }


    const script =
        document.createElement(
            "script"
        );


    script.src =
        "player.local.js";


    script.addEventListener(
        "load",
        function () {

            console.log(
                "Player local carregado."
            );
        }
    );


    script.addEventListener(
        "error",
        function () {

            console.warn(
                "Player local não encontrado."
            );
        }
    );


    document.head.appendChild(
        script
    );
}


carregarPlayerLocal();


/* =========================
   MENSAGENS / CARDS
========================= */


function mostrarMensagem(
    texto
) {

    listaFilmes.innerHTML =
        "";


    const mensagem =
        document.createElement(
            "p"
        );


    mensagem.classList.add(
        "mensagem"
    );


    mensagem.textContent =
        texto;


    listaFilmes.appendChild(
        mensagem
    );
}


function criarCardFilme(
    filme
) {

    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "card_filme"
    );


    if (filme.poster_path) {

        const capa =
            document.createElement(
                "img"
            );


        capa.classList.add(
            "capa_filme"
        );


        capa.src =
            `${URL_IMAGEM}${filme.poster_path}`;


        capa.alt =
            `Pôster de ${filme.title}`;


        card.appendChild(
            capa
        );

    } else {

        const semCapa =
            document.createElement(
                "div"
            );


        semCapa.classList.add(
            "sem_capa"
        );


        semCapa.textContent =
            "?";


        card.appendChild(
            semCapa
        );
    }


    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.classList.add(
        "card_conteudo"
    );


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        filme.title;


    const nota =
        document.createElement(
            "p"
        );


    const notaValor =
        Number(
            filme.vote_average
        );


    nota.textContent =
        Number.isFinite(
            notaValor
        )
            ? `⭐ ${notaValor.toFixed(1)}`
            : "⭐ —";


    conteudo.appendChild(
        titulo
    );


    conteudo.appendChild(
        nota
    );


    card.appendChild(
        conteudo
    );


    card.addEventListener(
        "click",
        function () {

            carregarDetalhesFilme(
                filme.id
            );
        }
    );


    const botaoFavorito =
        document.createElement(
            "button"
        );


    botaoFavorito.type =
        "button";


    botaoFavorito.classList.add(
        "favorito_card"
    );


    // guardo o id pra sincronizar os outros cards do mesmo filme
    botaoFavorito.dataset.filmeId =
        filme.id;


    botaoFavorito.textContent =
        "♥";


    const jaFavoritado =
        filmeEstaFavoritado(
            filme.id
        );


    botaoFavorito.classList.toggle(
        "favorito_card_ativo",
        jaFavoritado
    );


    botaoFavorito.setAttribute(
        "aria-pressed",
        String(
            jaFavoritado
        )
    );


    botaoFavorito.setAttribute(
        "aria-label",

        jaFavoritado
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos"
    );


    botaoFavorito.title =
        jaFavoritado
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos";


    botaoFavorito.addEventListener(
        "click",
        function (evento) {

            // sem isso o clique no coracao tb abriria o modal
            evento.stopPropagation();


            alternarFavorito(
                filme
            );
        }
    );


    card.appendChild(
        botaoFavorito
    );


    return card;
}


function mostrarFilmes(
    filmes
) {

    listaFilmes.innerHTML =
        "";


    if (
        !filmes ||
        filmes.length === 0
    ) {

        mostrarMensagem(
            "Nenhum filme encontrado."
        );


        return;
    }


    filmes.forEach(
        function (filme) {

            const card =
                criarCardFilme(
                    filme
                );


            listaFilmes.appendChild(
                card
            );
        }
    );
}


/* =========================
   PESQUISA
========================= */


async function buscarFilmes() {

    const termo =
        campoBusca.value.trim();


    if (termo === "") {

        mostrarInicio();

        return;
    }


    mostrarTelaResultados();


    tituloSecao.textContent =
        `Resultados para "${termo}"`;


    mostrarMensagem(
        "Buscando filmes..."
    );


    try {

        const url =
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(termo)}`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível pesquisar os filmes."
            );
        }


        const dados =
            await resposta.json();


        mostrarFilmes(
            dados.results
        );


    } catch (erro) {

        console.error(
            "Erro ao pesquisar filmes:",
            erro
        );


        mostrarMensagem(
            "Não foi possível realizar a pesquisa."
        );
    }
}


/* =========================
   DETALHES DO FILME
========================= */


async function carregarDetalhesFilme(
    id
) {

    abrirModal();


    detalhesFilme.innerHTML =
        '<p class="mensagem_modal">Carregando detalhes...</p>';


    try {

        const url =
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar os detalhes."
            );
        }


        const filme =
            await resposta.json();


        mostrarDetalhesFilme(
            filme
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar detalhes:",
            erro
        );


        detalhesFilme.innerHTML =
            '<p class="mensagem_modal">Não foi possível carregar os detalhes do filme.</p>';
    }
}


function abrirModal() {

    modal.classList.add(
        "ativo"
    );
}


function mostrarDetalhesFilme(
    filme
) {

    detalhesFilme.innerHTML =
        "";


    const acoes =
        document.createElement(
            "div"
        );


    acoes.classList.add(
        "acoes_filme"
    );


    const botaoFavorito =
        document.createElement(
            "button"
        );


    botaoFavorito.type =
        "button";


    botaoFavorito.classList.add(
        "botao_favorito_icone"
    );


    atualizarBotaoFavorito(
        botaoFavorito,
        filme.id
    );


    botaoFavorito.addEventListener(
        "click",
        function () {

            alternarFavorito(
                filme,
                botaoFavorito
            );
        }
    );


    acoes.appendChild(
        botaoFavorito
    );


    const botaoTrailer =
        document.createElement(
            "button"
        );


    botaoTrailer.type =
        "button";


    botaoTrailer.classList.add(
        "botao_assistir"
    );


    botaoTrailer.textContent =
        "▶ Assistir trailer";


    botaoTrailer.addEventListener(
        "click",
        function () {

            abrirTrailer(
                filme
            );
        }
    );


    acoes.appendChild(
        botaoTrailer
    );


    if (
        typeof window.criarBotaoPlayerLocal ===
        "function"
    ) {

        const botaoLocal =
            window.criarBotaoPlayerLocal(
                filme
            );


        if (botaoLocal) {

            acoes.appendChild(
                botaoLocal
            );
        }
    }


    const backdrop =
        document.createElement(
            "div"
        );


    backdrop.classList.add(
        "modal_backdrop"
    );


    if (filme.backdrop_path) {

        backdrop.style.backgroundImage =
            `url(${URL_IMAGEM}${filme.backdrop_path})`;
    }


    const layout =
        document.createElement(
            "div"
        );


    layout.classList.add(
        "detalhes_layout"
    );


    const poster =
        document.createElement(
            "img"
        );


    poster.classList.add(
        "detalhes_poster"
    );


    if (filme.poster_path) {

        poster.src =
            `${URL_IMAGEM}${filme.poster_path}`;
    }


    poster.alt =
        `Pôster de ${filme.title}`;


    const info =
        document.createElement(
            "div"
        );


    info.classList.add(
        "detalhes_info"
    );


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        filme.title;


    const meta =
        document.createElement(
            "div"
        );


    meta.classList.add(
        "detalhes_meta"
    );


    const ano =
        filme.release_date
            ? filme.release_date.slice(
                0,
                4
            )
            : "Ano não informado";


    const duracao =
        filme.runtime
            ? formatarDuracao(
                filme.runtime
            )
            : "Duração não informada";


    const nota =
        Number(
            filme.vote_average
        );


    const notaTexto =
        Number.isFinite(
            nota
        )
            ? `⭐ ${nota.toFixed(1)}`
            : "Sem avaliação";


    const anoElemento =
        document.createElement(
            "span"
        );


    anoElemento.textContent =
        ano;


    const duracaoElemento =
        document.createElement(
            "span"
        );


    duracaoElemento.textContent =
        `• ${duracao}`;


    const notaElemento =
        document.createElement(
            "span"
        );


    notaElemento.textContent =
        `• ${notaTexto}`;


    meta.appendChild(
        anoElemento
    );


    meta.appendChild(
        duracaoElemento
    );


    meta.appendChild(
        notaElemento
    );


    const generos =
        document.createElement(
            "div"
        );


    generos.classList.add(
        "detalhes_generos"
    );


    (filme.genres || []).forEach(
        function (genero) {

            const generoElemento =
                document.createElement(
                    "span"
                );


            generoElemento.classList.add(
                "genero"
            );


            generoElemento.textContent =
                genero.name;


            generos.appendChild(
                generoElemento
            );
        }
    );


    const tituloSinopse =
        document.createElement(
            "h3"
        );


    tituloSinopse.classList.add(
        "titulo_sinopse"
    );


    tituloSinopse.textContent =
        "Sinopse";


    const sinopse =
        document.createElement(
            "p"
        );


    sinopse.classList.add(
        "sinopse"
    );


    sinopse.textContent =
        filme.overview ||
        "Sinopse não disponível para este filme.";


    info.appendChild(
        titulo
    );


    info.appendChild(
        meta
    );


    info.appendChild(
        generos
    );


    info.appendChild(
        acoes
    );


    info.appendChild(
        tituloSinopse
    );


    info.appendChild(
        sinopse
    );


    layout.appendChild(
        poster
    );


    layout.appendChild(
        info
    );


    detalhesFilme.appendChild(
        backdrop
    );


    detalhesFilme.appendChild(
        layout
    );
}


/* =========================
   TRAILER
========================= */


async function abrirTrailerPorId(
    id
) {

    abrirModal();


    detalhesFilme.innerHTML =
        "<p>Carregando trailer...</p>";


    try {

        const url =
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar o trailer."
            );
        }


        const filme =
            await resposta.json();


        abrirTrailer(
            filme
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar trailer:",
            erro
        );


        detalhesFilme.innerHTML =
            "<p>Não foi possível carregar o trailer.</p>";
    }
}


function encontrarTrailer(
    filme
) {

    const videos =
        filme.videos?.results ||
        [];


    const trailerOficial =
        videos.find(
            function (video) {

                return (
                    video.site ===
                        "YouTube" &&

                    video.type ===
                        "Trailer" &&

                    video.official ===
                        true
                );
            }
        );


    if (trailerOficial) {

        return trailerOficial;
    }


    const trailer =
        videos.find(
            function (video) {

                return (
                    video.site ===
                        "YouTube" &&

                    video.type ===
                        "Trailer"
                );
            }
        );


    if (trailer) {

        return trailer;
    }


    const teaser =
        videos.find(
            function (video) {

                return (
                    video.site ===
                        "YouTube" &&

                    video.type ===
                        "Teaser"
                );
            }
        );


    return teaser || null;
}


function abrirTrailer(
    filme
) {

    const trailer =
        encontrarTrailer(
            filme
        );


    if (!trailer) {

        alert(
            "Nenhum trailer disponível para este filme."
        );


        return;
    }


    detalhesFilme.innerHTML =
        "";


    const playerContainer =
        document.createElement(
            "div"
        );


    playerContainer.classList.add(
        "player_container"
    );


    const topoPlayer =
        document.createElement(
            "div"
        );


    topoPlayer.classList.add(
        "player_topo"
    );


    const voltar =
        document.createElement(
            "button"
        );


    voltar.type =
        "button";


    voltar.classList.add(
        "botao_voltar"
    );


    voltar.textContent =
        "← Voltar";


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        `Trailer — ${filme.title}`;


    voltar.addEventListener(
        "click",
        function () {

            mostrarDetalhesFilme(
                filme
            );
        }
    );


    topoPlayer.appendChild(
        voltar
    );


    topoPlayer.appendChild(
        titulo
    );


    const iframe =
        document.createElement(
            "iframe"
        );


    iframe.classList.add(
        "player_filme"
    );


    iframe.src =
        `https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1`;


    iframe.allowFullscreen =
        true;


    iframe.setAttribute(
        "allow",
        "autoplay; encrypted-media; picture-in-picture; fullscreen"
    );


    iframe.setAttribute(
        "referrerpolicy",
        "strict-origin-when-cross-origin"
    );


    playerContainer.appendChild(
        topoPlayer
    );


    playerContainer.appendChild(
        iframe
    );


    detalhesFilme.appendChild(
        playerContainer
    );
}


function fecharModalFilme() {

    const players =
        detalhesFilme.querySelectorAll(
            "iframe"
        );


    players.forEach(
        function (player) {

            player.src =
                "about:blank";


            player.remove();
        }
    );


    detalhesFilme.innerHTML =
        "";


    modal.classList.remove(
        "ativo"
    );
}


/* =========================
   FAVORITOS / NAVEGACAO
========================= */


function mostrarFavoritos() {

    mostrarTelaResultados();


    atualizarMenuAtivo(
        linkFavoritos
    );


    tituloSecao.textContent =
        "Meus favoritos";


    if (
        favoritos.length === 0
    ) {

        mostrarMensagem(
            "Você ainda não adicionou nenhum filme aos favoritos."
        );


        return;
    }


    mostrarFilmes(
        favoritos
    );
}


function mostrarInicio() {

    campoBusca.value =
        "";


    carregarHome();
}


/* =========================
   FUNCOES AUXILIARES
========================= */


function formatarDuracao(
    minutos
) {

    const horas =
        Math.floor(
            minutos / 60
        );


    const minutosRestantes =
        minutos % 60;


    return (
        `${horas}h ${minutosRestantes}min`
    );
}


function mostrarDestaque(
    filmes
) {

    const candidatos =
        (filmes || []).filter(
            function (filme) {

                return (
                    filme.backdrop_path &&
                    filme.overview
                );
            }
        );


    if (
        candidatos.length === 0
    ) {

        destaqueTitulo.textContent =
            "Descubra seu próximo filme";


        destaqueAno.textContent =
            "";


        destaqueNota.textContent =
            "";


        destaqueSinopse.textContent =
            "Explore o catálogo e encontre algo novo para assistir.";


        return;
    }


    const filme =
        candidatos[0];


    filmeDestaqueAtual =
        filme;


    destaque.style.backgroundImage =
        `url(${URL_BACKDROP}${filme.backdrop_path})`;


    destaqueTitulo.textContent =
        filme.title;


    const nota =
        Number(
            filme.vote_average
        );


    destaqueNota.textContent =
        Number.isFinite(
            nota
        )
            ? `⭐ ${nota.toFixed(1)}`
            : "⭐ —";


    destaqueAno.textContent =
        filme.release_date
            ? filme.release_date.slice(
                0,
                4
            )
            : "Ano não informado";


    destaqueSinopse.textContent =
        filme.overview.length > 220
            ? filme.overview.slice(
                0,
                220
            ) + "..."
            : filme.overview;
}


/* =========================
   EVENTOS
========================= */


linkInicio.addEventListener(
    "click",
    function (event) {

        event.preventDefault();


        mostrarInicio();
    }
);


linkFavoritos.addEventListener(
    "click",
    function (event) {

        event.preventDefault();


        mostrarFavoritos();
    }
);


fecharModal.addEventListener(
    "click",
    fecharModalFilme
);


botaoBusca.addEventListener(
    "click",
    buscarFilmes
);


campoBusca.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            buscarFilmes();
        }
    }
);


modal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            modal
        ) {

            fecharModalFilme();
        }
    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            fecharModalFilme();
        }
    }
);


destaqueTrailer.addEventListener(
    "click",
    function () {

        if (!filmeDestaqueAtual) {

            return;
        }


        abrirTrailerPorId(
            filmeDestaqueAtual.id
        );
    }
);


destaqueDetalhes.addEventListener(
    "click",
    function () {

        if (!filmeDestaqueAtual) {

            return;
        }


        carregarDetalhesFilme(
            filmeDestaqueAtual.id
        );
    }
);


/* =========================
   INICIALIZACAO
========================= */


configurarCarrosseis();


carregarHome();