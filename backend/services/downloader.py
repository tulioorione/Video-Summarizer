import os
import uuid
import yt_dlp


def download_audio(url: str) -> str:
    """Download audio from a YouTube URL and return the file path."""
    output_dir = os.path.join(os.path.dirname(__file__), "..", "temp")
    os.makedirs(output_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}"
    output_path = os.path.join(output_dir, filename)

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": f"{output_path}.%(ext)s",
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e).lower()
        if "private" in error_msg or "sign in" in error_msg:
            raise ValueError("This video is private or requires authentication.")
        if "not a valid url" in error_msg or "unsupported url" in error_msg:
            raise ValueError("Invalid YouTube URL provided.")
        raise ValueError(f"Failed to download video: {e}")

    mp3_path = f"{output_path}.mp3"
    if not os.path.exists(mp3_path):
        raise ValueError("Audio extraction failed. The video may be unavailable.")

    return mp3_path
