export default async function handler(request, response) {

    if (request.method !== "GET") {

        response.setHeader(
            "Allow",
            "GET"
        );

        return response.status(405).json({
            erro: "Método não permitido."
        });
    }


    const apiKey =
        process.env.TMDB_API_KEY;


    if (!apiKey) {

        return response.status(500).json({
            erro: "A chave da TMDB não foi configurada no servidor."
        });
    }


    const caminho =
        Array.isArray(request.query.path)
            ? request.query.path[0]
            : request.query.path;


    if (!caminho) {

        return response.status(400).json({
            erro: "Caminho da TMDB não informado."
        });
    }


    const caminhosPermitidos = [
        /^\/movie\/popular$/,
        /^\/movie\/top_rated$/,
        /^\/movie\/now_playing$/,
        /^\/movie\/upcoming$/,
        /^\/search\/movie$/,
        /^\/movie\/\d+$/
    ];


    const caminhoPermitido =
        caminhosPermitidos.some(
            function (regra) {

                return regra.test(
                    caminho
                );
            }
        );


    if (!caminhoPermitido) {

        return response.status(403).json({
            erro: "Esse caminho da TMDB não é permitido."
        });
    }


    const url =
        new URL(
            `https://api.themoviedb.org/3${caminho}`
        );


    url.searchParams.set(
        "api_key",
        apiKey
    );


    const parametrosPermitidos = [
        "language",
        "region",
        "query",
        "append_to_response",
        "page"
    ];


    parametrosPermitidos.forEach(
        function (parametro) {

            const valor =
                request.query[parametro];


            if (
                typeof valor === "string" &&
                valor !== ""
            ) {

                url.searchParams.set(
                    parametro,
                    valor
                );
            }
        }
    );


    try {

        const respostaTmdb =
            await fetch(
                url
            );


        const dados =
            await respostaTmdb.text();


        response.setHeader(
            "Content-Type",
            respostaTmdb.headers.get(
                "content-type"
            ) || "application/json; charset=utf-8"
        );


        response.setHeader(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=600"
        );


        return response
            .status(
                respostaTmdb.status
            )
            .send(
                dados
            );


    } catch (erro) {

        console.error(
            "Erro ao consultar a TMDB:",
            erro
        );


        return response.status(500).json({
            erro: "Não foi possível consultar a TMDB."
        });
    }
}
