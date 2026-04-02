import json
import asyncio
from urllib.parse import urlparse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Literal
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

from services.downloader import download_audio
from services.transcriber import transcribe_audio
from services.summarizer import summarize

load_dotenv()

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
    model: Literal["claude", "gpt"]

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        parsed = urlparse(v)
        hostname = (parsed.hostname or "").lower()
        valid_hosts = {"www.youtube.com", "youtube.com", "youtu.be", "m.youtube.com"}
        if parsed.scheme not in ("http", "https") or hostname not in valid_hosts:
            raise ValueError("URL must be a valid YouTube link.")
        return v


def sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.post("/summarize")
async def summarize_video(request: SummarizeRequest):
    async def event_stream():
        try:
            # Step 1: Download
            yield sse_event("progress", {"step": "downloading", "message": "Downloading audio from YouTube..."})
            await asyncio.sleep(0)
            audio_path = await asyncio.to_thread(download_audio, request.url)

            # Step 2: Transcribe
            yield sse_event("progress", {"step": "transcribing", "message": "Transcribing audio with Whisper..."})
            await asyncio.sleep(0)
            transcript = await asyncio.to_thread(transcribe_audio, audio_path)

            # Step 3: Summarize
            yield sse_event("progress", {"step": "summarizing", "message": f"Generating summary with {request.model.upper()}..."})
            await asyncio.sleep(0)
            result = await asyncio.to_thread(summarize, transcript, request.model)

            # Step 4: Done
            yield sse_event("done", {"result": result})

        except ValueError as e:
            yield sse_event("error", {"message": str(e)})
        except Exception as e:
            yield sse_event("error", {"message": f"An unexpected error occurred: {str(e)}"})

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
