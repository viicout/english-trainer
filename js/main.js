
const campoPortugues = document.getElementById("portuguese");
const botaoTraduzir = document.getElementById("translateBtn");
const resultado = document.getElementById("result");

async function traduzirFrase() {

    const frase = campoPortugues.value.trim();

    if (!frase) {
        resultado.textContent = "Digite uma frase em português.";
        return;
    }

    botaoTraduzir.disabled = true;
    botaoTraduzir.textContent = "Analisando sua frase...";

    resultado.textContent =
        "Nosso professor está preparando sua aula...";

    try {

        const resposta = await fetch("http://localhost:3000/traduzir", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                frase: frase
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || "Erro ao analisar sua frase."
            );
        }

        const titulo = document.createElement("h3");
        titulo.textContent = "Sua aula de inglês";

        const explicacao = document.createElement("pre");
        explicacao.className = "resultado-texto";
        explicacao.textContent = dados.resultado;

        resultado.replaceChildren(titulo, explicacao);

    } catch (erro) {

        resultado.textContent =
            "Não foi possível realizar a tradução: " +
            erro.message;

        console.error(erro);

    } finally {

        botaoTraduzir.disabled = false;
        botaoTraduzir.textContent = "Traduzir e explicar";

    }
}

botaoTraduzir.addEventListener("click", traduzirFrase);
