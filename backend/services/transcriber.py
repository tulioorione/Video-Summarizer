import os
from faster_whisper import WhisperModel


_model = None


def _get_model():
    global _model
    if _model is None:
        _model = WhisperModel("base", device="cpu", compute_type="int8")
    return _model


def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file using faster-whisper and delete it afterward."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Arquivo de áudio não encontrado: {file_path}")

    try:
        model = _get_model()
        segments, _ = model.transcribe(file_path, beam_size=1)
        text = " ".join(segment.text.strip() for segment in segments)
        return text
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
