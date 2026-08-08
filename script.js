const campoBusca = document.querySelector("#campo_busca");
const botaoBusca = document.querySelector("#botao_busca");
const cardsFilmes = document.querySelectorAll(".card_filme");

/* . = classe
# = id */

function buscarFilmes() {

    const textoDigitado = campoBusca.value
    .trim()
    .toLowerCase();

    cardsFilmes.forEach(function (card) {

        const titulo = card
            .querySelector("h3")
            .textContent
            .toLowerCase();

        if (titulo.includes(textoDigitado)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

}

botaoBusca.addEventListener("click", buscarFilmes);

campoBusca.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        buscarFilmes();
    }
});

