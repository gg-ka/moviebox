const campoBusca = document.querySelector("#campo_busca");
const botaoBusca = document.querySelector("#botao_busca");
const listaFilmes = document.querySelector("#lista_filmes");

const URL_IMAGEM =
    "https://image.tmdb.org/t/p/w500";

const modal =
    document.querySelector("#modal");

const fecharModal =
    document.querySelector("#fechar_modal");

const detalhesFilme =
    document.querySelector("#detalhes_filme");

const linkInicio =
    document.querySelector("#link_inicio");

const linkFavoritos =
    document.querySelector("#link_favoritos");

const tituloSecao =
    document.querySelector("#titulo_secao");

const destaque =
    document.querySelector("#destaque");

const destaqueTitulo =
    document.querySelector("#destaque_titulo");

const destaqueAno =
    document.querySelector("#destaque_ano");

const destaqueNota =
    document.querySelector("#destaque_nota");

const destaqueSinopse =
    document.querySelector("#destaque_sinopse");

const destaqueTrailer =
    document.querySelector("#destaque_trailer");

const destaqueDetalhes =
    document.querySelector("#destaque_detalhes");

const URL_BACKDROP =
    "https://image.tmdb.org/t/p/w1280";

const catalogoHome =
    document.querySelector("#catalogo_home");

const resultadosView =
    document.querySelector("#resultados_view");

const listaPopulares =
    document.querySelector("#lista_populares");

const listaAvaliados =
    document.querySelector("#lista_avaliados");

const listaCartaz =
    document.querySelector("#lista_cartaz");

const listaLancamentos =
    document.querySelector("#lista_lancamentos");


let filmeDestaqueAtual = null;


/*
    . = classe
    # = id
*/


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
}


/* monta os filmes dentro de cada fileira */

function mostrarCarrossel(
    filmes,
    container
) {

    container.innerHTML = "";


    filmes.forEach(function (filme) {

        const card =
            criarCardFilme(filme);

        card.classList.add(
            "card_carrossel"
        );

        container.appendChild(card);

    });


    container.scrollLeft = 0;


    requestAnimationFrame(
        function () {

            atualizarBotoesCarrossel(
                container
            );

        }
    );
}


/* busca qualquer categoria da tmdb */

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


/* carrega tudo que aparece na home */

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


/* verifica onde o carrossel ta */

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


/* configura as setinhas das fileiras */

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

        return (
            JSON.parse(
                localStorage.getItem(
                    "moviebox_favoritos"
                )
            ) || []
        );

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
    atualiza todos os coracoes dos cards,
    pq um filme pode aparecer em mais de uma fileira
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


/* atualiza o coracao que fica dentro do modal */

function atualizarBotaoFavorito(
    botao,
    id
) {

    const estaFavoritado =
        filmeEstaFavoritado(id);


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


/* adiciona ou remove um filme dos favoritos */

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


    // deixa o mesmo filme certinho em qualquer fileira

    atualizarCoracoesCards();


    /*
        so atualiza esse botao direto
        quando ele foi passado.
        isso acontece no modal
    */

    if (botao) {

        atualizarBotaoFavorito(
            botao,
            filme.id
        );

    }


    /*
        se tirar um favorito dentro da propria
        pagina de favoritos, atualiza a lista
    */

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
        LOCAL_PLAYER_ENABLED === false
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
   MENSAGENS
========================= */


function mostrarMensagem(texto) {

    listaFilmes.innerHTML = "";


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


/*
    essa funcao ficou do primeiro modelo da home.
    deixei por enquanto caso eu queira reaproveitar
*/

async function carregarFilmesPopulares() {

    mostrarMensagem(
        "Carregando filmes..."
    );


    try {

        const url =
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar os filmes."
            );

        }


        const dados =
            await resposta.json();


        mostrarDestaque(
            dados.results
        );


        mostrarFilmes(
            dados.results
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar filmes populares:",
            erro
        );


        mostrarMensagem(
            "Não foi possível carregar os filmes."
        );

    }
}


/* =========================
   CARD
========================= */


function criarCardFilme(filme) {

    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "card_filme"
    );


    /* capa */

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


    /* texto */

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


    /* clicar no card abre os detalhes */

    card.addEventListener(
        "click",
        function () {

            carregarDetalhesFilme(
                filme.id
            );

        }
    );


    /* coracao do card */

    const botaoFavorito =
        document.createElement(
            "button"
        );


    botaoFavorito.type =
        "button";


    botaoFavorito.classList.add(
        "favorito_card"
    );


    /*
        guardo o id aqui pra achar outros
        cards do mesmo filme dps
    */

    botaoFavorito.dataset.filmeId =
        filme.id;


    botaoFavorito.innerHTML =
        "♥";


    botaoFavorito.setAttribute(
        "aria-label",
        "Adicionar aos favoritos"
    );


    botaoFavorito.setAttribute(
        "aria-pressed",
        "false"
    );


    const jaFavoritado =
        favoritos.some(
            function (favorito) {

                return (
                    favorito.id ===
                    filme.id
                );

            }
        );


    if (jaFavoritado) {

        botaoFavorito.classList.add(
            "favorito_card_ativo"
        );


        botaoFavorito.setAttribute(
            "aria-label",
            "Remover dos favoritos"
        );


        botaoFavorito.setAttribute(
            "aria-pressed",
            "true"
        );

    }


    botaoFavorito.addEventListener(
        "click",
        function (evento) {

            /*
                sem isso o clique no coracao
                tb abriria o modal
            */

            evento.stopPropagation();


            alternarFavorito(
                filme
            );


            /*
                alternarFavorito ja atualiza todos
                os coracoes visiveis
            */

        }
    );


    card.appendChild(
        botaoFavorito
    );


    return card;
}


/* cria a grade usada na busca e nos favoritos */

function mostrarFilmes(filmes) {

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
        "<p class=\"mensagem_modal\">Carregando detalhes...</p>";


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
            "<p class=\"mensagem_modal\">Não foi possível carregar os detalhes do filme.</p>";

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


    /* botoes */

    const acoes =
        document.createElement(
            "div"
        );


    acoes.classList.add(
        "acoes_filme"
    );


    /* favorito do modal */

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


    /* trailer */

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


    /* player local, caso esteja habilitado */

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


    /* fundo do modal */

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


    /* layout */

    const layout =
        document.createElement(
            "div"
        );


    layout.classList.add(
        "detalhes_layout"
    );


    /* poster */

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


    /* informacoes */

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


    /* generos */

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


    /* sinopse */

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


    /* monta as informacoes */

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


/* =========================
   FAVORITOS - TELA
========================= */


function mostrarFavoritos() {

    mostrarTelaResultados();


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


function encontrarTrailer(
    filme
) {

    const videos =
        filme.videos?.results ||
        [];


    /* tenta achar primeiro o trailer oficial */

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


    /* se nao tiver oficial pega qualquer trailer */

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


    /* ultima tentativa eh um teaser */

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


/* fecha o modal e para qualquer video aberto */

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
   NAVEGACAO
========================= */


function mostrarInicio() {

    campoBusca.value =
        "";


    carregarHome();
}


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


/* =========================
   EVENTOS GERAIS
========================= */


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


/* =========================
   DESTAQUE DA HOME
========================= */


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
   INICIALIZACAO
========================= */


configurarCarrosseis();


carregarHome();


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