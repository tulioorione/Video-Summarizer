# Video Summarizer

Aplicacao full-stack que recebe uma URL do YouTube, baixa o audio, transcreve com OpenAI Whisper e gera um resumo inteligente usando **Claude** (Anthropic) ou **GPT** (OpenAI) — a escolha e feita pelo usuario na interface.

## Funcionalidades

- **Extracao de audio do YouTube** via yt-dlp
- **Transcricao de fala para texto** com OpenAI Whisper (modelo base)
- **Resumos com IA** usando Claude Sonnet ou GPT-4o
- **Progresso em tempo real** via Server-Sent Events (SSE)
- **Historico de buscas** armazenado no localStorage (ultimas 5 consultas)
- **Interface responsiva** construida com React, TypeScript e Tailwind CSS
- **Validacao robusta** de URLs do YouTube com allowlist de hostnames
- **Tratamento de erros** com mensagens claras para o usuario (URL invalida, video privado, API key ausente, falha de conexao)

## Stack Tecnologica

| Camada   | Tecnologia                                  |
| -------- | ------------------------------------------- |
| Backend  | Python, FastAPI, yt-dlp, Whisper            |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4    |
| IA       | Anthropic Claude Sonnet / OpenAI GPT-4o     |

## Pre-requisitos

- **Python 3.10+**
- **Node.js 18+**
- **FFmpeg** instalado e disponivel no PATH
- Chaves de API da **Anthropic** e/ou **OpenAI**

## Como instalar o FFmpeg

O FFmpeg e necessario para o yt-dlp converter o audio do video em MP3.

- **Windows**: Baixe em https://ffmpeg.org/download.html, extraia e adicione a pasta `bin` ao PATH do sistema.
- **macOS**: `brew install ffmpeg`
- **Linux (Debian/Ubuntu)**: `sudo apt install ffmpeg`

Para verificar se esta instalado corretamente:
```bash
ffmpeg -version
```

## Como obter as API keys

- **Anthropic (Claude)**: Crie uma conta em https://console.anthropic.com, va em API Keys e gere uma nova chave.
- **OpenAI (GPT)**: Crie uma conta em https://platform.openai.com, va em API Keys e gere uma nova chave.

Voce precisa de pelo menos uma das duas chaves configurada. Se quiser usar apenas Claude, basta configurar a `ANTHROPIC_API_KEY`. Se quiser usar apenas GPT, basta a `OPENAI_API_KEY`.

## Instalacao e Execucao

### Backend

```bash
cd backend

# Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variaveis de ambiente
cp .env.example .env
# Edite o .env e adicione suas chaves:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=sk-...

# Iniciar o servidor
uvicorn main:app --reload --port 8000
```

O servidor estara disponivel em `http://localhost:8000`.

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estara disponivel em `http://localhost:5173`.

### Variaveis de Ambiente

#### Backend (`backend/.env`)

| Variavel            | Descricao                        | Obrigatoria |
| ------------------- | -------------------------------- | ----------- |
| `ANTHROPIC_API_KEY` | Chave de API da Anthropic        | Se usar Claude |
| `OPENAI_API_KEY`    | Chave de API da OpenAI           | Se usar GPT |

#### Frontend (`frontend/.env`) — opcional

| Variavel        | Descricao                          | Padrao                   |
| --------------- | ---------------------------------- | ------------------------ |
| `VITE_API_URL`  | URL base da API do backend         | `http://localhost:8000`  |

## Como Usar

1. Abra `http://localhost:5173` no navegador
2. Cole a URL de um video do YouTube
3. Selecione **Claude** ou **GPT** como modelo de sumarizacao
4. Clique em **Summarize** e acompanhe o progresso em tempo real
5. Visualize o titulo inferido, resumo e pontos-chave gerados
6. Consultas anteriores ficam salvas no historico (clique para recarregar)

## Fluxo da Aplicacao

```
Usuario cola URL + escolhe modelo
          |
          v
   [POST /summarize]
          |
          v
  1. Download do audio (yt-dlp)
          |
          v
  2. Transcricao (Whisper base)
          |
          v
  3. Sumarizacao (Claude ou GPT)
          |
          v
  4. Resultado exibido na interface
```

Cada etapa envia um evento SSE para o frontend, que atualiza a barra de progresso em tempo real.

## API

### `POST /summarize`

**Corpo da requisicao:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "model": "claude"
}
```

| Campo   | Tipo                    | Descricao                              |
| ------- | ----------------------- | -------------------------------------- |
| `url`   | `string`                | URL valida do YouTube                  |
| `model` | `"claude"` \| `"gpt"`  | Modelo de IA para gerar o resumo       |

**Resposta:** Stream de Server-Sent Events com os seguintes eventos:

| Evento     | Dados                                                                 |
| ---------- | --------------------------------------------------------------------- |
| `progress` | `{ "step": "downloading" \| "transcribing" \| "summarizing", "message": "..." }` |
| `done`     | `{ "result": "..." }`                                                 |
| `error`    | `{ "message": "..." }`                                                |

### `GET /health`

Retorna `{ "status": "ok" }`. Util para verificar se o servidor esta rodando.

## Estrutura do Projeto

```
video-summarizer/
├── .gitignore
├── README.md
├── backend/
│   ├── main.py              # App FastAPI com endpoint SSE
│   ├── requirements.txt     # Dependencias Python
│   ├── .env.example         # Template de variaveis de ambiente
│   └── services/
│       ├── __init__.py
│       ├── downloader.py    # Extracao de audio do YouTube (yt-dlp)
│       ├── transcriber.py   # Transcricao de audio (Whisper)
│       └── summarizer.py    # Router de LLM (Claude / GPT)
└── frontend/
    ├── package.json
    ├── vite.config.ts       # Configuracao Vite + Tailwind
    ├── index.html
    └── src/
        ├── main.tsx         # Ponto de entrada React
        ├── index.css        # Import do Tailwind
        ├── App.tsx          # Componente raiz com formulario e estado
        ├── components/
        │   ├── ProgressBar.tsx    # Barra de progresso com 4 etapas
        │   ├── ResultDisplay.tsx  # Exibicao do resumo parseado
        │   └── History.tsx        # Historico de consultas (localStorage)
        └── services/
            └── api.ts       # Cliente SSE para comunicacao com backend
```

## Decisoes Tecnicas

- **SSE ao inves de WebSocket**: Mais simples para comunicacao unidirecional (servidor -> cliente). O backend envia progresso, o frontend apenas escuta.
- **Whisper modelo base**: Equilibrio entre velocidade e qualidade. Pode ser trocado para `small` ou `medium` em `transcriber.py` para maior precisao.
- **Lazy loading do modelo Whisper**: O modelo e carregado apenas na primeira requisicao e reutilizado, evitando reload a cada chamada.
- **Limpeza automatica de audio**: O arquivo MP3 temporario e deletado imediatamente apos a transcricao no bloco `finally`.
- **Literal type no Pydantic**: O campo `model` usa `Literal["claude", "gpt"]` para validacao automatica e documentacao OpenAPI correta.

## Licenca

MIT
