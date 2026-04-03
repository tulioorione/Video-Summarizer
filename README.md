# Video Summarizer
<img width="1360" height="1240" alt="arquitetura_video_summarizer" src="https://github.com/user-attachments/assets/fdd5f531-eddc-4407-9c3b-18f8cb62e3c6" />

Aplicacao full-stack que recebe uma URL do YouTube, baixa o audio, transcreve com Whisper e gera um resumo inteligente usando Gemini.

## Funcionalidades

- Extracao de audio do YouTube via yt-dlp
- Transcricao de fala para texto com Whisper (modelo base)
- Resumos com Gemini
- Progresso em tempo real via Server-Sent Events (SSE)
- Historico de buscas armazenado no localStorage (ultimas 5 consultas)
- Interface responsiva construida com React, TypeScript e Tailwind CSS
- Validacao robusta de URLs do YouTube com allowlist de hostnames
- Tratamento de erros com mensagens claras para o usuario

## Stack Tecnologica

| Camada   | Tecnologia                               |
| -------- | ---------------------------------------- |
| Backend  | Python, FastAPI, yt-dlp, Whisper         |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4 |
| IA       | Google Gemini                            |

## Pre-requisitos

- Python 3.10+
- Node.js 18+
- FFmpeg instalado e disponivel no PATH
- Uma chave de API do Gemini

## Como instalar o FFmpeg

O FFmpeg e necessario para o yt-dlp converter o audio do video em MP3.

- Windows: Baixe em https://ffmpeg.org/download.html, extraia e adicione a pasta `bin` ao PATH do sistema.
- macOS: `brew install ffmpeg`
- Linux (Debian/Ubuntu): `sudo apt install ffmpeg`

Para verificar se esta instalado corretamente:

```bash
ffmpeg -version
```

## Como obter a API key

- Gemini: Crie uma chave em https://aistudio.google.com/app/apikey

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
# IMPORTANTE: O arquivo .env.example e apenas um modelo/template.
# A aplicacao le SOMENTE o arquivo .env (sem "example").
# Copie o template e preencha com sua chave real:
cp .env.example .env
# Edite o .env e substitua o valor pela sua chave:
#   GEMINI_API_KEY=sua_chave_real_aqui

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

### Atalho para Windows

Na raiz do projeto, voce tambem pode executar:

```bat
start-dev.bat
```

Esse arquivo abre duas janelas: uma para o backend e outra para o frontend.

## Variaveis de Ambiente

O projeto usa arquivos `.env` para armazenar configuracoes sensiveis (como chaves de API).

- **`.env.example`** - E apenas um **modelo/template**. Ele mostra quais variaveis sao necessarias, mas **nao e lido pela aplicacao**.
- **`.env`** - E o arquivo **real** que a aplicacao le. Voce deve criar este arquivo copiando o `.env.example` e preenchendo com seus valores reais.
- O `.env` esta no `.gitignore` e **nunca sera commitado** no repositorio, protegendo suas chaves.

### Backend (`backend/.env`)

| Variavel            | Descricao                 | Obrigatoria |
| ------------------- | ------------------------- | ----------- |
| `GEMINI_API_KEY` | Chave de API do Gemini | Sim |

### Frontend (`frontend/.env`) - opcional

| Variavel       | Descricao                  | Padrao                  |
| -------------- | -------------------------- | ----------------------- |
| `VITE_API_URL` | URL base da API do backend | `http://localhost:8000` |

## Como Usar

1. Abra `http://localhost:5173` no navegador
2. Cole a URL de um video do YouTube
3. Clique em `Resumir`
4. Acompanhe o progresso em tempo real
5. Visualize o titulo inferido, resumo e pontos-chave gerados
6. Consultas anteriores ficam salvas no historico

## Fluxo da Aplicacao

```text
Usuario cola URL
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
3. Sumarizacao (Gemini)
      |
      v
4. Resultado exibido na interface
```

Cada etapa envia um evento SSE para o frontend, que atualiza a barra de progresso em tempo real.

## API

### `POST /summarize`

Corpo da requisicao:

```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

| Campo | Tipo     | Descricao             |
| ----- | -------- | --------------------- |
| `url` | `string` | URL valida do YouTube |

Resposta: Stream de Server-Sent Events com os seguintes eventos:

| Evento     | Dados                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| `progress` | `{ "step": "downloading" \| "transcribing" \| "summarizing", "message": "..." }` |
| `done`     | `{ "result": "..." }`                                                       |
| `error`    | `{ "message": "..." }`                                                      |

### `GET /health`

Retorna `{ "status": "ok" }`.

## Estrutura do Projeto

```text
video-summarizer/
|-- .gitignore
|-- README.md
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- .env.example
|   `-- services/
|       |-- __init__.py
|       |-- downloader.py
|       |-- transcriber.py
|       `-- summarizer.py
`-- frontend/
    |-- package.json
    |-- vite.config.ts
    |-- index.html
    `-- src/
        |-- main.tsx
        |-- index.css
        |-- App.tsx
        |-- components/
        |   |-- ProgressBar.tsx
        |   |-- ResultDisplay.tsx
        |   `-- History.tsx
        `-- services/
            `-- api.ts
```

## Decisoes Tecnicas

- SSE ao inves de WebSocket: Mais simples para comunicacao unidirecional do servidor para o frontend.
- Whisper modelo base: Equilibrio entre velocidade e qualidade. Pode ser trocado para `small` ou `medium` em `transcriber.py`.
- Lazy loading do Whisper: O modelo e carregado apenas na primeira requisicao e reutilizado.
- Limpeza automatica de audio: O arquivo MP3 temporario e deletado apos a transcricao.

## Licenca

MIT
