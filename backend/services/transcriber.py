import os
import whisper


_model = None


def _get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")
    return _model


def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file using Whisper and delete it afterward."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Arquivo de áudio não encontrado: {file_path}")

    try:
        model = _get_model()
        result = model.transcribe(file_path)
        return result["text"]
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
