import os
import glob
import json
import asyncio
from pathlib import Path
from urllib.parse import urlparse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / ".env.local", override=True)


def _setup_path():
    """Add winget-installed tools (FFmpeg, Deno) to PATH if not already available."""
    local_app = os.environ.get("LOCALAPPDATA", "")
    winget_base = os.path.join(local_app, "Microsoft", "WinGet", "Packages")

    patterns = [
        os.path.join(winget_base, "Gyan.FFmpeg*", "ffmpeg-*", "bin"),
        os.path.join(winget_base, "DenoLand.Deno*"),
    ]

    extra_paths = []
    for pattern in patterns:
        matches = glob.glob(pattern)
        if matches:
            extra_paths.append(matches[0])

    if extra_paths:
        os.environ["PATH"] = os.pathsep.join(extra_paths) + os.pathsep + os.environ.get("PATH", "")


_setup_path()

from services.downloader import download_audio
from services.transcriber import transcribe_audio
from services.summarizer import summarize

app = FastAPI(title="Video Summarizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SummarizeRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        parsed = urlparse(v)
        hostname = (parsed.hostname or "").lower()
        valid_hosts = {"www.youtube.com", "youtube.com", "youtu.be", "m.youtube.com"}
        if parsed.scheme not in ("http", "https") or hostname not in valid_hosts:
            raise ValueError("A URL precisa ser um link válido do YouTube.")
        return v


def sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.post("/summarize")
async def summarize_video(request: SummarizeRequest):
    async def event_stream():
        try:
            # Step 1: Download
            yield sse_event("progress", {"step": "downloading", "message": "Baixando áudio do YouTube..."})
            await asyncio.sleep(0)
            audio_path = await asyncio.to_thread(download_audio, request.url)

            # Step 2: Transcribe
            yield sse_event("progress", {"step": "transcribing", "message": "Transcrevendo áudio com Whisper..."})
            await asyncio.sleep(0)
            transcript = await asyncio.to_thread(transcribe_audio, audio_path)

            # Step 3: Summarize
            yield sse_event("progress", {"step": "summarizing", "message": "Gerando resumo com Gemini..."})
            await asyncio.sleep(0)
            result = await asyncio.to_thread(summarize, transcript)

            # Step 4: Done
            yield sse_event("done", {"result": result})

        except ValueError as e:
            yield sse_event("error", {"message": str(e)})
        except Exception as e:
            yield sse_event("error", {"message": f"Ocorreu um erro inesperado: {str(e)}"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
