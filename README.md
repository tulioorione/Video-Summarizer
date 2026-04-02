# Video Summarizer

A full-stack application that takes a YouTube URL, downloads the audio, transcribes it with OpenAI Whisper, and generates an intelligent summary using **Claude** (Anthropic) or **GPT** (OpenAI) — your choice.

## Features

- **YouTube audio extraction** via yt-dlp
- **Speech-to-text transcription** with OpenAI Whisper (base model)
- **AI-powered summaries** with Claude Sonnet or GPT-4o
- **Real-time progress** via Server-Sent Events (SSE)
- **Search history** stored in localStorage (last 5 summaries)
- **Responsive UI** built with React, TypeScript, and Tailwind CSS

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Backend  | Python, FastAPI, yt-dlp, Whisper            |
| Frontend | React, TypeScript, Vite, Tailwind CSS       |
| AI       | Anthropic Claude Sonnet / OpenAI GPT-4o     |

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **FFmpeg** installed and available in PATH
- API keys for **Anthropic** and/or **OpenAI**

## Setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=sk-...

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend API at `http://localhost:8000`.

## Usage

1. Open `http://localhost:5173` in your browser
2. Paste a YouTube video URL
3. Select **Claude** or **GPT** as the summarization model
4. Click **Summarize** and watch the real-time progress
5. View the generated title, summary, and key points

## API

### `POST /summarize`

**Request body:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "model": "claude"
}
```

**Response:** Server-Sent Events stream with events:
- `progress` — `{ "step": "downloading" | "transcribing" | "summarizing", "message": "..." }`
- `done` — `{ "result": "..." }`
- `error` — `{ "message": "..." }`

### `GET /health`

Returns `{ "status": "ok" }`.

## Project Structure

```
video-summarizer/
├── backend/
│   ├── main.py              # FastAPI app with SSE endpoint
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── downloader.py    # YouTube audio extraction (yt-dlp)
│       ├── transcriber.py   # Audio transcription (Whisper)
│       └── summarizer.py    # LLM router (Claude / GPT)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── ProgressBar.tsx
        │   ├── ResultDisplay.tsx
        │   └── History.tsx
        └── services/
            └── api.ts
```

## License

MIT
