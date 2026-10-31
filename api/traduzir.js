
module.exports = async function handler(req, res) {

    // Aceitar somente requisições POST
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");

        return res.status(405).json({
            erro: "Método não permitido."
        });
    }

    try {

        // Verificar a chave da Groq
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                erro: "Chave GROQ_API_KEY não configurada na Vercel."
            });
        }

        // Receber a frase enviada pelo site
        const body = typeof req.body === "string"
            ? JSON.parse(req.body)
            : req.body || {};

        const frase = body.frase;

        if (typeof frase !== "string" || !frase.trim()) {
            return res.status(400).json({
                erro: "Digite uma frase em português."
            });
        }

        if (frase.length > 1000) {
            return res.status(400).json({
                erro: "A frase deve ter no máximo 1000 caracteres."
            });
        }

        console.log("Analisando frase com Groq...");

        // Enviar a frase para a inteligência artificial
        const resposta = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",

                            content: `
Você é um professor particular de inglês
especializado em ensinar brasileiros iniciantes.

Analise a frase enviada pelo aluno e explique
tudo em português brasileiro.

Organize sua resposta com estas sete seções:

1. TRADUÇÃO NATURAL
Apresente a tradução correta e natural em inglês.

2. TRADUÇÃO PALAVRA POR PALAVRA
Mostre cada palavra em português e seu equivalente
em inglês.

3. FUNÇÃO DE CADA PALAVRA
Explique o papel de cada palavra na frase.

4. ESTRUTURA GRAMATICAL
Explique como a frase foi construída.

5. TEMPO VERBAL
Identifique o tempo verbal e explique por que foi usado.

6. PRONÚNCIA
Mostre uma pronúncia aproximada para brasileiros,
sem substituir a pronúncia correta do inglês.

7. EXEMPLOS SEMELHANTES
Crie três frases semelhantes em inglês,
cada uma acompanhada da tradução em português.

Seja didático, paciente e use exemplos simples.
Considere que o aluno está começando a aprender inglês.
`
                        },

                        {
                            role: "user",
                            content: frase.trim()
                        }
                    ],

                    max_completion_tokens: 1800
                })
            }
        );

        const dados = await resposta.json();

        // Tratar erros retornados pela Groq
        if (!resposta.ok) {

            console.error(
                "Erro da Groq:",
                resposta.status,
                dados
            );

            if (resposta.status === 429) {
                return res.status(429).json({
                    erro: "Limite gratuito da inteligência artificial atingido. Tente novamente mais tarde."
                });
            }

            return res.status(resposta.status).json({
                erro: dados.error?.message ||
                    "A inteligência artificial não conseguiu processar sua frase."
            });
        }

        const resultado =
            dados.choices?.[0]?.message?.content;

        if (!resultado) {
            throw new Error("A Groq retornou uma resposta vazia.");
        }

        // Devolver a explicação para o site
        return res.status(200).json({
            resultado: resultado
        });

    } catch (erro) {

        console.error("Erro na função de tradução:", erro);

        return res.status(500).json({
            erro: "Não foi possível realizar a análise da frase."
        });
    }
};
