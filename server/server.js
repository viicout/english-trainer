
const express = require("express");
const cors = require("cors");
require("dotenv").config({
    path: __dirname + "/.env"
});

const app = express();

app.use(cors());
app.use(express.json());

// Configuração da Groq
const apiKey = process.env.GROQ_API_KEY;
console.log("Arquivo .env:", __dirname + "/.env");
console.log("Chave carregada:", Boolean(apiKey));
const fs = require("fs");
const dotenv = require("dotenv");

const conteudoEnv = fs.readFileSync(__dirname + "/.env");
const variaveis = dotenv.parse(conteudoEnv);

console.log("Nomes encontrados no .env:", Object.keys(variaveis));
console.log("GROQ_API_KEY existe no arquivo:", Boolean(variaveis.GROQ_API_KEY));
console.log("GROQ_API_KEY carregada no Node:", Boolean(process.env.GROQ_API_KEY));
// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "English Trainer está funcionando!"
    });
});

// Rota para analisar frases
app.post("/traduzir", async (req, res) => {

    console.log("ROTA TRADUZIR FOI ACESSADA!");
    console.log("Groq disponível:", Boolean(apiKey));

    try {

        if (!apiKey) {
            return res.status(500).json({
                erro: "Chave GROQ_API_KEY não encontrada no arquivo server/.env."
            });
        }

        const { frase } = req.body;

        if (typeof frase !== "string" || !frase.trim()) {
            return res.status(400).json({
                erro: "Digite uma frase."
            });
        }

        console.log("Enviando frase para a Groq...");

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

Analise a frase enviada e explique em português brasileiro.

Organize a resposta nestas sete seções:

1. TRADUÇÃO NATURAL
Apresente a tradução correta e natural em inglês.

2. TRADUÇÃO PALAVRA POR PALAVRA
Mostre cada palavra em português e seu equivalente em inglês.

3. FUNÇÃO DE CADA PALAVRA
Explique o papel de cada palavra na frase.

4. ESTRUTURA GRAMATICAL
Explique como a frase foi construída.

5. TEMPO VERBAL
Identifique o tempo verbal e explique por que foi utilizado.

6. EXEMPLOS SEMELHANTES
Crie três frases em inglês acompanhadas das traduções.

Seja didático, paciente e considere que o aluno
está começando a aprender inglês.
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

        if (!resposta.ok) {

            console.error("Erro retornado pela Groq:", dados);

            return res.status(resposta.status).json({
                erro: dados.error?.message ||
                    "Erro ao consultar a inteligência artificial."
            });
        }

        const resultado =
            dados.choices?.[0]?.message?.content;

        if (!resultado) {
            throw new Error("A Groq retornou uma resposta vazia.");
        }

        console.log("Análise concluída com sucesso!");

        res.json({
            resultado: resultado
        });

    } catch (erro) {

        console.error("Erro na API Groq:", erro);

        res.status(500).json({
            erro: "Não foi possível realizar a análise da frase."
        });
    }
});

// Iniciar servidor
const PORT = 3000;

app.listen(PORT, () => {
    console.log("Groq disponível:", Boolean(apiKey));
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
