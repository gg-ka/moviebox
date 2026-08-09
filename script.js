const campoBusca = document.querySelector("#campo_busca");
const botaoBusca = document.querySelector("#botao_busca");
const listaFilmes = document.querySelector("#lista_filmes");
const URL_IMAGEM = "https://image.tmdb.org/t/p/w500";
const modal = document.querySelector("#modal");
const fecharModal = document.querySelector("#fechar_modal");
const detalhesFilme = document.querySelector("#detalhes_filme");

/* . = classe
# = id */

function mostrarMensagem(texto) {
    listaFilmes.innerHTML = "";

    const mensagem = document.createElement("p");

    mensagem.classList.add("mensagem");
    mensagem.textContent = texto;

    listaFilmes.appendChild(mensagem);
}

async function carregarFilmesPopulares(){

    mostrarMensagem("Carregando filmes...");

    try {
        const url =
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`;

        const resposta = await fetch(url);
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os filmes.")
        }

        const dados = await resposta.json();

        mostrarFilmes(dados.results);

}  catch (erro) {
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
    nota.textContent = `⭐ ${filme.vote_average.toFixed(1)}`;

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

    if (filmes.length === 0) {
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
        carregarFilmesPopulares();
        return;
    }

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
    }

}

carregarFilmesPopulares();

async function carregarDetalhesFilme(id) {

    abrirModal();

    detalhesFilme.innerHTML = "<p>Carregando detalhes...</p>";

    try {

        const url =
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os detalhes.");
        }

        const filme = await resposta.json();

        mostrarDetalhesFilme(filme);

    } catch (erro) {

        console.error("Erro ao carregar detalhes:", erro);

        detalhesFilme.innerHTML =
            "<p>Não foi possível carregar os detalhes do filme.</p>";

    }

}
function abrirModal() {
    modal.classList.add("ativo");
}

function fecharModalFilme() {
    modal.classList.remove("ativo");
}

function mostrarDetalhesFilme(filme) {

    detalhesFilme.innerHTML = "";


    // BACKDROP

    const backdrop = document.createElement("div");

    backdrop.classList.add("modal_backdrop");

    if (filme.backdrop_path) {
        backdrop.style.backgroundImage =
            `url(${URL_IMAGEM}${filme.backdrop_path})`;
    }


    // LAYOUT PRINCIPAL

    const layout = document.createElement("div");

    layout.classList.add("detalhes_layout");


    // PÔSTER

    const poster = document.createElement("img");

    poster.classList.add("detalhes_poster");

    if (filme.poster_path) {
        poster.src =
            `${URL_IMAGEM}${filme.poster_path}`;
    }

    poster.alt =
        `Pôster de ${filme.title}`;


    // ÁREA DE INFORMAÇÕES

    const info = document.createElement("div");

    info.classList.add("detalhes_info");


    // TÍTULO

    const titulo = document.createElement("h2");

    titulo.textContent = filme.title;


    // META INFORMAÇÕES

    const meta = document.createElement("div");

    meta.classList.add("detalhes_meta");


    const ano = filme.release_date
        ? filme.release_date.slice(0, 4)
        : "Ano não informado";


    const duracao = filme.runtime
        ? formatarDuracao(filme.runtime)
        : "Duração não informada";


    const nota = filme.vote_average
        ? `⭐ ${filme.vote_average.toFixed(1)}`
        : "Sem avaliação";


    const anoElemento = document.createElement("span");
    anoElemento.textContent = ano;


    const duracaoElemento = document.createElement("span");
    duracaoElemento.textContent = `• ${duracao}`;


    const notaElemento = document.createElement("span");
    notaElemento.textContent = `• ${nota}`;


    meta.appendChild(anoElemento);
    meta.appendChild(duracaoElemento);
    meta.appendChild(notaElemento);


    // GÊNEROS

    const generos = document.createElement("div");

    generos.classList.add("detalhes_generos");


    filme.genres.forEach(function (genero) {

        const generoElemento =
            document.createElement("span");

        generoElemento.classList.add("genero");

        generoElemento.textContent = genero.name;

        generos.appendChild(generoElemento);

    });


    // SINOPSE

    const tituloSinopse =
        document.createElement("h3");

    tituloSinopse.classList.add("titulo_sinopse");

    tituloSinopse.textContent = "Sinopse";


    const sinopse = document.createElement("p");

    sinopse.classList.add("sinopse");

    sinopse.textContent =
        filme.overview ||
        "Sinopse não disponível para este filme.";


    // MONTAGEM

    info.appendChild(titulo);
    info.appendChild(meta);
    info.appendChild(generos);
    info.appendChild(tituloSinopse);
    info.appendChild(sinopse);


    layout.appendChild(poster);
    layout.appendChild(info);


    detalhesFilme.appendChild(backdrop);
    detalhesFilme.appendChild(layout);

}

function formatarDuracao(minutos) {

    const horas = Math.floor(minutos / 60);

    const minutosRestantes = minutos % 60;

    return `${horas}h ${minutosRestantes}min`;
}

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

fecharModal.addEventListener("click", fecharModalFilme);
botaoBusca.addEventListener("click", buscarFilmes);
campoBusca.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        buscarFilmes();
    }

});