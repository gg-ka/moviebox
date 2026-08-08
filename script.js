const campoBusca = document.querySelector("#campo_busca");
const botaoBusca = document.querySelector("#botao_busca");
const listaFilmes = document.querySelector("#lista_filmes");
const URL_IMAGEM = "https://image.tmdb.org/t/p/w500";

/* . = classe
# = id */

async function carregarFilmesPopulares() {

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

    return card;
}

function mostrarFilmes(filmes) {

    listaFilmes.innerHTML = "";

    if (filmes.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.classList.add("mensagem");
        mensagem.textContent = "Nenhum filme encontrado.";
        listaFilmes.appendChild(mensagem);
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

botaoBusca.addEventListener("click", buscarFilmes);
campoBusca.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        buscarFilmes();
    }

});