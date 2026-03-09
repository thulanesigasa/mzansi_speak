import os
import logging
import yaml
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from src.utils.rate_limiter import rate_limit
from src.utils.cache import get_cache_key, check_cache
from src.tts.kokoro_client import KokoroClient

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join("data", "models", "kokoro-v1.0.onnx")
VOICES_PATH = os.path.join("data", "models", "voices.json")
CONFIG_PATH = os.path.join("config", "voice_config.yaml")
OUTPUT_DIR = os.path.join("data", "outputs")

# ---------------------------------------------------------------------------
# Global client reference (populated at startup)
# ---------------------------------------------------------------------------
client: KokoroClient | None = None


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    logger.info("Initializing Kokoro TTS engine ...")
    client = KokoroClient(MODEL_PATH, VOICES_PATH)
    if client.is_ready():
        logger.info("Kokoro TTS engine is ready.")
    else:
        logger.warning(
            "Kokoro TTS engine could not load. "
            "Check that model files exist in data/models/."
        )
    yield
    logger.info("Shutting down Mzansi-Speak API.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Mzansi-Speak API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------
class TTSRequest(BaseModel):
    text: str
    voice_id: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _load_voice_config() -> dict:
    """Read voice_config.yaml and return parsed data."""
    if not os.path.exists(CONFIG_PATH):
        logger.error("Voice config not found at %s", CONFIG_PATH)
        return {"voices": [], "default_voice": "za_male_1"}
    with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"message": "Welcome to Mzansi-Speak API", "status": "online"}


@app.get("/voices")
async def list_voices():
    """Return the list of available voices from voice_config.yaml."""
    config = _load_voice_config()
    voices = config.get("voices", [])
    return {
        "voices": voices,
        "default_voice": config.get("default_voice", "za_male_1"),
    }


@app.post("/generate", dependencies=[Depends(rate_limit)])
async def generate_speech(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if client is None or not client.is_ready():
        raise HTTPException(
            status_code=503,
            detail="TTS engine is not available. Model files may be missing.",
        )

    cache_key = get_cache_key(request.text, request.voice_id)

    # Check cache first
    cached = check_cache(cache_key)
    if cached:
        logger.info("Cache hit for key %s", cache_key)
        return {
            "status": "success",
            "cache_key": cache_key,
            "audio_url": f"/api/audio/{cache_key}.wav",
        }

    # Cache miss: generate audio
    output_path = os.path.join(OUTPUT_DIR, f"{cache_key}.wav")
    success = client.generate(request.text, request.voice_id, output_path)

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Audio generation failed. Check server logs for details.",
        )

    return {
        "status": "success",
        "cache_key": cache_key,
        "audio_url": f"/api/audio/{cache_key}.wav",
    }


@app.get("/api/audio/{filename}")
async def get_audio(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/wav")
    raise HTTPException(status_code=404, detail="Audio file not found")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
