import os

from google import genai
from google.genai import types

SUMMARY_PROMPT = """Voce e um analista de conteudo de video. Dada a seguinte transcricao de um video, forneca:

1. **Titulo**: Infira um titulo claro e descritivo para o video.
2. **Resumo**: Escreva um resumo bem estruturado em 2-3 paragrafos.
3. **Pontos-chave**: Liste 5-7 principais conclusoes como topicos.

Formate sua resposta exatamente assim:

# Titulo
[titulo inferido]

## Resumo
[paragrafos do resumo]

## Pontos-chave
- [ponto 1]
- [ponto 2]
...

Transcricao:
{transcript}"""


def _translate_provider_error(provider: str, exc: Exception) -> ValueError:
    """Convert raw SDK errors into clearer local setup messages."""
    message = str(exc).strip()
    lower_message = message.lower()

    if "insufficient_quota" in lower_message or "exceeded your current quota" in lower_message:
        return ValueError(
            f"A chave da {provider} esta sem quota/creditos disponiveis. "
            "Verifique o billing da conta e os limites de uso antes de tentar novamente."
        )

    if "invalid_api_key" in lower_message or "incorrect api key" in lower_message:
        return ValueError(
            f"A chave da {provider} parece invalida. Confira o valor configurado no arquivo .env."
        )

    if "authentication" in lower_message or "unauthorized" in lower_message:
        return ValueError(
            f"Nao foi possivel autenticar com a {provider}. Revise a API key configurada."
        )

    if "rate limit" in lower_message or "too many requests" in lower_message:
        return ValueError(
            f"O limite de requisicoes da {provider} foi atingido. Aguarde um pouco e tente novamente."
        )

    return ValueError(f"Falha ao gerar resumo com {provider}: {message}")


def summarize(transcript: str) -> str:
    """Summarize using Gemini."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY nao esta configurada. Adicione no arquivo .env.")

    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=SUMMARY_PROMPT.format(transcript=transcript),
            config=types.GenerateContentConfig(
                max_output_tokens=1500,
                temperature=0.3,
            ),
        )
    except Exception as exc:
        raise _translate_provider_error("Gemini", exc) from exc

    if not response.text:
        raise ValueError("O Gemini nao retornou texto para este resumo.")

    return response.text
